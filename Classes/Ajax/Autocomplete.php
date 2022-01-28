<?php

namespace Subugoe\Find\Ajax;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use TYPO3\CMS\Core\Http\Response;
use TYPO3\CMS\Core\Http\JsonResponse;

class Autocomplete implements MiddlewareInterface
{

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $response = $handler->handle($request);
        if (!isset($request->getQueryParams()['q']) &&
            (!isset($request->getQueryParams()['autocomplete']) || !isset($request->getQueryParams()['entity']))
        ) {
            return $response;
        }

        include_once 'EidSettings.php';

        // Configuration options
        $solrSuggestUrl = $HOST . $CORE . '/suggest';

        // Autocomplete dictionary
        $solrAutocompleteDictionary = 'autocompleteSuggester';

        // Entity dictionary
        $solrEntityDictionary = 'entitySuggester';

        // Entity replacement
//        $entityReplacement = '(entity_ids:%s OR entity_ids_from:%s OR entity_ids_to:%s)';
        if (isset($request->getQueryParams()['replacement'])) {
            $entityReplacement = $request->getQueryParams()['replacement'];
        } else {
            $entityReplacement = 'id:%s';
        }

        // Array of suggestions
        $suggests = [];

        // Get query string
        $query = $request->getQueryParams()['q'];
        $entity = $request->getQueryParams()['entity'];
        $autocomplete = $request->getQueryParams()['autocomplete'];

        $dictionaryUrlParams = '';

        if ($entity) {
            $dictionaryUrlParams .= '&suggest.dictionary=' . $solrEntityDictionary;
        }
        if ($autocomplete) {
            $dictionaryUrlParams .= '&suggest.dictionary=' . $solrAutocompleteDictionary;
        }

        if (!$entity && !$autocomplete) {
            return $response;
        }


        // Get Solr suggestions
        $response = file_get_contents(
            $solrSuggestUrl . '?suggest=true' . $dictionaryUrlParams . '&suggest.q=' . urlencode($query),
            FALSE,
            stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'follow_location' => 0,
                    'timeout' => 1.0
                ]
            ])
        );

        // Parse JSON response
        if ($response !== FALSE) {
            $json = json_decode($response, TRUE);

            if ($autocomplete) {
                // get autocomplete
                foreach ($json['suggest'][$solrAutocompleteDictionary][$query]['suggestions'] as $suggestion) {
                    list ($id, $normalized) = explode('␝', $suggestion['payload']);
                    $suggests[] = [
                        'id' => htmlspecialchars($suggestion['term']),
                        'term' => htmlspecialchars($suggestion['term']),
                        'normalized' => htmlspecialchars($suggestion['term']),
                        'autocomplete' => '1'
                    ];
                }
            }

            if ($entity && $autocomplete) {
                // Add break between autocomplete and entity list
                $suggests[] = [
                    'id' => 'br'
                ];
            }

            if ($entity) {
                $idDeduping = [];

                // get entities
                foreach ($json['suggest'][$solrEntityDictionary][$query]['suggestions'] as $suggestion) {
                    list ($id, $normalized) = explode('␝', $suggestion['payload']);
                    if (!in_array($id, $idDeduping)) {
                        if (empty($normalized)) {
                            $normalized = $suggestion['term'];
                        }
                        $suggests[] = [
                            'id' => str_replace('%s', $id, $entityReplacement),
                            'term' => htmlspecialchars($suggestion['term']),
                            'normalized' => htmlspecialchars($normalized),
                            'autocomplete' => '0'
                        ];
                        $idDeduping[] = $id;
                    }
                }
            }
        }

        // Return results
        if (!empty($suggests)) {
            // Return result
            return new JsonResponse($suggests);
        }
    }
}

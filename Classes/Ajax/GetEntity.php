<?php

namespace Subugoe\Find\Ajax;


use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use TYPO3\CMS\Core\Http\Response;
use TYPO3\CMS\Core\Http\JsonResponse;

class GetEntity implements MiddlewareInterface
{

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $response = $handler->handle($request);
        if (!isset($request->getQueryParams()['q'], $request->getQueryParams()['getEntity'])) {
            return $response;
        }

        include_once 'EidSettings.php';

        // Configuration options
        $solr_select_url = $HOST . $CORE . '/select';

        // Array of entity facts
        $entity = [];

        // Get query string
        $query = $request->getQueryParams()['q'];

        // Get Solr record
        $response = file_get_contents(
            $solr_select_url . '?q=' . urlencode('id:(' . $query . ')') . '&rows=1',
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
            $entity = $json['response']['docs'][0];
        }

        // Return result
        return new JsonResponse($entity);
    }

}

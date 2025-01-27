

$( document ).ready(function() {
	activateNormdataAutocomplete();
});

function activateNormdataAutocomplete() {
	$.getScript( window.location.origin + '/typo3conf/ext/find/Resources/Public/JavaScript/jquery.tokeninput.js').

	done(function( script, textStatus ) {

		var inputTextToken = $('[id*=entity-input-]');
		inputTextToken.each(function() {
			var entity = $(this).data('entity'),
				entityAutocomplete = $(this).data('entityautocomplete'),
				entityReplacement = $(this).data('entityreplacement')
				urlParams = '';
			if (entity && entityAutocomplete) {
				urlParams = 'entity=1&autocomplete=1';
				if (entityReplacement) {
					urlParams += '&entityReplacement=' + entityReplacement;
				}
			} else if (entity) {
				urlParams = 'entity=1';
				if (entityReplacement) {
					urlParams += '&entityReplacement=' + entityReplacement;
				}
			} else if (entityAutocomplete) {
				urlParams = 'autocomplete=1';
			}
			// .attr('id', 'find-input')
			$(this).tokenInput('/?' + urlParams, {
				propertyToSearch: 'term',
				resultsFormatter: function(item){
					if (item.autocomplete == '1') {
						var output = '<li class="autocomplete-list-li">' + '<div style="display: inline-block; padding-left: 10px;"><div class="normalized">' + item.normalized + '</div>';
					} else {
						var output = '<li class="autocomplete-list-li normdata-autocomplete">' + '<div style="display: inline-block; padding-left: 10px;"><div class="normalized">' + item.normalized + '</div>';
					}

					output += '</li>';
					return output;
				},
				tokenFormatter: function(item) {
					return '<li><p>' + item.normalized + '</p></li>'
				}
			});

			var url = window.location.origin + '/?getEntity=1&q=';
			// original input
			var value = $(this).val();

			if (value != "") {
				// new token input
				$('#token-input-find-input').val(value);
			}

			// get entity for tokenizer
			var regEx = new RegExp(entityReplacement.replaceAll('%s', '(\\w*)'), 'g')
			// var regEx = new RegExp(/id:(\w*)/g);
			var valueWithoutToken = value;

			do {
				match = regEx.exec(value);
				if (match) {
					valueWithoutToken = valueWithoutToken.replace(match[0], '');
					valueWithoutToken = valueWithoutToken.replace(',', '');
					$.getJSON(url + match[1], function(result) {

						var entityQuery = entityReplacement.replaceAll('%s', result.id);

						inputTextToken.tokenInput('add', {id: entityQuery, term: "", normalized: result.title});
						$('#token-input-find-input').val(valueWithoutToken);
					});
				}
			} while (match);

		});

	});
}

/*
	Script for JFK-Institut newspaper list on Lib AAC
	Included by the TYPO3 find extension.
	Queries the ZDB-JOP service.
	Code taken from the pz2-client library
	https://github.com/ssp/pazpar2-js-client .
	
	2013 Sven-S. Porst, SUB Göttingen <porst@sub.uni-goettingen.de>
*/


var jfk_jop = (function () {

	/*	addZDBInfoForISSNToElementID
		Fetches ZDB-JOP information for the given ID, creates a DOM Element
		and inserts it into the element with the given elementID.
		inputs: issn - string
				elementID - string
	*/
	var addZDBInfoForISSNToElementID = function (issn, elementID) {
		var JOPURL = '/zdb/full.xml?issn=' + issn + '&genre=journal';
		jQuery.get(JOPURL, function (data) {
			var ZDBInfo = ZDBInformation(data);
			if (ZDBInfo) {
				var container = document.getElementById(elementID);

				var indicator = document.createElement('span');
				indicator.setAttribute('class', 'availability-indicator');
				container.appendChild(indicator);
				container.appendChild(ZDBInfo);
			}
		});
	};


	
	/*	turnIntoNewWindowLink
		Add a target attribute to open in our target window and add a note
		to the title about this fact.
		The link’s title element should be set before calling this function.
		input:	link - DOM a element
		output:	DOM element of the link passed in
	*/
	var turnIntoNewWindowLink = function (link) {
		if (link) {
			link.setAttribute('target', 'pz2-linkTarget');
			jQuery(link).addClass('pz2-newWindowLink');
	
			var newTitle = localise('Erscheint in separatem Fenster.');
			if (link.title) {
				var oldTitle = link.title;
				newTitle = oldTitle + ' (' + newTitle + ')';
			}
			link.title = newTitle;
	
			if (typeof(piwikTracker) !== 'undefined') {
				piwikTracker.addListener(link);
			}
		}
	};



	/*	markupInfoItems
		Returns marked up version of the DOM items passed, putting them into a list if necessary:
		input:	infoItems - array of DOM elements to insert
		output: * 1-element array => just the element
				* multi-element array => UL with an LI containing each of the elements
				* empty array => undefined
	*/
	var markupInfoItems = function (infoItems) {
		var result;
	
		if (infoItems.length === 1) {
			result = infoItems[0];
		}
		else if (infoItems.length > 1) {
			result = document.createElement('ul');
			jQuery(infoItems).each( function(index) {
					var LI = document.createElement('li');
					result.appendChild(LI);
					LI.appendChild(this);
				}
			);
		}
	
		return result;
	};
	


	/*	ZDBInfoItemForResult
		Turns XML of a single ZDB Result a DOM element displaying the relevant information.
		input:	ZDBResult - XML Element with a Full/(Print|Electronic)Data/ResultList/Result element
		output:	DOM Element for displaying the information in ZDBResult that's relevant for us
	*/
	var ZDBInfoItemForResult = function (ZDBResult) {
		var status = parseInt(ZDBResult.getAttribute('state'));
		var statusText;
	
		// Determine the access status of the result.
		if (status === 0) {
			statusText = localise('frei verfügbar');
		}
		else if (status === 1) {
			statusText = localise('teilweise frei verfügbar');
		}
		else if (status === 2) {
			statusText = localise('verfügbar');
		}
		else if (status === 3) {
			statusText = localise('teilweise verfügbar');
		}
		else {
			/*	Remaining cases are:
					status === -1: non-unique ISSN
					status === 4: not available
					status === 5: issue not available
					status === 10: unknown
			*/
		}
		
		// Only display detail information if we do have access.
		if (statusText) {
			var statusElement = document.createElement('span');
			jQuery(statusElement).addClass('pz2-ZDBStatusInfo');
	
			var accessLinkURL = jQuery('AccessURL', ZDBResult);
			if (accessLinkURL.length > 0) {
				// Having an AccessURL implies this is inside ElectronicData.
				statusElement.appendChild(document.createTextNode(statusText));
				var accessLink = document.createElement('a');
				statusElement.appendChild(document.createTextNode(' – '));
				statusElement.appendChild(accessLink);
				accessLink.setAttribute('href', accessLinkURL[0].textContent);
				var linkTitle = jQuery('Title', ZDBResult);
				if (linkTitle && linkTitle.length > 0) {
					linkTitle = linkTitle[0].textContent;
				}
				else {
					linkTitle = localise('Zugriff');
				}
				turnIntoNewWindowLink(accessLink);
	
				var additionals = [];
				var ZDBAdditionals = jQuery('Additional', ZDBResult);
				ZDBAdditionals.each( function (index) {
						additionals.push(this.textContent);
					}
				);
				if (additionals.length > 0) {
					accessLink.appendChild(document.createTextNode(additionals.join('; ') + '. '));
				}
				else {
					accessLink.appendChild(document.createTextNode(linkTitle));
				}
			}
			else if (status < 4) {
				// Absence of an AccessURL implies this is inside PrintData.
				// status > 3 means the volume is not available. Don't print info then.
				var locationInfo = document.createElement('span');
				var infoText = '';
	
				var period = jQuery('Period', ZDBResult)[0];
				if (period) {
					infoText += period.textContent + ': ';
	
				}
				var jLocation = jQuery('Location', ZDBResult);
				var locationText = '';
				if (jLocation.length > 0) {
					locationText = jLocation.text();
					infoText += locationText;
				}
	
				var signature = jQuery('Signature', ZDBResult)[0];
				if (signature) {
					infoText += ' ' + signature.textContent;
				}
				
				if (locationText.search('Göttingen SUB') !== -1 && locationText.search('LS2') !== -1) {
					infoText += ' ' + localise('[neuere Bände im Lesesaal 2]');
				}
	
				locationInfo.appendChild(document.createTextNode(infoText));
				statusElement.appendChild(locationInfo);
			}
			else {
				statusElement = undefined;
			}
		}	
		return statusElement;
	};
	
	
	
	/*	appendLibraryNameFromResultDataTo
		If we there is a Library name, insert it into the target container.
		input:	* data: ElectronicData or PrintData element from ZDB XML
				* target: DOM container to which the marked up library name is appended
	*/
	var appendLibraryNameFromResultDataTo = function (data, target) {
		var libraryName = jQuery('Library', data)[0];
		if (libraryName) {
			var libraryNameSpan = document.createElement('span');
			jQuery(libraryNameSpan).addClass('pz2-ZDBLibraryName');
			libraryNameSpan.appendChild(document.createTextNode(libraryName.textContent));
			target.appendChild(libraryNameSpan);
		}
	};
	
	
	
	/*	ZDBInfoElement
		Coverts ZDB XML data for electronic or print journals
			to DOM elements displaying their information.
		input:	data - ElectronicData or PrintData element from ZDB XML
		output:	DOM element containing the information from data
	*/				
	var ZDBInfoElement = function (data) {
		var results = jQuery('Result', data);
	
		if (results.length > 0) {
			var infoItems = [];
			results.each( function(index) {
					var ZDBInfoItem = ZDBInfoItemForResult(this);
					if (ZDBInfoItem) {
						infoItems.push(ZDBInfoItem);
					}
				}
			);
	
			if (infoItems.length > 0) {
				var infos = document.createElement('span');
				infos.appendChild(markupInfoItems(infoItems));
			}
		}
	
		return infos;
	};
	
	
	
	/*	ZDBInformation
		Converts complete ZDB XML data to DOM element containing information about them.
		input:	data - result from ZDB XML request
		output: DOM element displaying information about journal availability.
					If ZDB figures out the local library and the journal
						is accessible there, we display:
						* its name
						* electronic journal information with access link
						* print journal information
	*/
	var ZDBInformation = function (data) {
		var container;
	
		var electronicInfos = ZDBInfoElement( jQuery('ElectronicData', data) );
		var printInfos = ZDBInfoElement( jQuery('PrintData', data) );
		
		if (electronicInfos || printInfos) {
			container = document.createElement('div');
			var heading = document.createElement('h5');
			container.appendChild(heading);
			heading.appendChild(document.createTextNode(localise('Lokale Verfügbarkeit')));
			appendLibraryNameFromResultDataTo(data, container);
		}
	
		if (electronicInfos) {
			var electronicHeading = document.createElement('h5');
			container.appendChild(electronicHeading);
			electronicHeading.appendChild(document.createTextNode(localise('elektronisch')));
			container.appendChild(electronicInfos);
		}
	
		if (printInfos) {
			var printHeading = document.createElement('h5');
			container.appendChild(printHeading);
			var link = document.createElement('a');
			printHeading.appendChild(link);
			link.href = jQuery('PrintData Reference URL:first', data).text();
			link.target = 'zdb-jop';
			link.appendChild(document.createTextNode(localise('gedruckt')));
			container.appendChild(printInfos);
		}
	
		return container;
	};



	/*	localise
		Return localised term using the passed dictionary
			or the one stored in localisations variable.
		The localisation dictionary has ISO 639-1 language codes as keys.
		For each of them there can be a dictionary with terms for that language.
		In case the language dictionary is not present, the default ('en') is used.
		input:	term - string to localise
				externalDictionary (optional) - localisation dictionary
		output:	localised string
	*/
	function localise (term, externalDictionary) {
		var dictionary = localisations;
		if (externalDictionary) {
			dictionary = externalDictionary;
		}

		if (!pageLanguage) {
			pageLanguage = jQuery('html')[0].getAttribute('lang');
			if (!pageLanguage) {
				pageLanguage = 'en';
			}
		}

		var languageCode = pageLanguage;
		if (dictionary[pageLanguage] === null) {
			languageCode = 'en';
		}

		var localised = dictionary[languageCode][term];
		if (localised === undefined) {
			localised = term;
			// console.log('No localisation for: "' + term + '"');
		}

		return localised;
	}


	var localisations = {
		'en': {
			'Lokale Verfügbarkeit': 'local availability',
			// ZDB-JOP status labels
			'frei verfügbar': 'accessible for all',
			'teilweise frei verfügbar': 'partially accessible for all',
			'verfügbar': 'accessible',
			'teilweise verfügbar': 'partially accessible',
			'nicht verfügbar': 'not accessible',
			'diese Ausgabe nicht verfügbar': 'this issue not accessible',
			'Informationen bei der Zeitschriftendatenbank': 'View availability information at Zeitschriftendatenbank',
			'[neuere Bände im Lesesaal 2]': '[current volumes in Lesesaal 2]',
			'Zugriff': 'Access',
			// Link tooltip
			'Erscheint in separatem Fenster.': 'Link opens in a new window.',
		},
		'de': {
			'Lokale Verfügbarkeit': 'Lokale Verfügbarkeit',
			// ZDB-JOP status labels
			'frei verfügbar': 'frei verfügbar',
			'teilweise frei verfügbar': 'teilweise frei verfügbar',
			'verfügbar': 'verfügbar',
			'teilweise verfügbar': 'teilweise verfügbar',
			'nicht verfügbar': 'nicht verfügbar',
			'diese Ausgabe nicht verfügbar': 'diese Ausgabe nicht verfügbar',
			'Informationen bei der Zeitschriftendatenbank': 'Verfügbarkeitsinformationen bei der Zeitschriftendatenbank ansehen',
			'[neuere Bände im Lesesaal 2]': '[neuere Bände im Lesesaal 2]',
			'Zugriff': 'Zugriff',
			// Link tooltip
			'Erscheint in separatem Fenster.': 'Erscheint in separatem Fenster.',
		}
	};



	return {
		addZDBInfoForISSNToElementID: addZDBInfoForISSNToElementID
	};
})();
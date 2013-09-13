Find
====

This TYPO3 extension aims to enable the query and display of arbitrary Solr indexes.

It provides the ability to configure many aspects of the query – e.g. query fields, facets, filtering through TypoScript – and control the display using Fluid templates. Templates for standard display features as well as a number of View Helpers that help creating those ttemplates are included in the extension.

The exension is currently under development and documentation does not exist. If you still want to try it, have a look at the »Projects« folder inside the extension which provides a TypoScript configuration for our example projects along with the custom Partials needed for their display.

In case you have questions, suggestions or want to contribute, please get in touch or use the `github issue tracker <https://github.com/subugoe/typo3-find/issues>`_.



Prerequisites
=============

* TYPO3 6 or above for the extension to work completely. (It seems to work in TYPO 4.7 if you are willing to manually configure the inclusion of CSS and JavaScript resources)
* t3jquery Extension


Contact
=======

* `github <https://github.com/subugoe/typo3-find>`_
* Sven-S. Porst, SUB Göttingen <porst@sub.uni-goettingen.de>
* Ingo Pfennigstorf, SUB Göttingen <pfennigstorf@sub.uni-goettingen.de>



Acknowledgements
================

The extension’s Solr connectivity is provided by the `Solarium <http://www.solarium-project.org/>`_ PHP Solr client `(github) <https://github.com/basdenooijer/solarium]>`_.
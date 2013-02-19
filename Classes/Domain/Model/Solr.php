<?php

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2013 Ingo Pfennigstorf <pfennigstorf@sub-goettingen.de>
 *      Goettingen State Library
 *  
 *  All rights reserved
 *
 *  This script is part of the TYPO3 project. The TYPO3 project is
 *  free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  The GNU General Public License can be found at
 *  http://www.gnu.org/copyleft/gpl.html.
 *
 *  This script is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  This copyright notice MUST APPEAR in all copies of the script!
 * ************************************************************* */

/**
 * Description 
 */
class Tx_Sublar_Domain_Model_Solr {

	/**
	 * @var string
	 */
	protected $hostname;

	/**
	 * @var int
	 */
	protected $port;

	/**
	 * @var string
	 */
	protected $scheme;

	/**
	 * @var string
	 */
	protected $path;

	/**
	 * @param string $hostname
	 */
	public function setHostname($hostname) {
		$this->hostname = $hostname;
	}

	/**
	 * @return string
	 */
	public function getHostname() {
		return $this->hostname;
	}

	/**
	 * @param string $path
	 */
	public function setPath($path) {
		$this->path = $path;
	}

	/**
	 * @return string
	 */
	public function getPath() {
		return $this->path;
	}

	/**
	 * @param int $port
	 */
	public function setPort($port) {
		$this->port = $port;
	}

	/**
	 * @return int
	 */
	public function getPort() {
		return $this->port;
	}

	/**
	 * @param string $scheme
	 */
	public function setScheme($scheme) {
		$this->scheme = $scheme;
	}

	/**
	 * @return string
	 */
	public function getScheme() {
		return $this->scheme;
	}



}
<?php

$_SERVER['SCRIPT_NAME'] = "/$script";
$_SERVER['SCRIPT_FILENAME'] = "$_SERVER[DOCUMENT_ROOT]/$script";

require_once("$_SERVER[DOCUMENT_ROOT]/$script");

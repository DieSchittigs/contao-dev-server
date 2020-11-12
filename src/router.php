<?php

if (is_file("$_SERVER[DOCUMENT_ROOT]/index.php")) $script = "index.php";
else if (!is_file("$_SERVER[DOCUMENT_ROOT]/$script")) $script = "app.php";
$_SERVER['SCRIPT_NAME'] = "/$script";
$_SERVER['SCRIPT_FILENAME'] = "$_SERVER[DOCUMENT_ROOT]/$script";
require_once("$_SERVER[DOCUMENT_ROOT]/$script");

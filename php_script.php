<?php

require_once __DIR__ . '/vendor/autoload.php'; // Make sure Composer dependencies exist

function getClient()
{
    // Use GitHub Actions path if available, fallback to local
    $rootPath = !empty(getenv('GITHUB_WORKFLOW')) ? getenv('HOME') : __DIR__;
    $credentialsPath = $rootPath . '/secrets/credentials.json';

    $client = new Google_Client();
    $client->setApplicationName('My App Name');
    $client->setScopes(Google_Service_Sheets::SPREADSHEETS);
    $client->setAuthConfig($credentialsPath);
    $client->setAccessType('offline');

    return $client;
}

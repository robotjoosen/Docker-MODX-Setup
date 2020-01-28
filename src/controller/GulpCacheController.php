<?php

require_once dirname(dirname(dirname(__FILE__))) . '/public_html/config.core.php';
require_once MODX_CORE_PATH . 'model/modx/modx.class.php';
$modx = new modX();
$modx->initialize('web');
$modx->getService('error', 'error.modError', '', '');
$modx->cacheManager->refresh([
    'context_settings' => [
        'contexts' => [
            'web'
        ]
    ],
    'resource' => [
        'web'
    ],
    'lexicon_topics' => [
        'lexicon'
    ]
]);
print('Cache refreshed');
<?php

return [

    'apps' => [

        [
            'app_id' => env('REVERB_APP_ID'),
            'key' => env('REVERB_APP_KEY'),
            'secret' => env('REVERB_APP_SECRET'),
            'allowed_origins' => explode(',', env('REVERB_ALLOWED_ORIGINS', '*')),
            'ping_interval' => env('REVERB_PING_INTERVAL', 60),
            'max_message_size' => env('REVERB_MAX_MESSAGE_SIZE', 10000),
            'capacity' => null,
            'enable_statistics' => false,
        ],

    ],

    'apps_path' => env('REVERB_APPS_PATH', storage_path('reverb.php')),

    'scaling' => [

        'enabled' => env('REVERB_SCALING_ENABLED', false),

        'channel' => env('REVERB_SCALING_CHANNEL', 'reverb_scaling'),

        'server' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'port' => env('REDIS_PORT', '6379'),
            'password' => env('REDIS_PASSWORD'),
            'database' => env('REDIS_SCALING_DATABASE', '1'),
        ],

    ],

    'pulse_ingest_interval' => env('REVERB_PULSE_INGEST_INTERVAL', 15),

    'telescope_ingest_interval' => env('REVERB_TELESCOPE_INGEST_INTERVAL', 15),

];

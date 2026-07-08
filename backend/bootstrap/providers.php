<?php

use App\Providers\AppServiceProvider;
use App\Providers\BroadcastServiceProvider;
use Laravel\Reverb\ApplicationManagerServiceProvider;
use Laravel\Reverb\ReverbServiceProvider;

return [
    AppServiceProvider::class,
    BroadcastServiceProvider::class,
    ApplicationManagerServiceProvider::class,
    ReverbServiceProvider::class,
];

<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('subscriptions:check-trials')->daily();
Schedule::command('subscriptions:generate-invoices')->daily();
Schedule::command('notifications:rappel-visite')->dailyAt('08:00');

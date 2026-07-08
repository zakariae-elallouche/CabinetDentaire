<?php
require_once __DIR__ . '/vendor/autoload.php';
\ = require_once __DIR__ . '/bootstrap/app.php';
\ = \->make(Illuminate\Contracts\Console\Kernel::class);
\->bootstrap();
try {
    \ = DB::table('utilisateurs')->get();
    echo 'Users count: ' . count(\) . PHP_EOL;
    foreach (\ as \) {
        echo \->email . ' | ' . \->role . PHP_EOL;
    }
    echo PHP_EOL . 'Patients: ' . DB::table('patients')->count() . PHP_EOL;
    echo 'Dentistes: ' . DB::table('dentistes')->count() . PHP_EOL;
    echo 'Secretaires: ' . DB::table('secretaires')->count() . PHP_EOL;
} catch (Exception \) {
    echo 'Error: ' . \->getMessage() . PHP_EOL;
}

<?php

use Illuminate\Support\Facades\Route;

// All functionality has moved to the React SPA via routes/api.php
// These routes exist only for legacy compatibility / health check.
Route::get('/', fn () => redirect('/'));
Route::get('/dashboard', fn () => redirect('/'));
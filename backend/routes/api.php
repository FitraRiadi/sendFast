<?php

use App\Http\Controllers\Api\MessageController;
use Illuminate\Support\Facades\Route;

Route::post('/send', [MessageController::class, 'send']);

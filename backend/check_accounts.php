<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== ACCOUNTS TABLE ===\n";
$accounts = \App\Models\Account::all(['id', 'email', 'name']);
foreach ($accounts as $account) {
    echo "ID: {$account->id}, Email: {$account->email}, Name: {$account->name}\n";
}

echo "\n=== USERS TABLE ===\n";
$users = \App\Models\User::all(['id', 'email', 'name']);
foreach ($users as $user) {
    echo "ID: {$user->id}, Email: {$user->email}, Name: {$user->name}\n";
}

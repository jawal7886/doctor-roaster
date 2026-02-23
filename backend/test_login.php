<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$email = 'ajmanrecovery529@gmail.com';
$testPasswords = ['password', 'password123', '12345678', 'Password123'];

echo "Testing login for: $email\n\n";

// Check in accounts table
echo "=== CHECKING ACCOUNTS TABLE ===\n";
$account = \App\Models\Account::where('email', $email)->first();
if ($account) {
    echo "Account found: {$account->name}\n";
    echo "Status: {$account->status}\n";
    echo "Testing passwords...\n";
    foreach ($testPasswords as $password) {
        if (\Illuminate\Support\Facades\Hash::check($password, $account->password)) {
            echo "✓ PASSWORD FOUND: '$password'\n";
            break;
        } else {
            echo "✗ Not: '$password'\n";
        }
    }
} else {
    echo "No account found\n";
}

echo "\n=== CHECKING USERS TABLE ===\n";
$user = \App\Models\User::where('email', $email)->first();
if ($user) {
    echo "User found: {$user->name}\n";
    echo "Status: {$user->status}\n";
    echo "Testing passwords...\n";
    foreach ($testPasswords as $password) {
        if (\Illuminate\Support\Facades\Hash::check($password, $user->password)) {
            echo "✓ PASSWORD FOUND: '$password'\n";
            break;
        } else {
            echo "✗ Not: '$password'\n";
        }
    }
} else {
    echo "No user found\n";
}

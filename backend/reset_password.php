<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$email = 'ajmanrecovery529@gmail.com';
$newPassword = 'password123';

echo "Resetting password for: $email\n";
echo "New password will be: $newPassword\n\n";

// Update in accounts table
$account = \App\Models\Account::where('email', $email)->first();
if ($account) {
    $account->password = \Illuminate\Support\Facades\Hash::make($newPassword);
    $account->save();
    echo "✓ Password updated in ACCOUNTS table\n";
}

// Update in users table
$user = \App\Models\User::where('email', $email)->first();
if ($user) {
    $user->password = \Illuminate\Support\Facades\Hash::make($newPassword);
    $user->save();
    echo "✓ Password updated in USERS table\n";
}

echo "\nYou can now login with:\n";
echo "Email: $email\n";
echo "Password: $newPassword\n";

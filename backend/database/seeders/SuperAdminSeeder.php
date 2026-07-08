<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        Utilisateur::create([
            'tenant_id' => null,
            'email'     => 'superadmin@clinic.ma',
            'password'  => Hash::make('password'),
            'role'      => 'superadmin',
            'statut'    => 'actif',
            'nom'       => 'Super',
            'prenom'    => 'Admin',
        ]);

        $this->command->info('Super admin created: superadmin@clinic.ma / password');
    }
}

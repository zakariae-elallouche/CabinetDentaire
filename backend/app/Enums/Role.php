<?php

namespace App\Enums;

enum Role: string
{
    case SuperAdmin = 'superadmin';
    case AdminClinique = 'admin_clinique';
    case Dentiste = 'dentiste';
    case Secretaire = 'secretaire';
    case Patient = 'patient';
}

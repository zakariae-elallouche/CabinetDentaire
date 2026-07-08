<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\Utilisateur;
use App\Models\Patient;
use App\Models\Dentiste;
use App\Models\Secretaire;
use App\Models\RendezVous;
use App\Models\Visite;
use App\Models\Facture;
use App\Models\Paiement;
use App\Models\Medicament;
use App\Models\Ordonnance;
use App\Models\CatalogueOperation;
use App\Models\Notification;
use App\Enums\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenantA;
    private Tenant $tenantB;
    private Utilisateur $secretaireA;
    private Utilisateur $secretaireB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenantA = Tenant::create(['nom_clinique' => 'Clinique A', 'slug' => 'clinique-a', 'email_contact' => 'a@test.ma']);
        $this->tenantB = Tenant::create(['nom_clinique' => 'Clinique B', 'slug' => 'clinique-b', 'email_contact' => 'b@test.ma']);

        $this->secretaireA = Utilisateur::create(['tenant_id' => $this->tenantA->id, 'email' => 'sec-a@test.ma', 'password' => bcrypt('pass'), 'role' => 'secretaire', 'nom' => 'Sec', 'prenom' => 'A']);
        $this->secretaireB = Utilisateur::create(['tenant_id' => $this->tenantB->id, 'email' => 'sec-b@test.ma', 'password' => bcrypt('pass'), 'role' => 'secretaire', 'nom' => 'Sec', 'prenom' => 'B']);

        app()->instance(Tenant::class, $this->tenantA);
    }

    public function test_patients_are_scoped_by_tenant(): void
    {
        $uA = Utilisateur::create(['tenant_id' => $this->tenantA->id, 'email' => 'pA@test.ma', 'password' => bcrypt('pass'), 'role' => 'patient', 'nom' => 'Patient A', 'prenom' => 'Test']);
        $uB = Utilisateur::create(['tenant_id' => $this->tenantB->id, 'email' => 'pB@test.ma', 'password' => bcrypt('pass'), 'role' => 'patient', 'nom' => 'Patient B', 'prenom' => 'Test']);
        Patient::create(['tenant_id' => $this->tenantA->id, 'utilisateur_id' => $uA->id, 'telephone' => '0600000001']);
        Patient::create(['tenant_id' => $this->tenantB->id, 'utilisateur_id' => $uB->id, 'telephone' => '0600000002']);

        $this->assertCount(1, Patient::all());
        $this->assertEquals('Patient A', Patient::first()->nom);
    }

    public function test_medicaments_are_scoped_by_tenant(): void
    {
        Medicament::create(['tenant_id' => $this->tenantA->id, 'nom' => 'Doliprane']);
        Medicament::create(['tenant_id' => $this->tenantB->id, 'nom' => 'Efferalgan']);

        $this->assertCount(1, Medicament::all());
        $this->assertEquals('Doliprane', Medicament::first()->nom);
    }

    public function test_catalogue_operations_are_scoped_by_tenant(): void
    {
        CatalogueOperation::create(['tenant_id' => $this->tenantA->id, 'nom' => 'Détartrage', 'cout' => 200]);
        CatalogueOperation::create(['tenant_id' => $this->tenantB->id, 'nom' => 'Extraction', 'cout' => 300]);

        $this->assertCount(1, CatalogueOperation::all());
    }

    public function test_rendez_vous_are_scoped_by_tenant(): void
    {
        $uA = Utilisateur::create(['tenant_id' => $this->tenantA->id, 'email' => 'pA@test.ma', 'password' => bcrypt('pass'), 'role' => 'patient', 'nom' => 'A', 'prenom' => 'Test']);
        $uB = Utilisateur::create(['tenant_id' => $this->tenantB->id, 'email' => 'pB@test.ma', 'password' => bcrypt('pass'), 'role' => 'patient', 'nom' => 'B', 'prenom' => 'Test']);
        $patientA = Patient::create(['tenant_id' => $this->tenantA->id, 'utilisateur_id' => $uA->id, 'telephone' => '0600000001']);
        $patientB = Patient::create(['tenant_id' => $this->tenantB->id, 'utilisateur_id' => $uB->id, 'telephone' => '0600000002']);
        $dentA = Dentiste::create(['tenant_id' => $this->tenantA->id, 'utilisateur_id' => $uA->id, 'telephone' => '0600000001']);
        $dentB = Dentiste::create(['tenant_id' => $this->tenantB->id, 'utilisateur_id' => $uB->id, 'telephone' => '0600000002']);

        RendezVous::create(['tenant_id' => $this->tenantA->id, 'patient_id' => $patientA->id, 'dentiste_id' => $dentA->id, 'date_heure' => now(), 'statut' => 'en_attente']);
        RendezVous::create(['tenant_id' => $this->tenantB->id, 'patient_id' => $patientB->id, 'dentiste_id' => $dentB->id, 'date_heure' => now(), 'statut' => 'en_attente']);

        $this->assertCount(1, RendezVous::all());
    }

    public function test_facture_report_is_scoped_by_tenant(): void
    {
        $uA = Utilisateur::create(['tenant_id' => $this->tenantA->id, 'email' => 'pA@test.ma', 'password' => bcrypt('pass'), 'role' => 'patient', 'nom' => 'A', 'prenom' => 'Test']);
        $uB = Utilisateur::create(['tenant_id' => $this->tenantB->id, 'email' => 'pB@test.ma', 'password' => bcrypt('pass'), 'role' => 'patient', 'nom' => 'B', 'prenom' => 'Test']);
        $patientA = Patient::create(['tenant_id' => $this->tenantA->id, 'utilisateur_id' => $uA->id, 'telephone' => '0600000001']);
        $dentA = Dentiste::create(['tenant_id' => $this->tenantA->id, 'utilisateur_id' => $uA->id, 'telephone' => '0600000001']);
        $dentB = Dentiste::create(['tenant_id' => $this->tenantB->id, 'utilisateur_id' => $uB->id, 'telephone' => '0600000002']);
        $rdvA = RendezVous::create(['tenant_id' => $this->tenantA->id, 'patient_id' => $patientA->id, 'dentiste_id' => $dentA->id, 'date_heure' => now(), 'statut' => 'confirme']);
        $visiteA = Visite::create(['tenant_id' => $this->tenantA->id, 'patient_id' => $patientA->id, 'dentiste_id' => $dentA->id, 'rendezvous_id' => $rdvA->id, 'date_visite' => today(), 'statut' => 'complete']);

        Facture::create(['tenant_id' => $this->tenantA->id, 'patient_id' => $patientA->id, 'visite_id' => $visiteA->id, 'numero_facture' => 'FAC-001', 'montant_total' => 500, 'statut' => 'payee', 'date_facture' => today()]);

        app()->instance(Tenant::class, $this->tenantB);

        $patientB = Patient::create(['tenant_id' => $this->tenantB->id, 'utilisateur_id' => $uB->id, 'telephone' => '0600000002']);
        $rdvB = RendezVous::create(['tenant_id' => $this->tenantB->id, 'patient_id' => $patientB->id, 'dentiste_id' => $dentB->id, 'date_heure' => now(), 'statut' => 'confirme']);
        $visiteB = Visite::create(['tenant_id' => $this->tenantB->id, 'patient_id' => $patientB->id, 'dentiste_id' => $dentB->id, 'rendezvous_id' => $rdvB->id, 'date_visite' => today(), 'statut' => 'complete']);
        Facture::create(['tenant_id' => $this->tenantB->id, 'patient_id' => $patientB->id, 'visite_id' => $visiteB->id, 'numero_facture' => 'FAC-002', 'montant_total' => 9999, 'statut' => 'payee', 'date_facture' => today()]);

        app()->instance(Tenant::class, $this->tenantA);

        $this->assertEquals(500, Facture::where('statut', 'payee')->sum('montant_total'));
        $this->assertEquals(1, Facture::where('statut', 'payee')->count());
    }

    public function test_find_or_fail_is_scoped_by_tenant(): void
    {
        $uA = Utilisateur::create(['tenant_id' => $this->tenantA->id, 'email' => 'pA@test.ma', 'password' => bcrypt('pass'), 'role' => 'patient', 'nom' => 'A', 'prenom' => 'Test']);
        $uB = Utilisateur::create(['tenant_id' => $this->tenantB->id, 'email' => 'pB@test.ma', 'password' => bcrypt('pass'), 'role' => 'patient', 'nom' => 'B', 'prenom' => 'Test']);
        $pA = Patient::create(['tenant_id' => $this->tenantA->id, 'utilisateur_id' => $uA->id, 'telephone' => '0600000001']);
        $pB = Patient::create(['tenant_id' => $this->tenantB->id, 'utilisateur_id' => $uB->id, 'telephone' => '0600000002']);

        $found = Patient::find($pA->id);
        $this->assertNotNull($found);
        $this->assertEquals('A', $found->nom);

        $crossTenant = Patient::find($pB->id);
        $this->assertNull($crossTenant);
    }

    public function test_switch_tenant_changes_scope(): void
    {
        $uA = Utilisateur::create(['tenant_id' => $this->tenantA->id, 'email' => 'pA@test.ma', 'password' => bcrypt('pass'), 'role' => 'patient', 'nom' => 'From A', 'prenom' => 'Test']);
        $uB = Utilisateur::create(['tenant_id' => $this->tenantB->id, 'email' => 'pB@test.ma', 'password' => bcrypt('pass'), 'role' => 'patient', 'nom' => 'From B', 'prenom' => 'Test']);
        Patient::create(['tenant_id' => $this->tenantA->id, 'utilisateur_id' => $uA->id, 'telephone' => '0600000001']);
        Patient::create(['tenant_id' => $this->tenantB->id, 'utilisateur_id' => $uB->id, 'telephone' => '0600000002']);

        $this->assertCount(1, Patient::all());
        $this->assertEquals('From A', Patient::first()->nom);

        app()->instance(Tenant::class, $this->tenantB);

        $this->assertCount(1, Patient::all());
        $this->assertEquals('From B', Patient::first()->nom);
    }

    public function test_superadmin_bypasses_tenant_scope(): void
    {
        $uA = Utilisateur::create(['tenant_id' => $this->tenantA->id, 'email' => 'pA@test.ma', 'password' => bcrypt('pass'), 'role' => 'patient', 'nom' => 'A', 'prenom' => 'Test']);
        $uB = Utilisateur::create(['tenant_id' => $this->tenantB->id, 'email' => 'pB@test.ma', 'password' => bcrypt('pass'), 'role' => 'patient', 'nom' => 'B', 'prenom' => 'Test']);
        Patient::create(['tenant_id' => $this->tenantA->id, 'utilisateur_id' => $uA->id, 'telephone' => '0600000001']);
        Patient::create(['tenant_id' => $this->tenantB->id, 'utilisateur_id' => $uB->id, 'telephone' => '0600000002']);

        $superadmin = Utilisateur::create(['email' => 'super@test.ma', 'password' => bcrypt('pass'), 'role' => 'superadmin']);
        $this->actingAs($superadmin);

        app()->forgetInstance(Tenant::class);

        $this->assertCount(2, Patient::all());
    }

    public function test_api_returns_only_tenant_data_for_secretaire(): void
    {
        $uA = Utilisateur::create(['tenant_id' => $this->tenantA->id, 'email' => 'pA@test.ma', 'password' => bcrypt('pass'), 'role' => 'patient', 'nom' => 'Ali', 'prenom' => 'Test']);
        $uB = Utilisateur::create(['tenant_id' => $this->tenantB->id, 'email' => 'pB@test.ma', 'password' => bcrypt('pass'), 'role' => 'patient', 'nom' => 'Brahim', 'prenom' => 'Test']);
        $patientA = Patient::create(['tenant_id' => $this->tenantA->id, 'utilisateur_id' => $uA->id, 'telephone' => '0600000001']);
        Patient::create(['tenant_id' => $this->tenantB->id, 'utilisateur_id' => $uB->id, 'telephone' => '0600000002']);

        $token = $this->secretaireA->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->withHeader('X-Tenant-Id', $this->tenantA->id)
            ->getJson('/api/patients');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json());
        $this->assertEquals('Ali', $response->json()[0]['nom']);
    }
}

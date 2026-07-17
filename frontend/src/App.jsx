import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const RegisterClinic = lazy(() => import('./pages/auth/RegisterClinic'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const SubscriptionBlocked = lazy(() => import('./pages/shared/SubscriptionBlocked'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const ManageTeam = lazy(() => import('./pages/admin/ManageTeam'))
const BillingPage = lazy(() => import('./pages/admin/BillingPage'))
const ParametresClinique = lazy(() => import('./pages/admin/ParametresClinique'))
const GestionCatalogueOperations = lazy(() => import('./pages/admin/GestionCatalogueOperations'))
const GestionMedicaments = lazy(() => import('./pages/admin/GestionMedicaments'))
const MonCompte = lazy(() => import('./pages/shared/MonCompte'))
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'))
const SuperAdminTenants = lazy(() => import('./pages/superadmin/SuperAdminTenants'))
const SuperAdminTenantDetail = lazy(() => import('./pages/superadmin/SuperAdminTenantDetail'))
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'))
const BookAppointment = lazy(() => import('./pages/patient/BookAppointment'))
const MyAppointments = lazy(() => import('./pages/patient/MyAppointments'))
const MyVisits = lazy(() => import('./pages/patient/MyVisits'))
const MyPrescriptions = lazy(() => import('./pages/patient/MyPrescriptions'))
const MyInvoices = lazy(() => import('./pages/patient/MyInvoices'))
const MyProfile = lazy(() => import('./pages/patient/MyProfile'))
const SecretaireDashboard = lazy(() => import('./pages/secretaire/SecretaireDashboard'))
const ManageAppointments = lazy(() => import('./pages/secretaire/ManageAppointments'))
const ManagePayments = lazy(() => import('./pages/secretaire/ManagePayments'))
const PatientsList = lazy(() => import('./pages/secretaire/PatientsList'))
const DentisteDashboard = lazy(() => import('./pages/dentiste/DentisteDashboard'))
const AgendaDuJour = lazy(() => import('./pages/dentiste/AgendaDuJour'))
const VisiteDetail = lazy(() => import('./pages/dentiste/VisiteDetail'))
const RecordVisit = lazy(() => import('./pages/dentiste/RecordVisit'))
const IssuePrescription = lazy(() => import('./pages/dentiste/IssuePrescription'))
const PatientHistory = lazy(() => import('./pages/dentiste/PatientHistory'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-500">Chargement…</div>}>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />

        {/* ─── Auth ─── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-clinic" element={<RegisterClinic />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/subscription-blocked" element={<SubscriptionBlocked />} />

        {/* ─── Admin ─── */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['ADMIN_CLINIQUE']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/equipe" element={
          <ProtectedRoute roles={['ADMIN_CLINIQUE']}>
            <ManageTeam />
          </ProtectedRoute>
        } />
        <Route path="/admin/facturation" element={
          <ProtectedRoute roles={['ADMIN_CLINIQUE']}>
            <BillingPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/compte" element={
          <ProtectedRoute roles={['ADMIN_CLINIQUE']}>
            <MonCompte />
          </ProtectedRoute>
        } />
        <Route path="/admin/parametres" element={
          <ProtectedRoute roles={['ADMIN_CLINIQUE']}>
            <ParametresClinique />
          </ProtectedRoute>
        } />
        <Route path="/admin/catalogue-operations" element={
          <ProtectedRoute roles={['ADMIN_CLINIQUE']}>
            <GestionCatalogueOperations />
          </ProtectedRoute>
        } />
        <Route path="/admin/medicaments" element={
          <ProtectedRoute roles={['ADMIN_CLINIQUE']}>
            <GestionMedicaments />
          </ProtectedRoute>
        } />

        {/* ─── Super Admin ─── */}
        <Route path="/superadmin/dashboard" element={
          <ProtectedRoute roles={['SUPERADMIN']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/tenants" element={
          <ProtectedRoute roles={['SUPERADMIN']}>
            <SuperAdminTenants />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/tenants/:id" element={
          <ProtectedRoute roles={['SUPERADMIN']}>
            <SuperAdminTenantDetail />
          </ProtectedRoute>
        } />
        {/* ─── Patient ─── */}
        <Route path="/patient/dashboard" element={
          <ProtectedRoute roles={['PATIENT']}>
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/patient/reserver" element={
          <ProtectedRoute roles={['PATIENT']}>
            <BookAppointment />
          </ProtectedRoute>
        } />
        <Route path="/patient/rendez-vous" element={
          <ProtectedRoute roles={['PATIENT']}>
            <MyAppointments />
          </ProtectedRoute>
        } />
        <Route path="/patient/visites" element={
          <ProtectedRoute roles={['PATIENT']}>
            <MyVisits />
          </ProtectedRoute>
        } />
        <Route path="/patient/ordonnances" element={
          <ProtectedRoute roles={['PATIENT']}>
            <MyPrescriptions />
          </ProtectedRoute>
        } />
        <Route path="/patient/factures" element={
          <ProtectedRoute roles={['PATIENT']}>
            <MyInvoices />
          </ProtectedRoute>
        } />
        <Route path="/patient/profil" element={
          <ProtectedRoute roles={['PATIENT']}>
            <MyProfile />
          </ProtectedRoute>
        } />

        {/* ─── Secretaire + Admin clinique ─── */}
        <Route path="/secretaire/dashboard" element={
          <ProtectedRoute roles={['SECRETAIRE', 'ADMIN_CLINIQUE']}>
            <SecretaireDashboard />
          </ProtectedRoute>
        } />
        <Route path="/secretaire/rendez-vous" element={
          <ProtectedRoute roles={['SECRETAIRE', 'ADMIN_CLINIQUE']}>
            <ManageAppointments />
          </ProtectedRoute>
        } />
        <Route path="/secretaire/paiements" element={
          <ProtectedRoute roles={['SECRETAIRE', 'ADMIN_CLINIQUE']}>
            <ManagePayments />
          </ProtectedRoute>
        } />

        <Route path="/secretaire/patients" element={
          <ProtectedRoute roles={['SECRETAIRE', 'ADMIN_CLINIQUE']}>
            <PatientsList />
          </ProtectedRoute>
        } />
        <Route path="/secretaire/patient/:id" element={
          <ProtectedRoute roles={['SECRETAIRE', 'ADMIN_CLINIQUE']}>
            <PatientsList />
          </ProtectedRoute>
        } />
        <Route path="/secretaire/compte" element={
          <ProtectedRoute roles={['SECRETAIRE', 'ADMIN_CLINIQUE']}>
            <MonCompte />
          </ProtectedRoute>
        } />

        {/* ─── Dentiste ─── */}
        <Route path="/dentiste/dashboard" element={
          <ProtectedRoute roles={['DENTISTE']}>
            <DentisteDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dentiste/agenda" element={
          <ProtectedRoute roles={['DENTISTE']}>
            <AgendaDuJour />
          </ProtectedRoute>
        } />
        <Route path="/dentiste/visite-detail/:id" element={
          <ProtectedRoute roles={['DENTISTE']}>
            <VisiteDetail />
          </ProtectedRoute>
        } />
        <Route path="/dentiste/visite/:rdv_id" element={
          <ProtectedRoute roles={['DENTISTE']}>
            <RecordVisit />
          </ProtectedRoute>
        } />
        <Route path="/dentiste/visite/nouvelle" element={
          <ProtectedRoute roles={['DENTISTE']}>
            <RecordVisit />
          </ProtectedRoute>
        } />
        <Route path="/dentiste/ordonnance/:visite_id" element={
          <ProtectedRoute roles={['DENTISTE']}>
            <IssuePrescription />
          </ProtectedRoute>
        } />
        <Route path="/dentiste/patient/:id/historique" element={
          <ProtectedRoute roles={['DENTISTE']}>
            <PatientHistory />
          </ProtectedRoute>
        } />
        <Route path="/dentiste/patients" element={
          <ProtectedRoute roles={['DENTISTE']}>
            <PatientHistory />
          </ProtectedRoute>
        } />
        <Route path="/dentiste/compte" element={
          <ProtectedRoute roles={['DENTISTE']}>
            <MonCompte />
          </ProtectedRoute>
        } />

      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
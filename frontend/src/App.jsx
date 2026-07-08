import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// ─── Auth ───
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import RegisterClinic from './pages/auth/RegisterClinic'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// ─── Shared ───
import SubscriptionBlocked from './pages/shared/SubscriptionBlocked'

// ─── Admin ───
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageTeam from './pages/admin/ManageTeam'
import BillingPage from './pages/admin/BillingPage'
import ParametresClinique from './pages/admin/ParametresClinique'
import GestionCatalogueOperations from './pages/admin/GestionCatalogueOperations'
import GestionMedicaments from './pages/admin/GestionMedicaments'
import MonCompte from './pages/shared/MonCompte'

// ─── Super Admin ───
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard'
import SuperAdminTenants from './pages/superadmin/SuperAdminTenants'
import SuperAdminTenantDetail from './pages/superadmin/SuperAdminTenantDetail'

// ─── Patient ───
import PatientDashboard from './pages/patient/PatientDashboard'
import BookAppointment from './pages/patient/BookAppointment'
import MyAppointments from './pages/patient/MyAppointments'
import MyVisits from './pages/patient/MyVisits'
import MyPrescriptions from './pages/patient/MyPrescriptions'
import MyInvoices from './pages/patient/MyInvoices'
import MyProfile from './pages/patient/MyProfile'

// ─── Secretaire ───
import SecretaireDashboard from './pages/secretaire/SecretaireDashboard'
import ManageAppointments from './pages/secretaire/ManageAppointments'
import ManagePayments from './pages/secretaire/ManagePayments'

import PatientsList from './pages/secretaire/PatientsList'

// ─── Dentiste ───
import DentisteDashboard from './pages/dentiste/DentisteDashboard'
import AgendaDuJour from './pages/dentiste/AgendaDuJour'
import VisiteDetail from './pages/dentiste/VisiteDetail'
import RecordVisit from './pages/dentiste/RecordVisit'
import IssuePrescription from './pages/dentiste/IssuePrescription'
import PatientHistory from './pages/dentiste/PatientHistory'

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default App
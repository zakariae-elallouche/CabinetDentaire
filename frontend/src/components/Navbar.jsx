import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const roleLabel = {
    SUPERADMIN: 'Super Admin',
    ADMIN_CLINIQUE: 'Admin Clinique',
    DENTISTE: 'Docteur',
    SECRETAIRE: 'Secrétaire',
    PATIENT: 'Patient',
  }

  const displayName = user?.nom_complet || user?.nom || roleLabel[user?.role] || user?.email || ''

  // ─── Fonction déconnexion ───
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // ─── Liens selon le rôle ───
  const getLinks = () => {
    if (user?.role === 'PATIENT') {
      return (
        <>
          <Link to="/patient/dashboard" style={styles.link}>🏠 Accueil</Link>
          <Link to="/patient/reserver" style={styles.link}>📅 Réserver</Link>
          <Link to="/patient/rendez-vous" style={styles.link}>📋 Mes RDV</Link>
          <Link to="/patient/visites" style={styles.link}>🏥 Visites</Link>
          <Link to="/patient/ordonnances" style={styles.link}>💊 Mes Ordonnances</Link>
          <Link to="/patient/factures" style={styles.link}>💳 Mes Factures</Link>
        </>
      )
    }

    if (user?.role === 'SECRETAIRE') {
      return (
        <>
          <Link to="/secretaire/dashboard" style={styles.link}>🏠 Accueil</Link>
          <Link to="/secretaire/rendez-vous" style={styles.link}>📋 Rendez-vous</Link>
          <Link to="/secretaire/paiements" style={styles.link}>💳 Paiements</Link>
          <Link to="/secretaire/medicaments" style={styles.link}>💊 Médicaments</Link>
          <Link to="/secretaire/patients" style={styles.link}>👥 Patients</Link>
        </>
      )
    }

    if (user?.role === 'DENTISTE') {
      return (
        <>
          <Link to="/dentiste/dashboard" style={styles.link}>🏠 Accueil</Link>
          <Link to="/dentiste/visite/nouvelle" style={styles.link}>📝 Enregistrer visite</Link>
          <Link to="/dentiste/agenda" style={styles.link}>📅 Agenda</Link>
          <Link to="/dentiste/patients" style={styles.link}>👥 Patients</Link>
        </>
      )
    }
  }

  return (
    <nav style={styles.navbar}>

      {/* Logo */}
      <div style={styles.logo}>
        <span style={styles.logoIcon}>🦷</span>
        <span style={styles.logoText}>HZ Dentaire</span>
      </div>

      {/* Liens navigation */}
      <div style={styles.links}>
        {getLinks()}
      </div>

      {/* User info + Déconnexion */}
      <div style={styles.right}>
        <span style={styles.userName}>
          👤 {displayName}
        </span>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 Déconnexion
        </button>
      </div>

    </nav>
  )
}

// ─── Styles ───
const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#0B1F3A',
    padding: '0 2rem',
    height: '64px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    fontSize: '1.5rem',
    background: '#00C9A7',
    borderRadius: '8px',
    padding: '4px 8px',
  },
  logoText: {
    color: 'white',
    fontFamily: 'Georgia, serif',
    fontSize: '1.2rem',
    fontWeight: '600',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  link: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userName: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.85rem',
  },
  logoutBtn: {
    background: 'rgba(239,68,68,0.15)',
    color: '#EF4444',
    border: '1px solid rgba(239,68,68,0.3)',
    padding: '7px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
}

export default Navbar
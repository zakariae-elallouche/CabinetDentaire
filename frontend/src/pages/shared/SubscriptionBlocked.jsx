import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function SubscriptionBlocked() {
  const { logout, tenantStatut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 24,
    }}>
      <div style={{
        textAlign: 'center', maxWidth: 420, background: 'var(--card)',
        borderRadius: 16, border: '1px solid var(--line)', padding: '48px 36px',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: '#FEF2F2',
          display: 'grid', placeItems: 'center', margin: '0 auto 20px',
          fontSize: 28,
        }}>🔒</div>
        <h1 style={{
          fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 22,
          color: 'var(--ink)', margin: '0 0 8px',
        }}>
          {tenantStatut === 'suspendu' ? 'Accès suspendu' : 'Abonnement expiré'}
        </h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>
          Votre période d'essai est terminée et aucun abonnement actif n'a été trouvé.<br />
          Veuillez contacter votre administrateur pour souscrire à un abonnement et rétablir l'accès.
        </p>
        <button onClick={handleLogout} style={{
          padding: '12px 32px', borderRadius: 10, border: '1px solid var(--line)',
          background: 'var(--surface)', color: 'var(--ink)', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
        }}>
          Se déconnecter
        </button>
      </div>
    </div>
  )
}

export default SubscriptionBlocked

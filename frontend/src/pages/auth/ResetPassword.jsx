import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { resetPassword } = useAuth()

  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email, token, password, passwordConfirmation)
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Lien invalide ou expiré.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!email || !token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔗</div>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 22, color: 'var(--ink)', margin: '0 0 8px' }}>Lien invalide</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: '0 0 24px', textAlign: 'center' }}>Ce lien de réinitialisation est invalide ou a expiré.</p>
        <Link to="/forgot-password" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Demander un nouveau lien</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/HZLogo.png" alt="HZ" style={{ width: 48, height: 48, marginBottom: 8 }} />
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 24, color: 'var(--ink)', margin: '0 0 4px' }}>Nouveau mot de passe</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: 0 }}>
            Choisissez un nouveau mot de passe pour <strong>{email}</strong>
          </p>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: 16, padding: 32, border: '1px solid var(--line)' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6, fontWeight: 500 }}>Nouveau mot de passe</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 caractères" required minLength={6}
                style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6, fontWeight: 500 }}>Confirmer le mot de passe</label>
              <input
                type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)}
                placeholder="Répétez le mot de passe" required
                style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Réinitialisation...' : 'Réinitialiser →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', marginTop: 20, marginBottom: 0 }}>
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

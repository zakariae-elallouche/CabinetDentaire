import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { forgotPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await forgotPassword(email)
      setMessage(res.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11, marginBottom: 16 }}>
            <img src="/DentASpace-LogoBG.png" alt="Dent A Space"
              style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 10 }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: 17, color: 'var(--ink)' }}>Dent <span style={{ color: '#57c8cb' }}>A</span> Space</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.05em' }}>CABINET DENTAIRE</div>
            </div>
          </div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 24, color: 'var(--ink)', margin: '0 0 4px' }}>Mot de passe oublié ?</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: 0 }}>
            Saisissez votre email, nous vous enverrons un lien de réinitialisation.
          </p>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: 16, padding: 32, border: '1px solid var(--line)' }}>
          {message && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {message}
            </div>
          )}
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6, fontWeight: 500 }}>Adresse email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="exemple@email.com" required
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px', background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Envoi...' : 'Envoyer le lien →'}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', marginTop: 20, marginBottom: 0 }}>
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

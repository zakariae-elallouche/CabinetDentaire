import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AnimateIn from '../../components/AnimateIn'
import { useApiQuery, useApiMutation } from '../../hooks/useApi'

function AcceptInvitation() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [form, setForm] = useState({ nom: '', prenom: '', password: '', password_confirmation: '' })
  const [submitting, setSubmitting] = useState(false)

  const { data: invitation, isLoading: loading } = useApiQuery(
    ['invitation', token],
    `/invitations/${token}`,
    { enabled: !!token }
  )

  const acceptMutation = useApiMutation('post', null, {
    onSuccess: (res) => {
      const { token: newToken, user } = res.data
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(user))
      const routes = { SECRETAIRE: '/secretaire/dashboard', DENTISTE: '/dentiste/dashboard' }
      navigate(routes[user.role] || '/login')
    },
    onError: (err) => setError(err?.response?.data?.message || "Erreur lors de l'acceptation"),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await acceptMutation.mutateAsync({ _config: { url: `/invitations/${token}/accept` }, ...form })
    } catch { /* handled */ }
    setSubmitting(false)
  }
    setSubmitting(false)
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', color: 'var(--ink-3)', fontSize: 14 }}><DonutLoader /></div>
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔗</div>
      <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 22, color: 'var(--ink)', margin: '0 0 8px' }}>Lien invalide</h1>
      <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: '0 0 24px', textAlign: 'center' }}>{error}</p>
      <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Retour à la connexion</Link>
    </div>
  )

  return (
    <AnimateIn>
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/HZLogo.png" alt="HZ" style={{ width: 48, height: 48, marginBottom: 8 }} />
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 24, color: 'var(--ink)', margin: '0 0 4px' }}>Rejoindre {invitation?.tenant?.nom_clinique}</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: 0 }}>
            Vous êtes invité en tant que <strong>{invitation?.role === 'dentiste' ? 'Dentiste' : 'Secrétaire'}</strong>
          </p>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: 16, padding: 32, border: '1px solid var(--line)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={invitation?.email || ''} disabled style={{ ...inputStyle, opacity: 0.6 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Prénom</label>
                <input type="text" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Nom</label>
                <input type="text" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} style={inputStyle} required />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Mot de passe</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 caractères" style={inputStyle} required minLength={6} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Confirmer le mot de passe</label>
              <input type="password" value={form.password_confirmation} onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))} placeholder="Répétez le mot de passe" style={inputStyle} required />
            </div>

            <button type="submit" disabled={submitting} style={{
              width: '100%', padding: '14px', background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? 'Création...' : 'Rejoindre la clinique →'}
            </button>
          </form>
        </div>
      </div>
    </div>
    </AnimateIn>
  )
}

const inputStyle = {
  width: '100%', padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 10,
  fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
}
const labelStyle = {
  display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'var(--ink-3)', marginBottom: 6, fontWeight: 500,
}

export default AcceptInvitation

import DonutLoader from '../../components/DonutLoader'
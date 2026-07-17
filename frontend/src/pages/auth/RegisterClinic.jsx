import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'

const P = '#0d9488'
const P_HOVER = '#0f766e'
const ACCENT = '#57c8cb'

const VILLES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Safi', 'El Jadida', 'Nador', 'Khouribga', 'Béni Mellal']

const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

const inputBase = {
  width: '100%',
  padding: '13px 15px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 11,
  fontSize: 15,
  background: '#fff',
  color: '#191919',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

function RegisterClinic() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ nom_clinique: '', nom_admin: '', prenom_admin: '', email: '', password: '', password_confirmation: '', telephone: '', ville: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = { ...form, slug: slugify(form.nom_clinique) }
      const res = await api.post('/register-clinic', data)
      const { token: newToken, user: userData } = res.data
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription")
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `url('/background-dentaspace.webp') center/cover no-repeat`,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.35)',
      }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28,
        }}>
          <img src="/DentASpace-LogoBG.webp" alt="Dent A Space"
            style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 11 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 19, color: '#fff' }}>Dent <span style={{ color: ACCENT }}>A</span> Space</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>CABINET DENTAIRE</div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          maxWidth: 640,
          width: '100%',
          animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <div style={{
            flex: 1,
            padding: '48px 44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <div style={{ marginBottom: 24 }}>
            <h2 style={{
              fontSize: 26, fontWeight: 600, color: '#191919',
              margin: '0 0 7px', letterSpacing: '-0.02em',
            }}>
              Ouvrir votre clinique
            </h2>
            <p style={{ color: '#6a6a6a', fontSize: 15, margin: 0 }}>
              Essayez gratuitement pendant 30 jours
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#dc2626', padding: '11px 15px',
              borderRadius: 11, fontSize: '14px', marginBottom: 18,
              animation: 'slideUp 0.3s ease',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 500,
                color: '#191919', marginBottom: 7,
              }}>
                Nom de la clinique
              </label>
              <input
                type="text" value={form.nom_clinique}
                onChange={e => update('nom_clinique', e.target.value)}
                placeholder="Clinique Dr. Alami"
                style={inputBase} required
                onFocus={e => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.15)' }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <div>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 500,
                  color: '#191919', marginBottom: 7,
                }}>
                  Email
                </label>
                <input
                  type="email" value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="contact@clinique.ma"
                  style={inputBase} required
                  onFocus={e => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 500,
                  color: '#191919', marginBottom: 7,
                }}>
                  Téléphone
                </label>
                <input
                  type="tel" value={form.telephone}
                  onChange={e => update('telephone', e.target.value)}
                  placeholder="06 XX XX XX XX"
                  style={inputBase} required
                  onFocus={e => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <div>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 500,
                  color: '#191919', marginBottom: 7,
                }}>
                  Nom de l'admin
                </label>
                <input
                  type="text" value={form.nom_admin}
                  onChange={e => update('nom_admin', e.target.value)}
                  placeholder="Alami"
                  style={inputBase} required
                  onFocus={e => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 500,
                  color: '#191919', marginBottom: 7,
                }}>
                  Prénom de l'admin
                </label>
                <input
                  type="text" value={form.prenom_admin}
                  onChange={e => update('prenom_admin', e.target.value)}
                  placeholder="Mohamed"
                  style={inputBase} required
                  onFocus={e => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 500,
                  color: '#191919', marginBottom: 7,
                }}>
                  Mot de passe
                </label>
                <input
                  type="password" value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="Min. 6 caractères"
                  style={inputBase} required minLength={6}
                  onFocus={e => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 500,
                  color: '#191919', marginBottom: 7,
                }}>
                  Confirmer
                </label>
                <input
                  type="password" value={form.password_confirmation}
                  onChange={e => update('password_confirmation', e.target.value)}
                  placeholder="Répétez le mot de passe"
                  style={inputBase} required
                  onFocus={e => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 500,
                color: '#191919', marginBottom: 6,
              }}>
                Ville
              </label>
              <select
                value={form.ville}
                onChange={e => update('ville', e.target.value)}
                style={{
                  ...inputBase,
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236a6a6a' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  paddingRight: 36,
                }}
                required
              >
                <option value="">Sélectionnez une ville</option>
                {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? '#94d3d5' : P,
              color: '#fff', border: 'none', borderRadius: 11,
              fontSize: 15, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', letterSpacing: '0.02em',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(13,148,136,0.3)',
            }}
              onMouseEnter={e => {
                if (!loading) {
                  e.target.style.background = P_HOVER
                  e.target.style.boxShadow = '0 6px 20px rgba(13,148,136,0.4)'
                  e.target.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  e.target.style.background = P
                  e.target.style.boxShadow = '0 4px 14px rgba(13,148,136,0.3)'
                  e.target.style.transform = 'none'
                }
              }}
            >
              {loading ? 'Création en cours...' : 'Démarrer 30 jours gratuits →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6a6a6a', margin: '24px 0 0' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: P, textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={e => e.target.style.color = P_HOVER}
              onMouseLeave={e => e.target.style.color = P}
            >Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  )
}

export default RegisterClinic

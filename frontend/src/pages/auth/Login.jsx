import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const P = '#0d9488'
const P_HOVER = '#0f766e'
const ACCENT = '#57c8cb'

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

const btnBase = {
  width: '100%',
  padding: '14px',
  background: P,
  color: '#fff',
  border: 'none',
  borderRadius: 11,
  fontSize: 15,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
  letterSpacing: '0.02em',
  transition: 'all 0.2s',
  boxShadow: `0 4px 14px rgba(13,148,136,0.3)`,
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const mergedUser = await login(email, password)
      const routes = {
        PATIENT: '/patient/dashboard',
        SECRETAIRE: '/secretaire/dashboard',
        DENTISTE: '/dentiste/dashboard',
        ADMIN_CLINIQUE: '/admin/dashboard',
        SUPERADMIN: '/superadmin/dashboard',
      }
      navigate(routes[mergedUser.role] || '/login')
    } catch (err) {
      setError('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  const formContent = (
    <>
      <div style={{ marginBottom: 8 }}>
        <h2 style={{
          fontSize: 26, fontWeight: 600, color: '#191919',
          margin: '0 0 7px', letterSpacing: '-0.02em',
        }}>Bon retour</h2>
        <p style={{ color: '#6a6a6a', fontSize: 15, margin: 0 }}>
          Connectez-vous à votre espace personnel
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
              Adresse email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="exemple@email.com" required
              style={inputBase}
              onFocus={e => { e.target.style.borderColor = P; e.target.style.boxShadow = `0 0 0 3px rgba(13,148,136,0.15)` }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block', fontSize: 13, fontWeight: 500,
              color: '#191919', marginBottom: 7,
            }}>
              Mot de passe
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              style={inputBase}
              onFocus={e => { e.target.style.borderColor = P; e.target.style.boxShadow = `0 0 0 3px rgba(13,148,136,0.15)` }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
            />
            <Link to="/forgot-password" style={{
              display: 'inline-block', marginTop: 8, fontSize: 12, color: P,
              textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = P_HOVER}
              onMouseLeave={e => e.target.style.color = P}
            >Mot de passe oublié ?</Link>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              ...btnBase,
              background: loading ? '#94d3d5' : P,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : `0 4px 14px rgba(13,148,136,0.3)`,
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
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6a6a6a', margin: '24px 0 0' }}>
          Vous êtes un cabinet ?{' '}
          <Link to="/register-clinic" style={{ color: P, textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => e.target.style.color = P_HOVER}
            onMouseLeave={e => e.target.style.color = P}
          >Demander un essai</Link>
        </p>
    </>
  )

  const desktopView = (
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
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        maxWidth: 960,
        width: '100%',
        minHeight: 580,
        position: 'relative',
        zIndex: 1,
        animation: mounted ? 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both' : 'none',
      }}>
        <div style={{
          flex: '0 0 50%',
          padding: '48px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 11, marginBottom: 42,
          }}>
            <img src="/DentASpace-LogoBG.webp" alt="Dent A Space"
              style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 10 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 17 }}>Dent <span style={{ color: ACCENT }}>A</span> Space</div>
              <div style={{ fontSize: 11, color: '#6a6a6a', letterSpacing: '0.05em' }}>CABINET DENTAIRE</div>
            </div>
          </div>
          {formContent}
        </div>

        <div style={{
          flex: '0 0 50%',
          background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #ecfeff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-15%', right: '-15%',
            width: '60%', height: '60%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-20%', left: '-20%',
            width: '70%', height: '70%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%)',
          }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <img
              src="/unDrawn.webp"
              alt="Authentication"
              loading="lazy"
              style={{ width: '100%', maxWidth: 380, height: 'auto', display: 'block' }}
            />
            <p style={{
              margin: '24px auto 0', fontSize: 15, color: '#0d9488',
              fontWeight: 500, lineHeight: 1.5, maxWidth: 300,
            }}>
              Optimiser le fonctionnement de votre cabinet dentaire
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const mobileView = (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), var(--ink)',
      backgroundSize: 'cover',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: 20,
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.35)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        animation: mounted ? 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both' : 'none',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 11, marginBottom: 28,
          justifyContent: 'center',
        }}>
          <img src="/DentASpace-LogoBG.webp" alt="Dent A Space"
            style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 9 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, color: '#fff' }}>Dent <span style={{ color: ACCENT }}>A</span> Space</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>CABINET DENTAIRE</div>
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 16, padding: '31px 22px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}>
          {formContent}
        </div>
      </div>
    </div>
  )

  return isDesktop ? desktopView : mobileView
}

export default Login

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useIsMobile } from '../../hooks/useIsMobile'

const IcoPatient    = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
const IcoSecretaire = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M12 12v4M10 14h4"/></svg>
const IcoDentiste   = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="22" height="22" fill="currentColor"><path d="M320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72zM380 384.8C374.6 384.3 369 384 363.4 384L276.5 384C270.9 384 265.4 384.3 259.9 384.8L259.9 452.3C276.4 459.9 287.9 476.6 287.9 495.9C287.9 522.4 266.4 543.9 239.9 543.9C213.4 543.9 191.9 522.4 191.9 495.9C191.9 476.5 203.4 459.8 219.9 452.3L219.9 393.9C157 417 112 477.6 112 548.6C112 563.7 124.3 576 139.4 576L500.5 576C515.6 576 527.9 563.7 527.9 548.6C527.9 477.6 482.9 417.1 419.9 394L419.9 431.4C443.2 439.6 459.9 461.9 459.9 488L459.9 520C459.9 531 450.9 540 439.9 540C428.9 540 419.9 531 419.9 520L419.9 488C419.9 477 410.9 468 399.9 468C388.9 468 379.9 477 379.9 488L379.9 520C379.9 531 370.9 540 359.9 540C348.9 540 339.9 531 339.9 520L339.9 488C339.9 461.9 356.6 439.7 379.9 431.4L379.9 384.8z"/></svg>

const ROLES = [
  { role: 'PATIENT',    Ico: IcoPatient,    label: 'Patient',    color: '#dfe9e6', iconColor: 'var(--accent)' },
  { role: 'SECRETAIRE', Ico: IcoSecretaire, label: 'Secrétaire', color: '#f1e4cf', iconColor: 'var(--gold)' },
  { role: 'DENTISTE',   Ico: IcoDentiste,   label: 'Dentiste',   color: '#dfe9e6', iconColor: 'var(--accent)' },
]

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

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
      }
      navigate(routes[mergedUser.role])
    } catch {
      setError('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  const loginAs = (role) => {
    const creds = {
      PATIENT: 'patient@clinic.ma',
      SECRETAIRE: 'secretaire@clinic.ma',
      DENTISTE: 'dentiste@clinic.ma',
    }
    setEmail(creds[role])
    setPassword('password')
  }

  if (isMobile) return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
        <img src="/HZLogo.png" alt="HZ" style={{ width: 48, height: 48, objectFit: 'contain' }} />
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 20, color: 'var(--ink)' }}>HZ Dentaire</div>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Cabinet Dentaire</div>
        </div>
      </div>

      {/* Form */}
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: '1.8rem', letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 6px' }}>Bon retour 👋</h2>
        <p style={{ color: 'var(--ink-3)', fontSize: '14px', margin: '0 0 24px' }}>Connectez-vous à votre espace personnel</p>

        {error && <div style={styles.errorBox}>❌ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Adresse email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemple@email.com" style={styles.input} required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={styles.input} required />
          </div>
          <button type="submit" style={styles.btnLogin} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter →'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine}/><span style={styles.dividerText}>Accès rapide</span><span style={styles.dividerLine}/>
        </div>

        <div style={styles.roleGrid}>
          {ROLES.map(d => (
            <button key={d.role} style={{ ...styles.roleBtn, background: d.color }} onClick={() => loginAs(d.role)}>
              <span style={{ color: d.iconColor }}><d.Ico /></span>
              <span style={styles.roleBtnLabel}>{d.label}</span>
            </button>
          ))}
        </div>

        <p style={styles.switchText}>
          Pas encore de compte ?{' '}<Link to="/register" style={styles.link}>Créer un compte</Link>
        </p>
      </div>
    </div>
  )

  return (
    <div style={styles.page}>

      {/* ── Background image full page ── */}
      <div style={styles.bgImage}/>
      <div style={styles.bgOverlay}/>

      {/* ── Logo en haut à gauche ── */}
      <div style={styles.logoTop}>
        <img src="/HZLogo.png" alt="HZ Dentaire" style={{ width: '46px', height: '46px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        <div>
          <div style={styles.logoName}>HZ Dentaire</div>
          <div style={styles.logoSub}>Cabinet Dentaire</div>
        </div>
      </div>

      {/* ── Slogan gauche ── */}
      <div style={styles.sloganBox} className="login-slogan">
        <div style={styles.sloganTag}>✦ Excellence dentaire </div>
        <h1 style={styles.slogan}>
          Votre sourire,<br/>
          <em style={styles.sloganEm}>notre priorité.</em>
        </h1>
        <p style={styles.sloganSub}>
          Prenez soin de votre santé bucco-dentaire avec<br/>
          une équipe dédiée et des soins de qualité supérieure.
        </p>
        <div style={styles.stats}>
          <div style={styles.stat}>
            <span style={styles.statNum}>500+</span>
            <span style={styles.statLbl}>Patients</span>
          </div>
          <div style={styles.statDiv}/>
          <div style={styles.stat}>
            <span style={styles.statNum}>98%</span>
            <span style={styles.statLbl}>Satisfaction</span>
          </div>
          <div style={styles.statDiv}/>
          <div style={styles.stat}>
            <span style={styles.statNum}>6+</span>
            <span style={styles.statLbl}>Années</span>
          </div>
        </div>
      </div>

      {/* ── Formulaire droite ── */}
      <div style={styles.formPanel} className="login-panel">
        <div style={styles.formInner}>

          {/* Mobile logo */}
          <div className="auth-mobile-logo" style={{ display: 'none', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <img src="/HZLogo.png" alt="HZ Dentaire" style={{ width: 44, height: 44, objectFit: 'contain' }} />
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 18, color: 'var(--ink)' }}>HZ Dentaire</div>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Cabinet Dentaire</div>
            </div>
          </div>

          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Bon retour 👋</h2>
            <p style={styles.formSub}>Connectez-vous à votre espace personnel</p>
          </div>

          {error && (
            <div style={styles.errorBox}>❌ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
              />
            </div>

            <button type="submit" style={styles.btnLogin} disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine}/>
            <span style={styles.dividerText}>Accès rapide</span>
            <span style={styles.dividerLine}/>
          </div>

          <div style={styles.roleGrid}>
            {ROLES.map(d => (
              <button
                key={d.role}
                style={{ ...styles.roleBtn, background: d.color }}
                onClick={() => loginAs(d.role)}
              >
                <span style={{ color: d.iconColor }}><d.Ico /></span>
                <span style={styles.roleBtnLabel}>{d.label}</span>
              </button>
            ))}
          </div>

          <p style={styles.switchText}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={styles.link}>Créer un compte</Link>
          </p>

        </div>
      </div>

    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    display: 'flex',
    alignItems: 'stretch',
  },
  bgImage: {
    position: 'fixed',
    inset: 0,
    backgroundImage: 'url(https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1400&q=90)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: 0,
  },
  bgOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(110deg, rgba(10,40,36,0.82) 0%, rgba(10,40,36,0.65) 50%, rgba(10,40,36,0.15) 100%)',
    zIndex: 1,
  },
  logoTop: {
    position: 'fixed',
    top: '2rem',
    left: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 10,
  },
  logoBox: {
    width: '46px',
    height: '46px',
    borderRadius: '13px',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    border: '1.5px solid rgba(255,255,255,0.3)',
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  logoHZ: {
    fontFamily: "'Fraunces', serif",
    fontWeight: '600',
    fontSize: '18px',
    color: 'white',
    letterSpacing: '-0.02em',
  },
  logoName: {
    fontFamily: "'Fraunces', serif",
    fontWeight: '600',
    fontSize: '17px',
    color: 'white',
    letterSpacing: '-0.01em',
    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  logoSub: {
    fontSize: '10px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.6)',
  },
  sloganBox: {
    position: 'relative',
    zIndex: 5,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '8rem 3rem 3rem 3.5rem',
    maxWidth: '55%',
  },
  sloganTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '999px',
    padding: '6px 16px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: '0.04em',
    marginBottom: '1.5rem',
    width: 'fit-content',
  },
  slogan: {
    fontFamily: "'Fraunces', serif",
    fontWeight: '300',
    fontSize: '52px',
    lineHeight: '1.1',
    color: 'white',
    margin: '0 0 1.25rem',
    letterSpacing: '-0.02em',
    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  sloganEm: {
    fontStyle: 'italic',
    fontWeight: '400',
    color: '#7dd3c8',
  },
  sloganSub: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: '1.7',
    margin: '0 0 2.5rem',
    maxWidth: '42ch',
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statNum: {
    fontFamily: "'Fraunces', serif",
    fontSize: '28px',
    fontWeight: '500',
    color: 'white',
    letterSpacing: '-0.02em',
  },
  statLbl: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  statDiv: {
    width: '1px',
    height: '36px',
    background: 'rgba(255,255,255,0.2)',
  },
  formPanel: {
    position: 'relative',
    zIndex: 5,
    width: '440px',
    flexShrink: 0,
    background: 'var(--bg, #f4f1ea)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    boxShadow: '-20px 0 80px rgba(0,0,0,0.25)',
  },
  formInner: {
    width: '100%',
    maxWidth: '360px',
  },
  formHeader: {
    marginBottom: '2rem',
  },
  formTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: '400',
    fontSize: '2rem',
    letterSpacing: '-0.02em',
    color: 'var(--ink, #1a201f)',
    margin: '0 0 6px',
  },
  formSub: {
    color: 'var(--ink-3, #7d8682)',
    fontSize: '14px',
    margin: 0,
  },
  errorBox: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#991B1B',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '1rem',
  },
  formGroup: { marginBottom: '1.2rem' },
  label: {
    display: 'block',
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--ink-3, #7d8682)',
    marginBottom: '6px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid var(--line, #e3ddd0)',
    borderRadius: '10px',
    fontSize: '14px',
    background: 'var(--card, #ffffff)',
    color: 'var(--ink, #1a201f)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  btnLogin: {
    width: '100%',
    padding: '13px',
    background: 'var(--accent, #0f4842)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: '0.5rem',
    letterSpacing: '0.02em',
    transition: 'all 0.15s',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '1.75rem 0 1.25rem',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'var(--line, #e3ddd0)',
  },
  dividerText: {
    fontSize: '11.5px',
    color: 'var(--ink-3, #7d8682)',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
  },
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
    marginBottom: '1.5rem',
  },
  roleBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 8px',
    border: '1px solid var(--line, #e3ddd0)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  roleBtnLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--ink-2, #46504d)',
  },
  switchText: {
    textAlign: 'center',
    fontSize: '13px',
    color: 'var(--ink-3, #7d8682)',
    margin: 0,
  },
  link: {
    color: 'var(--accent, #0f4842)',
    textDecoration: 'none',
    fontWeight: '500',
  },
}

export default Login
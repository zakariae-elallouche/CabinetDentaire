import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useIsMobile } from '../../hooks/useIsMobile'

function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    password_confirmation: '',
    telephone: '',
    adresse: '',
    date_naissance: '',
    sexe: 'masculin',
    contact_urgence: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(formData)
      navigate('/patient/dashboard')
    } catch {
      setError("Erreur lors de l'inscription. Vérifiez vos informations.")
    } finally {
      setLoading(false)
    }
  }

  const FormRow = ({ children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>{children}</div>
  )

  if (isMobile) return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', padding: '32px 20px 60px', overflowY: 'auto' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <img src="/HZLogo.png" alt="HZ" style={{ width: 44, height: 44, objectFit: 'contain' }} />
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 18, color: 'var(--ink)' }}>HZ Dentaire</div>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Cabinet Dentaire</div>
        </div>
      </div>

      <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: '1.7rem', letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 6px' }}>Créer un compte 🦷</h2>
      <p style={{ color: 'var(--ink-3)', fontSize: '14px', margin: '0 0 24px' }}>Remplissez vos informations personnelles</p>

      {error && <div style={styles.errorBox}>❌ {error}</div>}

      <form onSubmit={handleSubmit}>
        <FormRow>
          <div style={styles.formGroup}><label style={styles.label}>Nom</label><input style={styles.input} type="text" name="nom" placeholder="Benali" value={formData.nom} onChange={handleChange} required /></div>
          <div style={styles.formGroup}><label style={styles.label}>Prénom</label><input style={styles.input} type="text" name="prenom" placeholder="Ahmed" value={formData.prenom} onChange={handleChange} required /></div>
        </FormRow>
        <div style={styles.formGroup}><label style={styles.label}>Email</label><input style={styles.input} type="email" name="email" placeholder="exemple@email.com" value={formData.email} onChange={handleChange} required /></div>
        <div style={styles.formGroup}><label style={styles.label}>Mot de passe</label><input style={styles.input} type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required minLength={6} /></div>
        <div style={styles.formGroup}><label style={styles.label}>Confirmer mot de passe</label><input style={styles.input} type="password" name="password_confirmation" placeholder="••••••••" value={formData.password_confirmation} onChange={handleChange} required minLength={6} /></div>
        <div style={styles.formGroup}><label style={styles.label}>Téléphone</label><input style={styles.input} type="tel" name="telephone" placeholder="+212 6 xx-xxx-xxx" value={formData.telephone} onChange={handleChange} required /></div>
        <FormRow>
          <div style={styles.formGroup}><label style={styles.label}>Date de naissance</label><input style={styles.input} type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} required /></div>
          <div style={styles.formGroup}><label style={styles.label}>Sexe</label><select style={styles.input} name="sexe" value={formData.sexe} onChange={handleChange}><option value="masculin">Masculin</option><option value="feminin">Féminin</option></select></div>
        </FormRow>
        <div style={styles.formGroup}><label style={styles.label}>Adresse</label><input style={styles.input} type="text" name="adresse" placeholder="123 Rue, Ville" value={formData.adresse} onChange={handleChange} /></div>
        <button type="submit" style={styles.btnSubmit} disabled={loading}>{loading ? 'Inscription...' : 'Créer mon compte →'}</button>
      </form>

      <p style={{ ...styles.switchText, marginTop: '20px' }}>
        Déjà un compte ?{' '}<Link to="/login" style={styles.link}>Se connecter</Link>
      </p>
    </div>
  )

  return (
    <div style={styles.page}>

      <div style={styles.bgImage} />
      <div style={styles.bgOverlay} />

      {/* Logo top-left */}
      <div style={styles.logoTop} className="auth-logo-top">
        <div style={styles.logoBox}>
          <span style={styles.logoHZ}>HZ</span>
        </div>
        <div>
          <div style={styles.logoName}>HZ Dentaire</div>
          <div style={styles.logoSub}>Cabinet Dentaire</div>
        </div>
      </div>

      {/* Left slogan */}
      <div style={styles.sloganBox} className="login-slogan">
        <div style={styles.sloganTag}>✦ Rejoignez-nous</div>
        <h1 style={styles.slogan}>
          Créez votre<br />
          <em style={styles.sloganEm}>espace santé.</em>
        </h1>
        <p style={styles.sloganSub}>
          Inscrivez-vous en quelques minutes et bénéficiez<br />
          d'un suivi dentaire personnalisé et de qualité.
        </p>
        <div style={styles.features}>
          {[
            'Réservation de rendez-vous en ligne',
            'Accès à votre dossier médical',
            'Consultez vos ordonnances',
            'Suivi de vos factures',
          ].map((f) => (
            <div key={f} style={styles.featureItem}>
              <span style={styles.featureDot}>✓</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
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
            <h2 style={styles.formTitle}>Créer un compte 🦷</h2>
            <p style={styles.formSub}>Remplissez vos informations personnelles</p>
          </div>

          {error && <div style={styles.errorBox}>❌ {error}</div>}

          <form onSubmit={handleSubmit}>

            <div style={styles.row} className="auth-form-row">
              <div style={styles.formGroup}>
                <label style={styles.label}>Nom</label>
                <input
                  style={styles.input}
                  type="text"
                  name="nom"
                  placeholder="Benali"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Prénom</label>
                <input
                  style={styles.input}
                  type="text"
                  name="prenom"
                  placeholder="Ahmed"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Adresse email</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                placeholder="exemple@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.row} className="auth-form-row">
              <div style={styles.formGroup}>
                <label style={styles.label}>Mot de passe</label>
                <input
                  style={styles.input}
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Confirmer mot de passe</label>
                <input
                  style={styles.input}
                  type="password"
                  name="password_confirmation"
                  placeholder="••••••••"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div style={styles.row} className="auth-form-row">
              <div style={styles.formGroup}>
                <label style={styles.label}>Téléphone</label>
                <input
                  style={styles.input}
                  type="tel"
                  name="telephone"
                  placeholder="+212 6 xx-xxx-xxx"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Sexe</label>
                <select
                  style={styles.input}
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleChange}
                >
                  <option value="masculin">Masculin</option>
                  <option value="feminin">Féminin</option>
                </select>
              </div>
            </div>

            <div style={styles.row} className="auth-form-row">
              <div style={styles.formGroup}>
                <label style={styles.label}>Date de naissance</label>
                <input
                  style={styles.input}
                  type="date"
                  name="date_naissance"
                  value={formData.date_naissance}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contact urgence</label>
                <input
                  style={styles.input}
                  type="tel"
                  name="contact_urgence"
                  placeholder="+212 6 xx-xxx-xxx"
                  value={formData.contact_urgence}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Adresse</label>
              <input
                style={styles.input}
                type="text"
                name="adresse"
                placeholder="123 Rue, Ville"
                value={formData.adresse}
                onChange={handleChange}
              />
            </div>

            <button type="submit" style={styles.btnSubmit} disabled={loading}>
              {loading ? 'Inscription...' : "Créer mon compte →"}
            </button>
          </form>

          <p style={styles.switchText}>
            Déjà un compte ?{' '}
            <Link to="/login" style={styles.link}>Se connecter</Link>
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
    margin: '0 0 2rem',
    maxWidth: '42ch',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '14px',
  },
  featureDot: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: 'rgba(125,211,200,0.25)',
    border: '1px solid rgba(125,211,200,0.5)',
    display: 'grid',
    placeItems: 'center',
    fontSize: '11px',
    color: '#7dd3c8',
    flexShrink: 0,
  },
  formPanel: {
    position: 'relative',
    zIndex: 5,
    width: '460px',
    flexShrink: 0,
    background: 'var(--bg, #f4f1ea)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '2.5rem 2rem',
    boxShadow: '-20px 0 80px rgba(0,0,0,0.25)',
    overflowY: 'auto',
    maxHeight: '100vh',
  },
  formInner: {
    width: '100%',
    maxWidth: '380px',
  },
  formHeader: {
    marginBottom: '1.75rem',
  },
  formTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: '400',
    fontSize: '1.9rem',
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
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  formGroup: {
    marginBottom: '1.1rem',
  },
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
    padding: '11px 14px',
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
  btnSubmit: {
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
  switchText: {
    textAlign: 'center',
    fontSize: '13px',
    color: 'var(--ink-3, #7d8682)',
    margin: '1.25rem 0 0',
  },
  link: {
    color: 'var(--accent, #0f4842)',
    textDecoration: 'none',
    fontWeight: '500',
  },
}

export default Register

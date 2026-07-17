import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useIsMobile } from '../../hooks/useIsMobile'
import AnimateIn from '../../components/AnimateIn'
import { useApiQuery } from '../../hooks/useApi'
import DonutLoader from '../../components/DonutLoader'


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
  boxShadow: '0 4px 14px rgba(13,148,136,0.3)',
}

function Register() {
  const [searchParams] = useSearchParams()
  const clinicSlug = searchParams.get('slug')
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', password: '',
    password_confirmation: '', telephone: '', adresse: '',
    date_naissance: '', sexe: 'masculin', contact_urgence: '',
    slug: clinicSlug || '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  useEffect(() => { setMounted(true) }, [])

  const { data: clinic, isLoading: clinicLoading } = useApiQuery(
    ['clinic', clinicSlug],
    `/clinics/${clinicSlug}`,
    { enabled: !!clinicSlug }
  )

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
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) {
        setError(Object.values(data.errors).flat().join(' · '))
      } else if (data?.message) {
        setError(data.message)
      } else {
        setError("Erreur lors de l'inscription. Vérifiez vos informations.")
      }
    } finally {
      setLoading(false)
    }
  }

  const input = (name, placeholder, type = 'text', opts = {}) => (
    <div style={{ marginBottom: opts.compact ? 0 : 18 }}>
      {opts.label && (
        <label style={{
          display: 'block', fontSize: 13, fontWeight: 500,
          color: '#191919', marginBottom: 7,
        }}>{opts.label}</label>
      )}
      {type === 'select' ? (
        <select
          name={name} value={formData[name]} onChange={handleChange}
          style={inputBase}
        >
          {opts.options?.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type} name={name} placeholder={placeholder}
          value={formData[name]} onChange={handleChange}
          required={opts.required !== false} minLength={opts.minLength}
          style={inputBase}
          onFocus={e => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.15)' }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
        />
      )}
    </div>
  )

  const fieldRow = (children) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? 0 : 16,
    }}>
      {children}
    </div>
  )

  const clinicBanner = clinic && (
    <div style={{
      padding: '14px 18px', background: '#f0fdfa', borderRadius: 12,
      marginBottom: 20, border: '1px solid #ccfbf1',
      animation: 'slideUp 0.3s ease',
    }}>
      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0d9488', fontWeight: 500, marginBottom: 2 }}>
        Vous créez un compte pour
      </div>
      <div style={{ fontWeight: 600, fontSize: 16, color: '#0d9488' }}>{clinic.nom_clinique}</div>
      {clinic.ville && <div style={{ fontSize: 12, color: '#6a6a6a', marginTop: 2 }}>{clinic.ville}</div>}
    </div>
  )

  const formFields = (
    <>
      {fieldRow(
        <>
          {input('nom', 'Benali', 'text', { label: 'Nom' })}
          {input('prenom', 'Ahmed', 'text', { label: 'Prénom' })}
        </>
      )}
      {input('email', 'exemple@email.com', 'email', { label: 'Adresse email' })}
      {fieldRow(
        <>
          {input('password', '••••••••', 'password', { label: 'Mot de passe', minLength: 6 })}
          {input('password_confirmation', '••••••••', 'password', { label: 'Confirmer', minLength: 6 })}
        </>
      )}
      {input('telephone', '+212 6 xx-xxx-xxx', 'tel', { label: 'Téléphone' })}
      {fieldRow(
        <>
          {input('date_naissance', '', 'date', { label: 'Date de naissance' })}
          {input('sexe', '', 'select', { label: 'Sexe', options: [{ value: 'masculin', label: 'Masculin' }, { value: 'feminin', label: 'Féminin' }] })}
        </>
      )}
      {input('adresse', '123 Rue, Ville', 'text', { label: 'Adresse', required: false })}
    </>
  )

  if (clinicLoading) return <div style={{ padding: 40, textAlign: 'center' }}><DonutLoader /></div>

  if (isMobile) {
    return (
      <AnimateIn>
      <div style={{
        minHeight: '100dvh',
        background: `url('/background-dentaspace.webp') center/cover no-repeat`,
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
            <img src="/DentASpace-Logo.webp" alt="Dent A Space"
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
            <div style={{ marginBottom: 24 }}>
              <h2 style={{
                fontSize: 22, fontWeight: 600, color: '#191919',
                margin: '0 0 7px', letterSpacing: '-0.02em',
              }}>Créer un compte</h2>
              <p style={{ color: '#6a6a6a', fontSize: 14, margin: 0 }}>
                Remplissez vos informations personnelles
              </p>
            </div>

            {clinicBanner}
            {error && <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
              padding: '11px 15px', borderRadius: 11, fontSize: '14px', marginBottom: 18,
              animation: 'slideUp 0.3s ease',
            }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              {formFields}
              <button
                type="submit" disabled={loading}
                style={{
                  ...btnBase,
                  background: loading ? '#94d3d5' : P,
                  cursor: loading ? 'not-allowed' : 'pointer',
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
                {loading ? 'Inscription...' : 'Créer mon compte'}
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
      </AnimateIn>
    )
  }

  return (
    <AnimateIn>
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
        maxWidth: 540,
        width: '100%',
        position: 'relative',
        zIndex: 1,
        animation: mounted ? 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both' : 'none',
      }}>
        <div style={{
          flex: 1,
          padding: '48px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 11, marginBottom: 32,
          }}>
            <img src="/DentASpace-Logo.webp" alt="Dent A Space"
              style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 10 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 17 }}>Dent <span style={{ color: ACCENT }}>A</span> Space</div>
              <div style={{ fontSize: 11, color: '#6a6a6a', letterSpacing: '0.05em' }}>CABINET DENTAIRE</div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h2 style={{
              fontSize: 26, fontWeight: 600, color: '#191919',
              margin: '0 0 7px', letterSpacing: '-0.02em',
            }}>Créer un compte</h2>
            <p style={{ color: '#6a6a6a', fontSize: 15, margin: 0 }}>
              Remplissez vos informations personnelles
            </p>
          </div>

          {clinicBanner}
          {error && <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
            padding: '11px 15px', borderRadius: 11, fontSize: '14px', marginBottom: 18,
            animation: 'slideUp 0.3s ease',
          }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {formFields}
            <button
              type="submit" disabled={loading}
              style={{
                ...btnBase,
                background: loading ? '#94d3d5' : P,
                cursor: loading ? 'not-allowed' : 'pointer',
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
              {loading ? 'Inscription...' : 'Créer mon compte'}
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
    </AnimateIn>
  )
}

export default Register
import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useApiQuery, useApiMutation } from '../../hooks/useApi'
import DonutLoader from '../../components/DonutLoader'
import AnimateIn from '../../components/AnimateIn'

function MonCompte() {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [profile, setProfile] = useState({
    nom: '', prenom: '', telephone: '', email: '',
    specialite: '', nom_clinique: '',
  })
  const [passwords, setPasswords] = useState({ ancien: '', nouveau: '' })
  const [toast, setToast] = useState(null)

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  const { data: meData, isLoading } = useApiQuery('me', '/me')

  useEffect(() => {
    if (!meData?.profile) return
    const p = meData.profile
    setProfile({
      nom: p.nom || '', prenom: p.prenom || '', telephone: p.telephone || '',
      email: p.email || user?.email || '', specialite: p.specialite || '',
      nom_clinique: p.nom_clinique || '',
    })
  }, [meData, user])

  const handleChange = e => setProfile({ ...profile, [e.target.name]: e.target.value })

  const saveProfileMutation = useApiMutation('put', '/me', {
    onSuccess: (res) => {
      const p = res.data.profile
      setProfile(prev => ({ ...prev, ...p }))
      showToast('ok', 'Profil mis à jour avec succès.')
    },
    onError: () => showToast('err', 'Erreur lors de la mise à jour.'),
    invalidate: 'me',
  })

  const changePasswordMutation = useApiMutation('put', '/password', {
    onSuccess: () => { showToast('ok', 'Mot de passe modifié.'); setPasswords({ ancien: '', nouveau: '' }) },
    onError: () => showToast('err', 'Ancien mot de passe incorrect.'),
  })

  const handleSave = (e) => { e.preventDefault(); saveProfileMutation.mutate(profile) }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (!passwords.ancien || !passwords.nouveau) {
      showToast('err', 'Remplissez les deux champs.')
      return
    }
    changePasswordMutation.mutate(passwords)
  }

  const initials = ((profile.prenom || '')[0] || '') + ((profile.nom || '')[0] || '')
  const roleLabel = user?.role === 'SECRETAIRE' ? 'Secrétaire'
    : user?.role === 'DENTISTE' ? 'Dentiste'
    : user?.role === 'ADMIN_CLINIQUE' ? 'Administrateur'
    : user?.role || ''

  if (isLoading) return <Layout><div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}><DonutLoader /></div></Layout>

  return (
    <Layout>
      <h1 style={s.title}>Mon <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>compte</em></h1>
      <p style={s.subtitle}>Gérez vos informations personnelles et professionnelles.</p>

      <AnimateIn>
        <>
        {toast && (
        <div style={{ ...s.toast, background: toast.type === 'ok' ? 'var(--success-soft)' : 'var(--rose-soft)', color: toast.type === 'ok' ? 'var(--success)' : 'var(--rose)', border: `1px solid ${toast.type === 'ok' ? '#a3c9b4' : '#e4b4b4'}` }}>
          {toast.msg}
        </div>
      )}

      <div style={{ ...s.grid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>

        {/* ── Left: personal info ── */}
        <div style={s.card}>
          <div style={s.avatarRow}>
            <div style={s.avatar}>{initials.toUpperCase() || '?'}</div>
            <div>
              <strong style={{ fontSize: 15, color: 'var(--ink)' }}>
                {profile.prenom} {profile.nom}
              </strong>
              <div style={{ color: 'var(--ink-3)', fontSize: 12, marginTop: 2 }}>
                {profile.email} · {roleLabel}
              </div>
            </div>
          </div>

          <form autoComplete="off" onSubmit={handleSave}>
          <div style={s.sectionHead}>Informations personnelles</div>

          <div style={{ ...s.row, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
            <Field label="Prénom" name="prenom" value={profile.prenom} onChange={handleChange} autoComplete="given-name" />
            <Field label="Nom" name="nom" value={profile.nom} onChange={handleChange} autoComplete="family-name" />
          </div>
          <Field label="Téléphone" name="telephone" value={profile.telephone} onChange={handleChange} autoComplete="tel" />

          {user?.role === 'DENTISTE' && (
            <Field label="Spécialité" name="specialite" value={profile.specialite} onChange={handleChange} autoComplete="organization-title" />
          )}

          {user?.role === 'ADMIN_CLINIQUE' && (
            <Field label="Nom de la clinique" name="nom_clinique" value={profile.nom_clinique} onChange={handleChange} autoComplete="off" />
          )}

          <button type="submit" style={s.btnPrimary}>Enregistrer</button>
          </form>
        </div>

        {/* ── Right: password ── */}
        <div>
          <div style={s.card}>
            <form onSubmit={handlePasswordChange} autoComplete="off">
            <div style={s.sectionHead}>Changer le mot de passe</div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={s.label}>Ancien mot de passe</label>
              <input style={s.input} type="password" placeholder="••••••••" autoComplete="current-password"
                value={passwords.ancien}
                onChange={e => setPasswords({ ...passwords, ancien: e.target.value })} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={s.label}>Nouveau mot de passe</label>
              <input style={s.input} type="password" placeholder="••••••••" autoComplete="new-password"
                value={passwords.nouveau}
                onChange={e => setPasswords({ ...passwords, nouveau: e.target.value })} />
            </div>
            <button type="submit" style={s.btnGhost}>Modifier</button>
            </form>
          </div>
        </div>

      </div>
      </>
        </AnimateIn>
    </Layout>
  )
}

function Field({ label, name, value, onChange, type = 'text', placeholder, autoComplete }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={s.label}>{label}</label>
      <input style={s.input} type={type} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} />
    </div>
  )
}

const s = {
  title: {
    fontFamily: '"Inter", serif', fontWeight: 400,
    fontSize: 36, letterSpacing: '-0.02em',
    margin: '0 0 6px', color: 'var(--ink)',
  },
  subtitle: { color: 'var(--ink-2)', fontSize: 14, margin: '0 0 24px' },
  toast: {
    padding: '10px 16px', borderRadius: 8,
    fontSize: 13, marginBottom: 20,
  },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 20, alignItems: 'start',
  },
  card: {
    background: 'var(--card)', border: '1px solid var(--line)',
    borderRadius: 'var(--radius)', padding: 22,
  },
  avatarRow: {
    display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22,
  },
  avatar: {
    width: 52, height: 52, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-soft), var(--accent))',
    display: 'grid', placeItems: 'center',
    color: '#fff', fontWeight: 600, fontSize: 18, flexShrink: 0,
  },
  sectionHead: {
    fontFamily: '"Inter", serif', fontWeight: 500,
    fontSize: 15, color: 'var(--accent)',
    margin: '0 0 16px', paddingBottom: 8,
    borderBottom: '1px solid var(--line)',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  label: {
    display: 'block', fontSize: 11.5, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6,
  },
  input: {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--line)', borderRadius: 8,
    fontSize: 13.5, outline: 'none',
    background: 'var(--surface)', boxSizing: 'border-box',
    fontFamily: 'inherit', color: 'var(--ink)',
  },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 18px', borderRadius: 10,
    fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
    background: 'var(--accent)', color: '#fff', border: 'none',
    marginTop: 4,
  },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 18px', borderRadius: 10,
    fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
    background: 'transparent', color: 'var(--ink)',
    border: '1px solid var(--line-strong)',
    marginTop: 4,
  },
}

export default MonCompte

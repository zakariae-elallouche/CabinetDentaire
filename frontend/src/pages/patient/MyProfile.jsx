import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { useIsMobile } from '../../hooks/useIsMobile'
import api from '../../api'

function MyProfile() {
  const { user } = useAuth()
  const isMobile = useIsMobile()

  const [profile, setProfile] = useState({
    nom: '', prenom: '', telephone: '', adresse: '',
    date_naissance: '', sexe: '', contact_urgence: '', notes_generales: '',
  })
  const [passwords, setPasswords] = useState({ ancien: '', nouveau: '' })
  const [loading, setLoading]     = useState(true)
  const [toast, setToast]         = useState(null) // { type: 'ok'|'err', msg }

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    api.get('/me')
      .then(res => setProfile(res.data.profile || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleChange = e => setProfile({ ...profile, [e.target.name]: e.target.value })

  const handleSave = async () => {
    try {
      const res = await api.put('/me', profile)
      setProfile(res.data.profile)
      showToast('ok', 'Profil mis à jour avec succès.')
    } catch {
      showToast('err', 'Erreur lors de la mise à jour.')
    }
  }

  const handlePasswordChange = async () => {
    if (!passwords.ancien || !passwords.nouveau) {
      showToast('err', 'Remplissez les deux champs.')
      return
    }
    try {
      await api.put('/password', passwords)
      showToast('ok', 'Mot de passe modifié.')
      setPasswords({ ancien: '', nouveau: '' })
    } catch {
      showToast('err', 'Ancien mot de passe incorrect.')
    }
  }

  if (loading) return (
    <Layout>
      <div style={{ color: 'var(--ink-3)', padding: '2rem' }}>Chargement…</div>
    </Layout>
  )

  const initials = ((profile.prenom || '')[0] || '') + ((profile.nom || '')[0] || '')

  return (
    <Layout>
      <h1 style={s.title}>Mon <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>profil</em></h1>
      <p style={s.subtitle}>Gérez vos informations personnelles et médicales.</p>

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
                {user?.email} · Patient
              </div>
            </div>
          </div>

          <div style={s.sectionHead}>Informations personnelles</div>

          <div style={{ ...s.row, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
            <Field label="Prénom" name="prenom" value={profile.prenom} onChange={handleChange} />
            <Field label="Nom" name="nom" value={profile.nom} onChange={handleChange} />
          </div>
          <Field label="Téléphone" name="telephone" value={profile.telephone} onChange={handleChange} />
          <Field label="Adresse" name="adresse" value={profile.adresse} onChange={handleChange} />
          <div style={{ ...s.row, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
            <Field label="Date de naissance" name="date_naissance" type="date" value={profile.date_naissance} onChange={handleChange} />
            <div style={{ marginBottom: '1rem' }}>
              <label style={s.label}>Sexe</label>
              <select style={s.input} name="sexe" value={profile.sexe || ''} onChange={handleChange}>
                <option value="">—</option>
                <option value="masculin">Masculin</option>
                <option value="feminin">Féminin</option>
              </select>
            </div>
          </div>

          <button style={s.btnPrimary} onClick={handleSave}>Enregistrer</button>
        </div>

        {/* ── Right: medical + password ── */}
        <div>
          <div style={s.card}>
            <div style={s.sectionHead}>Informations médicales</div>
            <Field
              label="Notes médicales / Antécédents"
              name="notes_generales"
              value={profile.notes_generales}
              onChange={handleChange}
              textarea
              placeholder="Diabète, hypertension, allergies…"
            />
            <Field
              label="Contact d'urgence"
              name="contact_urgence"
              value={profile.contact_urgence}
              onChange={handleChange}
              placeholder="Nom — Téléphone"
            />
            <button style={s.btnPrimary} onClick={handleSave}>Enregistrer</button>
          </div>

          <div style={{ ...s.card, marginTop: 16 }}>
            <div style={s.sectionHead}>Changer le mot de passe</div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={s.label}>Ancien mot de passe</label>
              <input style={s.input} type="password" placeholder="••••••••"
                value={passwords.ancien}
                onChange={e => setPasswords({ ...passwords, ancien: e.target.value })} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={s.label}>Nouveau mot de passe</label>
              <input style={s.input} type="password" placeholder="••••••••"
                value={passwords.nouveau}
                onChange={e => setPasswords({ ...passwords, nouveau: e.target.value })} />
            </div>
            <button style={s.btnGhost} onClick={handlePasswordChange}>Modifier</button>
          </div>
        </div>

      </div>
    </Layout>
  )
}

function Field({ label, name, value, onChange, type = 'text', textarea, placeholder }) {
  const s2 = {
    marginBottom: '1rem',
  }
  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--line)', borderRadius: 8,
    fontSize: 13.5, outline: 'none',
    background: 'var(--surface)', boxSizing: 'border-box',
    fontFamily: 'inherit', color: 'var(--ink)',
    resize: textarea ? 'vertical' : undefined,
    minHeight: textarea ? 80 : undefined,
  }
  return (
    <div style={s2}>
      <label style={{ display: 'block', fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 }}>
        {label}
      </label>
      {textarea
        ? <textarea style={inputStyle} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} />
        : <input style={inputStyle} type={type} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} />
      }
    </div>
  )
}

const s = {
  title: {
    fontFamily: '"Fraunces", serif', fontWeight: 400,
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
    fontFamily: '"Fraunces", serif', fontWeight: 500,
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

export default MyProfile

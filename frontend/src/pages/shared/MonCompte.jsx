import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { useIsMobile } from '../../hooks/useIsMobile'
import api from '../../api'
import { toast } from 'react-toastify'
import DonutLoader from '../../components/DonutLoader'
import AnimateIn from '../../components/AnimateIn'

function MonCompte() {
  const { user, updateUser } = useAuth()
  const isMobile = useIsMobile()
  const [profile, setProfile] = useState(null)
  const [pwForm, setPwForm] = useState({ ancien: '', nouveau: '' })
  const [saving, setSaving] = useState(false)
  const [savingTel, setSavingTel] = useState(false)
  const [editingTel, setEditingTel] = useState(false)
  const [telephone, setTelephone] = useState('')
  const [telDraft, setTelDraft] = useState('')

  const [editingNomClinique, setEditingNomClinique] = useState(false)
  const [nomClinique, setNomClinique] = useState('')
  const [nomCliniqueDraft, setNomCliniqueDraft] = useState('')

  const [editingNom, setEditingNom] = useState(false)
  const [nom, setNom] = useState('')
  const [nomDraft, setNomDraft] = useState('')

  const [editingPrenom, setEditingPrenom] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [prenomDraft, setPrenomDraft] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/me').then(res => {
      setProfile(res.data.profile)
      const tel = res.data.profile?.telephone || ''
      setTelephone(tel)
      setTelDraft(tel)
      const nc = res.data.profile?.nom_clinique || ''
      setNomClinique(nc)
      setNomCliniqueDraft(nc)
      const n = res.data.profile?.nom || ''
      setNom(n)
      setNomDraft(n)
      const p = res.data.profile?.prenom || ''
      setPrenom(p)
      setPrenomDraft(p)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const changePw = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/password', pwForm)
      toast.success('Mot de passe modifié')
      setPwForm({ ancien: '', nouveau: '' })
    } catch (err) {
      toast.error(err.response?.data?.errors?.ancien?.[0] || err.response?.data?.message || 'Erreur')
    }
    setSaving(false)
  }

  const cancelEdit = () => { setTelDraft(telephone); setEditingTel(false) }

  const saveTelephone = async () => {
    setSavingTel(true)
    try {
      const res = await api.put('/me', { telephone: telDraft })
      setProfile(res.data.profile)
      setTelephone(telDraft)
      setEditingTel(false)
      toast.success('Téléphone mis à jour')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
    setSavingTel(false)
  }

  const saveField = async (field, value, setEditing, setValue, setDraft) => {
    setSavingTel(true)
    try {
      const res = await api.put('/me', { [field]: value })
      setProfile(res.data.profile)
      setValue(value)
      setDraft(value)
      setEditing(false)
      toast.success('Mis à jour')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
    setSavingTel(false)
  }

  const cols = profile ? Object.entries(profile).filter(([k]) => !['id', 'tenant_id', 'utilisateur_id', 'utilisateur', 'created_at', 'updated_at', 'numero_employe', 'statut', 'slug', 'plan', 'ville', 'adresse', 'email_contact', 'date_naissance', 'sexe', 'contact_urgence', 'notes_generales'].includes(k)) : []
  const isAdmin = user?.role === 'ADMIN_CLINIQUE'

  if (loading) return <Layout><div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}><DonutLoader /></div></Layout>

  return (
    <Layout>
      <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 26, color: 'var(--ink)', margin: '0 0 24px' }}>
        Mon <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>compte</em>
      </h1>

      <AnimateIn>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 16 : 24, maxWidth: isMobile ? '100%' : 800 }}>
        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: 24 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 18, color: 'var(--ink)', margin: '0 0 16px' }}>Informations</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {cols.filter(([k]) => !['nom', 'prenom'].includes(k) && (!isAdmin || !['telephone', 'nom_clinique'].includes(k))).map(([key, val]) => (
              <div key={key}>
                <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 2, fontWeight: 500 }}>
                  {key === 'nom' ? 'Nom' : key === 'prenom' ? 'Prénom' : key === 'telephone' ? 'Téléphone' : key === 'specialite' ? 'Spécialité' : key === 'email' ? 'Email' : key}
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink)' }}>{val || '—'}</div>
              </div>
            ))}
            <EditableField label="Nom" value={nom} draft={nomDraft} setDraft={setNomDraft}
              editing={editingNom} setEditing={setEditingNom} saving={savingTel}
              onSave={() => saveField('nom', nomDraft, setEditingNom, setNom, setNomDraft)}
              onCancel={() => { setNomDraft(nom); setEditingNom(false) }} />
            <EditableField label="Prénom" value={prenom} draft={prenomDraft} setDraft={setPrenomDraft}
              editing={editingPrenom} setEditing={setEditingPrenom} saving={savingTel}
              onSave={() => saveField('prenom', prenomDraft, setEditingPrenom, setPrenom, setPrenomDraft)}
              onCancel={() => { setPrenomDraft(prenom); setEditingPrenom(false) }} />
            {isAdmin && (
              <>
                <EditableField label="Nom de la clinique" value={nomClinique} draft={nomCliniqueDraft} setDraft={setNomCliniqueDraft}
                  editing={editingNomClinique} setEditing={setEditingNomClinique} saving={savingTel}
                  onSave={() => saveField('nom_clinique', nomCliniqueDraft, setEditingNomClinique, setNomClinique, setNomCliniqueDraft)}
                  onCancel={() => { setNomCliniqueDraft(nomClinique); setEditingNomClinique(false) }} />
                <EditableField label="Téléphone" value={telephone} draft={telDraft} setDraft={setTelDraft}
                  editing={editingTel} setEditing={setEditingTel} saving={savingTel}
                  onSave={saveTelephone}
                  onCancel={cancelEdit} />
              </>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: 24 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 18, color: 'var(--ink)', margin: '0 0 16px' }}>Mot de passe</h2>
          <form onSubmit={changePw}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6, fontWeight: 500 }}>Mot de passe actuel</label>
              <input type="password" value={pwForm.ancien} onChange={e => setPwForm(f => ({...f, ancien: e.target.value}))} required style={inputStyle} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6, fontWeight: 500 }}>Nouveau mot de passe</label>
              <input type="password" value={pwForm.nouveau} onChange={e => setPwForm(f => ({...f, nouveau: e.target.value}))} required minLength={6} style={inputStyle} />
            </div>
            <button type="submit" disabled={saving} style={{
              width: '100%', padding: '12px', background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}>
              {saving ? 'Enregistrement...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </div>
      </AnimateIn>
    </Layout>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 10,
  fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
}

const iconBtnStyle = {
  width: 34, height: 34, borderRadius: 8, border: '1px solid var(--line)',
  background: 'var(--surface)', cursor: 'pointer', display: 'grid', placeItems: 'center',
  flexShrink: 0, fontFamily: 'inherit', fontSize: 13,
}

function EditableField({ label, value, draft, setDraft, editing, setEditing, saving, onSave, onCancel }) {
  return (
    <div>
      <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 2, fontWeight: 500 }}>{label}</div>
      {editing ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input value={draft} onChange={e => setDraft(e.target.value)} style={inputStyle} placeholder={label} autoFocus />
          <button onClick={onSave} disabled={saving} title="Confirmer" style={{ ...iconBtnStyle, background: 'var(--accent)', color: '#fff' }}>
            {saving ? '...' : <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>}
          </button>
          <button onClick={onCancel} disabled={saving} title="Annuler" style={iconBtnStyle}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5l14 14M19 5l-14 14"/></svg>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: 'var(--ink)' }}>{value || '—'}</span>
          <button onClick={() => { setDraft(value); setEditing(true) }} title="Modifier" style={{ ...iconBtnStyle, width: 28, height: 28 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default MonCompte
import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { toast } from 'react-toastify'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useApiQuery, useApiMutation } from '../../hooks/useApi'
import DonutLoader from '../../components/DonutLoader'
import AnimateIn from '../../components/AnimateIn'

const DAYS = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi', label: 'Samedi' },
  { key: 'dimanche', label: 'Dimanche' },
]

const defaultHours = () => ({
  lundi: { actif: true, debut: '09:00', fin: '17:00' },
  mardi: { actif: true, debut: '09:00', fin: '17:00' },
  mercredi: { actif: true, debut: '09:00', fin: '17:00' },
  jeudi: { actif: true, debut: '09:00', fin: '17:00' },
  vendredi: { actif: true, debut: '09:00', fin: '17:00' },
  samedi: { actif: false, debut: '09:00', fin: '13:00' },
  dimanche: { actif: false, debut: '', fin: '' },
})

function ParametresClinique() {
  const [form, setForm] = useState({ nom_clinique: '', email_contact: '', telephone: '', adresse: '', ville: '', frais_visite: 200, horaires: defaultHours() })
  const [saving, setSaving] = useState(false)
  const [feeConfirm, setFeeConfirm] = useState(null)
  const isMobile = useIsMobile()

  useEffect(() => { /* initialisation done below via useApiQuery */ }, [])

  const { data: settingsData, isLoading } = useApiQuery('admin-settings', '/admin/settings')

  useEffect(() => {
    if (!settingsData) return
    setForm({
      nom_clinique: settingsData.nom_clinique || '',
      email_contact: settingsData.email_contact || '',
      telephone: settingsData.telephone || '',
      adresse: settingsData.adresse || '',
      ville: settingsData.ville || '',
      frais_visite: settingsData.frais_visite ?? 200,
      horaires: settingsData.horaires || defaultHours(),
    })
  }, [settingsData])

  const saveMutation = useApiMutation('put', '/admin/settings', {
    onSuccess: () => toast.success('Paramètres enregistrés'),
    onError: (err) => toast.error(err?.response?.data?.message || 'Erreur'),
    invalidate: 'admin-settings',
  })

  const saveSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    const oldFee = settingsData?.frais_visite
    try {
      await saveMutation.mutateAsync(form)
      if (parseInt(form.frais_visite) !== parseInt(oldFee || 0)) {
        setFeeConfirm(parseInt(form.frais_visite))
      }
    } catch { /* handled by mutation onError */ }
    setSaving(false)
  }

  const setHour = (day, field, value) => {
    setForm(f => ({
      ...f,
      horaires: { ...f.horaires, [day]: { ...f.horaires[day], [field]: value } },
    }))
  }

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      horaires: { ...f.horaires, [day]: { ...f.horaires[day], actif: !f.horaires[day]?.actif } },
    }))
  }

  if (isLoading) return <Layout><div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}><DonutLoader /></div></Layout>

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 26, color: 'var(--ink)', margin: '0 0 4px' }}>Paramètres <em style={{ fontStyle: 'italic', color: '#4AB2BB' }}>clinique</em></h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: 0 }}>Personnalisez les informations de votre cabinet</p>
      </div>

      <AnimateIn><div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 20,
        marginBottom: 24,
      }}>
      <form onSubmit={saveSettings} style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: 24 }}>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 18, color: 'var(--ink)', margin: '0 0 18px' }}>Informations</h2>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nom de la clinique</label>
            <input value={form.nom_clinique} onChange={e => setForm(f => ({...f, nom_clinique: e.target.value}))} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input value={form.telephone} onChange={e => setForm(f => ({...f, telephone: e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={form.email_contact} onChange={e => setForm(f => ({...f, email_contact: e.target.value}))} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Adresse</label>
            <input value={form.adresse} onChange={e => setForm(f => ({...f, adresse: e.target.value}))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Ville</label>
            <input value={form.ville} onChange={e => setForm(f => ({...f, ville: e.target.value}))} style={inputStyle} />
          </div>
        </div>
        <button type="submit" disabled={saving} style={btnStyle}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>

      {/* ─── Horaires & Frais ─── */}
      <form onSubmit={saveSettings} style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 18, color: 'var(--ink)', margin: 0 }}>Horaires d'ouverture</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}>Frais de visite :</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="number" min="0" value={form.frais_visite} onChange={e => setForm(f => ({...f, frais_visite: parseInt(e.target.value) || 0}))} style={{ ...inputStyle, width: 100 }} />
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>MAD</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {DAYS.map(d => {
            const h = form.horaires?.[d.key] || { actif: false, debut: '', fin: '' }
            return (
              <div key={d.key} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                borderRadius: 10, background: h.actif ? 'var(--surface)' : 'transparent',
                borderWidth: 1, borderStyle: 'solid', borderColor: h.actif ? 'var(--line)' : 'transparent',
              }}>
                <button type="button" onClick={() => toggleDay(d.key)} style={{
                  width: 22, height: 22, borderRadius: 6, border: '2px solid',
                  borderColor: h.actif ? '#4AB2BB' : 'var(--line)',
                  background: h.actif ? '#4AB2BB' : 'transparent',
                  cursor: 'pointer', display: 'grid', placeItems: 'center',
                  padding: 0, flexShrink: 0,
                }}>
                  {h.actif && (
                    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                  )}
                </button>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: h.actif ? 'var(--ink)' : 'var(--ink-3)' }}>{d.label}</span>
                {h.actif ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="time" value={h.debut || '09:00'} onChange={e => setHour(d.key, 'debut', e.target.value)} style={{ ...inputStyle, width: isMobile ? 85 : 110 }} />
                    <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>—</span>
                    <input type="time" value={h.fin || '17:00'} onChange={e => setHour(d.key, 'fin', e.target.value)} style={{ ...inputStyle, width: isMobile ? 85 : 110 }} />
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Fermé</span>
                )}
              </div>
            )
          })}
        </div>
        <button type="submit" disabled={saving} style={{ ...btnStyle, marginTop: 16 }}>
          {saving ? 'Enregistrement...' : 'Enregistrer les horaires'}
        </button>
      </form>
      </div></AnimateIn>

      {feeConfirm !== null && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center',
        }}>
          <div style={{
            background: 'var(--card)', borderRadius: 16, border: '1px solid var(--line)',
            padding: '32px 36px', textAlign: 'center', maxWidth: 380, width: '90%',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: 'var(--success)',
              color: '#fff', display: 'grid', placeItems: 'center', fontSize: 24, margin: '0 auto 16px',
            }}>✓</div>
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 18, color: 'var(--ink)', margin: '0 0 6px' }}>
              Frais de visite modifiés
            </h3>
            <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: '0 0 20px' }}>
              Nouveau tarif : <strong style={{ color: '#4AB2BB' }}>{feeConfirm} MAD</strong>
            </p>
            <button onClick={() => setFeeConfirm(null)} style={{
              padding: '10px 32px', background: '#4AB2BB', color: '#fff', border: 'none',
              borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              OK
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 10,
  fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
}

const labelStyle = {
  display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'var(--ink-3)', marginBottom: 6, fontWeight: 500,
}

const btnStyle = {
  width: '100%', padding: '12px', background: '#4AB2BB', color: '#fff', border: 'none',
  borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  marginTop: 16,
}

export default ParametresClinique
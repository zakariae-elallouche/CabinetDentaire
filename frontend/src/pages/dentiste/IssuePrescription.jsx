import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import api from '../../api'
import { useIsMobile } from '../../hooks/useIsMobile'

function IssuePrescription() {
  const { visite_id } = useParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [medicaments, setMedicaments] = useState([])
  const [selectedMeds, setSelectedMeds] = useState([])
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)

  // Rediriger si pas de visite_id — l'ordonnance doit venir d'une visite enregistrée
  useEffect(() => {
    if (!visite_id) {
      toast.warning('Une ordonnance doit être créée depuis une visite.')
      navigate('/dentiste/dashboard')
      return
    }
    api.get('/medicaments')
      .then(res => setMedicaments(res.data))
      .catch(() => {})
  }, [])

  const handleAddMed = (e) => {
    const id = e.target.value
    if (!id) return
    const med = medicaments.find(m => m.id === parseInt(id))
    if (med && !selectedMeds.find(s => s.id === med.id)) {
      setSelectedMeds(prev => [...prev, { ...med, frequence: '', duree_jours: 7 }])
    }
    e.target.value = ''
  }

  const handleMedChange = (id, field, value) => {
    setSelectedMeds(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  const handleSubmit = async () => {
    if (selectedMeds.length === 0) { toast.warning('Ajoutez au moins un médicament'); return }
    if (selectedMeds.some(m => !m.frequence)) { toast.warning('Remplissez la fréquence de tous les médicaments'); return }
    setLoading(true)
    try {
      await api.post('/ordonnances', {
        visite_id,
        instructions_generales: instructions,
        medicaments: selectedMeds.map(m => ({
          medicament_id: m.id,
          frequence: m.frequence,
          duree_jours: m.duree_jours,
        })),
      })
      toast.success('Ordonnance enregistrée')
      navigate('/dentiste/dashboard')
    } catch { /* interceptor */ }
    finally { setLoading(false) }
  }

  return (
    <Layout>
      <div>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={s.pageTitle}>
            Émettre <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>une ordonnance</em>
          </h1>
          <p style={s.pageSub}>Prescrivez les médicaments nécessaires.</p>
        </div>

        <div style={{ ...s.grid, gridTemplateColumns: isMobile ? '1fr' : s.grid.gridTemplateColumns }}>

          {/* ── Left ── */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>Prescription</h3>

            <div style={s.formGroup}>
              <label style={s.label}>Visite</label>
              <div style={s.infoBadge}>
                Visite #{String(visite_id).padStart(4, '0')}
              </div>
            </div>

            {/* Add medication */}
            <div style={s.formGroup}>
              <label style={s.label}>Ajouter un médicament</label>
              <select style={s.input} onChange={handleAddMed} defaultValue="">
                <option value="">— Choisir —</option>
                {medicaments.map(m => (
                  <option key={m.id} value={m.id}>{m.nom} · {m.dosage}</option>
                ))}
              </select>
            </div>

            {/* Med list */}
            {selectedMeds.length === 0 ? (
              <div style={s.emptyMeds}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--ink-3)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
                  <rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-30 12 12)"/><path d="M8.5 6.5l7 7"/>
                </svg>
                <p style={{ margin: 0, fontSize: '13px' }}>Aucun médicament ajouté</p>
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                {selectedMeds.map(med => (
                  <div key={med.id} style={s.medItem}>
                    <div style={s.medHeader}>
                      <div>
                        <b style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{med.nom}</b>
                        <small style={{ display: 'block', color: 'var(--ink-3)', fontSize: '12px' }}>{med.dosage} · {med.forme}</small>
                      </div>
                      <button style={s.btnRemove} onClick={() => setSelectedMeds(p => p.filter(m => m.id !== med.id))}>✕</button>
                    </div>
                    <div style={{ ...s.medFields, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                      <div>
                        <label style={s.label}>Fréquence</label>
                        <input
                          style={s.input} placeholder="Ex: 3×/jour"
                          value={med.frequence}
                          onChange={e => handleMedChange(med.id, 'frequence', e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={s.label}>Durée (jours)</label>
                        <input
                          style={s.input} type="number" min="1"
                          value={med.duree_jours}
                          onChange={e => handleMedChange(med.id, 'duree_jours', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Instructions */}
            <div style={s.formGroup}>
              <label style={s.label}>Instructions générales</label>
              <textarea
                style={s.textarea} rows={3}
                placeholder="Ex: Prendre après les repas..."
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
              />
            </div>
          </div>

          {/* ── Right: summary + actions ── */}
          <div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Résumé</h3>
              {selectedMeds.length === 0 ? (
                <p style={{ color: 'var(--ink-3)', fontSize: '13px' }}>Aucun médicament sélectionné.</p>
              ) : (
                selectedMeds.map((med, i) => (
                  <div key={med.id} style={{ padding: '12px 0', borderBottom: i < selectedMeds.length - 1 ? '1px dashed var(--line)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <b style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{med.nom}</b>
                      <span style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: '"Geist Mono", monospace', flexShrink: 0, marginLeft: '8px' }}>{med.dosage}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <small style={{ color: med.frequence ? 'var(--accent)' : 'var(--ink-3)', fontSize: '12px' }}>
                        {med.frequence || 'Fréquence non renseignée'}
                      </small>
                      <small style={{ color: 'var(--ink-3)', fontSize: '12px' }}>
                        {med.duree_jours} jour{med.duree_jours > 1 ? 's' : ''}
                      </small>
                    </div>
                  </div>
                ))
              )}
              {selectedMeds.length > 0 && instructions && (
                <div style={{ marginTop: '14px', padding: '12px', background: 'var(--accent-soft)', borderRadius: '8px', fontSize: '13px', color: 'var(--accent)', lineHeight: 1.5 }}>
                  {instructions}
                </div>
              )}
            </div>

            <div style={s.card}>
              <button style={s.btnPrimary} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Enregistrement...' : "Enregistrer l'ordonnance →"}
              </button>
              <button style={s.btnOutline} onClick={() => navigate('/dentiste/dashboard')}>
                Annuler
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}

const s = {
  pageTitle: {
    fontFamily: "'Fraunces', serif", fontWeight: '400', fontSize: '36px',
    letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 6px', lineHeight: '1.1',
  },
  pageSub: { color: 'var(--ink-2)', fontSize: '14px', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' },
  card: {
    background: 'var(--card)', border: '1px solid var(--line)',
    borderRadius: 'var(--radius)', padding: '24px', marginBottom: '16px',
  },
  cardTitle: {
    fontFamily: "'Fraunces', serif", fontWeight: '500', fontSize: '17px',
    color: 'var(--ink)', margin: '0 0 20px',
  },
  formGroup: { marginBottom: '16px' },
  label: {
    display: 'block', fontSize: '11px', letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '6px', fontWeight: '500',
  },
  input: {
    width: '100%', padding: '11px 14px',
    border: '1px solid var(--line)', borderRadius: '10px',
    fontSize: '14px', background: 'var(--card)', color: 'var(--ink)',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  },
  textarea: {
    width: '100%', padding: '11px 14px',
    border: '1px solid var(--line)', borderRadius: '10px',
    fontSize: '14px', background: 'var(--card)', color: 'var(--ink)',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical',
  },
  infoBadge: {
    padding: '11px 14px', borderRadius: '10px',
    border: '1px solid var(--line)', background: 'var(--surface)',
    fontSize: '13.5px', color: 'var(--ink-2)', fontFamily: '"Geist Mono", monospace',
  },
  emptyMeds: {
    textAlign: 'center', padding: '2rem',
    color: 'var(--ink-3)', background: 'var(--surface)',
    borderRadius: '10px', marginBottom: '16px',
  },
  medItem: {
    border: '1px solid var(--line)', borderRadius: '10px',
    padding: '14px', marginBottom: '10px',
  },
  medHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '12px',
  },
  medFields: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  btnRemove: {
    width: '26px', height: '26px', borderRadius: '6px',
    background: 'var(--rose-soft)', color: 'var(--rose)',
    border: 'none', cursor: 'pointer', fontSize: '11px',
    display: 'grid', placeItems: 'center', flexShrink: 0,
  },
  btnPrimary: {
    width: '100%', padding: '13px', marginBottom: '10px',
    background: 'var(--accent)', color: '#fff', border: 'none',
    borderRadius: '10px', fontSize: '14px', fontWeight: '500',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  btnOutline: {
    width: '100%', padding: '13px',
    background: 'transparent', color: 'var(--ink-2)',
    border: '1px solid var(--line-strong)', borderRadius: '10px',
    fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
  },
}

export default IssuePrescription

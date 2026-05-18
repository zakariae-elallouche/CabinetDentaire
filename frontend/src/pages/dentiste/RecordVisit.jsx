import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import api from '../../api'
import { useIsMobile } from '../../hooks/useIsMobile'

function RecordVisit() {
  const { rdv_id } = useParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [formData, setFormData] = useState({ diagnostic: '', traitement_fourni: '', notes: '' })
  const [operations, setOperations] = useState([])
  const [selectedOps, setSelectedOps] = useState([])
  const [rdvs, setRdvs] = useState([])
  const [selectedRdvId, setSelectedRdvId] = useState(rdv_id || '')
  const [loading, setLoading] = useState(false)
  const [selectOpVal, setSelectOpVal] = useState('')

  const BASE_FEE = 200
  const total = BASE_FEE + selectedOps.reduce((s, op) => s + Number(op.cout), 0)

  useEffect(() => {
    Promise.all([api.get('/operations'), api.get('/rendez-vous')])
      .then(([opsRes, rdvRes]) => {
        setOperations(opsRes.data)
        const todayStr = new Date().toISOString().slice(0, 10)
        setRdvs(rdvRes.data.filter(r => r.statut === 'CONFIRMÉ' && r.date === todayStr))
      })
      .catch(() => {})
  }, [])

  const selectedRdv = rdvs.find(r => String(r.id) === String(selectedRdvId))
  const patientName = selectedRdv?.patient
    ? `${selectedRdv.patient.prenom || ''} ${selectedRdv.patient.nom || ''}`.trim()
    : '—'

  const handleAddOp = (e) => {
    const id = e.target.value
    setSelectOpVal('')
    if (!id) return
    const op = operations.find(o => o.id === parseInt(id))
    if (op && !selectedOps.find(s => s.id === op.id)) setSelectedOps(prev => [...prev, op])
  }

  const handleSubmit = async () => {
    if (!selectedRdvId) { toast.warning('Sélectionnez un rendez-vous'); return }
    if (!formData.diagnostic) { toast.warning('Entrez un diagnostic'); return }
    setLoading(true)
    try {
      const res = await api.post('/visites', {
        ...formData,
        rendezvous_id: selectedRdvId,
        frais_visite_base: BASE_FEE,
        operations: selectedOps.map(op => ({
          nom_operation: op.nom,
          cout: op.cout,
          description: op.description || null,
        })),
      })
      toast.success('Visite enregistrée — facture générée !')
      const visiteId = res.data?.id
      navigate(visiteId ? `/dentiste/ordonnance/${visiteId}` : '/dentiste/dashboard')
    } catch { /* interceptor handles */ }
    finally { setLoading(false) }
  }

  return (
    <Layout>
      <div>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={s.pageTitle}>
            Enregistrer <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>une visite</em>
          </h1>
          <p style={s.pageSub}>Complétez les informations cliniques et les opérations effectuées.</p>
        </div>

        <div style={{ ...s.grid, gridTemplateColumns: isMobile ? '1fr' : s.grid.gridTemplateColumns }}>

          {/* ── Left: clinical info ── */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>Informations cliniques</h3>

            {/* RDV / Patient */}
            <div style={s.formGroup}>
              <label style={s.label}>Rendez-vous — Patient</label>
              {rdv_id ? (
                <div style={s.patientBadge}>
                  <div style={s.patientAvatar}>
                    {patientName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?'}
                  </div>
                  <div>
                    <b style={{ fontSize: '14px', color: 'var(--ink)' }}>{patientName}</b>
                    <small style={{ display: 'block', color: 'var(--ink-3)', fontSize: '12px' }}>
                      RDV #{String(rdv_id).padStart(4,'0')} · {selectedRdv?.heure?.slice(0,5) || ''}
                    </small>
                  </div>
                </div>
              ) : (
                <select style={s.input} value={selectedRdvId} onChange={e => setSelectedRdvId(e.target.value)}>
                  <option value="">— Choisir un rendez-vous confirmé —</option>
                  {rdvs.map(r => {
                    const name = r.patient ? `${r.patient.prenom || ''} ${r.patient.nom || ''}`.trim() : '—'
                    return (
                      <option key={r.id} value={r.id}>
                        {name} · {r.date} {r.heure?.slice(0,5)}
                      </option>
                    )
                  })}
                </select>
              )}
            </div>

            {/* Diagnostic */}
            <div style={s.formGroup}>
              <label style={s.label}>Diagnostic</label>
              <textarea
                style={s.textarea} name="diagnostic" rows={4}
                placeholder="Décrivez le diagnostic..."
                value={formData.diagnostic}
                onChange={e => setFormData(f => ({ ...f, diagnostic: e.target.value }))}
              />
            </div>

            {/* Traitement */}
            <div style={s.formGroup}>
              <label style={s.label}>Traitement fourni</label>
              <textarea
                style={s.textarea} name="traitement_fourni" rows={4}
                placeholder="Décrivez le traitement effectué..."
                value={formData.traitement_fourni}
                onChange={e => setFormData(f => ({ ...f, traitement_fourni: e.target.value }))}
              />
            </div>

            {/* Notes */}
            <div style={s.formGroup}>
              <label style={s.label}>Notes complémentaires</label>
              <textarea
                style={s.textarea} name="notes" rows={3}
                placeholder="Notes supplémentaires..."
                value={formData.notes}
                onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>

          {/* ── Right: operations + actions ── */}
          <div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Opérations effectuées</h3>

              <div style={s.formGroup}>
                <label style={s.label}>Ajouter une opération</label>
                <select style={s.input} value={selectOpVal} onChange={handleAddOp}>
                  <option value="">— Choisir —</option>
                  {operations.map(op => (
                    <option key={op.id} value={op.id} disabled={!!selectedOps.find(s => s.id === op.id)}>
                      {op.nom} · {op.cout} MAD
                    </option>
                  ))}
                </select>
              </div>

              {selectedOps.length === 0 ? (
                <p style={{ color: 'var(--ink-3)', fontSize: '13px', padding: '8px 0' }}>Aucune opération ajoutée.</p>
              ) : (
                selectedOps.map(op => (
                  <div key={op.id} style={s.opRow}>
                    <span style={{ flex: 1, fontSize: '13.5px', color: 'var(--ink)' }}>{op.nom}</span>
                    <span style={s.opCout}>{op.cout} MAD</span>
                    <button style={s.btnRemove} onClick={() => setSelectedOps(p => p.filter(o => o.id !== op.id))}>✕</button>
                  </div>
                ))
              )}

              {/* Base fee */}
              <div style={{ ...s.opRow, borderBottom: 'none' }}>
                <span style={{ flex: 1, fontSize: '13px', color: 'var(--ink-3)' }}>Frais de visite de base</span>
                <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '13px', color: 'var(--ink-2)' }}>{BASE_FEE} MAD</span>
              </div>

              {/* Total */}
              <div style={s.totalBar}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--ink)' }}>Total</span>
                <span style={s.totalAmount}>{total} MAD</span>
              </div>
            </div>

            {/* Actions */}
            <div style={s.card}>
              <button style={s.btnPrimary} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Enregistrement...' : 'Marquer comme complété →'}
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
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' },
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
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    resize: 'vertical', lineHeight: '1.5',
  },
  patientBadge: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 14px', borderRadius: '10px',
    border: '1px solid var(--line)', background: 'var(--surface)',
  },
  patientAvatar: {
    width: '38px', height: '38px', borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-soft), var(--accent-2))',
    display: 'grid', placeItems: 'center',
    color: 'white', fontWeight: '500', fontSize: '13px', flexShrink: 0,
  },
  opRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 0', borderBottom: '1px dashed var(--line)',
  },
  opCout: {
    fontFamily: '"Geist Mono", monospace', fontSize: '13px',
    fontWeight: '500', color: 'var(--accent)', minWidth: '80px', textAlign: 'right',
  },
  btnRemove: {
    width: '24px', height: '24px', borderRadius: '6px',
    background: 'var(--rose-soft)', color: 'var(--rose)',
    border: 'none', cursor: 'pointer', fontSize: '11px',
    display: 'grid', placeItems: 'center', flexShrink: 0,
  },
  totalBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--accent-soft)', borderRadius: '10px',
    padding: '14px 16px', marginTop: '14px',
  },
  totalAmount: {
    fontFamily: '"Geist Mono", monospace', fontSize: '20px',
    fontWeight: '600', color: 'var(--accent)',
  },
  btnPrimary: {
    width: '100%', padding: '13px', marginBottom: '10px',
    background: 'var(--accent)', color: '#fff', border: 'none',
    borderRadius: '10px', fontSize: '14px', fontWeight: '500',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
  },
  btnOutline: {
    width: '100%', padding: '13px',
    background: 'transparent', color: 'var(--ink-2)',
    border: '1px solid var(--line-strong)', borderRadius: '10px',
    fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
  },
}

export default RecordVisit

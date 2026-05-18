import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import api from '../../api'
import { useIsMobile } from '../../hooks/useIsMobile'

const MONTHS_FR = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc']
const fmtDate = (str) => {
  if (!str) return '—'
  const parts = str.split('-')
  const d = parts.length === 3 ? new Date(+parts[0], +parts[1] - 1, +parts[2]) : new Date(str)
  return isNaN(d) ? str : `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

const fullName = (p) => `${p?.prenom || ''} ${p?.nom || ''}`.trim() || '—'
const initials = (p) => `${p?.prenom?.[0] || ''}${p?.nom?.[0] || ''}`.toUpperCase() || '?'

// ─────────────────────────────────────────────
//  List View
// ─────────────────────────────────────────────
function PatientsListView() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/patients')
      .then(res => setPatients(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    return fullName(p).toLowerCase().includes(q) || p.telephone?.includes(search)
  })

  return (
    <Layout>
      <div>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={s.pageTitle}>
            Liste des <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>patients</em>
          </h1>
          <p style={s.pageSub}>Consultez les informations et historiques de chaque patient.</p>
        </div>

        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom ou téléphone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...s.searchInput, paddingLeft: '38px' }}
            />
          </div>
          <span style={{ fontSize: '12.5px', color: 'var(--ink-3)' }}>
            {filtered.length} patient{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <p style={{ color: 'var(--ink-3)', fontSize: '14px' }}>Chargement...</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="Aucun patient trouvé" sub="Essayez un autre terme de recherche." />
        ) : (
          <div style={{ ...s.grid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {filtered.map(p => (
              <div key={p.id} style={s.patientCard} onClick={() => navigate(`/secretaire/patient/${p.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <div style={s.avatar}>{initials(p)}</div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={s.patientName}>{fullName(p)}</div>
                    <div style={s.patientMeta}>#{String(p.id).padStart(4, '0')}</div>
                  </div>
                </div>

                <div style={s.infoRow}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-3)', flexShrink: 0 }}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.21 3.18 2 2 0 0 1 3.22 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.09a16 16 0 0 0 5.83 5.83l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span style={s.infoText}>{p.telephone || '—'}</span>
                </div>

                {p.date_naissance && (
                  <div style={s.infoRow}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-3)', flexShrink: 0 }}>
                      <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
                    </svg>
                    <span style={s.infoText}>{fmtDate(p.date_naissance)}</span>
                  </div>
                )}

                {p.adresse && (
                  <div style={s.infoRow}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-3)', flexShrink: 0 }}>
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                    </svg>
                    <span style={{ ...s.infoText, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.adresse}</span>
                  </div>
                )}

                <div style={s.viewBtn}>Voir dossier →</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

// ─────────────────────────────────────────────
//  Detail View
// ─────────────────────────────────────────────
function PatientDetailView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [patient, setPatient] = useState(null)
  const [rdvs, setRdvs] = useState([])
  const [visites, setVisites] = useState([])
  const [ordonnances, setOrdonnances] = useState([])
  const [factures, setFactures] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('rdv')

  useEffect(() => {
    Promise.all([
      api.get('/patients'),
      api.get('/rendez-vous'),
      api.get(`/patient/${id}/visites`),
      api.get(`/patient/${id}/ordonnances`),
      api.get(`/patients/${id}/history`).catch(() => ({ data: { factures: [] } })),
    ]).then(([pRes, rRes, vRes, oRes, hRes]) => {
      const p = pRes.data.find(x => String(x.id) === String(id))
      setPatient(p || null)
      setRdvs(rRes.data.filter(r => r.patient?.id === parseInt(id)).sort((a, b) => b.date?.localeCompare(a.date)))
      setVisites(vRes.data)
      setOrdonnances(oRes.data)
      setFactures(hRes.data.factures || [])
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <Layout>
      <p style={{ color: 'var(--ink-3)', fontSize: '14px', padding: '40px 0' }}>Chargement...</p>
    </Layout>
  )

  if (!patient) return (
    <Layout>
      <button style={s.backBtn} onClick={() => navigate('/secretaire/patients')}>← Retour</button>
      <p style={{ color: 'var(--ink-3)', fontSize: '14px', marginTop: '20px' }}>Patient introuvable.</p>
    </Layout>
  )

  const tabs = [
    { key: 'rdv',         label: `Rendez-vous (${rdvs.length})` },
    { key: 'visites',     label: `Visites (${visites.length})` },
    { key: 'ordonnances', label: `Ordonnances (${ordonnances.length})` },
    { key: 'paiements',   label: `Paiements (${factures.length})` },
  ]

  return (
    <Layout>
      <div>
        <button style={s.backBtn} onClick={() => navigate('/secretaire/patients')}>
          ← Retour aux patients
        </button>

        <div style={{ marginBottom: '28px', marginTop: '20px' }}>
          <h1 style={s.pageTitle}>
            Dossier <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{fullName(patient)}</em>
          </h1>
        </div>

        <div style={{ ...s.detailGrid, gridTemplateColumns: isMobile ? '1fr' : '280px 1fr' }}>

          {/* ── Left: profile ── */}
          <div>
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{ ...s.avatar, width: '52px', height: '52px', fontSize: '18px' }}>
                  {initials(patient)}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--ink)' }}>{fullName(patient)}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>#{String(patient.id).padStart(4, '0')}</div>
                </div>
              </div>

              {[
                { label: 'Téléphone',       value: patient.telephone || '—' },
                { label: 'Date naissance',   value: fmtDate(patient.date_naissance) },
                { label: 'Sexe',             value: patient.sexe ? patient.sexe.charAt(0).toUpperCase() + patient.sexe.slice(1) : '—' },
                { label: 'Adresse',          value: patient.adresse || '—' },
                { label: 'Contact urgence',  value: patient.contact_urgence || '—' },
              ].map(row => (
                <div key={row.label} style={s.profileField}>
                  <span style={s.fieldLabel}>{row.label}</span>
                  <span style={s.fieldValue}>{row.value}</span>
                </div>
              ))}

              {patient.notes_generales && (
                <div style={{ marginTop: '12px', padding: '10px 12px', background: 'var(--amber-soft)', borderRadius: '8px', fontSize: '12.5px', color: '#8d6a2b', lineHeight: '1.5' }}>
                  {patient.notes_generales}
                </div>
              )}
            </div>

            <div style={s.card}>
              <div style={s.statRow}>
                <span style={s.statLabel}>Rendez-vous</span>
                <span style={s.statValue}>{rdvs.length}</span>
              </div>
              <div style={s.statRow}>
                <span style={s.statLabel}>Visites</span>
                <span style={s.statValue}>{visites.length}</span>
              </div>
              <div style={s.statRow}>
                <span style={s.statLabel}>Ordonnances</span>
                <span style={s.statValue}>{ordonnances.length}</span>
              </div>
              <div style={{ ...s.statRow, borderBottom: 'none' }}>
                <span style={s.statLabel}>Factures</span>
                <span style={s.statValue}>{factures.length}</span>
              </div>
            </div>
          </div>

          {/* ── Right: tabs ── */}
          <div>
            <div style={s.tabs}>
              {tabs.map(t => (
                <button
                  key={t.key}
                  style={{ ...s.tab, ...(activeTab === t.key ? s.tabActive : {}) }}
                  onClick={() => setActiveTab(t.key)}
                >{t.label}</button>
              ))}
            </div>

            {/* RDV */}
            {activeTab === 'rdv' && (
              rdvs.length === 0 ? <EmptyState title="Aucun rendez-vous" sub="Aucun rendez-vous enregistré." />
              : rdvs.map(rdv => {
                const chip = chipStyle(rdv.statut)
                return (
                  <div key={rdv.id} style={s.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '14px', fontWeight: '500', color: 'var(--ink)' }}>
                          {rdv.heure?.slice(0, 5)?.replace(':', 'h')}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: '2px' }}>{rdv.date}</div>
                        {rdv.notes && <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginTop: '6px' }}>{rdv.notes}</div>}
                      </div>
                      <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '500', background: chip.background, color: chip.color }}>
                        {rdv.statut === 'EN_ATTENTE' ? 'En attente' : rdv.statut === 'CONFIRMÉ' ? 'Confirmé' : rdv.statut === 'COMPLÉTÉ' ? 'Complété' : 'Annulé'}
                      </span>
                    </div>
                  </div>
                )
              })
            )}

            {/* Visites */}
            {activeTab === 'visites' && (
              visites.length === 0 ? <EmptyState title="Aucune visite" sub="Aucune visite enregistrée pour ce patient." />
              : visites.map(visite => (
                <div key={visite.id} style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '4px' }}>{visite.date_visite}</div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--ink)' }}>{visite.diagnostic}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: '"Geist Mono", monospace', fontWeight: '600', fontSize: '15px', color: 'var(--accent)' }}>
                        {visite.facture?.montant_total ?? '—'} MAD
                      </div>
                      <span style={{ ...s.badge, ...(visite.facture?.statut === 'payee' ? { background: '#d1fae5', color: '#065f46' } : { background: '#fef3c7', color: '#92400e' }) }}>
                        {visite.facture?.statut === 'payee' ? 'Payée' : visite.facture?.statut === 'en_attente' ? 'En attente' : visite.facture?.statut || '—'}
                      </span>
                    </div>
                  </div>
                  {visite.traitement_fourni && (
                    <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginBottom: '6px' }}>
                      <span style={s.fieldLabel}>Traitement : </span>{visite.traitement_fourni}
                    </div>
                  )}
                  {visite.notes && (
                    <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginBottom: '6px' }}>
                      <span style={s.fieldLabel}>Notes : </span>{visite.notes}
                    </div>
                  )}
                  {visite.operations?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {visite.operations.map((op, i) => (
                        <span key={i} style={s.opTag}>{op.nom_operation} · {op.cout} MAD</span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Ordonnances */}
            {activeTab === 'ordonnances' && (
              ordonnances.length === 0 ? <EmptyState title="Aucune ordonnance" sub="Aucune ordonnance délivrée pour ce patient." />
              : ordonnances.map(ord => (
                <div key={ord.id} style={s.card}>
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{ord.date_delivrance}</div>
                  </div>
                  {ord.instructions_generales && (
                    <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginBottom: '10px' }}>{ord.instructions_generales}</div>
                  )}
                  {ord.medicaments?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {ord.medicaments.map((m, i) => (
                        <span key={i} style={s.medTag}>
                          {m.medicament?.nom || `Méd. #${m.medicament_id}`}
                          {m.frequence ? ` — ${m.frequence}` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Paiements */}
            {activeTab === 'paiements' && (
              factures.length === 0 ? <EmptyState title="Aucune facture" sub="Aucune facture générée pour ce patient." />
              : factures.map(f => {
                const paid = f.statut === 'payee'
                return (
                  <div key={f.id} style={s.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--ink)' }}>{f.numero_facture || `FAC-${String(f.id).padStart(4,'0')}`}</div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: '2px' }}>{fmtDate(f.date_facture || f.created_at)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '15px', fontWeight: '600', color: 'var(--ink)' }}>{f.montant_total} MAD</div>
                        <span style={{ ...s.badge, ...(paid ? { background: '#d1fae5', color: '#065f46' } : { background: '#fef3c7', color: '#92400e' }) }}>
                          {paid ? 'Payée' : 'À régler'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

// ─────────────────────────────────────────────
//  Router
// ─────────────────────────────────────────────
function PatientsList() {
  const { id } = useParams()
  return id ? <PatientDetailView /> : <PatientsListView />
}

const chipStyle = (statut) => {
  const map = {
    'EN_ATTENTE': { background: 'var(--amber-soft)', color: '#8d6a2b' },
    'CONFIRMÉ':   { background: 'var(--accent-soft)', color: 'var(--accent)' },
    'COMPLÉTÉ':   { background: 'var(--info-soft)',    color: 'var(--info)' },
    'ANNULÉ':     { background: 'var(--rose-soft)', color: 'var(--rose)' },
  }
  return map[statut] || { background: 'var(--surface)', color: 'var(--ink-3)' }
}

const s = {
  pageTitle: {
    fontFamily: "'Fraunces', serif", fontWeight: '400', fontSize: '36px',
    letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 6px', lineHeight: '1.1',
  },
  pageSub: { color: 'var(--ink-2)', fontSize: '14px', margin: 0 },
  searchInput: {
    width: '100%', padding: '10px 14px',
    border: '1px solid var(--line)', borderRadius: '10px',
    fontSize: '13.5px', background: 'var(--card)', color: 'var(--ink)',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '20px',
    alignItems: 'start',
  },
  emptyState: {
    background: 'var(--surface)', border: '1px dashed var(--line)',
    borderRadius: 'var(--radius)', padding: '40px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  patientCard: {
    background: 'var(--card)', border: '1px solid var(--line)',
    borderRadius: 'var(--radius)', padding: '20px',
    cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  card: {
    background: 'var(--card)', border: '1px solid var(--line)',
    borderRadius: 'var(--radius)', padding: '20px', marginBottom: '16px',
  },
  avatar: {
    width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, var(--accent-soft, #c9d6d1), var(--accent))',
    display: 'grid', placeItems: 'center',
    color: '#fff', fontWeight: '600', fontSize: '15px',
  },
  patientName: {
    fontWeight: '600', fontSize: '14px', color: 'var(--ink)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  patientMeta: { fontSize: '11.5px', color: 'var(--ink-3)', marginTop: '2px' },
  infoRow: {
    display: 'flex', alignItems: 'center', gap: '7px',
    fontSize: '12.5px', color: 'var(--ink-2)', marginBottom: '6px',
  },
  infoText: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  viewBtn: {
    marginTop: '14px', paddingTop: '12px',
    borderTop: '1px solid var(--line)',
    fontSize: '12.5px', fontWeight: '500',
    color: 'var(--accent)', textAlign: 'right',
  },
  backBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '13.5px', color: 'var(--ink-2)', padding: '0',
    fontFamily: 'inherit',
  },
  profileField: {
    display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '12px',
  },
  fieldLabel: {
    fontSize: '10.5px', letterSpacing: '0.08em', textTransform: 'uppercase',
    color: 'var(--ink-3)', fontWeight: '500',
  },
  fieldValue: { fontSize: '13.5px', color: 'var(--ink)' },
  statRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 0', borderBottom: '1px solid var(--line)',
  },
  statLabel: { fontSize: '13px', color: 'var(--ink-2)' },
  statValue: { fontSize: '14px', fontWeight: '600', color: 'var(--ink)' },
  tabs: {
    display: 'flex', gap: '4px',
    background: 'var(--surface)', borderRadius: '10px',
    padding: '4px', marginBottom: '16px',
    border: '1px solid var(--line)',
  },
  tab: {
    flex: 1, padding: '8px 10px',
    border: 'none', borderRadius: '7px',
    fontSize: '12.5px', fontWeight: '500', cursor: 'pointer',
    background: 'transparent', color: 'var(--ink-3)', fontFamily: 'inherit',
    transition: 'all 0.15s', whiteSpace: 'nowrap',
  },
  tabActive: {
    background: 'var(--card)', color: 'var(--ink)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  badge: {
    display: 'inline-block', padding: '3px 9px',
    borderRadius: '99px', fontSize: '11.5px', fontWeight: '500',
  },
  opTag: {
    background: 'var(--accent-soft, #e8f0ee)', color: 'var(--accent)',
    padding: '3px 10px', borderRadius: '99px',
    fontSize: '11.5px', fontWeight: '500',
  },
  medTag: {
    background: '#eef2ff', color: '#3730a3',
    padding: '3px 10px', borderRadius: '99px',
    fontSize: '11.5px', fontWeight: '500',
  },
}

export default PatientsList

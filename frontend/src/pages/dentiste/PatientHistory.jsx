import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useApiQuery } from '../../hooks/useApi'
import DonutLoader from '../../components/DonutLoader'
import AnimateIn from '../../components/AnimateIn'

// ─────────────────────────────────────────────
//  Patients List View
// ─────────────────────────────────────────────
function PatientsList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: patients = [], isLoading } = useApiQuery('patients', '/patients')

  const fullName = (p) => `${p?.prenom || ''} ${p?.nom || ''}`.trim() || '—'
  const initials = (p) => `${p?.prenom?.[0] || ''}${p?.nom?.[0] || ''}`.toUpperCase() || '?'

  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    return fullName(p).toLowerCase().includes(q) || p.telephone?.includes(search)
  })

  if (isLoading) return (
    <Layout>
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>
        <DonutLoader />
      </div>
    </Layout>
  )

  return (
    <Layout>
      <AnimateIn>
      <div>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={s.pageTitle}>
            Mes <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>patients</em>
          </h1>
          <p style={s.pageSub}>Consultez et recherchez vos patients.</p>
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

        {filtered.length === 0 ? (
          <EmptyState title="Aucun patient trouvé" sub="Essayez un autre terme de recherche." />
        ) : (
          <div style={{ border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden', background: 'var(--card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
              <div style={{ ...s.th, width: '8%' }}>#</div>
              <div style={{ ...s.th, width: '27%' }}>Nom complet</div>
              <div style={{ ...s.th, width: '15%' }}>Téléphone</div>
              <div style={{ ...s.th, width: '17%' }}>Date naissance</div>
              <div style={{ ...s.th, width: '23%' }}>Adresse</div>
              <div style={{ ...s.th, width: '10%', textAlign: 'right' }}></div>
            </div>
            {filtered.map(p => (
              <div key={p.id} style={s.tr} onClick={() => navigate(`/dentiste/patient/${p.id}/historique`)}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ ...s.td, width: '8%', flexShrink: 0 }}><span style={s.idBadge}>#{String(p.id).padStart(4, '0')}</span></div>
                <div style={{ ...s.td, width: '27%', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={s.avatar}>{initials(p)}</div>
                  <span style={{ fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fullName(p)}</span>
                </div>
                <div style={{ ...s.td, width: '15%', flexShrink: 0 }}>{p.telephone || '—'}</div>
                <div style={{ ...s.td, width: '17%', flexShrink: 0 }}>{p.date_naissance || '—'}</div>
                <div style={{ ...s.td, width: '23%', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.adresse || '—'}</div>
                <div style={{ ...s.td, width: '10%', flexShrink: 0, textAlign: 'right' }}>
                  <span style={s.viewLink}>Voir dossier →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </AnimateIn>
    </Layout>
  )
}

// ─────────────────────────────────────────────
//  Patient Detail View
// ─────────────────────────────────────────────
function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [activeTab, setActiveTab] = useState('visites')

  const { data: patients = [] } = useApiQuery('patients', '/patients')
  const { data: visites = [], isLoading: visitesLoading } = useApiQuery(
    ['patient-visites', id],
    `/patient/${id}/visites`,
    { enabled: !!id }
  )
  const { data: ordonnances = [], isLoading: ordsLoading } = useApiQuery(
    ['patient-ordonnances', id],
    `/patient/${id}/ordonnances`,
    { enabled: !!id }
  )
  const loading = visitesLoading || ordsLoading
  const patient = patients.find(x => String(x.id) === String(id)) || null

  const fullName = (p) => `${p?.prenom || ''} ${p?.nom || ''}`.trim()
  const initials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  if (loading) return (
    <Layout>
      <p style={{ color: 'var(--ink-3)', fontSize: '14px', padding: '40px 0' }}><DonutLoader /></p>
    </Layout>
  )

  if (!patient) return (
    <Layout>
      <button style={s.backBtn} onClick={() => navigate('/dentiste/patients')}>← Retour</button>
      <p style={{ color: 'var(--ink-3)', fontSize: '14px', marginTop: '20px' }}>Patient introuvable.</p>
    </Layout>
  )

  return (
    <Layout>
      <AnimateIn>
      <div>

        {/* Back */}
        <button style={s.backBtn} onClick={() => navigate('/dentiste/patients')}>
          ← Retour aux patients
        </button>

        {/* Header */}
        <div style={{ marginBottom: '28px', marginTop: '20px' }}>
          <h1 style={s.pageTitle}>
            Dossier <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{fullName(patient)}</em>
          </h1>
        </div>

        <div style={{ ...s.detailGrid, gridTemplateColumns: isMobile ? '1fr' : '280px 1fr' }}>

          {/* ── Left: profile ── */}
          <div style={{ position: 'sticky', top: '16px' }}>
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{ ...s.avatar, width: '52px', height: '52px', fontSize: '18px' }}>
                  {initials(fullName(patient))}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--ink)' }}>{fullName(patient)}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
                    Patient depuis {patient.created_at?.slice(0, 4) || '—'}
                  </div>
                </div>
              </div>

              <div style={s.profileField}>
                <span style={s.fieldLabel}>Téléphone</span>
                <span style={s.fieldValue}>{patient.telephone || '—'}</span>
              </div>
              <div style={s.profileField}>
                <span style={s.fieldLabel}>Date de naissance</span>
                <span style={s.fieldValue}>{patient.date_naissance || '—'}</span>
              </div>
              {patient.antecedents_medicaux && (
                <div style={s.profileField}>
                  <span style={s.fieldLabel}>Antécédents médicaux</span>
                  <span style={s.fieldValue}>{patient.antecedents_medicaux}</span>
                </div>
              )}
              {patient.allergies && (
                <div style={{ ...s.allergyBadge, marginTop: '12px' }}>
                  <strong>Allergies :</strong> {patient.allergies}
                </div>
              )}

            </div>

            {/* Stats */}
            <div style={s.card}>
              <div style={s.statRow}>
                <span style={s.statLabel}>Visites totales</span>
                <span style={s.statValue}>{visites.length}</span>
              </div>
              <div style={s.statRow}>
                <span style={s.statLabel}>Ordonnances</span>
                <span style={s.statValue}>{ordonnances.length}</span>
              </div>
              {visites.length > 0 && (
                <div style={s.statRow}>
                  <span style={s.statLabel}>Dernière visite</span>
                  <span style={s.statValue}>{visites[0]?.date || '—'}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: tabs ── */}
          <div>
            {/* Tabs */}
            <div style={s.tabs}>
              <button
                style={{ ...s.tab, ...(activeTab === 'visites' ? s.tabActive : {}) }}
                onClick={() => setActiveTab('visites')}
              >
                Visites ({visites.length})
              </button>
              <button
                style={{ ...s.tab, ...(activeTab === 'ordonnances' ? s.tabActive : {}) }}
                onClick={() => setActiveTab('ordonnances')}
              >
                Ordonnances ({ordonnances.length})
              </button>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 310px)', paddingRight: '4px' }}>

            {/* Visites tab */}
            {activeTab === 'visites' && (
              <div>
                {visites.length === 0 ? (
                  <EmptyState title="Aucune visite" sub="Aucune visite enregistrée pour ce patient." />
                ) : visites.map(visite => (
                  <div key={visite.id} style={s.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '4px' }}>
                          {visite.date_visite}
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--ink)' }}>
                          {visite.diagnostic}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: '"Inter", sans-serif', fontWeight: '600', fontSize: '15px', color: 'var(--accent)' }}>
                          {visite.facture?.montant_total ?? '—'} MAD
                        </div>
                        <span style={{
                          ...s.badge,
                          ...(visite.facture?.statut === 'payee'
                            ? { background: 'var(--success-soft, #d1fae5)', color: '#065f46' }
                            : { background: '#fef3c7', color: '#92400e' })
                        }}>
                          {visite.facture?.statut === 'payee' ? 'Payée' : visite.facture?.statut === 'en_attente' ? 'En attente' : visite.facture?.statut || '—'}
                        </span>
                      </div>
                    </div>

                    {visite.traitement_fourni && (
                      <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginBottom: '8px' }}>
                        <span style={s.fieldLabel}>Traitement : </span>
                        {visite.traitement_fourni}
                      </div>
                    )}

                    {visite.notes && (
                      <div style={{ fontSize: '13px', color: 'var(--ink-2)' }}>
                        <span style={s.fieldLabel}>Notes : </span>
                        {visite.notes}
                      </div>
                    )}

                    {visite.operations?.length > 0 && (
                      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {visite.operations.map((op, i) => (
                          <span key={i} style={s.opTag}>{op.nom_operation} · {op.cout} MAD</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Ordonnances tab */}
            {activeTab === 'ordonnances' && (
              <div>
                {ordonnances.length === 0 ? (
                  <EmptyState title="Aucune ordonnance" sub="Aucune ordonnance délivrée pour ce patient." />
                ) : ordonnances.map(ord => (
                  <div key={ord.id} style={s.card}>
                    <div style={{ marginBottom: '12px' }}>
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
                ))}
              </div>
            )}
            </div>
          </div>

        </div>
      </div>
      </AnimateIn>
    </Layout>
  )
}

// ─────────────────────────────────────────────
//  Router: list vs detail
// ─────────────────────────────────────────────
function PatientHistory() {
  const { id } = useParams()
  return id ? <PatientDetail /> : <PatientsList />
}

const s = {
  pageTitle: {
    fontFamily: "'Inter', sans-serif", fontWeight: '400', fontSize: '36px',
    letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 6px', lineHeight: '1.1',
  },
  pageSub: { color: 'var(--ink-2)', fontSize: '14px', margin: 0 },

  searchInput: {
    width: '100%', padding: '10px 14px',
    border: '1px solid var(--line)', borderRadius: '10px',
    fontSize: '13.5px', background: 'var(--card)', color: 'var(--ink)',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  },

  th: {
    textAlign: 'left', padding: '12px 14px',
    fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: '0.08em', color: 'var(--ink-3)',
    background: 'var(--surface)', borderBottom: '1px solid var(--line)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px 14px', color: 'var(--ink-2)', verticalAlign: 'middle',
  },
  tr: {
    cursor: 'pointer', transition: 'background 0.1s',
    borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center',
  },
  idBadge: {
    fontFamily: '"Inter", sans-serif', fontSize: '12px',
    fontWeight: '500', color: 'var(--ink-3)',
  },
  viewLink: {
    fontSize: '12.5px', fontWeight: '500', color: 'var(--accent)',
    whiteSpace: 'nowrap',
  },

  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '20px',
    alignItems: 'start',
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
    width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, var(--accent-soft, #c9d6d1), var(--accent))',
    display: 'grid', placeItems: 'center',
    color: '#fff', fontWeight: '600', fontSize: '13px',
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

  allergyBadge: {
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: '8px', padding: '6px 10px',
    fontSize: '12px', color: '#991b1b', marginTop: '6px',
  },

  viewBtn: {
    marginTop: '14px', paddingTop: '12px',
    borderTop: '1px solid var(--line)',
    fontSize: '12.5px', fontWeight: '500',
    color: 'var(--accent)', textAlign: 'right',
  },

  backBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '13.5px', color: 'var(--ink-2)', padding: '0',
    fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px',
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

  accentBtn: {
    width: '100%', padding: '11px',
    background: 'var(--accent)', color: '#fff', border: 'none',
    borderRadius: '10px', fontSize: '13.5px', fontWeight: '500',
    cursor: 'pointer', fontFamily: 'inherit',
  },

  tabs: {
    display: 'flex', gap: '4px',
    background: 'var(--surface)', borderRadius: '10px',
    padding: '4px', marginBottom: '16px',
    border: '1px solid var(--line)',
  },
  tab: {
    flex: 1, padding: '8px 12px',
    border: 'none', borderRadius: '7px',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
    background: 'transparent', color: 'var(--ink-3)', fontFamily: 'inherit',
    transition: 'all 0.15s',
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

  emptyState: {
    background: 'var(--surface)', border: '1px dashed var(--line)',
    borderRadius: 'var(--radius)', padding: '40px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
}

export default PatientHistory

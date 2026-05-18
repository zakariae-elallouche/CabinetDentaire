import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import api from '../../api'
import { useIsMobile } from '../../hooks/useIsMobile'

const DAYS_FR   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']

const toLocalStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

const IcoChevL   = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
const IcoChevR   = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
const IcoEdit    = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IcoUser    = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
const IcoCal     = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
const IcoClip    = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
const IcoReceipt = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>

function AgendaDuJour() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [date, setDate]       = useState(new Date())
  const [rdvs, setRdvs]       = useState([])
  const [visites, setVisites] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('rdv') // 'rdv' | 'visites'
  const [search, setSearch]   = useState('')
  const [expandedVisite, setExpandedVisite] = useState(null)

  useEffect(() => {
    setLoading(true)
    const dateStr = toLocalStr(date)
    Promise.all([
      api.get('/dentiste/schedule', { params: { date: dateStr } }).then(r => r.data || []).catch(() => []),
      toLocalStr(date) === toLocalStr(new Date())
        ? api.get('/dentiste/visites/today').then(r => r.data || []).catch(() => [])
        : Promise.resolve([]),
    ]).then(([r, v]) => {
      setRdvs(r)
      setVisites(v)
    }).finally(() => setLoading(false))
  }, [date])

  const shiftDay = (n) => {
    const d = new Date(date)
    d.setDate(d.getDate() + n)
    setDate(d)
  }

  const isToday = toLocalStr(date) === toLocalStr(new Date())

  const pName = (obj) =>
    obj?.patient ? `${obj.patient.prenom || ''} ${obj.patient.nom || ''}`.trim() : '—'

  const rdvChip = (statut) => ({
    'CONFIRMÉ':   { bg: 'var(--accent-soft)',  color: 'var(--accent)' },
    'COMPLÉTÉ':   { bg: 'var(--info-soft)',    color: 'var(--info)' },
    'EN_ATTENTE': { bg: 'var(--amber-soft)',   color: '#8d6a2b' },
    'ANNULÉ':     { bg: 'var(--rose-soft)',    color: 'var(--rose)' },
  })[statut] || { bg: 'var(--surface)', color: 'var(--ink-3)' }

  const rdvLabel = (s) => ({ CONFIRMÉ: 'Confirmé', COMPLÉTÉ: 'Complété', EN_ATTENTE: 'En attente', ANNULÉ: 'Annulé' })[s] || s

  const q = search.toLowerCase().trim()
  const filteredRdvs    = q ? rdvs.filter(r => pName(r).toLowerCase().includes(q)) : rdvs
  const filteredVisites = q ? visites.filter(v => pName(v).toLowerCase().includes(q)) : visites

  return (
    <Layout>
      <div>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={s.pageTitle}>
              Agenda <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>du jour</em>
            </h1>
            <p style={s.pageSub}>
              {DAYS_FR[date.getDay()]}, {date.getDate()} {MONTHS_FR[date.getMonth()]} {date.getFullYear()}
              {isToday && <span style={s.todayBadge}>Aujourd'hui</span>}
            </p>
          </div>
        </div>

        {/* ── Tabs + Search ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
          <div style={s.tabBar}>
            <button
              style={{ ...s.tabBtn, ...(tab === 'rdv' ? s.tabBtnActive : {}) }}
              onClick={() => setTab('rdv')}
            >
              <IcoCal /> Rendez-vous
              <span style={{ ...s.tabBadge, background: tab === 'rdv' ? 'rgba(255,255,255,0.25)' : 'var(--surface)', color: tab === 'rdv' ? '#fff' : 'var(--ink-3)' }}>
                {rdvs.length}
              </span>
            </button>
            <button
              style={{ ...s.tabBtn, ...(tab === 'visites' ? s.tabBtnActive : {}) }}
              onClick={() => setTab('visites')}
            >
              <IcoClip /> Visites complètes
              <span style={{ ...s.tabBadge, background: tab === 'visites' ? 'rgba(255,255,255,0.25)' : 'var(--surface)', color: tab === 'visites' ? '#fff' : 'var(--ink-3)' }}>
                {visites.length}
              </span>
            </button>
          </div>

          {/* Search */}
          <div style={s.searchWrap}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              style={s.searchInput}
              placeholder="Rechercher un patient..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', padding: 0, fontSize: '13px', lineHeight: 1 }}>✕</button>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <p style={{ color: 'var(--ink-3)', padding: '3rem 0', textAlign: 'center' }}>Chargement...</p>
        ) : tab === 'rdv' ? (
          filteredRdvs.length === 0 ? (
            <EmptyState title="Aucun rendez-vous" sub={isToday ? "Pas de consultations programmées aujourd'hui." : 'Aucune consultation ce jour-là.'} />
          ) : (
            <div style={s.timeline}>
              {filteredRdvs.slice().sort((a, b) => (a.heure || '').localeCompare(b.heure || '')).map((rdv, i, arr) => {
                const chip = rdvChip(rdv.statut)
                const done = rdv.statut === 'COMPLÉTÉ' || rdv.statut === 'ANNULÉ'
                return (
                  <div key={rdv.id} style={{ display: 'flex', position: 'relative' }}>
                    {!isMobile && (
                      <div style={s.timeCol}>
                        <span style={{ ...s.timeLabel, opacity: done ? 0.45 : 1 }}>
                          {rdv.heure?.slice(0, 5)?.replace(':', 'h')}
                        </span>
                        {i < arr.length - 1 && <div style={s.connector} />}
                      </div>
                    )}
                    {!isMobile && <div style={{ ...s.dot, background: done ? 'var(--line-strong)' : chip.color }} />}
                    <div style={{ ...s.rdvCard, opacity: done ? 0.65 : 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        {isMobile && (
                          <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '12px', fontWeight: '500', color: 'var(--ink-3)', flexShrink: 0 }}>
                            {rdv.heure?.slice(0, 5)?.replace(':', 'h')}
                          </span>
                        )}
                        <span style={{ ...s.chip, background: chip.bg, color: chip.color }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: chip.color, display: 'inline-block' }} />
                          {rdvLabel(rdv.statut)}
                        </span>
                        <span style={s.rdvId}>RDV-{String(rdv.id).padStart(4, '0')}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                        <div style={{ minWidth: 0 }}>
                          <b style={s.patientName}>{pName(rdv)}</b>
                          {(rdv.raison || rdv.notes) && (
                            <p style={s.rdvRaison}>{rdv.raison || rdv.notes}</p>
                          )}
                        </div>
                        {!done ? (
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            {rdv.patient?.id && (
                              <button style={s.btnAction} onClick={() => navigate(`/dentiste/patient/${rdv.patient.id}/historique`)}>
                                <IcoUser /> Dossier
                              </button>
                            )}
                            <button style={{ ...s.btnAction, ...s.btnActionAccent }} onClick={() => navigate(`/dentiste/visite/${rdv.id}`)}>
                              <IcoEdit /> Consulter
                            </button>
                          </div>
                        ) : rdv.statut === 'COMPLÉTÉ' ? (
                          <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '500' }}>✓ Terminé</span>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--rose)' }}>Annulé</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          // ── Visites tab ──
          filteredVisites.length === 0 ? (
            <EmptyState title="Aucune visite complète" sub={isToday ? "Aucune consultation enregistrée aujourd'hui." : 'Non disponible pour les jours passés.'} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredVisites.map(v => {
                const open = expandedVisite === v.id
                const totalOps = v.operations?.reduce((sum, op) => sum + parseFloat(op.cout || 0), 0) || 0
                return (
                  <div key={v.id} style={{ ...s.visteCard, ...(open ? s.visteCardOpen : {}) }}>
                    {/* ── Summary row (always visible) ── */}
                    <div
                      style={{ display: 'flex', flexDirection: 'column', gap: '6px', cursor: 'pointer' }}
                      onClick={() => setExpandedVisite(open ? null : v.id)}
                    >
                      {/* Row 1: dot + name + ref + chevron */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
                        <b style={{ fontSize: '14px', fontWeight: '500', color: 'var(--ink)', fontFamily: "'Fraunces', serif", flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pName(v)}
                        </b>
                        <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '11px', color: 'var(--ink-3)', flexShrink: 0 }}>
                          VIS-{String(v.id).padStart(4, '0')}
                        </span>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'none', flexShrink: 0 }}>
                          <path d="m9 6 6 6-6 6"/>
                        </svg>
                      </div>
                      {/* Row 2: ops + amount + status icon */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '18px' }}>
                        {v.operations?.length > 0 && (
                          <span style={{ fontSize: '11.5px', color: 'var(--ink-3)' }}>
                            {v.operations.length} op.
                          </span>
                        )}
                        {v.facture && (
                          <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>
                            {parseFloat(v.facture.montant_total).toFixed(2)} MAD
                          </span>
                        )}
                        {v.facture && (
                          <span title={v.facture.statut === 'payee' ? 'Payée' : 'En attente'} style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                            background: v.facture.statut === 'payee' ? 'var(--success-soft)' : 'var(--amber-soft)',
                            color: v.facture.statut === 'payee' ? 'var(--success)' : '#8d6a2b',
                          }}>
                            {v.facture.statut === 'payee'
                              ? <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 9 17 20 7"/></svg>
                              : <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── Expanded detail ── */}
                    {open && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                          {v.diagnostic && (
                            <div style={s.infoBox}>
                              <label style={s.infoLabel}>Diagnostic</label>
                              <p style={s.infoVal}>{v.diagnostic}</p>
                            </div>
                          )}
                          {v.traitement_fourni && (
                            <div style={s.infoBox}>
                              <label style={s.infoLabel}>Traitement</label>
                              <p style={s.infoVal}>{v.traitement_fourni}</p>
                            </div>
                          )}
                          {v.notes && (
                            <div style={{ ...s.infoBox, gridColumn: '1 / -1' }}>
                              <label style={s.infoLabel}>Notes</label>
                              <p style={s.infoVal}>{v.notes}</p>
                            </div>
                          )}
                        </div>

                        {v.operations?.length > 0 && (
                          <div style={{ marginBottom: '14px' }}>
                            <label style={{ ...s.infoLabel, display: 'block', marginBottom: '8px' }}>Opérations</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              {v.operations.map(op => (
                                <div key={op.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                                  <div>
                                    <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: '500', display: 'block' }}>{op.nom_operation}</span>
                                    {op.description && <span style={{ fontSize: '11.5px', color: 'var(--ink-3)' }}>{op.description}</span>}
                                  </div>
                                  <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '12.5px', fontWeight: '600', color: 'var(--ink)' }}>
                                    {parseFloat(op.cout).toFixed(2)} MAD
                                  </span>
                                </div>
                              ))}
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px 0' }}>
                                <span style={{ fontSize: '11.5px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total opérations</span>
                                <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>{totalOps.toFixed(2)} MAD</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {v.facture && (
                          <div style={{ display: 'flex', gap: '20px', padding: '12px 14px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--line)', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12px', color: 'var(--ink-3)', fontFamily: '"Geist Mono", monospace' }}>{v.facture.numero_facture}</span>
                            <span style={{ fontSize: '11.5px', color: 'var(--ink-3)' }}>Visite: <b style={{ color: 'var(--ink)' }}>{parseFloat(v.facture.frais_visite_base || 0).toFixed(2)} MAD</b></span>
                            <span style={{ fontSize: '11.5px', color: 'var(--ink-3)' }}>Opérations: <b style={{ color: 'var(--ink)' }}>{parseFloat(v.facture.frais_operations || 0).toFixed(2)} MAD</b></span>
                            <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '15px', fontWeight: '700', color: 'var(--ink)', marginLeft: 'auto' }}>
                              {parseFloat(v.facture.montant_total).toFixed(2)} MAD
                            </span>
                          </div>
                        )}

                        {v.patient?.id && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button style={s.btnAction} onClick={() => navigate(`/dentiste/patient/${v.patient.id}/historique`)}>
                              <IcoUser /> Dossier patient
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </Layout>
  )
}

const s = {
  pageTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: '400',
    fontSize: '36px',
    letterSpacing: '-0.02em',
    color: 'var(--ink)',
    margin: '0 0 6px',
    lineHeight: 1.1,
  },
  pageSub: {
    color: 'var(--ink-2)',
    fontSize: '14px',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textTransform: 'capitalize',
  },
  todayBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 9px',
    borderRadius: '999px',
    background: 'var(--accent-soft)',
    color: 'var(--accent)',
    fontSize: '11px',
    fontWeight: '500',
    letterSpacing: '0.04em',
    textTransform: 'none',
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '9px',
    fontSize: '13px',
    fontWeight: '500',
    background: 'var(--card)',
    border: '1px solid var(--line)',
    color: 'var(--ink-2)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  navBtn: {
    width: '36px',
    height: '36px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '9px',
    border: '1px solid var(--line)',
    background: 'var(--card)',
    color: 'var(--ink-2)',
    cursor: 'pointer',
  },
  statsRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '22px',
    flexWrap: 'wrap',
  },
  statPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '999px',
    border: '1px solid var(--line)',
    background: 'var(--card)',
  },
  statNum: {
    fontFamily: '"Geist Mono", monospace',
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: 1,
  },
  statLbl: { fontSize: '12px', color: 'var(--ink-3)' },
  tabBar: {
    display: 'flex',
    gap: '6px',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '999px',
    border: '1px solid var(--line)',
    background: 'var(--card)',
    flex: 1,
    maxWidth: '280px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '13px',
    color: 'var(--ink)',
    fontFamily: 'inherit',
    flex: 1,
    minWidth: 0,
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 16px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: 'inherit',
    border: '1px solid var(--line)',
    background: 'var(--card)',
    color: 'var(--ink-2)',
    cursor: 'pointer',
  },
  tabBtnActive: {
    background: 'var(--accent)',
    borderColor: 'var(--accent)',
    color: '#fff',
  },
  tabBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '18px',
    height: '18px',
    padding: '0 5px',
    borderRadius: '999px',
    fontSize: '11px',
    fontFamily: '"Geist Mono", monospace',
    fontWeight: '600',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '5rem 2rem',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--ink-3)',
    marginBottom: '20px',
  },
  emptyTitle: { color: 'var(--ink-2)', fontFamily: "'Fraunces', serif", fontSize: '20px', margin: '0 0 6px' },
  emptySub:  { color: 'var(--ink-3)', fontSize: '13.5px', margin: 0 },
  timeline: { display: 'flex', flexDirection: 'column' },
  timeCol: {
    width: '72px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    paddingRight: '16px',
    paddingTop: '18px',
    position: 'relative',
  },
  timeLabel: {
    fontFamily: '"Geist Mono", monospace',
    fontSize: '12.5px',
    color: 'var(--ink-3)',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  connector: {
    position: 'absolute',
    top: '34px',
    right: '7px',
    width: '1px',
    bottom: '-18px',
    background: 'var(--line)',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '22px',
    border: '2px solid var(--bg)',
    boxShadow: '0 0 0 1px var(--line)',
  },
  rdvCard: {
    flex: 1,
    background: 'var(--card)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '16px 20px',
    marginLeft: '14px',
    marginBottom: '12px',
  },
  visteCard: {
    background: 'var(--card)',
    border: '1px solid var(--line)',
    borderRadius: '10px',
    padding: '12px 18px',
    transition: 'border-color 0.15s',
  },
  visteCardOpen: {
    borderColor: 'var(--accent)',
  },
  infoBox: {
    background: 'var(--surface)',
    borderRadius: '8px',
    padding: '10px 12px',
    border: '1px solid var(--line)',
  },
  infoLabel: {
    display: 'block',
    fontSize: '10.5px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--ink-3)',
    marginBottom: '4px',
    fontWeight: '600',
  },
  infoVal: { fontSize: '13px', color: 'var(--ink)', margin: 0, lineHeight: 1.5 },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '11.5px',
    fontWeight: '500',
  },
  rdvId: { fontFamily: '"Geist Mono", monospace', fontSize: '11px', color: 'var(--ink-3)' },
  patientName: {
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--ink)',
    fontFamily: "'Fraunces', serif",
    display: 'block',
    marginBottom: '2px',
  },
  rdvRaison: { fontSize: '12.5px', color: 'var(--ink-3)', margin: 0 },
  infoBox: {
    background: 'var(--surface)',
    borderRadius: '8px',
    padding: '10px 12px',
    border: '1px solid var(--line)',
  },
  infoLabel: {
    display: 'block',
    fontSize: '10.5px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--ink-3)',
    marginBottom: '4px',
    fontWeight: '600',
  },
  infoVal: { fontSize: '13px', color: 'var(--ink)', margin: 0, lineHeight: 1.5 },
  btnAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '7px 12px',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: '500',
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    color: 'var(--ink-2)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnActionAccent: {
    background: 'var(--accent)',
    border: '1px solid var(--accent)',
    color: '#fff',
  },
}

export default AgendaDuJour

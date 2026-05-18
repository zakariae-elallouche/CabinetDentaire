import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import { promptDialog } from '../../components/DialogProvider'
import { useIsMobile } from '../../hooks/useIsMobile'
import api from '../../api'

const IcoCal      = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
const IcoReceipt  = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>
const IcoUsers    = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3a3 3 0 0 1 0 6M21 21v-2a4 4 0 0 0-3-3.87"/></svg>
const IcoList     = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>
const IcoPill     = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-30 12 12)"/><path d="M8.5 6.5l7 7"/></svg>
const IcoSettings = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
const IcoClock    = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
const IcoChevronR = () => <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>

function SecretaireDashboard() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [stats, setStats] = useState({ rdvEnAttente: 0, facturesEnAttente: 0, totalPatients: 0, rdvCeMois: 0 })
  const [rdvEnAttente, setRdvEnAttente] = useState([])
  const [rdvAujourdhui, setRdvAujourdhui] = useState([])
  const [loading, setLoading] = useState(true)

  const todayStr = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rdvRes, patientsRes, facturesRes] = await Promise.all([
          api.get('/rendez-vous'),
          api.get('/patients'),
          api.get('/factures'),
        ])
        const all = rdvRes.data
        const enAttente = all.filter(r => r.statut === 'EN_ATTENTE')
        const aujourdhui = all.filter(r => r.date === todayStr).sort((a, b) => a.heure?.localeCompare(b.heure))
        const facturesEnAttente = facturesRes.data.filter(f => f.statut === 'en_attente')
        setRdvEnAttente(enAttente)
        setRdvAujourdhui(aujourdhui)
        setStats({
          rdvEnAttente: enAttente.length,
          totalPatients: patientsRes.data.length,
          facturesEnAttente: facturesEnAttente.length,
          rdvCeMois: all.filter(r => r.date?.startsWith(todayStr.slice(0, 7))).length,
        })
      } catch {
        setRdvEnAttente([
          { id: 1, patient: { nom_complet: 'Ahmed Mansouri', telephone: '0661234567' }, date: '2026-05-08', heure: '09:00', notes: 'Douleur molaire' },
          { id: 2, patient: { nom_complet: 'Nadia Berrada', telephone: '0662345678' }, date: '2026-05-09', heure: '14:30', notes: 'Contrôle annuel' },
        ])
        setStats({ rdvEnAttente: 2, facturesEnAttente: 3, totalPatients: 48, rdvCeMois: 12 })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleConfirm = async (id) => {
    try {
      await api.put(`/rendez-vous/${id}/confirm`)
      setRdvEnAttente(prev => prev.filter(r => r.id !== id))
      setStats(prev => ({ ...prev, rdvEnAttente: prev.rdvEnAttente - 1 }))
    } catch { toast.error('Erreur lors de la confirmation') }
  }

  const handleReject = async (id) => {
    const raison = await promptDialog('Raison du rejet :', { placeholder: 'Ex: Créneau non disponible', confirmLabel: 'Rejeter' })
    if (!raison) return
    try {
      await api.put(`/rendez-vous/${id}/reject`, { raison })
      setRdvEnAttente(prev => prev.filter(r => r.id !== id))
      setStats(prev => ({ ...prev, rdvEnAttente: prev.rdvEnAttente - 1 }))
      toast.success('Rendez-vous rejeté')
    } catch { toast.error('Erreur lors du rejet') }
  }

  const STATS = [
    { label: 'RDV en attente',      value: stats.rdvEnAttente,      bg: 'var(--amber-soft)',   color: 'var(--gold)',    Ico: IcoClock },
    { label: 'Factures à encaisser',value: stats.facturesEnAttente, bg: 'var(--rose-soft)',    color: 'var(--rose)',    Ico: IcoReceipt },
    { label: 'Patients enregistrés',value: stats.totalPatients,     bg: 'var(--accent-soft)', color: 'var(--accent)',  Ico: IcoUsers },
    { label: 'RDV ce mois',         value: stats.rdvCeMois,         bg: 'var(--success-soft)',color: 'var(--success)', Ico: IcoCal },
  ]

  const SHORTCUTS = [
    { label: 'Rendez-vous', sub: 'Gérer les demandes',   path: '/secretaire/rendez-vous', Ico: IcoCal },
    { label: 'Paiements',   sub: 'Encaisser les factures',path: '/secretaire/paiements',   Ico: IcoReceipt },
    { label: 'Médicaments', sub: 'Catalogue & stocks',    path: '/secretaire/medicaments', Ico: IcoPill },
    { label: 'Opérations',  sub: 'Tarifs des actes',      path: '/secretaire/operations',  Ico: IcoSettings },
    { label: 'Patients',    sub: 'Liste & dossiers',      path: '/secretaire/patients',    Ico: IcoUsers },
  ]

  return (
    <Layout>
      <div>

        {/* Titre */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={styles.pageTitle}>
            Tableau de bord <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Secrétaire</em>
          </h1>
          <p style={styles.pageSub}>Gestion du cabinet dentaire</p>
        </div>

        {/* ─── Hero + Actions ─── */}
        <div style={{ ...styles.dashHero, gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr' }}>
        <div style={styles.heroCard}>
          <div style={styles.heroEyebrow}>VISITES DU JOUR</div>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Chargement...</p>
          ) : rdvAujourdhui.length === 0 ? (
            <>
              <div style={styles.heroEmpty}>Aucune visite prévue aujourd'hui</div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: 0 }}>
                Le cabinet est libre — profitez-en pour organiser les dossiers.
              </p>
            </>
          ) : (
            <>
              <div style={styles.heroBig}>
                {rdvAujourdhui.length}
                <span style={{ fontFamily: 'inherit', fontStyle: 'italic', fontWeight: 300, fontSize: '32px', marginLeft: '12px' }}>
                  {rdvAujourdhui.length === 1 ? 'visite' : 'visites'}
                </span>
              </div>
              <div style={styles.heroLine} />
              <div style={styles.heroList}>
                {rdvAujourdhui.slice(0, 3).map((rdv, i, arr) => {
                  const statusColor = rdv.statut === 'CONFIRMÉ' ? 'rgba(125,211,200,0.9)' : rdv.statut === 'COMPLÉTÉ' ? 'rgba(147,197,253,0.9)' : 'rgba(255,255,255,0.6)'
                  return (
                    <div key={rdv.id} style={{ ...styles.heroRow, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none', gridTemplateColumns: isMobile ? '48px 1fr 56px' : '60px 1fr 120px 80px' }}>
                      <span style={styles.heroTime}>{rdv.heure?.slice(0, 5)?.replace(':', 'h')}</span>
                      <span style={{ ...styles.heroPatient, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rdv.patient ? `${rdv.patient.prenom} ${rdv.patient.nom}` : '—'}
                      </span>
                      <span style={{ ...styles.heroStatut, color: statusColor, fontSize: isMobile ? '10px' : '12px', whiteSpace: 'nowrap' }}>
                        {rdv.statut === 'EN_ATTENTE' ? (isMobile ? 'Attente' : 'En attente') : rdv.statut === 'CONFIRMÉ' ? 'Confirmé' : rdv.statut === 'COMPLÉTÉ' ? 'Complété' : rdv.statut}
                      </span>
                      {!isMobile && <span style={styles.heroRef}>#{String(rdv.id).padStart(4, '0')}</span>}
                    </div>
                  )
                })}
              </div>
              {rdvAujourdhui.length > 3 && (
                <div
                  style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '10px', cursor: 'pointer' }}
                  onClick={() => navigate('/secretaire/rendez-vous')}
                >
                  +{rdvAujourdhui.length - 3} autre{rdvAujourdhui.length - 3 > 1 ? 's' : ''} → Voir tout
                </div>
              )}
            </>
          )}
        </div>{/* end heroCard */}

        {/* ─── Actions panel ─── */}
        <div style={styles.tasksCard}>
          <div style={styles.cardHead}>
            <span style={styles.cardTitle}>Actions</span>
            <span style={styles.cardSub}>{stats.rdvEnAttente} EN ATTENTE</span>
          </div>

          {[
            { Ico: IcoCal,     label: 'Rendez-vous', sub: `${stats.rdvEnAttente} en attente`,      path: '/secretaire/rendez-vous', icoStyle: { background: 'var(--accent-soft)', color: 'var(--accent)' } },
            { Ico: IcoReceipt, label: 'Paiements',   sub: `${stats.facturesEnAttente} à encaisser`, path: '/secretaire/paiements',   icoStyle: { background: 'var(--amber-soft)',  color: 'var(--gold)' } },
            { Ico: IcoUsers,   label: 'Patients',    sub: `${stats.totalPatients} enregistrés`,     path: '/secretaire/patients',    icoStyle: { background: 'var(--accent-soft)', color: 'var(--accent)' } },
          ].map(({ Ico, label, sub, path, icoStyle }, i, arr) => (
            <div key={path} style={{ ...styles.task, borderBottom: i < arr.length - 1 ? '1px dashed var(--line)' : 'none' }}>
              <div style={{ ...styles.taskIco, ...icoStyle }}><Ico /></div>
              <div style={{ flex: 1 }}>
                <b style={styles.taskTitle}>{label}</b>
                <small style={styles.taskSub}>{sub}</small>
              </div>
              <button style={styles.taskCta} onClick={() => navigate(path)}>
                Voir <IcoChevronR />
              </button>
            </div>
          ))}
        </div>

        </div>{/* end dashHero */}

        {/* Raccourcis */}
        <div style={{ ...styles.shortcutGrid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)' }}>
          {SHORTCUTS.map(s => (
            <button key={s.path} style={styles.shortcut} onClick={() => navigate(s.path)}>
              <div style={styles.shortcutIcon}><s.Ico /></div>
              <b style={styles.shortcutLabel}>{s.label}</b>
              <small style={styles.shortcutSub}>{s.sub}</small>
            </button>
          ))}
        </div>

        {/* RDV en attente */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ ...styles.cardTitle, margin: 0 }}>Demandes en attente</h3>
            <span
              style={{ fontSize: '13px', color: 'var(--accent)', cursor: 'pointer', fontWeight: '500' }}
              onClick={() => navigate('/secretaire/rendez-vous')}
            >
              Voir tout →
            </span>
          </div>

          {loading ? (
            <p style={{ color: 'var(--ink-3)' }}>Chargement...</p>
          ) : rdvEnAttente.length === 0 ? (
            <p style={{ color: 'var(--ink-3)' }}>Aucune demande en attente ✅</p>
          ) : (
            rdvEnAttente.map(rdv => (
              <div key={rdv.id} style={styles.rdvRow}>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '14px', color: 'var(--ink)', fontFamily: "'Fraunces', serif" }}>
                    {rdv.patient ? `${rdv.patient.prenom || ''} ${rdv.patient.nom || ''}`.trim() : '—'}
                  </b>
                  <div style={{ fontSize: '12.5px', color: 'var(--ink-3)', marginTop: '2px' }}>
                    {rdv.heure?.slice(0, 5)?.replace(':', 'h')}
                    {rdv.date ? ` · ${(() => { const [y,m,d] = rdv.date.split('-'); const dt = new Date(+y,+m-1,+d); return `${dt.getDate()} ${['jan','fév','mars','avr','mai','juin','juil','aoû','sep','oct','nov','déc'][dt.getMonth()]} ${dt.getFullYear()}` })()}` : ''}
                    {rdv.notes ? ` · ${rdv.notes}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{ ...styles.btnSmall, background: 'var(--success-soft)', color: 'var(--success)', border: 'none' }}
                    onClick={() => handleConfirm(rdv.id)}
                  >
                    ✓ Confirmer
                  </button>
                  <button
                    style={{ ...styles.btnSmall, background: 'var(--rose-soft)', color: 'var(--rose)', border: 'none' }}
                    onClick={() => handleReject(rdv.id)}
                  >
                    ✕ Rejeter
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}

const styles = {
  pageTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: '400',
    fontSize: '32px',
    letterSpacing: '-0.02em',
    color: 'var(--ink)',
    margin: '0 0 6px',
  },
  pageSub: { color: 'var(--ink-2)', fontSize: '14px', margin: 0 },
  dashHero: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '20px',
    marginBottom: '22px',
  },
  heroCard: {
    background: 'linear-gradient(155deg, #0f4842 0%, #1d6e66 100%)',
    borderRadius: 'var(--radius)',
    padding: '28px 20px',
    color: 'white',
    overflow: 'hidden',
  },
  tasksCard: {
    background: 'var(--card)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHead: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '14px',
  },
  cardTitle: {
    fontFamily: "'Fraunces', serif", fontWeight: '500',
    fontSize: '17px', letterSpacing: '-0.01em', color: 'var(--ink)',
  },
  cardSub: {
    color: 'var(--ink-3)', fontSize: '12px',
    letterSpacing: '0.04em', textTransform: 'uppercase',
  },
  task: {
    display: 'flex', gap: '12px', alignItems: 'center',
    padding: '11px 0',
  },
  taskIco: {
    width: '36px', height: '36px', borderRadius: '8px',
    display: 'grid', placeItems: 'center', flexShrink: 0,
  },
  taskTitle: { fontSize: '13.5px', fontWeight: '500', display: 'block', color: 'var(--ink)' },
  taskSub: { color: 'var(--ink-3)', fontSize: '12px' },
  taskCta: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    color: 'var(--accent)', fontSize: '12.5px', fontWeight: '500',
    background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
    fontFamily: 'inherit',
  },
  heroEyebrow: {
    fontSize: '10.5px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: '14px',
    fontWeight: '500',
  },
  heroBig: {
    fontFamily: "'Fraunces', serif",
    fontWeight: '300',
    fontSize: '52px',
    letterSpacing: '-0.02em',
    lineHeight: 1,
    color: 'white',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'baseline',
  },
  heroEmpty: {
    fontFamily: "'Fraunces', serif",
    fontWeight: '300',
    fontSize: '28px',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: '8px',
    letterSpacing: '-0.01em',
  },
  heroLine: {
    height: '1px',
    background: 'rgba(255,255,255,0.15)',
    marginBottom: '14px',
  },
  heroList: { display: 'flex', flexDirection: 'column' },
  heroRow: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr 120px 80px',
    gap: '16px',
    alignItems: 'center',
    padding: '10px 0',
  },
  heroTime: {
    fontFamily: '"Geist Mono", monospace',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
  },
  heroPatient: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
  },
  heroStatut: {
    fontSize: '12px',
    fontWeight: '500',
  },
  heroRef: {
    fontFamily: '"Geist Mono", monospace',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'right',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  statCard: {
    background: 'var(--card)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    width: '48px', height: '48px',
    borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.4rem', flexShrink: 0,
  },
  statNum: { fontSize: '1.8rem', fontWeight: '600', color: 'var(--ink)', lineHeight: 1 },
  statLbl: { fontSize: '0.82rem', color: 'var(--ink-3)', marginTop: '4px' },
  card: {
    background: 'var(--card)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '22px',
    marginBottom: '16px',
  },
  cardTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '1.05rem',
    color: 'var(--ink)',
    margin: '0 0 1rem',
  },
  shortcutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '14px',
    marginBottom: '20px',
  },
  shortcut: {
    background: 'var(--card)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '18px 18px 20px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'inherit',
  },
  shortcutIcon: {
    width: '36px', height: '36px',
    borderRadius: '10px',
    background: 'var(--surface)',
    display: 'grid', placeItems: 'center',
    color: 'var(--accent)',
    marginBottom: '14px',
  },
  shortcutLabel: {
    display: 'block',
    fontFamily: "'Fraunces', serif",
    fontWeight: '500',
    fontSize: '16px',
    marginBottom: '2px',
    color: 'var(--ink)',
  },
  shortcutSub: { color: 'var(--ink-3)', fontSize: '12px' },
  rdvRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 0',
    borderBottom: '1px dashed var(--line)',
  },
  btnSmall: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}

export default SecretaireDashboard
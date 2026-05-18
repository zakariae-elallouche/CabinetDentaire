import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { useIsMobile } from '../../hooks/useIsMobile'
import api from '../../api'

const MONTHS_FR = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]
const parseLocalDate = (str) => { const [y,m,d] = str.split('-'); return new Date(+y, +m-1, +d) }
const fmtDate = (iso) => { const d = parseLocalDate(iso); return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}` }
const fmtTime = (iso) => { const d = new Date(iso); return `${String(d.getHours()).padStart(2,'0')}h${String(d.getMinutes()).padStart(2,'0')}` }

const IcoPlus     = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
const IcoCal      = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
const IcoList     = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>
const IcoPill     = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-30 12 12)"/><path d="M8.5 6.5l7 7"/></svg>
const IcoReceipt  = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>
const IcoBell     = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>
const IcoSparkle  = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>
const IcoChevronR = () => <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>

const STATUS_MAP = {
  confirmed:  { label: 'Confirmé',   bg: 'var(--accent-soft)',  color: 'var(--accent)' },
  pending:    { label: 'En attente', bg: 'var(--amber-soft)',   color: 'var(--gold)' },
  completed:  { label: 'Complété',   bg: 'var(--success-soft)', color: 'var(--success)' },
  cancelled:  { label: 'Annulé',     bg: 'var(--rose-soft)',    color: 'var(--rose)' },
  CONFIRMÉ:   { label: 'Confirmé',   bg: 'var(--accent-soft)',  color: 'var(--accent)' },
  EN_ATTENTE: { label: 'En attente', bg: 'var(--amber-soft)',   color: 'var(--gold)' },
  COMPLÉTÉ:   { label: 'Complété',   bg: 'var(--info-soft)',    color: 'var(--info)' },
  ANNULÉ:     { label: 'Annulé',     bg: 'var(--rose-soft)',    color: 'var(--rose)' },
}

const STATUS_ICONS = {
  EN_ATTENTE: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  EN_ATTENTE2: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  pending:    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  CONFIRMÉ:   <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="9 12 11 14 15 10"/></svg>,
  confirmed:  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="9 12 11 14 15 10"/></svg>,
  COMPLÉTÉ:   <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 9 17 20 7"/></svg>,
  completed:  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 9 17 20 7"/></svg>,
  ANNULÉ:     <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/></svg>,
  cancelled:  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/></svg>,
}

function Chip({ status, isMobile }) {
  const s = STATUS_MAP[status] || { label: status, bg: 'var(--surface)', color: 'var(--ink-3)' }
  const icon = STATUS_ICONS[status]
  if (isMobile && icon) {
    return (
      <span title={s.label} style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: '50%',
        background: s.bg, color: s.color, flexShrink: 0,
      }}>
        {icon}
      </span>
    )
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 999,
      fontSize: 11.5, fontWeight: 500, letterSpacing: '0.02em',
      background: s.bg, color: s.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
      {s.label}
    </span>
  )
}

function PatientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [nextRdv, setNextRdv]   = useState(null)
  const [stats, setStats]       = useState({ rdvAVenir: 0, factures: 0, ordonnances: 0, visites: 0 })
  const [recentRdv, setRecentRdv] = useState([])
  const [loading, setLoading]   = useState(true)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  })()

  const firstName = user?.prenom || user?.nom || 'Patient'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rdvRes = await api.get('/rendez-vous')
        const rdvs = rdvRes.data || []

        const now = new Date()
        const todayStr = now.toISOString().slice(0, 10)
        const nowTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
        const upcoming = rdvs
          .filter(r => {
            if (r.statut !== 'CONFIRMÉ' && r.statut !== 'EN_ATTENTE') return false
            if (r.date > todayStr) return true
            if (r.date === todayStr) return (r.heure || '99:99') >= nowTime
            return false
          })
          .sort((a, b) => ((a.date || '') + (a.heure || '')).localeCompare((b.date || '') + (b.heure || '')))
        const confirmed = rdvs.filter(r => r.statut === 'CONFIRMÉ')

        setNextRdv(upcoming[0] || null)
        setRecentRdv(rdvs.slice(0, 3))
        setStats(prev => ({ ...prev, rdvAVenir: confirmed.length }))
      } catch (e) {
        // silent — API may not be wired yet
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const quickActions = [
    { ico: IcoSparkle, label: 'Réserver',        sub: 'Nouveau rendez-vous',   path: '/patient/reserver' },
    { ico: IcoCal,     label: 'Mes RDV',          sub: 'Voir tous',             path: '/patient/rendez-vous' },
    { ico: IcoPill,    label: 'Ordonnances',      sub: 'Mes prescriptions',     path: '/patient/ordonnances' },
    { ico: IcoReceipt, label: 'Factures',         sub: 'Historique & paiements',path: '/patient/factures' },
  ]

  return (
    <Layout>

      {/* ── Title ── */}
      <h1 style={s.title}>
        {greeting}, <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{firstName}</em>.
      </h1>
      <p style={s.subtitle}>
        Bienvenue dans votre espace patient. Retrouvez vos rendez-vous, ordonnances et factures en un seul endroit.
      </p>

      {/* ── Hero + actions ── */}
      <div style={{ ...s.dashHero, gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr' }}>

        {/* Hero card — next appointment */}
        <div style={s.heroCard}>
          <div style={s.heroEyebrow}>Prochain rendez-vous</div>
          {loading ? (
            <div style={{ opacity: 0.7, fontSize: 14 }}>Chargement…</div>
          ) : nextRdv ? (
            <>
              <div style={s.heroDate}>
                {parseLocalDate(nextRdv.date).getDate()}{' '}
                <em style={{ fontStyle: 'italic', fontWeight: 400 }}>
                  {MONTHS_FR[parseLocalDate(nextRdv.date).getMonth()]}
                </em>
              </div>
              <div style={s.heroSub}>
                {nextRdv.heure ? nextRdv.heure.slice(0, 5) : '—'} · {nextRdv.duration || 30} min
              </div>
              <div style={s.heroInfo}>
                <div>
                  <small style={s.heroSmall}>Motif</small>
                  <b style={s.heroBig}>{nextRdv.notes || 'Consultation'}</b>
                </div>
                <div>
                  <small style={s.heroSmall}>Statut</small>
                  <b style={s.heroBig}>{STATUS_MAP[nextRdv.statut]?.label || nextRdv.statut}</b>
                </div>
                <div>
                  <small style={s.heroSmall}>Référence</small>
                  <b style={{ ...s.heroBig, fontFamily: '"Geist Mono", monospace' }}>
                    #{String(nextRdv.id).padStart(4, '0')}
                  </b>
                </div>
              </div>
            </>
          ) : (
            <div style={{ paddingTop: 12 }}>
              <div style={{ opacity: 0.85, fontSize: 14, marginBottom: 16 }}>
                Aucun rendez-vous à venir.
              </div>
              <button
                style={{ ...s.btnHero }}
                onClick={() => navigate('/patient/reserver')}
              >
                <IcoPlus /> Réserver maintenant
              </button>
            </div>
          )}
        </div>

        {/* Tasks / alerts card */}
        <div style={s.tasksCard}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>Actions</span>
            <span style={s.cardSub}>{stats.rdvAVenir} à venir</span>
          </div>

          <div style={s.task}>
            <div style={{ ...s.taskIco, background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              <IcoCal />
            </div>
            <div style={{ flex: 1 }}>
              <b style={s.taskTitle}>Rendez-vous</b>
              <small style={s.taskSub}>{stats.rdvAVenir} confirmé(s)</small>
            </div>
            <button style={s.taskCta} onClick={() => navigate('/patient/rendez-vous')}>
              Voir <IcoChevronR />
            </button>
          </div>

          <div style={s.task}>
            <div style={{ ...s.taskIco, background: 'var(--amber-soft)', color: 'var(--gold)' }}>
              <IcoReceipt />
            </div>
            <div style={{ flex: 1 }}>
              <b style={s.taskTitle}>Factures</b>
              <small style={s.taskSub}>Historique complet</small>
            </div>
            <button style={s.taskCta} onClick={() => navigate('/patient/factures')}>
              Voir <IcoChevronR />
            </button>
          </div>

          <div style={{ ...s.task, borderBottom: 'none' }}>
            <div style={{ ...s.taskIco, background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              <IcoPill />
            </div>
            <div style={{ flex: 1 }}>
              <b style={s.taskTitle}>Ordonnances</b>
              <small style={s.taskSub}>Mes prescriptions</small>
            </div>
            <button style={s.taskCta} onClick={() => navigate('/patient/ordonnances')}>
              Voir <IcoChevronR />
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick actions grid ── */}
      <div style={{ ...s.quickGrid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)' }}>
        {quickActions.map(a => {
          const Ico = a.ico
          return (
            <button key={a.path} style={s.quick} onClick={() => navigate(a.path)}>
              <div style={s.quickIco}><Ico /></div>
              <b style={s.quickLabel}>{a.label}</b>
              <small style={s.quickSub}>{a.sub}</small>
            </button>
          )
        })}
      </div>

      {/* ── Recent appointments ── */}
      {recentRdv.length > 0 && (
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>Rendez-vous récents</span>
            <button style={s.linkBtn} onClick={() => navigate('/patient/rendez-vous')}>
              Voir tout <IcoChevronR />
            </button>
          </div>
          {recentRdv.map((rdv, i) => (
            <div key={rdv.id} style={{
              ...s.apptRow,
              borderBottom: i < recentRdv.length - 1 ? '1px solid var(--line)' : 'none',
            }}>
              <div style={s.apptTime}>
                <div style={s.apptHour}>{rdv.heure ? rdv.heure.slice(0, 5) : '—'}</div>
                <div style={s.apptDate}>{fmtDate(rdv.date)}</div>
              </div>
              <div style={s.apptBody}>
                <b style={{ fontSize: 14, fontFamily: '"Fraunces", serif', fontWeight: 500 }}>
                  {rdv.notes || 'Consultation'}
                </b>
                <small style={{ color: 'var(--ink-3)', fontSize: 12.5, display: 'block', marginTop: 2 }}>
                  {rdv.duration || 30} min
                </small>
              </div>
              <Chip status={rdv.statut} isMobile={isMobile} />
            </div>
          ))}
        </div>
      )}

    </Layout>
  )
}

const s = {
  title: {
    fontFamily: '"Fraunces", serif',
    fontWeight: 400, fontSize: 40,
    letterSpacing: '-0.02em',
    margin: '0 0 6px', lineHeight: 1.1,
    color: 'var(--ink)',
  },
  subtitle: {
    color: 'var(--ink-2)', fontSize: 14.5,
    margin: '0 0 28px', maxWidth: '64ch',
  },
  dashHero: {
    display: 'grid', gridTemplateColumns: '1.4fr 1fr',
    gap: 20, marginBottom: 22,
  },
  heroCard: {
    background: 'linear-gradient(155deg, #0f4842 0%, #1d6e66 100%)',
    color: '#fff', borderRadius: 'var(--radius)',
    padding: '28px 30px', position: 'relative', overflow: 'hidden',
  },
  heroEyebrow: {
    fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
    opacity: 0.7, marginBottom: 10,
  },
  heroDate: {
    fontFamily: '"Fraunces", serif', fontWeight: 300,
    fontSize: 52, letterSpacing: '-0.03em',
    lineHeight: 1, marginBottom: 4,
  },
  heroSub: { fontSize: 14, opacity: 0.85, marginBottom: 22 },
  heroInfo: {
    display: 'flex', gap: 22,
    borderTop: '1px solid #ffffff22', paddingTop: 18,
  },
  heroSmall: {
    fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase',
    opacity: 0.6, display: 'block', marginBottom: 4,
  },
  heroBig: { fontSize: 14.5, fontWeight: 500 },
  btnHero: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '9px 16px', borderRadius: 10, fontSize: 13.5, fontWeight: 500,
    background: '#ffffff22', color: '#fff', border: 'none', cursor: 'pointer',
  },
  tasksCard: {
    background: 'var(--card)', border: '1px solid var(--line)',
    borderRadius: 'var(--radius)', padding: 22,
    display: 'flex', flexDirection: 'column',
  },
  cardHead: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  cardTitle: {
    fontFamily: '"Fraunces", serif', fontWeight: 500,
    fontSize: 17, letterSpacing: '-0.01em', color: 'var(--ink)',
  },
  cardSub: {
    color: 'var(--ink-3)', fontSize: 12,
    letterSpacing: '0.04em', textTransform: 'uppercase',
  },
  task: {
    display: 'flex', gap: 12, alignItems: 'center',
    padding: '12px 0', borderBottom: '1px dashed var(--line)',
  },
  taskIco: {
    width: 36, height: 36, borderRadius: 8,
    display: 'grid', placeItems: 'center', flexShrink: 0,
  },
  taskTitle: { fontSize: 13.5, fontWeight: 500, display: 'block', color: 'var(--ink)' },
  taskSub: { color: 'var(--ink-3)', fontSize: 12 },
  taskCta: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    color: 'var(--accent)', fontSize: 12.5, fontWeight: 500,
    background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
  },
  quickGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14, marginBottom: 22,
  },
  quick: {
    background: 'var(--card)', border: '1px solid var(--line)',
    borderRadius: 'var(--radius)', padding: '18px 18px 20px',
    textAlign: 'left', cursor: 'pointer',
    transition: 'all .15s', display: 'flex', flexDirection: 'column',
  },
  quickIco: {
    width: 36, height: 36, borderRadius: 10,
    background: 'var(--surface)', display: 'grid', placeItems: 'center',
    color: 'var(--accent)', marginBottom: 14,
  },
  quickLabel: {
    display: 'block', fontFamily: '"Fraunces", serif',
    fontWeight: 500, fontSize: 16, marginBottom: 2, color: 'var(--ink)',
  },
  quickSub: { color: 'var(--ink-3)', fontSize: 12 },
  card: {
    background: 'var(--card)', border: '1px solid var(--line)',
    borderRadius: 'var(--radius)', padding: 22, marginBottom: 20,
  },
  linkBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--accent)', fontSize: 12.5, fontWeight: 500,
  },
  apptRow: {
    display: 'grid', gridTemplateColumns: '120px 1fr auto',
    gap: 20, padding: '16px 0', alignItems: 'center',
  },
  apptTime: { paddingRight: 18, borderRight: '1px solid var(--line)' },
  apptHour: {
    fontFamily: '"Geist Mono", monospace',
    fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--ink)',
  },
  apptDate: { fontSize: 11, color: 'var(--ink-3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' },
  apptBody: {},
}

export default PatientDashboard

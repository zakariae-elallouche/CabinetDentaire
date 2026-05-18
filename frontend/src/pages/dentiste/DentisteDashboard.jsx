import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { useIsMobile } from '../../hooks/useIsMobile'
import api from '../../api'

const IcoCal      = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
const IcoCheck    = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IcoClock    = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
const IcoEdit     = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IcoPill     = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-30 12 12)"/><path d="M8.5 6.5l7 7"/></svg>
const IcoUsers    = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3a3 3 0 0 1 0 6M21 21v-2a4 4 0 0 0-3-3.87"/></svg>
const IcoChevronR = () => <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>

const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']

function DentisteDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [rdvAujourdhui, setRdvAujourdhui] = useState([])
  const [stats, setStats] = useState({ total: 0, completes: 0, aVenir: 0 })
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const todayLabel = `${today.getDate()} ${MONTHS_FR[today.getMonth()]} ${today.getFullYear()}`
  const greeting = today.getHours() < 12 ? 'Bonjour' : today.getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'
  const firstName = user?.prenom || user?.nom || 'Docteur'

  useEffect(() => {
    api.get('/dentiste/schedule')
      .then(res => {
        const rdvs = res.data
        setRdvAujourdhui(rdvs)
        setStats({
          total:     rdvs.length,
          completes: rdvs.filter(r => r.statut === 'COMPLÉTÉ').length,
          aVenir:    rdvs.filter(r => r.statut === 'CONFIRMÉ').length,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const patientName = (rdv) =>
    rdv.patient ? `${rdv.patient.prenom || ''} ${rdv.patient.nom || ''}`.trim() : rdv.patient?.nom_complet || '—'

  const chipColor = (statut) => {
    if (statut === 'COMPLÉTÉ') return 'rgba(147,197,253,0.9)'
    if (statut === 'CONFIRMÉ') return 'rgba(125,211,200,0.9)'
    return 'rgba(255,255,255,0.55)'
  }

  const SHORTCUTS = [
    { Ico: IcoEdit,  label: 'Enregistrer visite',   sub: 'Nouvelle consultation',  path: '/dentiste/visite/nouvelle',   icoStyle: { background: 'var(--accent-soft)', color: 'var(--accent)' } },
    { Ico: IcoUsers, label: 'Patients',               sub: 'Historique & dossiers',  path: '/dentiste/patients',           icoStyle: { background: 'var(--success-soft)',color: 'var(--success)' } },
  ]

  return (
    <Layout>
      <div>

        {/* Header */}
        <h1 style={s.pageTitle}>
          {greeting}, <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Dr. {firstName}</em>.
        </h1>
        <p style={{ ...s.pageSub, marginBottom: '28px' }}>{todayLabel}</p>

        {/* Hero */}
        <div>

          {/* Dark hero — agenda du jour */}
          <div style={{ ...s.heroCard, marginBottom: '22px' }}>
            <div style={s.heroEyebrow}>AGENDA DU JOUR</div>

            {loading ? (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Chargement...</p>
            ) : rdvAujourdhui.length === 0 ? (
              <>
                <div style={s.heroEmpty}>Aucun rendez-vous aujourd'hui</div>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: 0 }}>
                  Profitez de cette journée pour mettre à jour les dossiers patients.
                </p>
              </>
            ) : (
              <>
                <div style={s.heroBig}>
                  {rdvAujourdhui.length}
                  <span style={{ fontStyle: 'italic', fontWeight: 300, fontSize: '32px', marginLeft: '12px' }}>
                    {rdvAujourdhui.length === 1 ? 'patient' : 'patients'}
                  </span>
                </div>
                <div style={s.heroLine} />
                <div>
                  {rdvAujourdhui.slice(0, 5).map((rdv, i, arr) => (
                    isMobile ? (
                      <div key={rdv.id} style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none', padding: '10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={s.heroTime}>{rdv.heure?.slice(0, 5)?.replace(':', 'h')}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ ...s.heroPatient, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patientName(rdv)}</span>
                          <span style={{ ...s.heroStatut, color: chipColor(rdv.statut), fontSize: '11px' }}>
                            {rdv.statut === 'CONFIRMÉ' ? 'Confirmé' : rdv.statut === 'COMPLÉTÉ' ? 'Complété' : rdv.statut}
                          </span>
                        </div>
                        <button style={s.heroBtnVisite} onClick={() => navigate(`/dentiste/visite/${rdv.id}`)}>
                          →
                        </button>
                      </div>
                    ) : (
                      <div key={rdv.id} style={{ ...s.heroRow, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                        <span style={s.heroTime}>{rdv.heure?.slice(0, 5)?.replace(':', 'h')}</span>
                        <span style={s.heroPatient}>{patientName(rdv)}</span>
                        <span style={{ ...s.heroStatut, color: chipColor(rdv.statut) }}>
                          {rdv.statut === 'CONFIRMÉ' ? 'Confirmé' : rdv.statut === 'COMPLÉTÉ' ? 'Complété' : rdv.statut}
                        </span>
                        <button style={s.heroBtnVisite} onClick={() => navigate(`/dentiste/visite/${rdv.id}`)}>
                          Enregistrer →
                        </button>
                      </div>
                    )
                  ))}
                </div>
                {rdvAujourdhui.length > 5 && (
                  <div
                    style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '10px', cursor: 'pointer' }}
                    onClick={() => navigate('/dentiste/agenda')}
                  >
                    +{rdvAujourdhui.length - 5} autre{rdvAujourdhui.length - 5 > 1 ? 's' : ''} → Voir tout
                  </div>
                )}
              </>
            )}
          </div>

        </div>

        {/* Stats */}
        <div style={{ ...s.statsGrid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: isMobile ? '10px' : '16px' }}>
          {[
            { Ico: IcoCal,   label: "RDV aujourd'hui", value: stats.total,     bg: 'var(--accent-soft)',  color: 'var(--accent)' },
            { Ico: IcoCheck, label: 'Visites complétées', value: stats.completes, bg: 'var(--success-soft)', color: 'var(--success)' },
            { Ico: IcoClock, label: 'À venir',            value: stats.aVenir,    bg: 'var(--amber-soft)',   color: 'var(--gold)' },
          ].map(({ Ico, label, value, bg, color }) => (
            <div key={label} style={{ ...s.statCard, padding: isMobile ? '14px' : '20px', gap: isMobile ? '10px' : '16px' }}>
              <div style={{ ...s.statIcon, width: isMobile ? '36px' : '48px', height: isMobile ? '36px' : '48px', background: bg, color }}><Ico /></div>
              <div>
                <div style={{ ...s.statNum, fontSize: isMobile ? '1.4rem' : '1.8rem' }}>{value}</div>
                <div style={s.statLbl}>{label}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  )
}

const s = {
  pageTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: '400', fontSize: '40px',
    letterSpacing: '-0.02em', color: 'var(--ink)',
    margin: '0 0 6px', lineHeight: 1.1,
  },
  pageSub: { color: 'var(--ink-3)', fontSize: '14px', margin: 0, textTransform: 'capitalize' },
  dashHero: {
    display: 'grid', gridTemplateColumns: '1.4fr 1fr',
    gap: '20px', marginBottom: '22px',
  },
  heroCard: {
    background: 'linear-gradient(155deg, #0f4842 0%, #1d6e66 100%)',
    borderRadius: 'var(--radius)', padding: '28px 32px', color: 'white',
  },
  heroEyebrow: {
    fontSize: '10.5px', letterSpacing: '0.15em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)', marginBottom: '14px', fontWeight: '500',
  },
  heroBig: {
    fontFamily: "'Fraunces', serif", fontWeight: '300', fontSize: '52px',
    letterSpacing: '-0.02em', lineHeight: 1, color: 'white',
    marginBottom: '16px', display: 'flex', alignItems: 'baseline',
  },
  heroEmpty: {
    fontFamily: "'Fraunces', serif", fontWeight: '300', fontSize: '28px',
    color: 'rgba(255,255,255,0.85)', marginBottom: '8px', letterSpacing: '-0.01em',
  },
  heroLine: { height: '1px', background: 'rgba(255,255,255,0.15)', marginBottom: '14px' },
  heroRow: {
    display: 'grid', gridTemplateColumns: '60px 1fr 90px auto',
    gap: '14px', alignItems: 'center', padding: '10px 0',
  },
  heroTime: { fontFamily: '"Geist Mono", monospace', fontSize: '13px', color: 'rgba(255,255,255,0.7)' },
  heroPatient: { fontSize: '14px', fontWeight: '500', color: 'white' },
  heroStatut: { fontSize: '12px', fontWeight: '500' },
  heroBtnVisite: {
    padding: '6px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600',
    background: 'white', border: 'none',
    color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit',
    whiteSpace: 'nowrap', letterSpacing: '0.01em',
    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
  },
  actionsCard: {
    background: 'var(--card)', border: '1px solid var(--line)',
    borderRadius: 'var(--radius)', padding: '22px', display: 'flex', flexDirection: 'column',
  },
  cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  cardTitle: { fontFamily: "'Fraunces', serif", fontWeight: '500', fontSize: '17px', letterSpacing: '-0.01em', color: 'var(--ink)' },
  cardSub: { color: 'var(--ink-3)', fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase' },
  task: { display: 'flex', gap: '12px', alignItems: 'center', padding: '11px 0' },
  taskIco: { width: '36px', height: '36px', borderRadius: '8px', display: 'grid', placeItems: 'center', flexShrink: 0 },
  taskTitle: { fontSize: '13.5px', fontWeight: '500', display: 'block', color: 'var(--ink)' },
  taskSub: { color: 'var(--ink-3)', fontSize: '12px' },
  taskCta: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    color: 'var(--accent)', fontSize: '12.5px', fontWeight: '500',
    background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px', marginBottom: '20px',
  },
  statCard: {
    background: 'var(--card)', border: '1px solid var(--line)',
    borderRadius: 'var(--radius)', padding: '20px',
    display: 'flex', alignItems: 'center', gap: '16px',
  },
  statIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'grid', placeItems: 'center', flexShrink: 0 },
  statNum: { fontSize: '1.8rem', fontWeight: '600', color: 'var(--ink)', lineHeight: 1 },
  statLbl: { fontSize: '12px', color: 'var(--ink-3)', marginTop: '4px' },
}

export default DentisteDashboard

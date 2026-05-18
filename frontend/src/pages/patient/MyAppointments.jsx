import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import { confirmDialog } from '../../components/DialogProvider'
import EmptyState from '../../components/EmptyState'
import { useIsMobile } from '../../hooks/useIsMobile'
import api from '../../api'

const StatusIcon = ({ statut, size = 14 }) => {
  const icons = {
    EN_ATTENTE: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
    CONFIRMÉ:   <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="9 12 11 14 15 10"/></svg>,
    COMPLÉTÉ:   <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 9 17 20 7"/></svg>,
    ANNULÉ:     <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/></svg>,
  }
  return icons[statut] || icons.EN_ATTENTE
}

const FILTERS = [
  { key: '', label: 'Tous' },
  { key: 'EN_ATTENTE', label: 'En attente' },
  { key: 'CONFIRMÉ', label: 'Confirmés' },
  { key: 'COMPLÉTÉ', label: 'Complétés' },
  { key: 'ANNULÉ', label: 'Annulés' },
]

function MyAppointments() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const openDetail = async (id) => {
    setDetailLoading(true)
    setDetail({ id })
    try {
      const res = await api.get(`/rendez-vous/${id}`)
      setDetail(res.data)
    } catch {
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/rendez-vous')
        setAppointments(res.data)
      } catch (err) {
        console.error('Erreur chargement RDV')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleCancel = async (id) => {
    if (!await confirmDialog('Annuler ce rendez-vous ?', { danger: true, confirmLabel: 'Oui, annuler' })) return
    try {
      await api.delete(`/rendez-vous/${id}`)
      setAppointments(appointments.map(r =>
        r.id === id ? { ...r, statut: 'ANNULÉ' } : r
      ))
      toast.success('Rendez-vous annulé')
    } catch {
      toast.error("Erreur lors de l'annulation")
    }
  }

  const filtered = (filter
    ? appointments.filter(r => r.statut === filter)
    : appointments
  ).slice().sort((a, b) => ((a.date || '') + (a.heure || '')).localeCompare((b.date || '') + (b.heure || '')))

  const countBy = (key) => appointments.filter(r => r.statut === key).length

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const [y, m, day] = dateStr.split('-')
    const d = new Date(+y, +m - 1, +day)
    const days = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM']
    const months = ['JANV', 'FÉVR', 'MARS', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC']
    return `${days[d.getDay()]}. ${d.getDate()} ${months[d.getMonth()]}`
  }

  const chipStyle = (statut) => {
    const map = {
      'EN_ATTENTE': { background: 'var(--amber-soft)', color: '#8d6a2b', dot: 'var(--gold)' },
      'CONFIRMÉ':   { background: 'var(--accent-soft)', color: 'var(--accent)', dot: 'var(--accent)' },
      'COMPLÉTÉ':   { background: 'var(--info-soft)',    color: 'var(--info)',    dot: 'var(--info)' },
      'ANNULÉ':     { background: 'var(--rose-soft)', color: 'var(--rose)', dot: 'var(--rose)' },
    }
    return map[statut] || map['EN_ATTENTE']
  }

  return (
    <Layout>
      <div>

        {/* ─── Header ─── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={styles.pageTitle}>
              Mes <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>rendez-vous</em>
            </h1>
            <p style={styles.pageSub}>
              Retrouvez toutes vos réservations — en attente, confirmées, passées.
            </p>
          </div>
          <button
            style={styles.btnPrimary}
            onClick={() => navigate('/patient/reserver')}
          >
            + Nouveau rendez-vous
          </button>
        </div>

        {/* ─── Filtres ─── */}
        <div style={styles.filterBar}>
          {FILTERS.map(f => {
            const count = f.key === '' ? appointments.length : countBy(f.key)
            const active = filter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  ...styles.filterPill,
                  ...(active ? styles.filterPillActive : {}),
                }}
              >
                {f.label}
                {count > 0 && (
                  <span style={{
                    ...styles.filterBadge,
                    background: active ? 'rgba(255,255,255,0.25)' : 'var(--surface)',
                    color: active ? '#fff' : 'var(--ink-3)',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ─── Liste RDV ─── */}
        {loading ? (
          <p style={{ color: 'var(--ink-3)', padding: '2rem 0' }}>Chargement...</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="Aucun rendez-vous" sub="Aucun rendez-vous ne correspond à vos critères." />
        ) : (
          filtered.map(rdv => {
            const chip = chipStyle(rdv.statut)
            return (
              <div key={rdv.id} style={{ ...styles.apptCard, gridTemplateColumns: isMobile ? 'auto 1fr' : 'auto auto 1fr auto', gap: isMobile ? '12px' : '20px', padding: isMobile ? '14px 16px' : '18px 22px' }}>

                {/* Heure + date */}
                <div style={styles.apptTime}>
                  <div style={styles.apptHour}>
                    {rdv.heure?.slice(0, 5)?.replace(':', 'h')}
                  </div>
                  <div style={styles.apptDate}>
                    {formatDate(rdv.date)}
                  </div>
                </div>

                {/* Séparateur */}
                {!isMobile && <div style={styles.apptDivider}/>}

                {/* Info + actions */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={styles.apptTitle}>{rdv.notes || 'Rendez-vous médical'}</b>
                  <small style={styles.apptMeta}>
                    avec Dr. {rdv.dentiste?.nom_complet || 'Médecin'} · {rdv.id ? `RDV-${String(rdv.id).padStart(4, '0')}` : ''}
                  </small>
                  {isMobile && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                      <span title={rdv.statut === 'EN_ATTENTE' ? 'En attente' : rdv.statut === 'CONFIRMÉ' ? 'Confirmé' : rdv.statut === 'COMPLÉTÉ' ? 'Complété' : 'Annulé'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '50%', background: chip.background, color: chip.color, flexShrink: 0 }}>
                        <StatusIcon statut={rdv.statut} size={15} />
                      </span>
                      <button style={styles.btnGhost} onClick={() => openDetail(rdv.id)}>Détails</button>
                      {rdv.statut === 'EN_ATTENTE' && <button style={styles.btnDanger} onClick={() => handleCancel(rdv.id)}>Annuler</button>}
                    </div>
                  )}
                </div>

                {/* Desktop actions */}
                {!isMobile && (
                  <div style={styles.apptActions}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '500', background: chip.background, color: chip.color }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: chip.dot }}/>
                      {rdv.statut === 'EN_ATTENTE' ? 'En attente' : rdv.statut === 'CONFIRMÉ' ? 'Confirmé' : rdv.statut === 'COMPLÉTÉ' ? 'Complété' : 'Annulé'}
                    </span>
                    <button style={styles.btnGhost} onClick={() => openDetail(rdv.id)}>Détails</button>
                    {rdv.statut === 'EN_ATTENTE' && <button style={styles.btnDanger} onClick={() => handleCancel(rdv.id)}>Annuler</button>}
                  </div>
                )}

              </div>
            )
          })
        )}
      </div>

      {/* ─── Overlay ─── */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: '#1a201f55',
          backdropFilter: 'blur(4px)',
          zIndex: 150,
          opacity: detail ? 1 : 0,
          pointerEvents: detail ? 'auto' : 'none',
          transition: 'opacity 0.2s',
        }}
        onClick={() => setDetail(null)}
      />

      {/* ─── Drawer ─── */}
      <div style={isMobile ? {
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '92dvh', background: 'var(--bg)', zIndex: 160,
        transform: detail ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(.3,.7,.2,1)',
        display: 'flex', flexDirection: 'column',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -20px 60px #1a201f22',
      } : {
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '480px', maxWidth: '94vw',
        background: 'var(--bg)', zIndex: 160,
        transform: detail ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(.3,.7,.2,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px #1a201f22',
      }}>
        {detail && (
          <>
            {/* Header */}
            <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: '400', fontSize: '22px', margin: 0, letterSpacing: '-0.01em', color: 'var(--ink)', flex: 1 }}>
                RDV-{String(detail.id).padStart(4, '0')}
              </h2>
              <button
                onClick={() => setDetail(null)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', border: '1px solid var(--line)', background: 'var(--card)', cursor: 'pointer', fontSize: '14px', color: 'var(--ink-2)' }}
              >✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 28px', overflow: 'auto', flex: 1 }}>
              {detailLoading ? (
                <p style={{ color: 'var(--ink-3)' }}>Chargement...</p>
              ) : (
                <>
                  {/* Statut chip */}
                  <div style={{ marginBottom: '20px' }}>
                    {(() => {
                      const c = chipStyle(detail.statut)
                      return (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '500', background: c.background, color: c.color }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: c.dot }}/>
                          {detail.statut === 'EN_ATTENTE' ? 'En attente' :
                           detail.statut === 'CONFIRMÉ'   ? 'Confirmé' :
                           detail.statut === 'COMPLÉTÉ'   ? 'Complété' : 'Annulé'}
                        </span>
                      )
                    })()}
                  </div>

                  {/* Rows */}
                  {[
                    { label: 'DATE',    value: formatDate(detail.date) },
                    { label: 'HEURE',   value: detail.heure?.slice(0, 5)?.replace(':', 'h') },
                    { label: 'DURÉE',   value: `${detail.duration} min` },
                    detail.raison && { label: 'RAISON',  value: detail.raison },
                    detail.notes  && { label: 'NOTES',   value: detail.notes },
                  ].filter(Boolean).map(row => (
                    <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '16px', padding: '10px 0', borderBottom: '1px dashed var(--line)' }}>
                      <label style={{ fontSize: '11.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{row.label}</label>
                      <span style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{row.value}</span>
                    </div>
                  ))}

                  {/* Patient info */}
                  {detail.patient && (
                    <>
                      <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: '500', fontSize: '15px', color: 'var(--accent)', paddingBottom: '6px', borderBottom: '1px solid var(--line)', margin: '22px 0 0' }}>
                        Patient
                      </h3>
                      {[
                        { label: 'NOM',       value: `${detail.patient.prenom} ${detail.patient.nom}` },
                        detail.patient.telephone && { label: 'TÉLÉPHONE', value: detail.patient.telephone },
                      ].filter(Boolean).map(row => (
                        <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '16px', padding: '10px 0', borderBottom: '1px dashed var(--line)' }}>
                          <label style={{ fontSize: '11.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{row.label}</label>
                          <span style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{row.value}</span>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {detail.statut === 'EN_ATTENTE' && (
              <div style={{ padding: '16px 28px', borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
                <button
                  style={{ width: '100%', padding: '10px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '500', background: 'transparent', border: '1px solid var(--rose-soft)', color: 'var(--rose)', cursor: 'pointer', fontFamily: 'inherit' }}
                  onClick={() => { handleCancel(detail.id); setDetail(null) }}
                >
                  Annuler ce rendez-vous
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </Layout>
  )
}

const styles = {
  pageTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: '400',
    fontSize: '36px',
    letterSpacing: '-0.02em',
    color: 'var(--ink)',
    margin: '0 0 6px',
    lineHeight: '1.1',
  },
  pageSub: {
    color: 'var(--ink-2)',
    fontSize: '14px',
    margin: 0,
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '10px',
    fontSize: '13.5px',
    fontWeight: '500',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  filterBar: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '22px',
  },
  filterPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '450',
    fontFamily: 'inherit',
    border: '1px solid var(--line)',
    background: 'var(--card)',
    color: 'var(--ink-2)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  filterPillActive: {
    background: 'var(--accent)',
    borderColor: 'var(--accent)',
    color: '#fff',
    fontWeight: '500',
  },
  filterBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '18px',
    height: '18px',
    padding: '0 5px',
    borderRadius: '999px',
    fontSize: '11px',
    fontFamily: '"Geist Mono", monospace',
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    padding: '4rem',
    color: 'var(--ink-3)',
  },
  apptCard: {
    display: 'grid',
    gridTemplateColumns: 'auto auto 1fr auto',
    gap: '20px',
    padding: '18px 22px',
    background: 'var(--card)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    marginBottom: '10px',
    alignItems: 'center',
    transition: 'border-color 0.15s',
  },
  apptTime: {
    textAlign: 'center',
    minWidth: '80px',
  },
  apptHour: {
    fontFamily: '"Geist Mono", monospace',
    fontSize: '20px',
    fontWeight: '500',
    letterSpacing: '-0.02em',
    color: 'var(--ink)',
  },
  apptDate: {
    fontSize: '11px',
    color: 'var(--ink-3)',
    marginTop: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  apptDivider: {
    width: '1px',
    height: '40px',
    background: 'var(--line)',
  },
  apptTitle: {
    fontSize: '14.5px',
    fontWeight: '500',
    fontFamily: "'Fraunces', serif",
    display: 'block',
    marginBottom: '3px',
    color: 'var(--ink)',
  },
  apptMeta: {
    color: 'var(--ink-3)',
    fontSize: '12.5px',
  },
  apptActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 11px',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: '500',
    background: 'transparent',
    border: '1px solid var(--line-strong)',
    color: 'var(--ink)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 11px',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: '500',
    background: 'transparent',
    border: '1px solid var(--rose-soft)',
    color: 'var(--rose)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}

export default MyAppointments
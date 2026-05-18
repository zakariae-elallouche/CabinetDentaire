import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import api from '../../api'
import { useIsMobile } from '../../hooks/useIsMobile'

const FILTERS = [
  { key: '', label: 'Tous' },
  { key: 'EN_ATTENTE', label: 'En attente' },
  { key: 'CONFIRMÉ',   label: 'Confirmés' },
  { key: 'COMPLÉTÉ',   label: 'Complétés' },
  { key: 'ANNULÉ',     label: 'Annulés' },
]

const MONTHS = ['JANV','FÉVR','MARS','AVR','MAI','JUIN','JUIL','AOÛT','SEPT','OCT','NOV','DÉC']
const DAYS   = ['DIM','LUN','MAR','MER','JEU','VEN','SAM']

const IcoCheck = () => <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IcoX     = () => <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IcoSearch= () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>

const StatIcon = ({ statut, size = 14 }) => {
  const icons = {
    EN_ATTENTE: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
    CONFIRMÉ:   <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="9 12 11 14 15 10"/></svg>,
    COMPLÉTÉ:   <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 9 17 20 7"/></svg>,
    ANNULÉ:     <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/></svg>,
  }
  return icons[statut] || icons.EN_ATTENTE
}

function ManageAppointments() {
  const isMobile = useIsMobile()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('')
  const [search, setSearch]             = useState('')
  const [rejectModal, setRejectModal]   = useState(null)
  const [raison, setRaison]             = useState('')

  useEffect(() => { fetchAppointments() }, [])

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/rendez-vous')
      setAppointments(res.data)
    } catch { console.error('Erreur chargement RDV') }
    finally { setLoading(false) }
  }

  const pName = (rdv) => `${rdv.patient?.prenom || ''} ${rdv.patient?.nom || ''}`.trim() || '—'

  const filtered = appointments.filter(r => {
    const matchFilter = !filter || r.statut === filter
    const matchSearch = !search || pName(r).toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const countBy = (key) => appointments.filter(r => r.statut === key).length

  const handleConfirm = async (id) => {
    try {
      const res = await api.put(`/rendez-vous/${id}/confirm`)
      setAppointments(prev => prev.map(r => r.id === id ? res.data : r))
      toast.success('Rendez-vous confirmé')
    } catch { toast.error('Erreur lors de la confirmation') }
  }

  const handleReject = async () => {
    if (!raison) { toast.warning('Entrez une raison'); return }
    try {
      const res = await api.put(`/rendez-vous/${rejectModal}/reject`, { raison })
      setAppointments(prev => prev.map(r => r.id === rejectModal ? res.data : r))
      setRejectModal(null)
      setRaison('')
      toast.success('Rendez-vous rejeté')
    } catch { toast.error('Erreur lors du rejet') }
  }

  const chipStyle = (statut) => ({
    'EN_ATTENTE': { bg: 'var(--amber-soft)',   color: '#8d6a2b' },
    'CONFIRMÉ':   { bg: 'var(--accent-soft)',  color: 'var(--accent)' },
    'COMPLÉTÉ':   { bg: 'var(--info-soft)',    color: 'var(--info)' },
    'ANNULÉ':     { bg: 'var(--rose-soft)',    color: 'var(--rose)' },
  })[statut] || { bg: 'var(--surface)', color: 'var(--ink-3)' }

  const statutLabel = (s) => ({ EN_ATTENTE: 'En attente', CONFIRMÉ: 'Confirmé', COMPLÉTÉ: 'Complété', ANNULÉ: 'Annulé' })[s] || s

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const [y, m, d] = dateStr.split('-')
    const dt = new Date(+y, +m - 1, +d)
    return `${DAYS[dt.getDay()]}. ${+d} ${MONTHS[+m - 1]}`
  }

  return (
    <Layout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={s.pageTitle}>
            Gestion des <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>rendez-vous</em>
          </h1>
          <p style={s.pageSub}>Confirmez ou rejetez les demandes de rendez-vous</p>
        </div>

        {/* Filter + Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {FILTERS.map(f => {
              const count = f.key === '' ? appointments.length : countBy(f.key)
              const active = filter === f.key
              return (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{ ...s.filterPill, ...(active ? s.filterPillActive : {}) }}>
                  {f.label}
                  {count > 0 && (
                    <span style={{ ...s.filterBadge, background: active ? 'rgba(255,255,255,0.25)' : 'var(--surface)', color: active ? '#fff' : 'var(--ink-3)' }}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <div style={s.searchWrap}>
            <IcoSearch />
            <input
              style={s.searchInput}
              placeholder="Rechercher un patient..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch('')} style={s.clearBtn}>✕</button>}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <p style={{ color: 'var(--ink-3)', padding: '2rem 0' }}>Chargement...</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="Aucun rendez-vous" sub="Essayez un autre filtre." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(rdv => {
              const chip = chipStyle(rdv.statut)
              return (
                <div key={rdv.id} style={{ ...s.itemCard, gridTemplateColumns: isMobile ? 'auto auto 1fr' : 'auto auto 1fr auto' }}>
                  <div style={s.timeBlock}>
                    <span style={s.timeHour}>{rdv.heure?.slice(0,5)?.replace(':','h')}</span>
                    <span style={s.timeDate}>{formatDate(rdv.date)}</span>
                  </div>
                  <div style={s.divider} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={s.patientName}>{pName(rdv)}</b>
                    <span style={s.patientMeta}>
                      {rdv.patient?.telephone && `${rdv.patient.telephone} · `}
                      RDV-{String(rdv.id).padStart(4, '0')}
                    </span>
                    {rdv.notes && <p style={s.notes}>{rdv.notes}</p>}
                    {isMobile && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span title={statutLabel(rdv.statut)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: chip.bg, color: chip.color, flexShrink: 0 }}>
                          <StatIcon statut={rdv.statut} />
                        </span>
                        {rdv.statut === 'EN_ATTENTE' && <>
                          <button style={s.btnConfirm} onClick={() => handleConfirm(rdv.id)}><IcoCheck /> Confirmer</button>
                          <button style={s.btnReject} onClick={() => setRejectModal(rdv.id)}><IcoX /> Rejeter</button>
                        </>}
                      </div>
                    )}
                  </div>
                  {!isMobile && (
                    <div style={s.actions}>
                      <span style={{ ...s.chip, background: chip.bg, color: chip.color }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: chip.color, display: 'inline-block' }} />
                        {statutLabel(rdv.statut)}
                      </span>
                      {rdv.statut === 'EN_ATTENTE' && <>
                        <button style={s.btnConfirm} onClick={() => handleConfirm(rdv.id)}><IcoCheck /> Confirmer</button>
                        <button style={s.btnReject} onClick={() => setRejectModal(rdv.id)}><IcoX /> Rejeter</button>
                      </>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Overlay */}
      <div style={{ position: 'fixed', inset: 0, background: '#1a201f55', backdropFilter: 'blur(4px)', zIndex: 50, opacity: rejectModal ? 1 : 0, pointerEvents: rejectModal ? 'auto' : 'none', transition: 'opacity 0.2s' }}
        onClick={() => { setRejectModal(null); setRaison('') }}
      />

      {/* Modal rejet */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: rejectModal ? 'translate(-50%,-50%) scale(1)' : 'translate(-50%,-50%) scale(0.97)', opacity: rejectModal ? 1 : 0, pointerEvents: rejectModal ? 'auto' : 'none', transition: 'all 0.2s cubic-bezier(.3,.7,.2,1)', zIndex: 51, width: '100%', maxWidth: '460px', padding: '0 16px', boxSizing: 'border-box' }}>
        <div style={s.modal}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={s.modalTitle}>Raison du rejet</h2>
            <button onClick={() => { setRejectModal(null); setRaison('') }} style={s.btnClose}>✕</button>
          </div>
          <textarea
            style={s.textarea}
            rows={4}
            placeholder="Expliquer la raison du rejet..."
            value={raison}
            onChange={e => setRaison(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button style={s.btnOutline} onClick={() => { setRejectModal(null); setRaison('') }}>Annuler</button>
            <button style={s.btnDanger} onClick={handleReject}>
              <IcoX /> Confirmer le rejet
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

const s = {
  pageTitle: { fontFamily: "'Fraunces', serif", fontWeight: '400', fontSize: '32px', letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 6px', lineHeight: 1.1 },
  pageSub:   { color: 'var(--ink-2)', fontSize: '14px', margin: 0 },
  filterPill: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '450', fontFamily: 'inherit', border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink-2)', cursor: 'pointer', whiteSpace: 'nowrap' },
  filterPillActive: { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff', fontWeight: '500' },
  filterBadge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px', padding: '0 5px', borderRadius: '999px', fontSize: '11px', fontFamily: '"Geist Mono", monospace', fontWeight: '500' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '999px', border: '1px solid var(--line)', background: 'var(--card)', flex: 1, maxWidth: '280px', color: 'var(--ink-3)' },
  searchInput: { border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'var(--ink)', fontFamily: 'inherit', flex: 1, minWidth: 0 },
  clearBtn: { background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', padding: 0, fontSize: '13px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', textAlign: 'center' },
  emptyIcon: { width: '64px', height: '64px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', marginBottom: '16px' },
  itemCard: { display: 'grid', gridTemplateColumns: 'auto auto 1fr auto', gap: '20px', padding: '16px 20px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', alignItems: 'center' },
  timeBlock: { textAlign: 'center', minWidth: '72px' },
  timeHour: { fontFamily: '"Geist Mono", monospace', fontSize: '18px', fontWeight: '500', color: 'var(--ink)', display: 'block', letterSpacing: '-0.02em' },
  timeDate: { fontSize: '10.5px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginTop: '2px' },
  divider: { width: '1px', height: '36px', background: 'var(--line)' },
  patientName: { fontSize: '14px', fontWeight: '500', color: 'var(--ink)', fontFamily: "'Fraunces', serif", display: 'block', marginBottom: '2px' },
  patientMeta: { fontSize: '12px', color: 'var(--ink-3)', display: 'block' },
  notes: { fontSize: '12.5px', color: 'var(--ink-3)', margin: '4px 0 0', fontStyle: 'italic' },
  actions: { display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 },
  chip: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '500' },
  btnConfirm: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '500', background: 'var(--success-soft)', color: 'var(--success)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  btnReject:  { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '500', background: 'var(--rose-soft)', color: 'var(--rose)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  modal: { background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' },
  modalTitle: { fontFamily: "'Fraunces', serif", fontWeight: '400', fontSize: '20px', color: 'var(--ink)', margin: 0 },
  btnClose: { width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', border: '1px solid var(--line)', background: 'var(--card)', cursor: 'pointer', fontSize: '13px', color: 'var(--ink-2)' },
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '13.5px', outline: 'none', background: 'var(--surface)', boxSizing: 'border-box', fontFamily: 'inherit', color: 'var(--ink)', resize: 'vertical' },
  btnOutline: { display: 'inline-flex', alignItems: 'center', padding: '9px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '500', background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'inherit' },
  btnDanger:  { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '500', background: 'var(--rose)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
}

export default ManageAppointments

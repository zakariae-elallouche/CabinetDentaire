import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import api from '../../api'
import { useIsMobile } from '../../hooks/useIsMobile'

const MONTHS_FR = ['janv','févr','mars','avr','mai','juin','juil','août','sept','oct','nov','déc']
const fmtDate = (str) => {
  if (!str) return '—'
  const [y, m, d] = str.split('-')
  const dt = new Date(+y, +m - 1, +d)
  return isNaN(dt) ? str : `${dt.getDate()} ${MONTHS_FR[dt.getMonth()]} ${y}`
}

const METHODS = [
  { value: 'especes',  label: 'Espèces',        icon: '💵' },
  { value: 'carte',    label: 'Carte bancaire',  icon: '💳' },
  { value: 'virement', label: 'Virement',        icon: '🏦' },
  { value: 'cheque',   label: 'Chèque',          icon: '📄' },
]

const IcoSearch  = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const IcoReceipt = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>
const IcoCheck   = () => <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>

function ManagePayments() {
  const isMobile = useIsMobile()
  const [factures, setFactures] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [tab, setTab]           = useState('attente') // 'attente' | 'payees'
  const [payModal, setPayModal] = useState(null)
  const [methode, setMethode]   = useState('especes')
  const [paying, setPaying]     = useState(false)

  useEffect(() => {
    api.get('/factures')
      .then(r => setFactures(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const openPay = (f) => { setPayModal(f); setMethode('especes') }

  const handlePaid = async () => {
    if (!payModal) return
    setPaying(true)
    try {
      await api.post(`/factures/${payModal.id}/payment`, {
        montant_recu: payModal.montant_total,
        methode_paiement: methode,
      })
      setFactures(prev => prev.map(f => f.id === payModal.id ? { ...f, statut: 'payee' } : f))
      toast.success('Paiement enregistré')
      setPayModal(null)
    } catch { toast.error('Erreur lors du paiement') }
    finally { setPaying(false) }
  }

  const pName = (f) => f.patient ? `${f.patient.prenom} ${f.patient.nom}` : '—'

  const enAttente = factures.filter(f => f.statut === 'en_attente')
  const payees    = factures.filter(f => f.statut === 'payee')
  const totalEncaisse = payees.reduce((sum, f) => sum + parseFloat(f.montant_total || 0), 0)

  const q = search.toLowerCase()
  const displayList = (tab === 'attente' ? enAttente : payees)
    .filter(f => !q || pName(f).toLowerCase().includes(q))

  return (
    <Layout>
      <div>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={s.pageTitle}>
            Gestion des <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>paiements</em>
          </h1>
          <p style={s.pageSub}>Enregistrez les paiements des patients</p>
        </div>


        {/* Tabs + Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { key: 'attente', label: 'En attente', count: enAttente.length },
              { key: 'payees',  label: 'Payées',     count: payees.length },
            ].map(t => {
              const active = tab === t.key
              return (
                <button key={t.key} onClick={() => setTab(t.key)} style={{ ...s.tabPill, ...(active ? s.tabPillActive : {}) }}>
                  {t.label}
                  <span style={{ ...s.tabBadge, background: active ? 'rgba(255,255,255,0.25)' : 'var(--surface)', color: active ? '#fff' : 'var(--ink-3)' }}>
                    {t.count}
                  </span>
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
        ) : displayList.length === 0 ? (
          <EmptyState
            title={tab === 'attente' ? 'Toutes les factures sont payées' : 'Aucune facture payée'}
            sub={search ? 'Aucun résultat pour cette recherche.' : undefined}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayList.map(f => (
              <div key={f.id} style={{ ...s.itemCard, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>

                {/* Row 1: icon + info */}
                <div style={{ ...s.itemIcon, background: f.statut === 'payee' ? 'var(--success-soft)' : 'var(--amber-soft)', color: f.statut === 'payee' ? 'var(--success)' : 'var(--gold)' }}>
                  <IcoReceipt />
                </div>
                <div style={{ flex: isMobile ? '1 1 0' : 1, minWidth: 0 }}>
                  <b style={s.patientName}>{pName(f)}</b>
                  <span style={s.factureMeta}>
                    {f.numero_facture} · {fmtDate(f.date_facture)}
                    {f.patient?.telephone && ` · ${f.patient.telephone}`}
                  </span>
                </div>

                {/* Row 2 on mobile: amount + status/btn */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between', ...(isMobile ? { width: '100%', paddingTop: '8px', borderTop: '1px solid var(--line)' } : {}) }}>
                  <span style={s.montant}>{parseFloat(f.montant_total).toFixed(2)} MAD</span>
                  {f.statut === 'payee' ? (
                    <span style={{ ...s.chip, background: 'var(--success-soft)', color: 'var(--success)' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                      Payée
                    </span>
                  ) : (
                    <button style={s.btnPay} onClick={() => openPay(f)}><IcoCheck /> Marquer payée</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overlay */}
      <div style={{ position: 'fixed', inset: 0, background: '#1a201f55', backdropFilter: 'blur(4px)', zIndex: 50, opacity: payModal ? 1 : 0, pointerEvents: payModal ? 'auto' : 'none', transition: 'opacity 0.2s' }}
        onClick={() => setPayModal(null)}
      />

      {/* Payment modal */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: payModal ? 'translate(-50%,-50%) scale(1)' : 'translate(-50%,-50%) scale(0.97)', opacity: payModal ? 1 : 0, pointerEvents: payModal ? 'auto' : 'none', transition: 'all 0.2s cubic-bezier(.3,.7,.2,1)', zIndex: 51, width: '100%', maxWidth: '400px', padding: '0 16px', boxSizing: 'border-box' }}>
        {payModal && (
          <div style={s.modal}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={s.modalTitle}>Enregistrer le paiement</h2>
                <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '12px', color: 'var(--ink-3)' }}>{payModal.numero_facture}</span>
              </div>
              <button onClick={() => setPayModal(null)} style={s.btnClose}>✕</button>
            </div>

            {/* Summary */}
            <div style={{ background: 'var(--surface)', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Patient', value: pName(payModal) },
                { label: 'Date',    value: fmtDate(payModal.date_facture) },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{row.label}</span>
                  <span style={{ fontSize: '13.5px', color: 'var(--ink)', fontWeight: '500' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
                <span style={{ fontSize: '11px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Montant</span>
                <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '18px', fontWeight: '700', color: 'var(--ink)' }}>{parseFloat(payModal.montant_total).toFixed(2)} MAD</span>
              </div>
            </div>

            {/* Method */}
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '10px', fontWeight: '600' }}>
              Méthode de paiement
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '22px' }}>
              {METHODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMethode(m.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: methode === m.value ? '2px solid var(--accent)' : '1px solid var(--line)',
                    background: methode === m.value ? 'var(--accent-soft)' : 'var(--card)',
                    color: methode === m.value ? 'var(--accent)' : 'var(--ink-2)',
                    fontWeight: methode === m.value ? '600' : '400',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button onClick={handlePaid} disabled={paying} style={{ width: '100%', padding: '13px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: paying ? 'default' : 'pointer', fontFamily: 'inherit', opacity: paying ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <IcoCheck /> {paying ? 'Enregistrement...' : 'Confirmer le paiement'}
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}

const s = {
  pageTitle: { fontFamily: "'Fraunces', serif", fontWeight: '400', fontSize: '32px', letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 6px', lineHeight: 1.1 },
  pageSub:   { color: 'var(--ink-2)', fontSize: '14px', margin: 0 },
  summaryPill: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '999px', border: '1px solid var(--line)', background: 'var(--card)' },
  summaryNum:  { fontFamily: '"Geist Mono", monospace', fontSize: '18px', fontWeight: '600', lineHeight: 1 },
  summaryLbl:  { fontSize: '12px', color: 'var(--ink-3)' },
  tabPill: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '450', fontFamily: 'inherit', border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink-2)', cursor: 'pointer', whiteSpace: 'nowrap' },
  tabPillActive: { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff', fontWeight: '500' },
  tabBadge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px', padding: '0 5px', borderRadius: '999px', fontSize: '11px', fontFamily: '"Geist Mono", monospace', fontWeight: '500' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '999px', border: '1px solid var(--line)', background: 'var(--card)', flex: 1, maxWidth: '280px', color: 'var(--ink-3)' },
  searchInput: { border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'var(--ink)', fontFamily: 'inherit', flex: 1, minWidth: 0 },
  clearBtn: { background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', padding: 0, fontSize: '13px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', textAlign: 'center' },
  emptyIcon: { width: '64px', height: '64px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--ink-3)', marginBottom: '16px' },
  itemCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' },
  itemIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'grid', placeItems: 'center', flexShrink: 0 },
  patientName: { fontSize: '14.5px', fontWeight: '500', color: 'var(--ink)', fontFamily: "'Fraunces', serif", display: 'block', marginBottom: '2px' },
  factureMeta: { fontSize: '12px', color: 'var(--ink-3)', fontFamily: '"Geist Mono", monospace', display: 'block' },
  montant: { fontFamily: '"Geist Mono", monospace', fontSize: '15px', fontWeight: '700', color: 'var(--ink)', flexShrink: 0 },
  chip: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '500', flexShrink: 0 },
  btnPay: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '500', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 },
  modal: { background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' },
  modalTitle: { fontFamily: "'Fraunces', serif", fontWeight: '400', fontSize: '20px', color: 'var(--ink)', margin: '0 0 4px' },
  btnClose: { width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', border: '1px solid var(--line)', background: 'var(--card)', cursor: 'pointer', fontSize: '13px', color: 'var(--ink-2)' },
}

export default ManagePayments

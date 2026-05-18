import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import api from '../../api'
import jsPDF from 'jspdf'

function MyInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await api.get('/me')
        const patientId = meRes.data.profile.id
        const res = await api.get(`/patient/${patientId}/factures`)
        setInvoices(res.data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const [y, m, day] = dateStr.split('-')
    const d = new Date(+y, +m - 1, +day)
    const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  }

  const generatePDF = async (f) => {
    const img = new Image(); img.src = '/HZPdf.jpg'
    await new Promise(r => { img.onload = r; img.onerror = r })
    const doc = new jsPDF()
    if (img.complete && img.naturalWidth) doc.addImage(img, 'JPEG', 15, 5, 80, 33)
    doc.setFontSize(12)
    doc.setTextColor(50)
    doc.text(`Facture N°: ${f.numero_facture}`, 20, 48)
    doc.text(`Date: ${formatDate(f.date_facture)}`, 20, 56)
    doc.text(`Patient: ${f.patient ? `${f.patient.prenom} ${f.patient.nom}` : '—'}`, 20, 64)
    const dentiste = f.visite?.dentiste
    const dentisteName = dentiste ? `${dentiste.prenom || ''} ${dentiste.nom || ''}`.trim() : '—'
    doc.text(`Dentiste: Dr. ${dentisteName}`, 20, 72)
    let y = 88
    doc.setFontSize(13)
    doc.text('Détail:', 20, y)
    y += 10
    doc.setFontSize(11)
    const fraisBase = parseFloat(f.frais_visite_base || 0)
    if (fraisBase > 0) {
      doc.text('Frais de visite de base', 25, y)
      doc.text(`${fraisBase.toFixed(2)} MAD`, 160, y)
      y += 10
    }
    const operations = f.visite?.operations || []
    operations.forEach(op => {
      doc.text(`• ${op.nom_operation || op.nom || '—'}`, 25, y)
      doc.text(`${parseFloat(op.cout).toFixed(2)} MAD`, 160, y)
      y += 10
    })
    y += 5
    doc.line(20, y, 190, y)
    y += 8
    doc.setFontSize(13)
    doc.text('Total:', 130, y)
    doc.text(`${parseFloat(f.montant_total).toFixed(2)} MAD`, 160, y)
    doc.save(`${f.numero_facture}.pdf`)
  }

  const enAttente = invoices.filter(f => f.statut === 'en_attente')
  const payees = invoices.filter(f => f.statut === 'payee')
  const totalARegler = enAttente.reduce((s, f) => s + f.montant_total, 0)

  const InvoiceRow = ({ f }) => (
    <div
      style={styles.invoiceRow}
      onClick={() => setSelectedInvoice(f)}
    >
      <div style={{
        ...styles.invoiceIcon,
        background: f.statut === 'en_attente' ? 'var(--amber-soft)' : 'var(--accent-soft)',
        color: f.statut === 'en_attente' ? 'var(--gold)' : 'var(--accent)',
      }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/>
          <path d="M9 8h6M9 12h6M9 16h4"/>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <b style={styles.invoiceTitle}>Facture {f.numero_facture}</b>
        <small style={styles.invoiceMeta}>
          {f.statut === 'payee'
            ? `Payée le ${formatDate(f.date_facture)} · visite du ${formatDate(f.date_facture)}`
            : `Visite du ${formatDate(f.date_facture)}`}
        </small>
      </div>
      <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '15px', fontWeight: '500', marginRight: '16px', color: 'var(--ink)' }}>
        {f.montant_total} MAD
      </div>
      <span style={{
        ...styles.chip,
        ...(f.statut === 'en_attente'
          ? { background: 'var(--amber-soft)', color: '#8d6a2b' }
          : { background: 'var(--success-soft)', color: 'var(--success)' })
      }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: f.statut === 'en_attente' ? 'var(--gold)' : 'var(--success)', display: 'inline-block' }}/>
        {f.statut === 'en_attente' ? 'À régler' : 'Payée'}
      </span>
      <button
        style={styles.btnPDF}
        onClick={e => { e.stopPropagation(); generatePDF(f) }}
      >
        ↓ PDF
      </button>
    </div>
  )

  return (
    <Layout>
      <div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={styles.pageTitle}>
              Mes <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>factures</em>
            </h1>
            <p style={styles.pageSub}>
              Factures générées après chaque visite. Paiement en espèces uniquement, à la clinique.
            </p>
          </div>
          {totalARegler > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '4px' }}>Total à régler</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: '32px', fontWeight: '400', color: 'var(--gold)', letterSpacing: '-0.02em' }}>
                {totalARegler} <span style={{ fontSize: '14px' }}>MAD</span>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <p style={{ color: 'var(--ink-3)' }}>Chargement...</p>
        ) : error ? (
          <EmptyState title="Impossible de charger les factures" sub="Vérifiez votre connexion et réessayez." />
        ) : invoices.length === 0 ? (
          <EmptyState title="Aucune facture" sub="Vos factures apparaîtront ici après chaque visite." />
        ) : (
          <>
            {enAttente.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={styles.sectionLabel}>À régler</div>
                {enAttente.map(f => <InvoiceRow key={f.id} f={f} />)}
              </div>
            )}
            {payees.length > 0 && (
              <div>
                <div style={styles.sectionLabel}>Payées</div>
                {payees.map(f => <InvoiceRow key={f.id} f={f} />)}
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Drawer détail facture ─── */}
      {/* Overlay */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: '#1a201f55',
          backdropFilter: 'blur(4px)',
          zIndex: 150,
          opacity: selectedInvoice ? 1 : 0,
          pointerEvents: selectedInvoice ? 'auto' : 'none',
          transition: 'opacity 0.2s',
        }}
        onClick={() => setSelectedInvoice(null)}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '520px', maxWidth: '94vw',
        background: 'var(--bg)',
        zIndex: 160,
        transform: selectedInvoice ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(.3,.7,.2,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px #1a201f22',
      }}>
        {selectedInvoice && (
          <>
            {/* Drawer header */}
            <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: '400', fontSize: '22px', margin: 0, letterSpacing: '-0.01em', color: 'var(--ink)', flex: 1 }}>
                Facture {selectedInvoice.numero_facture}
              </h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', border: '1px solid var(--line)', background: 'var(--card)', cursor: 'pointer', fontSize: '14px', color: 'var(--ink-2)' }}
              >
                ✕
              </button>
            </div>

            {/* Drawer body */}
            <div style={{ padding: '24px 28px', overflow: 'auto', flex: 1 }}>

              {/* Chip statut */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{
                  ...styles.chip,
                  ...(selectedInvoice.statut === 'en_attente'
                    ? { background: 'var(--amber-soft)', color: '#8d6a2b' }
                    : { background: 'var(--success-soft)', color: 'var(--success)' })
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: selectedInvoice.statut === 'en_attente' ? 'var(--gold)' : 'var(--success)', display: 'inline-block' }}/>
                  {selectedInvoice.statut === 'en_attente' ? 'À régler' : 'Payée'}
                </span>
              </div>

              {/* Infos */}
              {[
                { label: 'PATIENT', value: selectedInvoice.patient ? `${selectedInvoice.patient.prenom} ${selectedInvoice.patient.nom}` : '—' },
                { label: 'DENTISTE', value: (() => { const d = selectedInvoice.visite?.dentiste; return d ? `Dr. ${d.prenom || ''} ${d.nom || ''}`.trim() : '—' })() },
                { label: 'DATE DE VISITE', value: formatDate(selectedInvoice.date_facture) },
                { label: 'RÉFÉRENCE', value: selectedInvoice.numero_facture },
              ].map(row => (
                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '16px', padding: '10px 0', borderBottom: '1px dashed var(--line)' }}>
                  <label style={{ fontSize: '11.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{row.label}</label>
                  <span style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{row.value}</span>
                </div>
              ))}

              {/* Détail facturation */}
              <div style={{ marginTop: '22px', marginBottom: '10px' }}>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: '500', fontSize: '15px', color: 'var(--accent)', paddingBottom: '6px', borderBottom: '1px solid var(--line)', margin: '0 0 10px' }}>
                  Détails de la facturation
                </h3>
              </div>

              <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
                {/* Frais de base */}
                {parseFloat(selectedInvoice.frais_visite_base || 0) > 0 && (
                  <div style={styles.invLine}>
                    <span>Frais de visite de base</span>
                    <span style={{ fontFamily: '"Geist Mono", monospace' }}>{parseFloat(selectedInvoice.frais_visite_base).toFixed(2)} MAD</span>
                  </div>
                )}
                {/* Opérations */}
                {(selectedInvoice.visite?.operations || []).map((op, i) => (
                  <div key={i} style={styles.invLine}>
                    <span style={{ color: 'var(--ink-2)' }}>· {op.nom_operation || op.nom}</span>
                    <span style={{ fontFamily: '"Geist Mono", monospace' }}>{parseFloat(op.cout).toFixed(2)} MAD</span>
                  </div>
                ))}
                {/* Total */}
                <div style={{ ...styles.invLine, borderBottom: 'none', borderTop: '1px solid var(--line-strong)', marginTop: '6px', paddingTop: '14px', fontWeight: '500' }}>
                  <span>Total</span>
                  <span style={{ fontFamily: '"Geist Mono", monospace' }}>{selectedInvoice.montant_total} MAD</span>
                </div>
              </div>

              {/* Note paiement */}
              {selectedInvoice.statut === 'en_attente' && (
                <div style={{ background: 'var(--amber-soft)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginTop: '16px', fontSize: '13px', color: '#8d6a2b', lineHeight: '1.5' }}>
                  ✦ Règlement en espèces à la clinique. La secrétaire marquera la facture comme payée à la réception du paiement.
                </div>
              )}
            </div>

            {/* Drawer footer */}
            <div style={{ padding: '16px 28px', borderTop: '1px solid var(--line)', display: 'flex', gap: '10px', background: 'var(--surface)' }}>
              <button
                style={{ ...styles.btnPrimary, flex: 1 }}
                onClick={() => generatePDF(selectedInvoice)}
              >
                ↓ Télécharger en PDF
              </button>
            </div>
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
  pageSub: { color: 'var(--ink-2)', fontSize: '14px', margin: 0 },
  sectionLabel: {
    fontSize: '10.5px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--ink-3)',
    marginBottom: '10px',
    paddingBottom: '6px',
    borderBottom: '1px solid var(--line)',
  },
  invoiceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: 'var(--card)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    marginBottom: '10px',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  invoiceIcon: {
    width: '42px', height: '42px',
    borderRadius: '10px',
    display: 'grid', placeItems: 'center',
    flexShrink: 0,
  },
  invoiceTitle: {
    fontSize: '14.5px', fontWeight: '500',
    fontFamily: "'Fraunces', serif",
    display: 'block', marginBottom: '2px',
    color: 'var(--ink)',
  },
  invoiceMeta: { color: 'var(--ink-3)', fontSize: '12.5px' },
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '3px 10px', borderRadius: '999px',
    fontSize: '11.5px', fontWeight: '500', flexShrink: 0,
  },
  btnPDF: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '6px 12px', borderRadius: '8px',
    fontSize: '12.5px', fontWeight: '500',
    background: 'transparent', border: '1px solid var(--line-strong)',
    color: 'var(--ink)', cursor: 'pointer',
    fontFamily: 'inherit', flexShrink: 0,
  },
  invLine: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '13.5px', padding: '8px 0',
    borderBottom: '1px dashed var(--line)',
    color: 'var(--ink)',
  },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '10px 16px', borderRadius: '10px',
    fontSize: '13.5px', fontWeight: '500',
    background: 'var(--accent)', color: '#fff',
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '10px 16px', borderRadius: '10px',
    fontSize: '13.5px', fontWeight: '500',
    background: 'transparent', border: '1px solid var(--line-strong)',
    color: 'var(--ink)', cursor: 'pointer', fontFamily: 'inherit',
  },
}

export default MyInvoices
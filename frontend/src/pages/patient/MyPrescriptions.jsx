import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import api from '../../api'
import { generateOrdonnancePDF } from '../../utils/ordonnancePDF'

const MONTHS_LONG = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']

const fmtDate = (dateStr) => {
  if (!dateStr) return '—'
  const [y, m, day] = String(dateStr).split('-')
  const d = new Date(+y, +m - 1, +day)
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`
}

function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(false)
  const [selected, setSelected]           = useState(null)
  const [patientName, setPatientName]     = useState('—')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await api.get('/me')
        const { id, prenom, nom } = meRes.data.profile
        setPatientName(`${prenom || ''} ${nom || ''}`.trim() || '—')
        const res = await api.get(`/patient/${id}/ordonnances`)
        setPrescriptions(res.data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const generatePDF = (p) => generateOrdonnancePDF(p, patientName)

  return (
    <Layout>
      <div>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={s.pageTitle}>
            Mes <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>ordonnances</em>
          </h1>
          <p style={s.pageSub}>
            Toutes les ordonnances délivrées par votre dentiste. Téléchargez-les au format PDF pour la pharmacie.
          </p>
        </div>

        {loading ? (
          <p style={{ color: 'var(--ink-3)' }}>Chargement...</p>
        ) : error ? (
          <EmptyState title="Impossible de charger les ordonnances" sub="Vérifiez votre connexion et réessayez." />
        ) : prescriptions.length === 0 ? (
          <EmptyState title="Aucune ordonnance" sub="Aucune ordonnance délivrée pour le moment." />
        ) : (
          prescriptions.map(p => (
            <div
              key={p.id}
              style={{ ...s.row, background: selected?.id === p.id ? 'var(--accent-soft)' : 'var(--card)' }}
              onClick={() => setSelected(p)}
            >
              <div style={s.icon}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-30 12 12)"/>
                  <path d="M8.5 6.5l7 7"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <b style={s.rowTitle}>Ordonnance RX-{String(p.id).padStart(4, '0')}</b>
                <small style={s.rowMeta}>
                  {p.medicaments?.length || 0} médicaments · délivrée le {fmtDate(p.date_delivrance)}
                </small>
              </div>
              <button
                style={s.btnPDF}
                onClick={e => { e.stopPropagation(); generatePDF(p) }}
              >
                ↓ PDF
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── Overlay ── */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: '#1a201f55',
          backdropFilter: 'blur(4px)',
          zIndex: 150,
          opacity: selected ? 1 : 0,
          pointerEvents: selected ? 'auto' : 'none',
          transition: 'opacity 0.2s',
        }}
        onClick={() => setSelected(null)}
      />

      {/* ── Drawer ── */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '520px', maxWidth: '94vw',
        background: 'var(--bg)',
        zIndex: 160,
        transform: selected ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(.3,.7,.2,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px #1a201f22',
      }}>
        {selected && (
          <>
            {/* Header */}
            <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: '400', fontSize: '22px', margin: 0, letterSpacing: '-0.01em', color: 'var(--ink)', flex: 1 }}>
                Ordonnance RX-{String(selected.id).padStart(4, '0')}
              </h2>
              <button
                onClick={() => setSelected(null)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', border: '1px solid var(--line)', background: 'var(--card)', cursor: 'pointer', fontSize: '14px', color: 'var(--ink-2)' }}
              >✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 28px', overflow: 'auto', flex: 1 }}>

              {/* Infos */}
              {[
                { label: 'RÉFÉRENCE', value: `RX-${String(selected.id).padStart(4, '0')}` },
                { label: 'DATE',      value: fmtDate(selected.date_delivrance) },
                { label: 'MÉDICAMENTS', value: `${selected.medicaments?.length || 0} prescrit(s)` },
              ].map(row => (
                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '16px', padding: '10px 0', borderBottom: '1px dashed var(--line)' }}>
                  <label style={{ fontSize: '11.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{row.label}</label>
                  <span style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{row.value}</span>
                </div>
              ))}

              {/* Instructions */}
              {selected.instructions_generales && (
                <div style={{ background: 'var(--accent-soft)', borderRadius: '8px', padding: '12px 14px', margin: '16px 0 0', fontSize: '13px', color: 'var(--accent)', lineHeight: 1.5 }}>
                  {selected.instructions_generales}
                </div>
              )}

              {/* Médicaments */}
              <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: '500', fontSize: '15px', color: 'var(--accent)', margin: '22px 0 10px', paddingBottom: '6px', borderBottom: '1px solid var(--line)' }}>
                Médicaments prescrits
              </h3>

              <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
                {(selected.medicaments || []).length === 0 ? (
                  <p style={{ color: 'var(--ink-3)', fontSize: '13px', margin: 0 }}>Aucun médicament.</p>
                ) : (selected.medicaments || []).map((m, i, arr) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px dashed var(--line)' : 'none' }}>
                    <b style={{ fontSize: '13.5px', color: 'var(--ink)' }}>
                      {m.medicament?.nom || m.nom || '—'}
                    </b>
                    {m.medicament?.dosage && (
                      <small style={{ marginLeft: '8px', color: 'var(--ink-3)', fontSize: '12px' }}>
                        {m.medicament.dosage}
                      </small>
                    )}
                    <div style={{ display: 'flex', gap: '14px', marginTop: '4px' }}>
                      {m.frequence   && <small style={{ color: 'var(--accent)', fontSize: '12px' }}>{m.frequence}</small>}
                      {m.duree_jours && <small style={{ color: 'var(--ink-3)', fontSize: '12px' }}>{m.duree_jours} jours</small>}
                    </div>
                    {m.instructions_speciales && (
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--ink-2)', fontStyle: 'italic' }}>
                        {m.instructions_speciales}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 28px', borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
              <button style={s.btnPrimary} onClick={() => generatePDF(selected)}>
                ↓ Télécharger en PDF
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

const s = {
  pageTitle: {
    fontFamily: "'Fraunces', serif", fontWeight: '400', fontSize: '36px',
    letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 6px', lineHeight: '1.1',
  },
  pageSub: { color: 'var(--ink-2)', fontSize: '14px', margin: 0, maxWidth: '60ch' },
  empty: { textAlign: 'center', padding: '4rem', color: 'var(--ink-3)' },
  row: {
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '16px 20px',
    border: '1px solid var(--line)', borderRadius: 'var(--radius)',
    marginBottom: '10px', cursor: 'pointer', transition: 'background 0.15s',
  },
  icon: {
    width: '42px', height: '42px', borderRadius: '10px',
    display: 'grid', placeItems: 'center',
    background: 'var(--accent-soft)', color: 'var(--accent)', flexShrink: 0,
  },
  rowTitle: {
    fontSize: '14.5px', fontWeight: '500', fontFamily: "'Fraunces', serif",
    display: 'block', marginBottom: '2px', color: 'var(--ink)',
  },
  rowMeta: { color: 'var(--ink-3)', fontSize: '12.5px' },
  btnPDF: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '6px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '500',
    background: 'transparent', border: '1px solid var(--line-strong)',
    color: 'var(--ink)', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
  },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    fontSize: '13.5px', fontWeight: '500',
    background: 'var(--accent)', color: '#fff',
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  },
}

export default MyPrescriptions

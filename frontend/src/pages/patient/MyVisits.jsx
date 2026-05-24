import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { useIsMobile } from '../../hooks/useIsMobile'
import EmptyState from '../../components/EmptyState'
import api from '../../api'
import jsPDF from 'jspdf'
import { generateOrdonnancePDF } from '../../utils/ordonnancePDF'

const MONTHS_SHORT = ['JANV','FÉVR','MARS','AVR','MAI','JUIN','JUIL','AOÛT','SEPT','OCT','NOV','DÉC']
const MONTHS_LONG  = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']

const fmtDate = (dateStr) => {
  if (!dateStr) return '—'
  const parts = String(dateStr).split('-')
  const d = new Date(+parts[0], +parts[1] - 1, +parts[2])
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`
}

function MyVisits() {
  const isMobile = useIsMobile()
  const [visits, setVisits]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState(null)
  const [activeTab, setActiveTab]   = useState('facture')
  const [patientName, setPatientName] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await api.get('/me')
        const profile = meRes.data.profile
        const patientId = profile.id
        setPatientName(`${profile.prenom || ''} ${profile.nom || ''}`.trim())
        const res = await api.get(`/patient/${patientId}/visites`)
        setVisits(res.data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = search
    ? visits.filter(v =>
        v.diagnostic?.toLowerCase().includes(search.toLowerCase()) ||
        v.traitement_fourni?.toLowerCase().includes(search.toLowerCase())
      )
    : visits

  const openDrawer = (visite) => {
    setSelected(visite)
    setActiveTab('facture')
  }

  const closeDrawer = () => setSelected(null)

  // ── PDF Facture ──
  const downloadFacturePDF = async () => {
    const f = selected?.facture
    if (!f) return

    const loadImage = (src) => {
      const img = new Image()
      img.src = src
      return new Promise(r => { img.onload = () => r(img); img.onerror = () => r(null) })
    }

    const [logoCircle, logoWater] = await Promise.all([
      loadImage('/HZLogo-Border.png'),
      loadImage('/HZLogo.png'),
    ])

    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const W = 210

    if (logoCircle) doc.addImage(logoCircle, 'PNG', 12, 8, 28, 28)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(26)
    doc.setTextColor(15, 72, 66)
    doc.text('HZ Dentaire', 46, 22)

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(13)
    doc.setTextColor(80, 105, 100)
    doc.text('Cabinet Dentaire', 46, 31)

    doc.setDrawColor(15, 72, 66)
    doc.setLineWidth(0.6)
    doc.line(12, 41, W - 12, 41)

    if (logoWater) {
      try {
        doc.saveGraphicsState()
        doc.setGState(new doc.GState({ opacity: 0.07 }))
        doc.addImage(logoWater, 'PNG', 55, 105, 100, 100)
        doc.restoreGraphicsState()
      } catch (_) {}
    }

    const LX = 15
    const VX = 58
    let y = 56

    const field = (label, value) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(15, 72, 66)
      doc.text(`${label}:`, LX, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(25, 25, 25)
      doc.text(String(value || '—'), VX, y)
      y += 14
    }

    const dentiste = selected?.dentiste
    const dentisteName = dentiste ? `${dentiste.prenom || ''} ${dentiste.nom || ''}`.trim() : '—'

    field('Facture N°', f.numero_facture)
    field('Patient',    patientName || '—')
    field('Dentiste',   `Dr. ${dentisteName}`)
    field('Date',       fmtDate(f.date_facture))

    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(15, 72, 66)
    doc.text('Détail:', LX, y)
    y += 11

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(25, 25, 25)

    const fraisBase = parseFloat(f.frais_visite_base || 0)
    if (fraisBase > 0) {
      doc.text('Frais de visite de base', LX + 4, y)
      doc.text(`${fraisBase.toFixed(2)} MAD`, W - 14, y, { align: 'right' })
      y += 9
    }

    ;(selected.operations || []).forEach(op => {
      doc.text(`•  ${op.nom_operation || op.nom || '—'}`, LX + 4, y)
      doc.text(`${parseFloat(op.cout || 0).toFixed(2)} MAD`, W - 14, y, { align: 'right' })
      y += 9
    })

    y += 4
    doc.setDrawColor(15, 72, 66)
    doc.setLineWidth(0.4)
    doc.line(LX, y, W - 14, y)
    y += 9

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(15, 72, 66)
    doc.text('Total:', LX, y)
    doc.setTextColor(25, 25, 25)
    doc.text(`${parseFloat(f.montant_total || 0).toFixed(2)} MAD`, W - 14, y, { align: 'right' })

    y += 10
    const statut = f.statut === 'payee' ? 'PAYÉE' : 'EN ATTENTE'
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(f.statut === 'payee' ? 15 : 150, f.statut === 'payee' ? 72 : 100, f.statut === 'payee' ? 66 : 30)
    doc.text(`Statut: ${statut}`, LX, y)

    const sigX1 = W - 78
    const sigX2 = W - 14
    const sigY  = 265
    doc.setDrawColor(40, 40, 40)
    doc.setLineWidth(0.3)
    doc.line(sigX1, sigY, sigX2, sigY)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(15, 72, 66)
    doc.text('Signature', (sigX1 + sigX2) / 2, sigY + 7, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(40, 40, 40)
    doc.text('Hz', (sigX1 + sigX2) / 2, sigY + 13, { align: 'center' })

    doc.save(`${f.numero_facture || 'facture'}.pdf`)
  }

  // ── PDF Ordonnance ──
  const downloadOrdonnancePDF = async () => {
    const p = selected?.ordonnance
    if (!p) return
    const patientName = selected?.patient
      ? `${selected.patient.prenom || ''} ${selected.patient.nom || ''}`.trim()
      : '—'
    await generateOrdonnancePDF(p, patientName)
  }

  return (
    <Layout>
      <div>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={s.pageTitle}>
            Mes <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>visites</em>
          </h1>
          <p style={s.pageSub}>
            Historique complet — diagnostics, traitements, opérations et ordonnances associées.
          </p>
        </div>

        {/* Recherche */}
        <div style={{ position: 'relative', marginBottom: '22px' }}>
          <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
          </svg>
          <input
            placeholder="Rechercher dans diagnostics, traitements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', border: '1px solid var(--line)', borderRadius: '10px', padding: '11px 14px 11px 38px', fontSize: '13.5px', background: 'var(--card)', outline: 'none', boxSizing: 'border-box', color: 'var(--ink)' }}
          />
        </div>

        {/* Liste */}
        {loading ? (
          <p style={{ color: 'var(--ink-3)' }}>Chargement...</p>
        ) : error ? (
          <EmptyState title="Impossible de charger les visites" sub="Vérifiez votre connexion et réessayez." />
        ) : filtered.length === 0 ? (
          <EmptyState title="Aucune visite" sub="Aucune visite enregistrée pour le moment." />
        ) : (
          filtered.map((visite) => {
            const d     = new Date(visite.date_visite)
            const day   = isNaN(d) ? '—' : d.getDate()
            const month = isNaN(d) ? '—' : MONTHS_SHORT[d.getMonth()]
            const year  = isNaN(d) ? '' : d.getFullYear()
            const title = visite.diagnostic || visite.traitement_fourni || 'Visite médicale'
            return (
              <div key={visite.id} style={{ ...s.visitCard, display: isMobile ? 'flex' : 'grid', padding: isMobile ? '16px' : '18px 22px' }}>
                {isMobile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                    {/* Row 1: date | info | status icon */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{ ...s.visitDateCol, minWidth: '44px', flexShrink: 0 }}>
                        <div style={s.visitDay}>{day}</div>
                        <div style={s.visitMonth}>{month}</div>
                        <div style={s.visitYear}>{year}</div>
                      </div>
                      <div style={{ width: '1px', alignSelf: 'stretch', background: 'var(--line)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <b style={s.visitTitle}>{title}</b>
                        <small style={s.visitMeta}>
                          V-{String(visite.id).padStart(4, '0')}
                          {visite.traitement_fourni && visite.diagnostic ? ` · ${visite.traitement_fourni}` : ''}
                        </small>
                      </div>
                      <span title="Complété" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--info-soft)', color: 'var(--info)', flexShrink: 0 }}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 9 17 20 7"/></svg>
                      </span>
                    </div>
                    {/* Row 2: badges left | Détails right */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {visite.facture    && <span style={s.badge}>Facture</span>}
                        {visite.ordonnance && <span style={s.badge}>Ordonnance</span>}
                        {!visite.facture && !visite.ordonnance && <span />}
                      </div>
                      <button style={s.btnGhost} onClick={() => openDrawer(visite)}>Détails</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Date */}
                    <div style={s.visitDateCol}>
                      <div style={s.visitDay}>{day}</div>
                      <div style={s.visitMonth}>{month}</div>
                      <div style={s.visitYear}>{year}</div>
                    </div>
                    {/* Divider */}
                    <div style={s.visitDivider} />
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={s.visitTitle}>{title}</b>
                      <small style={s.visitMeta}>
                        V-{String(visite.id).padStart(4, '0')}
                        {visite.traitement_fourni && visite.diagnostic ? ` · ${visite.traitement_fourni}` : ''}
                      </small>
                      {(visite.ordonnance || visite.facture) && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                          {visite.facture    && <span style={s.badge}>Facture</span>}
                          {visite.ordonnance && <span style={s.badge}>Ordonnance</span>}
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div style={s.visitActions}>
                      <span style={s.chipCompleted}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--info)', display: 'inline-block' }}/>
                        Complété
                      </span>
                      <button style={s.btnGhost} onClick={() => openDrawer(visite)}>Détails</button>
                    </div>
                  </>
                )}
              </div>
            )
          })
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
        onClick={closeDrawer}
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
            {/* Drawer header */}
            <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: '400', fontSize: '22px', margin: 0, letterSpacing: '-0.01em', color: 'var(--ink)', flex: 1 }}>
                Visite V-{String(selected.id).padStart(4, '0')}
              </h2>
              <button
                onClick={closeDrawer}
                style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', border: '1px solid var(--line)', background: 'var(--card)', cursor: 'pointer', fontSize: '14px', color: 'var(--ink-2)' }}
              >✕</button>
            </div>

            {/* Drawer body */}
            <div style={{ padding: '24px 28px', overflow: 'auto', flex: 1 }}>

              {/* Infos visite */}
              {[
                { label: 'DATE', value: fmtDate(selected.date_visite) },
                { label: 'DIAGNOSTIC', value: selected.diagnostic || '—' },
                { label: 'TRAITEMENT', value: selected.traitement_fourni || '—' },
              ].map(row => (
                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '16px', padding: '10px 0', borderBottom: '1px dashed var(--line)' }}>
                  <label style={{ fontSize: '11.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{row.label}</label>
                  <span style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{row.value}</span>
                </div>
              ))}

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '22px', marginBottom: '18px' }}>
                {['facture', 'ordonnance'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px',
                      fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.15s',
                      background: activeTab === tab ? 'var(--accent)' : 'var(--surface)',
                      color:      activeTab === tab ? '#fff' : 'var(--ink-2)',
                      border:     activeTab === tab ? 'none' : '1px solid var(--line)',
                    }}
                  >
                    {tab === 'facture' ? 'Facture' : 'Ordonnance'}
                  </button>
                ))}
              </div>

              {/* ── Facture tab ── */}
              {activeTab === 'facture' && (
                !selected.facture ? (
                  <p style={{ color: 'var(--ink-3)', fontSize: '13px' }}>Aucune facture associée à cette visite.</p>
                ) : (
                  <>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{
                        ...s.chip,
                        ...(selected.facture.statut === 'en_attente'
                          ? { background: 'var(--amber-soft)', color: '#8d6a2b' }
                          : { background: 'var(--success-soft)', color: 'var(--success)' })
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: selected.facture.statut === 'en_attente' ? 'var(--gold)' : 'var(--success)', display: 'inline-block' }}/>
                        {selected.facture.statut === 'en_attente' ? 'À régler' : 'Payée'}
                      </span>
                    </div>

                    {[
                      { label: 'RÉFÉRENCE', value: selected.facture.numero_facture },
                      { label: 'DATE',      value: fmtDate(selected.facture.date_facture) },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '16px', padding: '10px 0', borderBottom: '1px dashed var(--line)' }}>
                        <label style={{ fontSize: '11.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{row.label}</label>
                        <span style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{row.value}</span>
                      </div>
                    ))}

                    <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: '500', fontSize: '15px', color: 'var(--accent)', margin: '20px 0 10px', paddingBottom: '6px', borderBottom: '1px solid var(--line)' }}>
                      Détails de la facturation
                    </h3>

                    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
                      {parseFloat(selected.facture.frais_visite_base || 0) > 0 && (
                        <div style={s.invLine}>
                          <span>Frais de visite de base</span>
                          <span style={{ fontFamily: '"Geist Mono", monospace' }}>{parseFloat(selected.facture.frais_visite_base).toFixed(2)} MAD</span>
                        </div>
                      )}
                      {(selected.operations || []).map((op, i) => (
                        <div key={i} style={s.invLine}>
                          <span style={{ color: 'var(--ink-2)' }}>· {op.nom_operation || op.nom}</span>
                          <span style={{ fontFamily: '"Geist Mono", monospace' }}>{parseFloat(op.cout).toFixed(2)} MAD</span>
                        </div>
                      ))}
                      <div style={{ ...s.invLine, borderBottom: 'none', borderTop: '1px solid var(--line-strong)', marginTop: '6px', paddingTop: '14px', fontWeight: '500' }}>
                        <span>Total</span>
                        <span style={{ fontFamily: '"Geist Mono", monospace' }}>{parseFloat(selected.facture.montant_total || 0).toFixed(2)} MAD</span>
                      </div>
                    </div>

                    {selected.facture.statut === 'en_attente' && (
                      <div style={{ background: 'var(--amber-soft)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginTop: '16px', fontSize: '13px', color: '#8d6a2b', lineHeight: '1.5' }}>
                        ✦ Règlement en espèces à la clinique. La secrétaire marquera la facture comme payée à la réception du paiement.
                      </div>
                    )}
                  </>
                )
              )}

              {/* ── Ordonnance tab ── */}
              {activeTab === 'ordonnance' && (
                !selected.ordonnance ? (
                  <p style={{ color: 'var(--ink-3)', fontSize: '13px' }}>Aucune ordonnance associée à cette visite.</p>
                ) : (
                  <>
                    {[
                      { label: 'RÉFÉRENCE', value: `RX-${String(selected.ordonnance.id).padStart(4,'0')}` },
                      { label: 'DATE',      value: fmtDate(selected.ordonnance.date_delivrance) },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '16px', padding: '10px 0', borderBottom: '1px dashed var(--line)' }}>
                        <label style={{ fontSize: '11.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{row.label}</label>
                        <span style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{row.value}</span>
                      </div>
                    ))}

                    {selected.ordonnance.instructions_generales && (
                      <div style={{ background: 'var(--accent-soft)', borderRadius: '8px', padding: '12px 14px', margin: '16px 0 6px', fontSize: '13px', color: 'var(--accent)', lineHeight: 1.5 }}>
                        {selected.ordonnance.instructions_generales}
                      </div>
                    )}

                    <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: '500', fontSize: '15px', color: 'var(--accent)', margin: '20px 0 10px', paddingBottom: '6px', borderBottom: '1px solid var(--line)' }}>
                      Médicaments prescrits
                    </h3>

                    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px' }}>
                      {(selected.ordonnance.medicaments || []).length === 0 ? (
                        <p style={{ color: 'var(--ink-3)', fontSize: '13px', margin: 0 }}>Aucun médicament.</p>
                      ) : (selected.ordonnance.medicaments || []).map((m, i, arr) => (
                        <div key={i} style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px dashed var(--line)' : 'none' }}>
                          <b style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{m.medicament?.nom || m.nom || '—'}</b>
                          <div style={{ display: 'flex', gap: '14px', marginTop: '4px' }}>
                            {m.frequence    && <small style={{ color: 'var(--accent)', fontSize: '12px' }}>{m.frequence}</small>}
                            {m.duree_jours  && <small style={{ color: 'var(--ink-3)', fontSize: '12px' }}>{m.duree_jours} jours</small>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )
              )}
            </div>

            {/* Drawer footer */}
            <div style={{ padding: '16px 28px', borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
              {activeTab === 'facture' && selected.facture && (
                <button style={s.btnPrimary} onClick={downloadFacturePDF}>
                  ↓ Télécharger en PDF
                </button>
              )}
              {activeTab === 'ordonnance' && selected.ordonnance && (
                <button style={s.btnPrimary} onClick={downloadOrdonnancePDF}>
                  ↓ Télécharger en PDF
                </button>
              )}
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
  pageSub: { color: 'var(--ink-2)', fontSize: '14px', margin: 0 },
  visitCard: {
    display: 'grid',
    gridTemplateColumns: 'auto auto 1fr auto',
    gap: '20px',
    padding: '18px 22px',
    background: 'var(--card)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    marginBottom: '10px',
    alignItems: 'center',
    boxSizing: 'border-box',
    width: '100%',
  },
  visitDateCol: {
    textAlign: 'center',
    minWidth: '56px',
  },
  visitDivider: {
    width: '1px',
    height: '44px',
    background: 'var(--line)',
  },
  visitDay: {
    fontFamily: "'Fraunces', serif", fontSize: '26px', fontWeight: '400',
    lineHeight: '1', letterSpacing: '-0.02em', color: 'var(--ink)',
  },
  visitMonth: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-3)', marginTop: '2px' },
  visitYear:  { fontSize: '11px', color: 'var(--ink-3)', marginTop: '1px' },
  visitTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '14.5px', fontWeight: '500', display: 'block',
    marginBottom: '3px', color: 'var(--ink)',
  },
  visitMeta:  { color: 'var(--ink-3)', fontSize: '12.5px', display: 'block' },
  visitActions: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px',
  },
  chipCompleted: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '3px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '500',
    background: 'var(--info-soft)', color: 'var(--info)',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center',
    padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '500',
    background: 'var(--surface)', color: 'var(--ink-3)',
    border: '1px solid var(--line)',
  },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center',
    padding: '6px 11px', borderRadius: '8px',
    fontSize: '12.5px', fontWeight: '500',
    background: 'transparent', border: '1px solid var(--line-strong)',
    color: 'var(--ink)', cursor: 'pointer', fontFamily: 'inherit',
  },
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '3px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '500',
  },
  invLine: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '13.5px', padding: '8px 0',
    borderBottom: '1px dashed var(--line)', color: 'var(--ink)',
  },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    fontSize: '13.5px', fontWeight: '500',
    background: 'var(--accent)', color: '#fff',
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  },
}

export default MyVisits

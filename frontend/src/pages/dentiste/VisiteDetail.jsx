import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api'
import { useIsMobile } from '../../hooks/useIsMobile'

const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']

const IcoBack    = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
const IcoUser    = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
const IcoPill    = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-30 12 12)"/><path d="M8.5 6.5l7 7"/></svg>

function VisiteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [visite, setVisite] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/visites/${id}`)
      .then(res => setVisite(res.data))
      .catch(() => setVisite(null))
      .finally(() => setLoading(false))
  }, [id])

  const formatDate = (str) => {
    if (!str) return '—'
    const [y, m, d] = str.split('-')
    return `${+d} ${MONTHS_FR[+m - 1]} ${y}`
  }

  const pName = (v) =>
    v?.patient ? `${v.patient.prenom || ''} ${v.patient.nom || ''}`.trim() : '—'

  const totalOps = visite?.operations?.reduce((sum, op) => sum + parseFloat(op.cout || 0), 0) || 0

  if (loading) return (
    <Layout>
      <p style={{ color: 'var(--ink-3)', padding: '3rem 0', textAlign: 'center' }}>Chargement...</p>
    </Layout>
  )

  if (!visite) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--ink-3)', fontSize: '15px' }}>Visite introuvable.</p>
        <button style={s.btnBack} onClick={() => navigate(-1)}><IcoBack /> Retour</button>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div>

        {/* ── Back + header ── */}
        <button style={s.btnBack} onClick={() => navigate(-1)}>
          <IcoBack /> Agenda du jour
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', margin: '20px 0 28px' }}>
          <div>
            <h1 style={s.pageTitle}>
              Visite <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{pName(visite)}</em>
            </h1>
            <p style={s.pageSub}>{formatDate(visite.date_visite)} · VIS-{String(visite.id).padStart(4, '0')}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {visite.patient?.id && (
              <button style={s.btnAction} onClick={() => navigate(`/dentiste/patient/${visite.patient.id}/historique`)}>
                <IcoUser /> Dossier patient
              </button>
            )}
          </div>
        </div>

        <div style={{ ...s.grid, gridTemplateColumns: isMobile ? '1fr' : s.grid.gridTemplateColumns }}>

          {/* ── Left col ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Statut chip */}
            <div style={s.card}>
              <div style={s.cardHead}>Statut</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '500', background: 'var(--success-soft)', color: 'var(--success)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                Visite complète
              </span>
            </div>

            {/* Diagnostic */}
            {visite.diagnostic && (
              <div style={s.card}>
                <div style={s.cardHead}>Diagnostic</div>
                <p style={s.cardBody}>{visite.diagnostic}</p>
              </div>
            )}

            {/* Traitement */}
            {visite.traitement_fourni && (
              <div style={s.card}>
                <div style={s.cardHead}>Traitement fourni</div>
                <p style={s.cardBody}>{visite.traitement_fourni}</p>
              </div>
            )}

            {/* Notes */}
            {visite.notes && (
              <div style={s.card}>
                <div style={s.cardHead}>Notes cliniques</div>
                <p style={s.cardBody}>{visite.notes}</p>
              </div>
            )}
          </div>

          {/* ── Right col ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Operations */}
            <div style={s.card}>
              <div style={s.cardHead}>
                Opérations effectuées
                <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '11px', color: 'var(--ink-3)', fontWeight: '400', marginLeft: '8px' }}>
                  {visite.operations?.length || 0}
                </span>
              </div>
              {visite.operations?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {visite.operations.map(op => (
                    <div key={op.id} style={s.opRow}>
                      <div>
                        <span style={{ fontSize: '13.5px', color: 'var(--ink)', fontWeight: '500', display: 'block' }}>{op.nom_operation}</span>
                        {op.description && (
                          <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{op.description}</span>
                        )}
                      </div>
                      <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '13px', fontWeight: '600', color: 'var(--ink)', flexShrink: 0 }}>
                        {parseFloat(op.cout).toFixed(2)} MAD
                      </span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', marginTop: '4px', borderTop: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total opérations</span>
                    <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '14px', fontWeight: '700', color: 'var(--ink)' }}>
                      {totalOps.toFixed(2)} MAD
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--ink-3)', fontSize: '13px', margin: 0 }}>Aucune opération enregistrée.</p>
              )}
            </div>

            {/* Facture */}
            {visite.facture && (
              <div style={s.card}>
                <div style={s.cardHead}>Facture</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Numéro',       value: visite.facture.numero_facture },
                    { label: 'Date',         value: formatDate(visite.facture.date_facture) },
                    { label: 'Frais visite', value: `${parseFloat(visite.facture.frais_visite_base || 0).toFixed(2)} MAD` },
                    { label: 'Frais opérations', value: `${parseFloat(visite.facture.frais_operations || 0).toFixed(2)} MAD` },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed var(--line)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</span>
                      <span style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>Total</span>
                    <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '18px', fontWeight: '700', color: 'var(--ink)' }}>
                      {parseFloat(visite.facture.montant_total).toFixed(2)} MAD
                    </span>
                  </div>
                  <div style={{ paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '500',
                      background: visite.facture.statut === 'payee' ? 'var(--success-soft)' : 'var(--amber-soft)',
                      color: visite.facture.statut === 'payee' ? 'var(--success)' : '#8d6a2b',
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                      {visite.facture.statut === 'payee' ? 'Payée' : 'En attente de paiement'}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  )
}

const s = {
  btnBack: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    background: 'var(--card)',
    border: '1px solid var(--line)',
    color: 'var(--ink-2)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  pageTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: '400',
    fontSize: '32px',
    letterSpacing: '-0.02em',
    color: 'var(--ink)',
    margin: '0 0 6px',
    lineHeight: 1.1,
  },
  pageSub: {
    color: 'var(--ink-3)',
    fontSize: '13.5px',
    margin: 0,
    fontFamily: '"Geist Mono", monospace',
  },
  btnAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 14px',
    borderRadius: '9px',
    fontSize: '13px',
    fontWeight: '500',
    background: 'var(--card)',
    border: '1px solid var(--line)',
    color: 'var(--ink-2)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.1fr',
    gap: '16px',
    alignItems: 'start',
  },
  card: {
    background: 'var(--card)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '20px 22px',
  },
  cardHead: {
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--ink-3)',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
  },
  cardBody: {
    fontSize: '13.5px',
    color: 'var(--ink)',
    margin: 0,
    lineHeight: 1.6,
  },
  opRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '10px 12px',
    background: 'var(--surface)',
    borderRadius: '8px',
    border: '1px solid var(--line)',
  },
}

export default VisiteDetail

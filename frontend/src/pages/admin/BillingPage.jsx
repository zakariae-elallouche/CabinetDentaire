import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../api'
import { toast } from 'react-toastify'
import { useIsMobile } from '../../hooks/useIsMobile'
import DonutLoader from '../../components/DonutLoader'
import AnimateIn from '../../components/AnimateIn'

function BillingPage() {
  const isMobile = useIsMobile()
  const [data, setData] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/billing/status'),
      api.get('/billing/invoices'),
    ]).then(([sRes, iRes]) => {
      setData(sRes.data)
      setInvoices(iRes.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const tenant = data?.tenant
  const subscription = data?.subscription
  const nextInvoice = data?.next_invoice
  const hasPending = !!nextInvoice
  const hasSubscription = !!subscription && subscription.statut === 'actif'

  const subscribe = async () => {
    setSubscribing(true)
    try {
      const res = await api.post('/billing/subscribe', { methode_paiement: 'virement' })
      toast.success(res.data.message)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
    setSubscribing(false)
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'

  const trialDate = tenant?.trial_ends_at ? new Date(tenant.trial_ends_at) : null
  const subDate = subscription?.fin_periode ? new Date(subscription.fin_periode) : null

  const showTrialBanner = trialDate && trialDate > new Date() && (trialDate - new Date()) / (1000 * 60 * 60 * 24) <= 7
  const showSubBanner = subDate && subDate > new Date() && (subDate - new Date()) / (1000 * 60 * 60 * 24) <= 7

  if (loading) return <Layout><div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}><DonutLoader /></div></Layout>

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 26, color: 'var(--ink)', margin: '0 0 4px' }}>Facturation</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: 0 }}>Gérez votre abonnement</p>
      </div>

      <AnimateIn>
      <>
      {showTrialBanner || showSubBanner ? (
        <div style={{
          background: '#FEFCE8',
          border: '1px solid #EAB308',
          borderRadius: 12,
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⏳</span>
          <div>
            {showTrialBanner ? (
              <>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#92400E', marginBottom: 4 }}>Période d'essai</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  Votre période d'essai se termine le {fmtDate(tenant.trial_ends_at)}. Souscrivez à un abonnement pour continuer à utiliser l'application.
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#92400E', marginBottom: 4 }}>Abonnement</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  Votre abonnement se termine le {fmtDate(subscription.fin_periode)}.
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: 24 }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 16, color: 'var(--ink)', margin: '0 0 14px' }}>Situation actuelle</h3>
          {tenant && (
            <>
              <InfoRow label="Statut" value={<StatusBadge statut={tenant.statut} />} />
              {!hasSubscription && (
                <InfoRow label="Fin d'essai" value={tenant.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString() : '—'} />
              )}
              {hasSubscription && (
                <>
                  <InfoRow label="Fin abonnement" value={subscription.fin_periode ? new Date(subscription.fin_periode).toLocaleDateString() : '—'} />
                  <InfoRow label="Montant" value={`${subscription.montant} MAD/mois`} />
                  {hasPending ? (
                    <InfoRow label="Dernière facture" value={<span style={{ color: '#eab308', fontWeight: 500 }}>En attente</span>} />
                  ) : subDate && (
                    <InfoRow label="Prochaine facture" value={fmtDate(subscription.fin_periode)} />
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: 24 }}>
          {!hasSubscription ? (
            <>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 16, color: 'var(--ink)', margin: '0 0 14px' }}>Souscrire</h3>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 4 }}>Abonnement mensuel</div>
                <div style={{ fontSize: 32, fontWeight: 600, color: '#4AB2BB', marginBottom: 4 }}>299 <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--ink-3)' }}>MAD/mois</span></div>
              </div>
              <button onClick={subscribe} disabled={subscribing} style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                background: '#4AB2BB', color: '#fff', fontSize: 14, fontWeight: 500,
                cursor: subscribing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: subscribing ? 0.7 : 1,
              }}>
                {subscribing ? 'Traitement...' : "S'abonner (virement bancaire)"}
              </button>
            </>
          ) : hasPending ? (
            <>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 16, color: 'var(--ink)', margin: '0 0 14px' }}>Facture en attente</h3>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 4 }}>N° {nextInvoice.numero}</div>
                <div style={{ fontSize: 32, fontWeight: 600, color: '#eab308', marginBottom: 4 }}>
                  {nextInvoice.montant} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--ink-3)' }}>MAD</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Effectuez le virement pour confirmer</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.8, padding: '12px', background: 'var(--surface)', borderRadius: 8 }}>
                <strong style={{ color: 'var(--ink)' }}>Banque :</strong> CIH Bank<br />
                <strong style={{ color: 'var(--ink)' }}>RIB :</strong> xxx-xxxxxxx-xx-xxx-xxx-xxx<br />
                <strong style={{ color: 'var(--ink)' }}>Titulaire :</strong> DentApp.ma<br />
                <strong style={{ color: 'var(--ink)' }}>Référence :</strong> {nextInvoice.numero}
              </div>
            </>
          ) : (
            <>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 16, color: 'var(--ink)', margin: '0 0 14px' }}>Abonnement actif</h3>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.8 }}>
                Prochaine facture générée le <strong style={{ color: 'var(--ink)' }}>{fmtDate(subscription.fin_periode)}</strong>.<br />
                Vous recevrez un email avec les coordonnées bancaires pour effectuer le virement.
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 16, color: 'var(--ink)', margin: 0 }}>Historique des factures</h3>
        </div>
        {invoices.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>Aucune facture pour le moment</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 450 : undefined }}>
            <thead>
              <tr style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid var(--line)' }}>
                <th style={{ textAlign: 'left', padding: '12px 24px', fontWeight: 500 }}>N°</th>
                <th style={{ textAlign: 'left', padding: '12px 24px', fontWeight: 500 }}>Montant</th>
                <th style={{ textAlign: 'left', padding: '12px 24px', fontWeight: 500 }}>Statut</th>
                <th style={{ textAlign: 'left', padding: '12px 24px', fontWeight: 500 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 24px', fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{inv.numero}</td>
                  <td style={{ padding: '12px 24px', fontSize: 13, color: 'var(--ink)' }}>{inv.montant} {inv.devise}</td>
                  <td style={{ padding: '12px 24px', fontSize: 13 }}>
                    <span style={{ color: inv.statut === 'paid' ? 'var(--success)' : inv.statut === 'pending' ? '#eab308' : 'var(--rose)', fontWeight: 500 }}>
                      {inv.statut === 'paid' ? 'Payée' : inv.statut === 'pending' ? 'En attente' : 'Échouée'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 24px', fontSize: 13, color: 'var(--ink-3)' }}>
                    {inv.date_paiement ? new Date(inv.date_paiement).toLocaleDateString() : new Date(inv.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
      </>
      </AnimateIn>
    </Layout>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function StatusBadge({ statut }) {
  const m = {
    essai: { label: 'Essai', color: '#eab308' },
    actif: { label: 'Actif', color: 'var(--success)' },
    suspendu: { label: 'Suspendu', color: 'var(--rose)' },
    expire: { label: 'Abonnement terminé', color: 'var(--ink-3)' },
  }
  const s = m[statut] || { label: statut, color: 'var(--ink-3)' }
  return <span style={{ color: s.color, fontWeight: 500 }}>{s.label}</span>
}

export default BillingPage
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { toast } from 'react-toastify'
import { useApiQuery, useApiMutation } from '../../hooks/useApi'
import AnimateIn from '../../components/AnimateIn'


const statutConfig = {
  essai: { label: 'Essai', color: '#eab308', bg: '#FEFCE8' },
  actif: { label: 'Actif', color: '#16a34a', bg: '#F0FDF4' },
  expire: { label: 'Expiré', color: '#6b7280', bg: '#F3F4F6' },
  suspendu: { label: 'Suspendu', color: '#e11d48', bg: '#FFF1F2' },
  pending: { label: 'En attente', color: '#eab308', bg: '#FEFCE8' },
  paid: { label: 'Payée', color: '#16a34a', bg: '#F0FDF4' },
  expired: { label: 'Expiré', color: '#6b7280', bg: '#F3F4F6' },
}

function SuperAdminTenantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoiceModal, setInvoiceModal] = useState(false)
  const [invForm, setInvForm] = useState({ montant: 299, date_echeance: '', notes: '' })
  const [invLoading, setInvLoading] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [confirmTrial, setConfirmTrial] = useState(null)

  const { data: data } = useApiQuery(
    ['superadmin-tenant', id],
    `/superadmin/tenants/${id}`,
    { enabled: !!id }
  )

  const actionMutation = useApiMutation('post', null, {
    onSuccess: (res) => toast.success(res.data.message),
    onError: () => toast.error('Erreur'),
    invalidate: ['superadmin-tenant', id],
  })

  const confirmPaymentMutation = useApiMutation('post', null, {
    onSuccess: (res) => { toast.success(res.data.message); setConfirmId(null) },
    onError: () => toast.error('Erreur'),
    invalidate: ['superadmin-tenant', id],
  })

  const doAction = async (action, body = {}) => {
    actionMutation.mutate({ _config: { url: `/superadmin/tenants/${id}/${action}`, method: 'post' }, ...body })
  }

  const confirmPayment = async (invoiceId) => {
    confirmPaymentMutation.mutate({ _config: { url: `/superadmin/invoices/${invoiceId}/confirm`, method: 'post' } })
  }

  const daysUntil = (date) => {
    if (!date) return null
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (!data) return <Layout><div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}><DonutLoader /></div></Layout>

  const { tenant, utilisateurs, subscriptions, invoices } = data
  const counts = {
    utilisateurs: tenant.utilisateurs_count || 0,
    patients: tenant.patients_count || 0,
    dentistes: tenant.dentistes_count || 0,
    secretaires: tenant.secretaires_count || 0,
    rendezVous: tenant.rendez_vous_count || 0,
    visites: tenant.visites_count || 0,
    factures: tenant.factures_count || 0,
  }

  const sc = statutConfig[tenant.statut] || { label: tenant.statut, color: 'var(--ink-3)', bg: 'var(--surface)' }
  const trialDaysLeft = tenant.trial_ends_at ? daysUntil(tenant.trial_ends_at) : null
  const activeSub = subscriptions?.find(s => s.statut === 'actif')

  return (
    <Layout>
      <AnimateIn>
      <button onClick={() => navigate('/superadmin/tenants')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 13, fontFamily: 'inherit', marginBottom: 16, padding: '4px 0' }}>
        ← Retour aux cliniques
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 26, color: 'var(--ink)', margin: 0 }}>{tenant.nom_clinique}</h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: sc.bg, color: sc.color,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color }} />
              {sc.label}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16, color: 'var(--ink-3)', fontSize: 13, flexWrap: 'wrap' }}>
            <span>{tenant.slug}.dentapp.ma</span>
            {tenant.ville && <span>📍 {tenant.ville}</span>}
            <span>🆔 #{tenant.id}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {trialDaysLeft !== null && trialDaysLeft > 0 && trialDaysLeft <= 7 && (
            <span style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: '#FEFCE8', color: '#92400E',
              border: '1px solid #EAB308',
            }}>
              ⏳ Essai expire dans {trialDaysLeft}j
            </span>
          )}
          {tenant.statut === 'suspendu' && (
            <button onClick={() => doAction('activate')} style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: 'var(--success)', color: '#fff', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            }}>
              Activer
            </button>
          )}
          {['actif', 'essai'].includes(tenant.statut) && (
            <button onClick={() => doAction('suspend')} style={{
              padding: '8px 18px', borderRadius: 8, border: '1px solid var(--rose)',
              background: 'transparent', color: 'var(--rose)', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            }}>
              Suspendre
            </button>
          )}
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 10, marginBottom: 24,
      }}>
        <MiniStat icon="👤" label="Admins" value={counts.utilisateurs} color="#6366f1" />
        <MiniStat icon="🦷" label="Dentistes" value={counts.dentistes} color="#0891b2" />
        <MiniStat icon="📋" label="Secrétaires" value={counts.secretaires} color="#d946ef" />
        <MiniStat icon="🧑‍⚕️" label="Patients" value={counts.patients} color="#16a34a" />
        <MiniStat icon="📅" label="RDV" value={counts.rendezVous} color="#eab308" />
        <MiniStat icon="🏥" label="Visites" value={counts.visites} color="#f97316" />
        <MiniStat icon="💳" label="Factures" value={counts.factures} color="#e11d48" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: 24 }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 16, color: 'var(--ink)', margin: '0 0 16px' }}>Informations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <div>
              <InfoRow label="Email" value={tenant.email_contact} />
              <InfoRow label="Téléphone" value={tenant.telephone || '—'} />
              <InfoRow label="Adresse" value={tenant.adresse || '—'} />
              <InfoRow label="Ville" value={tenant.ville || '—'} />
            </div>
            <div>
              <InfoRow label="Créée le" value={new Date(tenant.created_at).toLocaleDateString('fr-FR')} />
              {tenant.trial_ends_at && (
                <InfoRow
                  label="Fin d'essai"
                  value={
                    <span style={{
                      color: trialDaysLeft !== null && trialDaysLeft <= 7 ? '#92400E' : 'var(--ink)',
                      fontWeight: trialDaysLeft !== null && trialDaysLeft <= 7 ? 600 : 500,
                    }}>
                      {new Date(tenant.trial_ends_at).toLocaleDateString('fr-FR')}
                      {trialDaysLeft !== null && trialDaysLeft > 0 && (
                        <span style={{ color: 'var(--ink-3)', fontWeight: 400, marginLeft: 6 }}>
                          ({trialDaysLeft}j restants)
                        </span>
                      )}
                    </span>
                  }
                />
              )}
              {activeSub && (
                <>
                  <InfoRow label="Début abonnement" value={new Date(activeSub.debut_periode).toLocaleDateString('fr-FR')} />
                  <InfoRow label="Fin abonnement" value={new Date(activeSub.fin_periode).toLocaleDateString('fr-FR')} />
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: 24 }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 16, color: 'var(--ink)', margin: '0 0 16px' }}>Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Prolonger l'essai</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[7, 14, 30, 60].map(d => (
                  <button key={d} onClick={() => setConfirmTrial({ days: d })} style={{
                    flex: 1, padding: '10px 6px', borderRadius: 8, border: '1px solid var(--line)',
                    background: 'var(--surface)', cursor: 'pointer', fontFamily: 'inherit',
                    color: 'var(--ink)', fontSize: 12, fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--ink)' }}
                  >
                    +{d} jours
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setInvoiceModal(true)} style={{
              padding: '10px', borderRadius: 8, border: '1px solid var(--accent)',
              background: 'transparent', color: 'var(--accent)', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent)' }}
            >
              + Créer une facture
            </button>
          </div>
        </div>
      </div>

      {activeSub && (
        <div style={{
          background: '#F0FDF4', border: '1px solid #86efac', borderRadius: 12,
          padding: '16px 20px', marginBottom: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#166534', marginBottom: 2 }}>
              ✅ Abonnement actif
            </div>
            <div style={{ fontSize: 13, color: '#166534' }}>
              299 MAD/mois — du {new Date(activeSub.debut_periode).toLocaleDateString('fr-FR')} au {new Date(activeSub.fin_periode).toLocaleDateString('fr-FR')}
            </div>
          </div>
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: '#dcfce7', color: '#16a34a',
          }}>
            {daysUntil(activeSub.fin_periode)} jours restants
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: 24 }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 16, color: 'var(--ink)', margin: '0 0 14px' }}>
            Abonnements {subscriptions?.length > 0 && <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 400 }}>({subscriptions.length})</span>}
          </h3>
          {(!subscriptions || subscriptions.length === 0) ? (
            <p style={{ color: 'var(--ink-3)', fontSize: 13 }}>Aucun abonnement</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {subscriptions.map(sub => {
                const sc = statutConfig[sub.statut] || { label: sub.statut, color: 'var(--ink-3)', bg: 'var(--surface)' }
                return (
                  <div key={sub.id} style={{
                    fontSize: 13, padding: '10px 12px', borderRadius: 8,
                    background: sub.statut === 'actif' ? '#F0FDF4' : 'var(--surface)',
                    border: sub.statut === 'actif' ? '1px solid #86efac' : '1px solid var(--line)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: sc.color, flexShrink: 0,
                      }} />
                      <div>
                        <span style={{ color: 'var(--ink)', fontWeight: 500 }}>
                          {sub.montant} {sub.devise}/mois
                        </span>
                        <span style={{ color: 'var(--ink-3)', marginLeft: 8 }}>
                          {new Date(sub.debut_periode).toLocaleDateString('fr-FR')} → {new Date(sub.fin_periode).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <span style={{
                      padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: sc.bg, color: sc.color,
                    }}>
                      {sc.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: 24 }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 16, color: 'var(--ink)', margin: '0 0 14px' }}>
            Factures SAAS {invoices?.length > 0 && <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 400 }}>({invoices.length})</span>}
          </h3>
          {(!invoices || invoices.length === 0) ? (
            <p style={{ color: 'var(--ink-3)', fontSize: 13 }}>Aucune facture</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {invoices.map(inv => {
                const sc = statutConfig[inv.statut] || { label: inv.statut, color: 'var(--ink-3)', bg: 'var(--surface)' }
                return (
                  <div key={inv.id} style={{
                    fontSize: 13, padding: '10px 12px', borderRadius: 8,
                    background: 'var(--surface)', border: '1px solid var(--line)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{inv.numero}</span>
                      <span style={{ color: 'var(--ink-2)', marginLeft: 8 }}>{inv.montant} MAD</span>
                      {inv.date_echeance && (
                        <span style={{ color: 'var(--ink-3)', marginLeft: 8, fontSize: 12 }}>
                          Échéance: {new Date(inv.date_echeance).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: sc.bg, color: sc.color,
                      }}>
                        {sc.label}
                      </span>
                      {inv.statut === 'pending' && (
                        <button onClick={() => setConfirmId(inv.id)} style={{
                          padding: '5px 12px', borderRadius: 6, border: 'none',
                          background: 'var(--success)', color: '#fff', cursor: 'pointer',
                          fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
                        }}>
                          Confirmer paiement
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {confirmId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center',
        }}>
          <div style={{
            background: 'var(--card)', borderRadius: 16, border: '1px solid var(--line)',
            padding: 28, maxWidth: 380, width: '90%', textAlign: 'center',
          }}>
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 17, color: 'var(--ink)', margin: '0 0 12px' }}>
              Confirmer le paiement
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 20px' }}>
              Marquer cette facture comme payée et prolonger l'abonnement de 30 jours&nbsp;?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmId(null)} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--line)',
                background: 'var(--surface)', cursor: 'pointer', fontFamily: 'inherit',
                color: 'var(--ink)', fontSize: 13, fontWeight: 500,
              }}>
                Annuler
              </button>
              <button onClick={() => confirmPayment(confirmId)} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                background: 'var(--success)', color: '#fff', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              }}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmTrial && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center',
        }}>
          <div style={{
            background: 'var(--card)', borderRadius: 16, border: '1px solid var(--line)',
            padding: 28, maxWidth: 380, width: '90%', textAlign: 'center',
          }}>
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 17, color: 'var(--ink)', margin: '0 0 12px' }}>
              Prolonger l'essai
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 20px' }}>
              Ajouter {confirmTrial.days} jours à la période d'essai&nbsp;?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmTrial(null)} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--line)',
                background: 'var(--surface)', cursor: 'pointer', fontFamily: 'inherit',
                color: 'var(--ink)', fontSize: 13, fontWeight: 500,
              }}>
                Annuler
              </button>
              <button onClick={() => { doAction('extend-trial', { days: confirmTrial.days }); setConfirmTrial(null) }} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                background: 'var(--accent)', color: '#fff', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              }}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--line)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 16, color: 'var(--ink)', margin: 0 }}>
            Équipe ({utilisateurs.length})
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid var(--line)' }}>
                <th style={{ textAlign: 'left', padding: '10px 20px', fontWeight: 500 }}>Nom</th>
                <th style={{ textAlign: 'left', padding: '10px 20px', fontWeight: 500 }}>Prénom</th>
                <th style={{ textAlign: 'left', padding: '10px 20px', fontWeight: 500 }}>Email</th>
                <th style={{ textAlign: 'left', padding: '10px 20px', fontWeight: 500 }}>Rôle</th>
                <th style={{ textAlign: 'left', padding: '10px 20px', fontWeight: 500 }}>Statut</th>
                <th style={{ textAlign: 'left', padding: '10px 20px', fontWeight: 500 }}>Dernière connexion</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map((u, i) => (
                <tr key={u.id} style={{
                  borderTop: '1px solid var(--line)',
                  background: i % 2 === 0 ? 'transparent' : 'var(--surface)',
                }}>
                  <td style={{ padding: '10px 20px', fontSize: 13, color: 'var(--ink)' }}>{u.nom || '—'}</td>
                  <td style={{ padding: '10px 20px', fontSize: 13, color: 'var(--ink)' }}>{u.prenom || '—'}</td>
                  <td style={{ padding: '10px 20px', fontSize: 13, color: 'var(--ink)' }}>{u.email}</td>
                  <td style={{ padding: '10px 20px', fontSize: 12 }}>
                    <RoleBadge role={u.role} />
                  </td>
                  <td style={{ padding: '10px 20px', fontSize: 13 }}>
                    <span style={{
                      color: u.statut === 'actif' ? '#16a34a' : u.statut === 'inactif' ? '#eab308' : 'var(--ink-3)',
                      fontWeight: 500,
                    }}>
                      {u.statut === 'actif' ? 'Actif' : u.statut === 'inactif' ? 'Inactif' : u.statut}
                    </span>
                  </td>
                  <td style={{ padding: '10px 20px', fontSize: 13, color: 'var(--ink-3)' }}>
                    {u.derniere_connexion ? (
                      <span>{new Date(u.derniere_connexion).toLocaleDateString('fr-FR')}</span>
                    ) : (
                      <span style={{ fontStyle: 'italic' }}>Jamais</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {invoiceModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center',
        }}>
          <div style={{
            background: 'var(--card)', borderRadius: 16, border: '1px solid var(--line)',
            padding: 28, maxWidth: 420, width: '90%',
          }}>
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 17, color: 'var(--ink)', margin: '0 0 18px' }}>
              Créer une facture
            </h3>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Montant (MAD)</label>
              <input type="number" min="0" value={invForm.montant} onChange={e => setInvForm(f => ({...f, montant: parseFloat(e.target.value) || 0}))} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Date d'échéance</label>
              <input type="date" value={invForm.date_echeance} onChange={e => setInvForm(f => ({...f, date_echeance: e.target.value}))} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Notes (optionnel)</label>
              <textarea value={invForm.notes} onChange={e => setInvForm(f => ({...f, notes: e.target.value}))} rows={2} style={{...inputStyle, resize: 'none'}} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setInvoiceModal(false)} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--line)',
                background: 'var(--surface)', cursor: 'pointer', fontFamily: 'inherit',
                color: 'var(--ink)', fontSize: 13, fontWeight: 500,
              }}>
                Annuler
              </button>
              <button disabled={invLoading} onClick={async () => {
                if (!invForm.montant) { toast.warning('Montant requis'); return }
                setInvLoading(true)
                try {
                  await actionMutation.mutateAsync({ _config: { url: `/superadmin/tenants/${id}/invoice`, method: 'post' }, ...invForm })
                  toast.success('Facture créée')
                  setInvoiceModal(false)
                  setInvForm({ montant: 299, date_echeance: '', notes: '' })
                } catch { toast.error('Erreur') }
                setInvLoading(false)
              }} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                background: 'var(--accent)', color: '#fff', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
                opacity: invLoading ? 0.7 : 1,
              }}>
                {invLoading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
      </AnimateIn>
    </Layout>
  )
}

function MiniStat({ icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--card)', borderRadius: 10, border: '1px solid var(--line)',
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}15`, display: 'grid', placeItems: 'center',
        fontSize: 16, flexShrink: 0,
      }}>
        {icon}
      </span>
      <div>
        <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function RoleBadge({ role }) {
  const m = {
    admin_clinique: { label: 'Admin', color: '#6366f1', bg: '#EEF2FF' },
    dentiste: { label: 'Dentiste', color: '#0891b2', bg: '#ECFEFF' },
    secretaire: { label: 'Secrétaire', color: '#d946ef', bg: '#FDF4FF' },
  }
  const r = m[role] || { label: role, color: 'var(--ink-3)', bg: 'var(--surface)' }
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
      background: r.bg, color: r.color,
    }}>
      {r.label}
    </span>
  )
}

const labelStyle = { display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6, fontWeight: 500 }

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8,
  fontSize: 13, background: 'var(--surface)', color: 'var(--ink)', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
}

export default SuperAdminTenantDetail

import DonutLoader from '../../components/DonutLoader'
import Layout from '../../components/Layout'
import api from '../../api'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Area,
} from 'recharts'

const fmt = (n) => n != null ? new Intl.NumberFormat('fr-FR').format(n) : '—'

function useIsWide() {
  const [wide, setWide] = useState(window.innerWidth > 1100)
  useEffect(() => {
    const h = () => setWide(window.innerWidth > 1100)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return wide
}

const DONUT_COLORS = ['#57c8cb', '#f59e0b']

function AdminDashboard() {
  const isMobile = useIsMobile()
  const isWide = useIsWide()
  const [stats, setStats] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [slug, setSlug] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/factures/report').then(r => setStats(r.data)).catch(() => {}),
      api.get('/dashboard').then(r => setDashboard(r.data)).catch(() => {}),
      api.get('/me').then(r => { if (r.data.profile?.slug) setSlug(r.data.profile.slug) }).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const regLink = slug ? `${window.location.origin}/register?slug=${slug}` : null
  const copyLink = () => {
    if (regLink) {
      navigator.clipboard.writeText(regLink)
      toast.success('Lien copié !')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}><DonutLoader /></div>
      </Layout>
    )
  }

  const revenuMensuel = dashboard?.revenu_mensuel || []
  const montantPayee = stats?.montant_payee ?? 0
  const montantAttente = stats?.montant_en_attente ?? 0
  const totalFacture = montantPayee + montantAttente
  const payeePct = totalFacture > 0 ? Math.round((montantPayee / totalFacture) * 100) : 0
  const attentePct = totalFacture > 0 ? Math.round((montantAttente / totalFacture) * 100) : 0

  const rdvCount = dashboard?.rdv_mois ?? 0
  const visitsCount = dashboard?.visites_mois ?? 0
  const conversionPct = rdvCount > 0 ? Math.round((visitsCount / rdvCount) * 100) : 0

  return (
    <Layout>
      {/* ── Header ── */}
      <div style={{
        marginBottom: 32,
        animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 400,
          fontSize: 30,
          color: 'var(--ink)',
          margin: '0 0 2px',
          lineHeight: 1.2,
        }}>
          Revenus
        </h1>
        <p style={{
          color: 'var(--ink-3)',
          fontSize: 14,
          margin: 0,
          fontFamily: "'Inter', sans-serif",
        }}>
          Aperçu financier de votre cabinet
        </p>
      </div>

      {/* ── Top row: 4 stat cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}>
        <BigStatCard
          title="Total payé"
          value={`${fmt(montantPayee)} MAD`}
          subtitle="Toutes factures confondues"
          accent="#10b981"
          delay={0.05}
        />
        <BigStatCard
          title="Revenu du mois"
          value={`${fmt(dashboard?.revenu_mois ?? 0)} MAD`}
          subtitle="Factures payées ce mois-ci"
          accent="#4AB2BB"
          delay={0.1}
        />
        <BigStatCard
          title="En attente"
          value={`${fmt(montantAttente)} MAD`}
          subtitle="Factures non réglées"
          accent="#f59e0b"
          delay={0.15}
        />
        <BigStatCard
          title="Patients"
          value={`${fmt(dashboard?.patients_count)}`}
          subtitle="Patients enregistrés"
          accent="#8b5cf6"
          delay={0.2}
        />
      </div>

      {/* ── X-ray chart + Donut row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : isWide ? '1fr 380px' : '1fr',
        gap: 20,
        marginBottom: 24,
      }}>
        {/* X-ray Revenue Chart */}
        <div style={{
          background: 'var(--xray-bg)',
          borderRadius: 14,
          padding: '24px 20px 12px',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 40%, transparent 50%, rgba(0,0,0,0.3) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            position: 'relative',
            zIndex: 2,
          }}>
            <span style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              fontSize: 15,
              color: '#fff',
              letterSpacing: '-0.01em',
            }}>
              Évolution des revenus
            </span>
            <span style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.3)',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              12 mois
            </span>
          </div>
          <ResponsiveContainer width="100%" height={isWide ? 270 : 230} debounce={100}>
            <LineChart data={revenuMensuel} margin={{ top: 4, right: 8, left: -12, bottom: 4 }}>
              <defs>
                <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#30b0b0" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#30b0b0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="mois"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontFamily: "'Inter', sans-serif" }}
                axisLine={false} tickLine={false} dy={6}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontFamily: "'Inter', sans-serif" }}
                axisLine={false} tickLine={false} dx={-4}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(11,26,46,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(8px)',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 4 }}
                formatter={(v) => [`${fmt(v)} MAD`, 'Revenu']}
                itemStyle={{ color: '#fff', fontWeight: 500 }}
              />
              <Area type="monotone" dataKey="revenu" fill="url(#areaGlow)" stroke="none" pointerEvents="none" />
              <Line
                type="monotone" dataKey="revenu" stroke="#30b0b0" strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#30b0b0', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Donut */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 14,
          border: '1px solid var(--line)',
          padding: isWide ? '24px' : '20px',
          animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: 16,
            color: 'var(--ink)',
            margin: '0 0 16px',
          }}>
            Répartition
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: isWide ? 'row' : 'column',
            alignItems: 'center',
            gap: isWide ? 24 : 16,
          }}>
            <div style={{ width: isMobile ? 120 : 160, height: isMobile ? 120 : 160, flexShrink: 0 }}>
              <svg width={isMobile ? 120 : 160} height={isMobile ? 120 : 160} viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="65" fill="none" stroke={DONUT_COLORS[1]} strokeWidth="20"
                  transform="rotate(-90 80 80)" />
                <circle cx="80" cy="80" r="65" fill="none" stroke={DONUT_COLORS[0]} strokeWidth="20"
                  strokeDasharray={`${2 * Math.PI * 65 * payeePct / 100} ${2 * Math.PI * 65}`}
                  strokeLinecap="butt"
                  transform="rotate(-90 80 80)" />
              </svg>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              flex: 1,
              width: isWide ? 'auto' : '100%',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: DONUT_COLORS[0], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: "'Inter', sans-serif" }}>Payé</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', fontFamily: "'Inter', sans-serif" }}>
                    {fmt(montantPayee)} MAD
                  </div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: DONUT_COLORS[0], fontFamily: "'Inter', sans-serif" }}>
                  {payeePct}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: DONUT_COLORS[1], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: "'Inter', sans-serif" }}>En attente</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', fontFamily: "'Inter', sans-serif" }}>
                    {fmt(montantAttente)} MAD
                  </div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: DONUT_COLORS[1], fontFamily: "'Inter', sans-serif" }}>
                  {attentePct}%
                </span>
              </div>
              <div style={{
                marginTop: 'auto',
                paddingTop: 12,
                borderTop: '1px solid var(--line)',
                fontSize: 12,
                color: 'var(--ink-3)',
                fontFamily: "'Inter', sans-serif",
              }}>
                Total facturé: <strong style={{ color: 'var(--ink)' }}>{fmt(totalFacture)} MAD</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row: conversion + registration ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : (regLink ? '1fr 1fr' : '1fr'),
        gap: 20,
      }}>
        {/* RDV → Visites conversion */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 14,
          border: '1px solid var(--line)',
          padding: isWide ? '20px 24px' : '18px',
          animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.22s both',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          gap: isMobile ? 14 : 28,
        }}>
          <div style={{ width: 110, height: 110, flexShrink: 0 }}>
            <svg width={110} height={110} viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="45" fill="none" stroke="#e5e7eb" strokeWidth="16"
                transform="rotate(-90 55 55)" />
              <circle cx="55" cy="55" r="45" fill="none" stroke="#57c8cb" strokeWidth="16"
                strokeDasharray={`${2 * Math.PI * 45 * conversionPct / 100} ${2 * Math.PI * 45}`}
                strokeLinecap="butt"
                transform="rotate(-90 55 55)" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 15, color: 'var(--ink)', marginBottom: 6 }}>
              Conversion RDV → Visites
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#57c8cb', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: "'Inter', sans-serif" }}>
                  Visites <strong style={{ color: 'var(--ink)' }}>{fmt(dashboard?.visites_mois ?? 0)}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e5e7eb', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: "'Inter', sans-serif" }}>
                  RDV restants <strong style={{ color: 'var(--ink)' }}>{fmt(Math.max(0, (dashboard?.rdv_mois ?? 0) - (dashboard?.visites_mois ?? 0)))}</strong>
                </span>
              </div>
              <span style={{
                padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                background: (dashboard?.rdv_mois ?? 0) > 0 ? '#d1fae5' : '#f3f4f6',
                color: (dashboard?.rdv_mois ?? 0) > 0 ? '#065f46' : '#9ca3af',
                fontFamily: "'Inter', sans-serif",
              }}>
                {rdvCount > 0
                  ? `${conversionPct}% de conversion`
                  : 'Aucun RDV'}
              </span>
            </div>
          </div>
        </div>

        {/* Registration Link */}
        {regLink && (
          <div style={{
            background: 'var(--surface)',
            borderRadius: 14,
            border: '1px solid var(--line)',
            padding: isWide ? '22px 28px' : '18px 20px',
            animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.28s both',
          }}>
            <div style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 400,
              fontSize: 16,
              color: 'var(--ink)',
              marginBottom: 2,
            }}>
              Lien d'inscription
            </div>
            <p style={{
              color: 'var(--ink-3)',
              fontSize: 13,
              margin: '0 0 12px',
              fontFamily: "'Inter', sans-serif",
            }}>
              Partagez ce lien pour que les patients créent leur compte.
            </p>
            <div style={{
              display: 'flex',
              gap: 10,
              alignItems: isMobile ? 'stretch' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
            }}>
              <input
                type="text" readOnly value={regLink}
                style={{
                  flex: 1, padding: '10px 14px', border: '1px solid var(--line)',
                  borderRadius: 10, fontSize: 13, background: 'var(--bg)',
                  color: '#4AB2BB', fontFamily: "'Inter', sans-serif", outline: 'none',
                }}
              />
              <button
                onClick={copyLink}
                style={{
                  padding: '10px 22px', background: '#4AB2BB', color: '#fff',
                  border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Copier
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

function BigStatCard({ title, value, subtitle, accent, delay }) {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 14,
      border: '1px solid var(--line)',
      padding: '22px 24px 20px',
      position: 'relative',
      overflow: 'hidden',
      animation: `slideUp 0.45s cubic-bezier(0.16,1,0.3,1) ${delay}s both`,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: accent, borderRadius: '14px 14px 0 0',
      }} />
      <div style={{
        fontSize: 11, color: 'var(--ink-3)', fontFamily: "'Inter', sans-serif",
        fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: "'Fraunces', serif", fontWeight: 400,
        fontSize: 28, lineHeight: 1.1, color: accent, marginBottom: 6,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 12, color: 'var(--ink-3)', fontFamily: "'Inter', sans-serif",
      }}>
        {subtitle}
      </div>
    </div>
  )
}

export default AdminDashboard

import DonutLoader from '../../components/DonutLoader'
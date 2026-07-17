import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useIsMobile } from '../hooks/useIsMobile'
import { getEcho, disconnectEcho } from '../echo'

const IcoBell = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const IcoCheck = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const typeColor = (type) => {
  if (type === 'rdv_confirme')       return { bg: 'var(--accent-soft)',   dot: '#4AB2BB' }
  if (type === 'rdv_rejete')         return { bg: 'var(--rose-soft)',     dot: 'var(--rose)' }
  if (type === 'paiement_recu')      return { bg: 'var(--success-soft)',  dot: 'var(--success)' }
  if (type === 'rdv_demande')        return { bg: 'var(--amber-soft)',    dot: '#8d6a2b' }
  if (type === 'facture_en_attente') return { bg: 'var(--amber-soft)',    dot: '#d97706' }
  if (type === 'visite_complete')    return { bg: 'var(--accent-soft)',   dot: '#4AB2BB' }
  if (type === 'ordonnance_disponible') return { bg: 'var(--accent-soft)', dot: '#6366f1' }
  if (type === 'nouveau_patient')    return { bg: 'var(--success-soft)',  dot: '#10b981' }
  if (type === 'rappel_visite')      return { bg: 'var(--accent-soft)',   dot: '#4AB2BB' }
  if (type === 'nouveau_rdv_dentiste') return { bg: 'var(--amber-soft)',  dot: '#8d6a2b' }
  return { bg: 'var(--surface)', dot: 'var(--ink-3)' }
}

const fmtTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60)   return "À l'instant"
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400)return `Il y a ${Math.floor(diff / 3600)} h`
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

export default memo(function NotificationBell({ user }) {
  const [notifs, setNotifs]   = useState([])
  const [open, setOpen]       = useState(false)
  const ref                   = useRef(null)
  const isMobile              = useIsMobile()
  const navigate             = useNavigate()

  const handleClick = (n) => {
    if (!n.lu) markRead(n.id)
    let path = null
    switch (n.type) {
      case 'rdv_confirme':
      case 'rdv_rejete':
        if (user?.role === 'PATIENT') path = '/patient/rendez-vous'
        break
      case 'rdv_demande':
        if (user?.role === 'SECRETAIRE' || user?.role === 'ADMIN_CLINIQUE') path = '/secretaire/rendez-vous'
        break
      case 'paiement_recu':
      case 'facture_en_attente':
        if (user?.role === 'PATIENT') path = '/patient/factures'
        break
      case 'facture_saas':
        if (user?.role === 'ADMIN_CLINIQUE') path = '/admin/facturation'
        break
      case 'visite_complete':
        if (user?.role === 'PATIENT') path = '/patient/visites'
        break
      case 'ordonnance_disponible':
        if (user?.role === 'PATIENT') path = '/patient/ordonnances'
        break
      case 'nouveau_patient':
        if (user?.role === 'SECRETAIRE' || user?.role === 'ADMIN_CLINIQUE') path = '/secretaire/patients'
        break
      case 'rappel_visite':
        if (user?.role === 'PATIENT') path = '/patient/rendez-vous'
        break
      case 'nouveau_rdv_dentiste':
        if (user?.role === 'DENTISTE') path = '/dentiste/agenda'
        break
    }
    if (path) { setOpen(false); navigate(path) }
  }

  const unread = notifs.filter(n => !n.lu).length

  const fetchNotifs = useCallback(() => {
    api.get('/notifications').then(res => {
      const data = res.data
      setNotifs(Array.isArray(data) ? data : (data?.data || []))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    fetchNotifs()

    if (!user?.id) return

    const echo = getEcho()
    if (!echo) return

    let channel
    try {
      channel = echo.private(`notifications.${user.id}`)
      channel.listen('.NewNotification', (e) => {
        setNotifs(prev => [e.notification, ...prev])
      })
    } catch {}

    return () => {
      if (channel) {
        try {
          channel.stopListening('.NewNotification')
          echo.leave(`notifications.${user.id}`)
        } catch {}
      }
    }
  }, [user?.id, fetchNotifs])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markRead = (id) => {
    api.patch(`/notifications/${id}/read`).then(() => {
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n))
    }).catch(() => {})
  }

  const markAllRead = () => {
    api.patch('/notifications/read-all').then(() => {
      setNotifs(prev => prev.map(n => ({ ...n, lu: true })))
    }).catch(() => {})
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => { if (!o) fetchNotifs(); return !o })}
        style={{
          position: 'relative',
          width: '36px', height: '36px',
          borderRadius: '10px',
          border: '1px solid var(--line)',
          background: open ? 'var(--accent-soft)' : 'var(--card)',
          color: open ? '#4AB2BB' : 'var(--ink-2)',
          cursor: 'pointer',
          display: 'grid', placeItems: 'center',
          transition: 'all 0.15s',
        }}
      >
        <IcoBell />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '4px', right: '4px',
            width: '16px', height: '16px',
            borderRadius: '50%',
            background: 'var(--rose, #e53e3e)',
            color: '#fff',
            fontSize: '9px', fontWeight: '700',
            display: 'grid', placeItems: 'center',
            lineHeight: 1,
            border: '1.5px solid var(--bg)',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={isMobile ? {
          position: 'fixed', top: '58px', left: '8px', right: '8px',
          maxHeight: '60dvh',
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          zIndex: 200,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        } : {
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: '360px', maxHeight: '480px',
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          zIndex: 200,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: '500', fontSize: '15px', color: 'var(--ink)', flex: 1 }}>
              Notifications
            </span>
            {unread > 0 && (
              <span style={{ fontSize: '11.5px', color: 'var(--ink-3)' }}>
                {unread} non lue{unread > 1 ? 's' : ''}
              </span>
            )}
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#4AB2BB', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '6px', fontFamily: 'inherit' }}
              >
                <IcoCheck /> Tout lire
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--ink-3)', margin: '0 auto 12px' }}>
                  <IcoBell />
                </div>
                <p style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: '15px', color: 'var(--ink)' }}>Aucune notification</p>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--ink-3)' }}>Vous êtes à jour.</p>
              </div>
            ) : notifs.map((n, i) => {
              const c = typeColor(n.type)
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    display: 'flex', gap: '12px',
                    padding: '13px 18px',
                    borderBottom: i < notifs.length - 1 ? '1px solid var(--line)' : 'none',
                    background: n.lu ? 'transparent' : 'var(--accent-soft)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.lu ? 'transparent' : 'var(--accent-soft)'}
                >
                  {/* Dot */}
                  <div style={{ paddingTop: '3px', flexShrink: 0 }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: n.lu ? 'var(--line)' : c.dot,
                      marginTop: '3px',
                    }} />
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 3px', fontSize: '13.5px', fontWeight: n.lu ? '400' : '500', color: 'var(--ink)', lineHeight: 1.4 }}>
                      {n.titre}
                    </p>
                    <p style={{ margin: '0 0 5px', fontSize: '12.5px', color: 'var(--ink-2)', lineHeight: 1.5 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '11px', color: 'var(--ink-3)' }}>
                      {fmtTime(n.created_at)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
})

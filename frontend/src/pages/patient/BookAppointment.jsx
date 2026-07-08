import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import { useIsMobile } from '../../hooks/useIsMobile'
import api from '../../api'
import DonutLoader from '../../components/DonutLoader'
import AnimateIn from '../../components/AnimateIn'

const DAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']
const DAY_KEYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

function BookAppointment() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const today = new Date()
  const toLocalDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [raison, setRaison] = useState('')
  const [loading, setLoading] = useState(false)
  const [freeSlots, setFreeSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [horaires, setHoraires] = useState(null)
  const [fraisVisite, setFraisVisite] = useState(null)

  // Fetch horaires + frais_visite once on mount
  useEffect(() => {
    const todayStr = toLocalDateStr(new Date())
    api.get(`/rendez-vous/available-slots?date=${todayStr}`)
      .then(res => {
        setHoraires(res.data.horaires)
        setFraisVisite(res.data.frais_visite)
      })
      .catch(() => {})
  }, [])

  // Fetch available slots when selected date changes
  useEffect(() => {
    if (!selectedDate) return
    setSelectedSlot(null)
    const dateStr = toLocalDateStr(selectedDate)
    setLoadingSlots(true)
    api.get(`/rendez-vous/available-slots?date=${dateStr}`)
      .then(res => {
        setHoraires(res.data.horaires || horaires)
        setFraisVisite(res.data.frais_visite)
        setFreeSlots(res.data.slots || [])
      })
      .catch(() => setFreeSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [selectedDate])

  // ─── Vérifier si un jour est actif dans les horaires ───
  const isDayActive = (date) => {
    if (!horaires) return date.getDay() !== 0
    const dayKey = DAY_KEYS[date.getDay()]
    return horaires[dayKey]?.actif ?? true
  }

  // ─── Génerer les jours du mois ───
  const getDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    const startOffset = firstDay === 0 ? 6 : firstDay - 1

    const days = []
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, current: false, past: true })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const closed = !isDayActive(date)
      days.push({ day: i, current: true, past: isPast || closed, date })
    }
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, current: false, past: true })
    }
    return days
  }

  const isSelected = (d) => {
    if (!d.date || !selectedDate) return false
    return d.date.toDateString() === selectedDate.toDateString()
  }

  const isToday = (d) => {
    if (!d.date) return false
    return d.date.toDateString() === today.toDateString()
  }

  const formatDate = (date) => {
    if (!date) return ''
    return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
  }

  const handleSubmit = async () => {
    if (!selectedSlot) { toast.warning('Choisissez un créneau'); return }
    try {
      setLoading(true)
      const dateStr = toLocalDateStr(selectedDate)
      await api.post('/rendez-vous', {
        date: dateStr,
        heure: selectedSlot,
        raison,
      })
      toast.success('Rendez-vous soumis — En attente de confirmation')
      navigate('/patient/rendez-vous')
    } catch {
      // global interceptor handles toast
    } finally {
      setLoading(false)
    }
  }

  const days = getDays()

  return (
    <Layout>
      <AnimateIn>
        {/* Titre */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: '400', fontSize: '32px', letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 6px' }}>
            Réserver un <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>rendez-vous</em>
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: '14px', margin: 0 }}>
            Choisissez une date et un créneau disponible
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', gap: isMobile ? '16px' : '24px', alignItems: 'start' }}>

          {/* ─── Calendrier ─── */}
          <div style={styles.card}>

            {/* Header calendrier */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: '500', fontSize: '18px', color: 'var(--ink)' }}>
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  style={styles.calNav}
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                >
                  ‹
                </button>
                <button
                  style={styles.calNav}
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                >
                  ›
                </button>
              </div>
            </div>

            {/* Jours de la semaine */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '10.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', padding: '8px 0' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Grille des jours */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {days.map((d, i) => (
                <div
                  key={i}
                  onClick={() => !d.past && d.current && setSelectedDate(d.date)}
                  style={{
                    aspectRatio: '1',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '13px',
                    borderRadius: '8px',
                    cursor: d.past || !d.current ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    color: isSelected(d) ? '#fff' : d.past || !d.current ? 'var(--ink-3)' : 'var(--ink)',
                    background: isSelected(d) ? 'var(--accent)' : 'transparent',
                    opacity: d.past || !d.current ? 0.35 : 1,
                    border: isToday(d) && !isSelected(d) ? '1px dashed var(--accent)' : 'none',
                    fontWeight: isToday(d) ? '600' : '400',
                    transition: 'all 0.1s',
                  }}
                >
                  {d.day}
                  {/* Point créneaux disponibles */}
                  {d.current && !d.past && (
                    <span style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: isSelected(d) ? '#fff' : 'var(--accent)',
                    }}/>
                  )}
                </div>
              ))}
            </div>

            {/* Légende */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--line)' }}>
              <span style={{ fontSize: '12px', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}/>
                Créneaux disponibles
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
                · {horaires ? Object.entries(horaires).filter(([_,v]) => !v.actif).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(', ') + ' fermé' : 'Dimanche fermé'}
              </span>
            </div>
          </div>

          {/* ─── Créneaux + Notes ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.card}>

              {/* Date sélectionnée */}
              <div style={{ marginBottom: '16px' }}>
                <b style={{ fontFamily: "'Inter', sans-serif", fontWeight: '500', fontSize: '18px', display: 'block', color: 'var(--ink)' }}>
                  {formatDate(selectedDate)}
                </b>
                <small style={{ color: 'var(--ink-3)', fontSize: '12.5px' }}>Choisissez un créneau disponible</small>
                {fraisVisite !== null && (
                  <div style={{ marginTop: 8, fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
                    Frais de visite : <strong>{fraisVisite} MAD</strong>
                  </div>
                )}
              </div>

              {/* Créneaux dynamiques */}
              {loadingSlots ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
                  <DonutLoader />
                </div>
              ) : (() => {
                const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`
                const nowTime = `${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}`
                const isToday = toLocalDateStr(selectedDate) === todayStr
                const pastSlots = isToday ? freeSlots.filter(s => s <= nowTime) : []
                const morning = freeSlots.filter(s => parseInt(s) < 12)
                const afternoon = freeSlots.filter(s => parseInt(s) >= 12)
                return (
                  <>
                    <div style={{ marginBottom: '14px' }}>
                      <div style={styles.slotLabel}>Matin</div>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '8px' }}>
                        {morning.length > 0 ? morning.map(slot => {
                          const passe = pastSlots.includes(slot)
                          return (
                            <button key={slot} disabled={passe} onClick={() => !passe && setSelectedSlot(slot)} style={{
                              ...styles.slot,
                              ...(selectedSlot === slot && !passe ? styles.slotSelected : {}),
                              ...(passe ? styles.slotTaken : {}),
                            }}>
                              {slot}
                            </button>
                          )
                        }) : (
                          <span style={{ fontSize: 12, color: 'var(--ink-3)', gridColumn: '1 / -1', padding: '14px 0', textAlign: 'center' }}>Aucun créneau le matin</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div style={styles.slotLabel}>Après-midi</div>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '8px' }}>
                        {afternoon.length > 0 ? afternoon.map(slot => {
                          const passe = pastSlots.includes(slot)
                          return (
                            <button key={slot} disabled={passe} onClick={() => !passe && setSelectedSlot(slot)} style={{
                              ...styles.slot,
                              ...(selectedSlot === slot && !passe ? styles.slotSelected : {}),
                              ...(passe ? styles.slotTaken : {}),
                            }}>
                              {slot}
                            </button>
                          )
                        }) : (
                          <span style={{ fontSize: 12, color: 'var(--ink-3)', gridColumn: '1 / -1', padding: '14px 0', textAlign: 'center' }}>Aucun créneau l'après-midi</span>
                        )}
                      </div>
                    </div>
                  </>
                )
              })()}

              <div style={{ marginTop: '16px' }}>
                <label style={styles.slotLabel}>Motif de la visite (optionnel)</label>
                <textarea
                  placeholder="Ex. douleur sur la molaire inférieure droite, contrôle annuel..."
                  value={raison}
                  onChange={e => setRaison(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    border: '1px solid var(--line)',
                    borderRadius: '10px',
                    padding: '11px 12px',
                    fontSize: '13.5px',
                    background: 'var(--surface)',
                    resize: 'none',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    color: 'var(--ink)',
                    marginTop: '6px',
                  }}
                />
              </div>

              {/* Bouton confirmer */}
              {selectedSlot && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '13.5px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {loading ? 'Envoi...' : `✓ Confirmer — ${formatDate(selectedDate)} à ${selectedSlot}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </AnimateIn>
    </Layout>
  )
}

const styles = {
  card: {
    background: 'var(--card)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '22px',
  },
  calNav: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    border: '1px solid var(--line)',
    background: 'var(--card)',
    color: 'var(--ink-2)',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'grid',
    placeItems: 'center',
  },
  slotLabel: {
    fontSize: '10.5px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--ink-3)',
    marginBottom: '8px',
    display: 'block',
  },
  slot: {
    padding: '10px 0',
    border: '1px solid var(--line)',
    borderRadius: '8px',
    fontSize: '12.5px',
    textAlign: 'center',
    cursor: 'pointer',
    background: 'var(--card)',
    fontFamily: '"Inter", sans-serif',
    color: 'var(--ink-2)',
    transition: 'all 0.1s',
  },
  slotSelected: {
    background: 'var(--accent)',
    color: '#fff',
    borderColor: 'var(--accent)',
  },
  slotTaken: {
    background: 'var(--surface)',
    color: 'var(--ink-3)',
    textDecoration: 'line-through',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
}

export default BookAppointment
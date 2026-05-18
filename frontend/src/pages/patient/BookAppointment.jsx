import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import { useIsMobile } from '../../hooks/useIsMobile'
import api from '../../api'

const DAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

const SLOTS_MATIN = ['09:00','09:30','10:00','10:30','11:00','11:30']
const SLOTS_APREM = ['14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']
const ALL_SLOTS = [...SLOTS_MATIN, ...SLOTS_APREM]

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
  const [takenSlots, setTakenSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    if (!selectedDate) return
    setSelectedSlot(null)
    const dateStr = toLocalDateStr(selectedDate)
    setLoadingSlots(true)
    api.get(`/rendez-vous/available-slots?date=${dateStr}`)
      .then(res => {
        const available = res.data.slots || []
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
        const nowTime = `${String(today.getHours()).padStart(2,'0')}:${String(today.getMinutes()).padStart(2,'0')}`
        const isToday = dateStr === todayStr
        setTakenSlots(ALL_SLOTS.filter(s => !available.includes(s) || (isToday && s <= nowTime)))
      })
      .catch(() => setTakenSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [selectedDate])

  // ─── Génerer les jours du mois ───
  const getDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    const startOffset = firstDay === 0 ? 6 : firstDay - 1

    const days = []
    // Jours du mois précédent
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, current: false, past: true })
    }
    // Jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const isSunday = date.getDay() === 0
      days.push({ day: i, current: true, past: isPast || isSunday, date })
    }
    // Compléter avec jours du mois suivant
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
      <div>
        {/* Titre */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: '400', fontSize: '32px', letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 6px' }}>
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
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: '500', fontSize: '18px', color: 'var(--ink)' }}>
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
              <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>· Dimanche fermé</span>
            </div>
          </div>

          {/* ─── Créneaux + Notes ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.card}>

              {/* Date sélectionnée */}
              <div style={{ marginBottom: '16px' }}>
                <b style={{ fontFamily: "'Fraunces', serif", fontWeight: '500', fontSize: '18px', display: 'block', color: 'var(--ink)' }}>
                  {formatDate(selectedDate)}
                </b>
                <small style={{ color: 'var(--ink-3)', fontSize: '12.5px' }}>Choisissez un créneau disponible</small>
              </div>

              {/* Matin */}
              <div style={{ marginBottom: '14px' }}>
                <div style={styles.slotLabel}>Matin</div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '8px' }}>
                  {SLOTS_MATIN.map(slot => {
                    const taken = takenSlots.includes(slot)
                    const selected = selectedSlot === slot
                    return (
                      <button
                        key={slot}
                        disabled={taken}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          ...styles.slot,
                          ...(selected ? styles.slotSelected : {}),
                          ...(taken ? styles.slotTaken : {}),
                        }}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Après-midi */}
              <div>
                <div style={styles.slotLabel}>Après-midi</div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '8px' }}>
                  {SLOTS_APREM.map(slot => {
                    const taken = takenSlots.includes(slot)
                    const selected = selectedSlot === slot
                    return (
                      <button
                        key={slot}
                        disabled={taken}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          ...styles.slot,
                          ...(selected ? styles.slotSelected : {}),
                          ...(taken ? styles.slotTaken : {}),
                        }}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              {loadingSlots && (
                <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '8px' }}>
                  Chargement des créneaux…
                </p>
              )}

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
      </div>
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
    fontFamily: '"Geist Mono", monospace',
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
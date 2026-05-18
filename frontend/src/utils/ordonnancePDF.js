import jsPDF from 'jspdf'

const MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']

const fmtDate = (dateStr) => {
  if (!dateStr) return '—'
  const [y, m, d] = String(dateStr).split('-')
  const dt = new Date(+y, +m - 1, +d)
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`
}

const loadImage = (src) => {
  const img = new Image()
  img.src = src
  return new Promise(r => { img.onload = () => r(img); img.onerror = () => r(null) })
}

export async function generateOrdonnancePDF(p, patientName = '—') {
  const [logoCircle, logoWater] = await Promise.all([
    loadImage('/HZLogo-Border.png'),
    loadImage('/HZLogo.png'),
  ])

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210

  // ── Header: circle logo ──
  if (logoCircle) doc.addImage(logoCircle, 'PNG', 12, 8, 28, 28)

  // "HZ Dentaire"
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(15, 72, 66)
  doc.text('HZ Dentaire', 46, 22)

  // "Cabinet Dentaire"
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(13)
  doc.setTextColor(80, 105, 100)
  doc.text('Cabinet Dentaire', 46, 31)

  // Teal divider
  doc.setDrawColor(15, 72, 66)
  doc.setLineWidth(0.6)
  doc.line(12, 41, W - 12, 41)

  // ── Watermark ──
  if (logoWater) {
    try {
      doc.saveGraphicsState()
      doc.setGState(new doc.GState({ opacity: 0.07 }))
      doc.addImage(logoWater, 'PNG', 55, 105, 100, 100)
      doc.restoreGraphicsState()
    } catch (_) {}
  }

  // ── Fields ──
  const LX = 15      // label x
  const VX = 58      // value x
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

  field('Ordonnance',    `RX-${String(p.id).padStart(4, '0')}`)
  field("Patient's Name", patientName)
  field('Date',          fmtDate(p.date_delivrance))
  if (p.instructions_generales) field('Instructions', p.instructions_generales)

  // ── Médicaments ──
  y += 2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(15, 72, 66)
  doc.text('Médicaments:', LX, y)
  y += 11

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(25, 25, 25)
  ;(p.medicaments || []).forEach(m => {
    const nom = m.medicament?.nom || m.nom || '—'
    const parts = [m.frequence, m.duree_jours ? `${m.duree_jours} jours` : null].filter(Boolean)
    const detail = parts.length ? `  (${parts.join(' · ')})` : ''
    doc.text(`•  ${nom}${detail}`, LX + 4, y)
    y += 8
    if (m.instructions_speciales) {
      doc.setTextColor(100)
      doc.text(`    ${m.instructions_speciales}`, LX + 8, y)
      doc.setTextColor(25, 25, 25)
      y += 7
    }
  })

  // ── Signature ──
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

  doc.save(`ordonnance-RX-${String(p.id).padStart(4, '0')}.pdf`)
}

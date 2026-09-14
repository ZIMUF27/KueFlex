'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Calendar, Clock, FileText, Loader2, Stethoscope } from 'lucide-react'

export default function PatientBookingForm({ initialDoctorId = '' }) {
  const router = useRouter()
  const { data: session } = useSession()

  const doctorId = initialDoctorId || ''
  const patientId = session?.user?.id

  const [doctor, setDoctor] = useState(null)
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: '',
    purpose: '',
  })

  useEffect(() => {
    async function loadDoctor() {
      if (!doctorId) {
        setDoctor(null)
        setLoadingDoctors(false)
        return
      }

      try {
        const res = await fetch('/api/doctors')
        if (!res.ok) {
          setBookingError('ไม่สามารถโหลดข้อมูลแพทย์ได้')
          return
        }
        const doctors = await res.json()
        const found = doctors.find(d => d.id === doctorId)
        setDoctor(found || null)
      } catch (e) {
        setBookingError('เกิดข้อผิดพลาดในการโหลดข้อมูลแพทย์')
      } finally {
        setLoadingDoctors(false)
      }
    }

    loadDoctor()
  }, [doctorId])

  const selectedDoctorName = useMemo(() => doctor?.name || 'แพทย์ที่เลือก', [doctor])

  async function loadSlots(date) {
    if (!doctorId || !date) return

    setLoadingSlots(true)
    setBookingError('')

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getSlots', doctorId, date }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setBookingError(data.error || 'ไม่สามารถโหลดช่วงเวลาว่างได้')
        setSlots([])
        return
      }

      const data = await res.json()
      setSlots(data)
      setForm(cur => ({ ...cur, time: data.find(s => s.available)?.time || '' }))
    } catch (e) {
      setBookingError('เกิดข้อผิดพลาดในการโหลดช่วงเวลาว่าง')
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  useEffect(() => {
    if (doctorId) loadSlots(form.date)
  }, [doctorId, form.date])

  async function handleSubmit(e) {
    e.preventDefault()

    if (!doctorId || !patientId) {
      setBookingError('กรุณาเข้าสู่ระบบก่อนทำการจอง')
      return
    }

    if (!form.date || !form.time || !form.purpose.trim()) {
      setBookingError('กรุณากรอกวันที่ เวลา และวัตถุประสงค์การจองให้ครบถ้วน')
      return
    }

    setSubmitting(true)
    setBookingError('')
    setBookingSuccess('')

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId,
          date: form.date,
          time: form.time,
          purpose: form.purpose.trim(),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setBookingError(data.error || 'ไม่สามารถจองนัดได้')
        return
      }

      setBookingSuccess('จองนัดสำเร็จแล้ว')
      setTimeout(() => router.push('/patient/appointments'), 900)
    } catch (e) {
      setBookingError('เกิดข้อผิดพลาดในการจองนัด')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-[70vh]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="text-sm font-semibold text-cyan-700 uppercase tracking-wide">KueFlex</div>
          <h1 className="text-3xl font-bold text-slate-900 mt-1">จองนัดหมาย</h1>
        </div>

        {bookingError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {bookingError}
          </div>
        )}

        {bookingSuccess && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {bookingSuccess}
          </div>
        )}

        {!doctorId && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            กรุณาเลือกแพทย์ก่อนทำการจอง
          </div>
        )}

        {loadingDoctors ? (
          <div className="flex items-center py-10 text-slate-600">
            <Loader2 className="animate-spin mr-2" size={20} />
            กำลังโหลดแพทย์...
          </div>
        ) : doctor ? (
          <div className="grid lg:grid-cols-[1fr_420px] gap-6">
            <section className="rounded-3xl bg-white shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                  <Stethoscope size={28} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">แพทย์ที่เลือก</div>
                  <div className="text-2xl font-bold text-slate-900">{doctor.name}</div>
                  <div className="text-sm text-cyan-700 font-semibold">{doctor.specialty || 'แพทย์ทั่วไป'}</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Calendar size={16} /> วันที่
                    </span>
                    <input
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-cyan-400"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Clock size={16} /> เวลาที่ต้องการ
                    </span>
                    <div className="mt-2">
                      {loadingSlots ? (
                        <div className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-500">
                          <Loader2 className="animate-spin inline mr-2" size={16} /> กำลังโหลดเวลา...
                        </div>
                      ) : (
                        <select
                          value={form.time}
                          onChange={(e) => setForm({ ...form, time: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-cyan-400"
                          required
                        >
                          <option value="">เลือกเวลา</option>
                          {slots.length > 0 && slots.map((slot) => (
                            <option key={slot.time} value={slot.time} disabled={!slot.available}>
                              {slot.time} {slot.available ? 'ว่าง' : 'เต็ม'}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </label>
                </div>

                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <FileText size={16} /> วัตถุประสงค์การเข้าพบ
                  </span>
                  <textarea
                    rows="4"
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="อธิบายอาการหรือวัตถุประสงค์"
                    required
                  />
                </label>

                <div className="flex items-center gap-3 pt-3">
                  <button type="submit" disabled={submitting || loadingSlots} className="rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold px-6 py-3 disabled:opacity-60">
                    {submitting ? <><Loader2 size={16} className="animate-spin mr-2 inline" /> กำลังยืนยัน...</> : 'ยืนยันการจองนัด'}
                  </button>
                  <button type="button" onClick={() => router.push('/patient/booking/select-doctor')} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">
                    เลือกแพทย์ใหม่
                  </button>
                </div>
              </form>
            </section>

            <aside className="rounded-3xl bg-slate-900 text-white p-6 h-fit">
              <div className="text-sm uppercase tracking-wide text-cyan-300">สรุปการจอง</div>
              <div className="mt-4">
                <div className="text-xs text-slate-400">แพทย์</div>
                <div className="text-lg font-bold">{selectedDoctorName}</div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-slate-400">วันที่</div>
                <div className="text-lg font-bold">{form.date || '—'}</div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-slate-400">เวลา</div>
                <div className="text-lg font-bold">{form.time || '—'}</div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-slate-400">ผู้ป่วย</div>
                <div className="text-lg font-bold">{session?.user?.name || 'ผู้ป่วย'}</div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            ไม่พบแพทย์ที่เลือก กรุณาเลือกแพทย์ใหม่
          </div>
        )}
      </div>
    </main>
  )
}

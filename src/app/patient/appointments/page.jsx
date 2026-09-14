'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Calendar, Clock, Stethoscope, Loader2, XCircle } from 'lucide-react'

export default function PatientAppointmentsPage() {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelingId, setCancelingId] = useState('')
  const [cancelNote, setCancelNote] = useState('')
  const [busyId, setBusyId] = useState('')

  async function loadAppointments() {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/appointments?patientId=${session.user.id}`)
      if (!res.ok) {
        setError('ไม่สามารถโหลดรายการนัดหมายได้')
        return
      }
      const data = await res.json()
      setAppointments(data)
      setCancelingId('')
      setCancelNote('')
    } catch (e) {
      setError('เกิดข้อผิดพลาดในการโหลดรายการนัดหมาย')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [session?.user?.id])

  async function cancelAppointment(id) {
    const note = (cancelNote || '').trim()
    if (!note) {
      setError('กรุณากรอกหมายเหตุเพื่อยกเลิกการนัด')
      return
    }

    try {
      setBusyId(id)
      setError('')

      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'CANCELLED', notes: note }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'ไม่สามารถยกเลิกการนัดได้')
        return
      }

      await loadAppointments()
    } catch (e) {
      setError('เกิดข้อผิดพลาดในการยกเลิกการนัด')
    } finally {
      setBusyId('')
    }
  }

  return (
    <main className="min-h-[70vh]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm font-semibold text-cyan-700 uppercase tracking-wide">KueFlex</div>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">นัดหมายของฉัน</h1>
          </div>
          <Link href="/patient/booking/select-doctor" className="rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-semibold px-5 py-2.5">
            + จองนัดใหม่
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-600">
            <Loader2 className="animate-spin mr-2" size={22} />
            กำลังโหลดรายการนัดหมาย...
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            ยังไม่มีรายการนัดหมาย
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{item.doctor?.name || 'แพทย์'}</div>
                      <div className="text-sm text-cyan-700 font-semibold">{item.doctor?.specialty || 'แพทย์ทั่วไป'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase text-slate-700">
                      {item.status}
                    </div>
                    {(item.status || '').toUpperCase() !== 'CANCELLED' && (
                      <button
                        className="rounded-xl border border-red-300 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                        disabled={busyId === item.id}
                        onClick={() => {
                          setCancelingId(item.id)
                          setCancelNote('')
                          setError('')
                        }}
                      >
                        <span className="inline-flex items-center gap-1"><XCircle size={14} /> ยกเลิก</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><Calendar size={16} /> {new Date(item.date).toLocaleDateString('th-TH')}</div>
                  <div className="flex items-center gap-2"><Clock size={16} /> {item.time}</div>
                  <div className="flex items-center gap-2"><FileTextIcon /> {item.purpose}</div>
                </div>

                {item.notes && (
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span className="font-bold text-slate-800">หมายเหตุ:</span> {item.notes}
                  </div>
                )}

                {cancelingId === item.id && (
                  <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <div className="text-sm font-bold text-red-700 mb-2">แนบหมายเหตุเพื่อยกเลิกการนัด</div>
                    <textarea
                      value={cancelNote}
                      onChange={(e) => setCancelNote(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-red-200 p-3 text-sm outline-none focus:border-red-400"
                      placeholder="เช่น ข้อความติดธุระ/ไม่สะดวกเข้ารับบริการ"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => cancelAppointment(item.id)}
                        disabled={busyId === item.id}
                        className="rounded-xl bg-red-600 text-white px-4 py-2 text-sm font-bold hover:bg-red-700 disabled:opacity-60"
                      >
                        {busyId === item.id ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิก'}
                      </button>
                      <button
                        onClick={() => {
                          setCancelingId('')
                          setCancelNote('')
                          setError('')
                        }}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function FileTextIcon() {
  return <span className="inline-flex items-center">📄</span>
}

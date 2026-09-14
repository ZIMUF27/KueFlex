'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Calendar, Clock, Stethoscope, Loader2 } from 'lucide-react'

export default function PatientAppointmentsPage() {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
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
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดรายการนัดหมาย')
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [session])

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{item.doctor?.name || 'แพทย์'}</div>
                      <div className="text-sm text-cyan-700 font-semibold">{item.doctor?.specialty || 'แพทย์ทั่วไป'}</div>
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase text-slate-700">
                    {item.status}
                  </div>
                </div>
                <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><Calendar size={16} /> {new Date(item.date).toLocaleDateString('th-TH')}</div>
                  <div className="flex items-center gap-2"><Clock size={16} /> {item.time}</div>
                  <div className="flex items-center gap-2"><FileTextIcon /> {item.purpose}</div>
                </div>
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

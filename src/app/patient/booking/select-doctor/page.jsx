'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stethoscope, CalendarCheck, ArrowRight, Loader2 } from 'lucide-react'

export default function PatientSelectDoctorPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await fetch('/api/doctors')
        if (!res.ok) {
          setError('ไม่สามารถโหลดรายชื่อแพทย์ได้')
          return
        }
        const data = await res.json()
        setDoctors(data)
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดรายชื่อแพทย์')
      } finally {
        setLoading(false)
      }
    }

    loadDoctors()
  }, [])

  return (
    <main className="min-h-[70vh]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm font-semibold text-cyan-700 uppercase tracking-wide">KueFlex</div>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">เลือกแพทย์เพื่อจองนัด</h1>
          </div>
          <button onClick={() => router.push('/patient/dashboard')} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50">
            กลับหน้าหลัก
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-600">
            <Loader2 className="animate-spin mr-2" size={22} />
            กำลังโหลดรายชื่อแพทย์...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                    <Stethoscope size={30} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{doctor.name}</h2>
                        <div className="text-sm text-cyan-700 font-semibold">{doctor.specialty || 'แพทย์ทั่วไป'}</div>
                      </div>
                      <CalendarCheck className="text-emerald-600" size={22} />
                    </div>

                    <div className="mt-4 space-y-1 text-sm text-slate-600">
                      <div>✉️ {doctor.email}</div>
                      <div>☎️ {doctor.phone || '—'}</div>
                      <div>ใบอนุญาต: {doctor.license || '—'}</div>
                    </div>

                    <button
                      onClick={() => router.push(`/patient/booking/form?doctorId=${doctor.id}`)}
                      className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-semibold px-4 py-2.5 transition"
                    >
                      เลือกแพทย์นี้ <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

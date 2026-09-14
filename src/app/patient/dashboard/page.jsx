'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarCheck,
  Clock3,
  FileText,
  HeartPulse,
  Loader2,
  PlusCircle,
  Stethoscope,
} from 'lucide-react'

export default function PatientDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.id) {
      setError('กรุณาเข้าสู่ระบบก่อนใช้งาน')
      setLoading(false)
      return
    }

    async function loadAppointments() {
      try {
        const res = await fetch(`/api/appointments?patientId=${session.user.id}`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error || 'ไม่สามารถโหลดนัดหมายได้')
          return
        }

        const data = await res.json()
        setAppointments(data)
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลนัดหมาย')
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [session?.user?.id, status])

  const nextAppointment = useMemo(() => {
    const future = appointments
      .filter(apt => apt.status !== 'CANCELLED')
      .filter(apt => new Date(`${apt.date}T${apt.time}:00`) >= new Date())
      .sort((a, b) => new Date(`${a.date}T${a.time}:00`) - new Date(`${b.date}T${b.time}:00`))[0]

    return future || null
  }, [appointments])

  const appointmentCount = appointments.length
  const totalActive = appointments.filter(a => a.status && a.status !== 'CANCELLED').length

  return (
    <main className="min-h-[70vh]">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="bg-gradient-to-r from-cyan-700 to-sky-800 rounded-3xl text-white p-8 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-100 text-sm font-semibold uppercase tracking-wide">
                <HeartPulse size={18} /> KueFlex Patient Care
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight">Welcome to KueFlex Patient Dashboard</h1>
              <p className="mt-2 text-cyan-50/90 text-lg">
                {session?.user?.name ? `สวัสดี, ${session.user.name}` : 'สวัสดี คุณผู้ป่วย'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/patient/booking/select-doctor')}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-cyan-800 hover:bg-cyan-50 transition"
              >
                <PlusCircle size={18} /> จองนัดใหม่
              </button>
              <button
                onClick={() => router.push('/patient/appointments')}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/60 px-5 py-3 font-bold text-white hover:bg-white/10 transition"
              >
                <CalendarCheck size={18} /> นัดหมายของฉัน
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid md:grid-cols-3 gap-4">
          <StatCard icon={<CalendarCheck size={24} />} label="นัดหมายทั้งหมด" value={String(appointmentCount)} tone="cyan" />
          <StatCard icon={<Clock3 size={24} />} label="นัดที่กำลังรอ" value={String(totalActive)} tone="amber" />
          <StatCard icon={<Stethoscope size={24} />} label="แพทย์ติดตาม" value={String(new Set(appointments.map(a => a.doctor?.id)).size || 0)} tone="emerald" />
        </section>

        <section className="grid xl:grid-cols-[1.3fr_0.7fr] gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">นัดหมายลำดับถัดไป</div>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  {nextAppointment ? `${nextAppointment.doctor?.name || 'แพทย์'} • ${nextAppointment.date}` : 'ยังไม่มีนัดหมาย'}
                </h2>
              </div>
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                <CalendarCheck size={26} />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-slate-500 mt-8">
                <Loader2 className="animate-spin" size={20} /> กำลังโหลดนัดหมาย...
              </div>
            ) : nextAppointment ? (
              <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">แพทย์</div>
                    <div className="mt-1 text-lg font-black text-slate-900">{nextAppointment.doctor?.name}</div>
                    <div className="text-sm text-cyan-700 font-semibold">{nextAppointment.doctor?.specialty || 'แพทย์ทั่วไป'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">เวลา</div>
                    <div className="mt-1 text-lg font-black text-slate-900">{nextAppointment.date} • {nextAppointment.time}</div>
                    <div className="text-sm text-slate-500">{nextAppointment.status}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FileText size={16} /> {nextAppointment.purpose || 'การตรวจสุขภาพ'}
                  </div>
                  <button onClick={() => router.push('/patient/appointments')} className="inline-flex items-center gap-2 text-cyan-700 font-bold hover:text-cyan-900">
                    ดูทั้งหมด <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <CalendarCheck className="text-cyan-700" size={36} />
                  <h3 className="mt-3 text-lg font-black text-slate-900">ไม่มีนัดหมายในระบบ</h3>
                  <p className="text-sm text-slate-500 mt-1">เริ่มต้นวางแผนการเข้ารับบริการของคุณได้เลย</p>
                  <button onClick={() => router.push('/patient/booking/select-doctor')} className="mt-4 rounded-xl bg-cyan-700 px-5 py-2.5 font-bold text-white hover:bg-cyan-800">
                    จองนัดแรก
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">บริการ</div>
                <h2 className="text-2xl font-black text-slate-900 mt-2">บริการหลัก</h2>
              </div>
              <Bell className="text-cyan-700" size={24} />
            </div>

            <div className="mt-6 space-y-3">
              <ServiceButton icon={<CalendarCheck size={18} />} label="จองนัดหมาย" subtitle="เลือกแพทย์และช่วงเวลา" onClick={() => router.push('/patient/booking/select-doctor')} />
              <ServiceButton icon={<FileText size={18} />} label="ประวัติการเข้ารับบริการ" subtitle="ดูนัดหมายของคุณ" onClick={() => router.push('/patient/appointments')} />
              <ServiceButton icon={<Stethoscope size={18} />} label="ข้อมูลแพทย์" subtitle="เลือกแพทย์ที่ต้องการ" onClick={() => router.push('/patient/booking/select-doctor')} />
            </div>
          </aside>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">ประวัตินัดหมายล่าสุด</div>
              <h2 className="text-2xl font-black text-slate-900 mt-2">รายการนัดหมาย</h2>
            </div>
            <button onClick={() => router.push('/patient/appointments')} className="text-sm font-bold text-cyan-700 hover:text-cyan-900">
              ดูทั้งหมด
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="mt-5 text-slate-500 text-sm">ยังไม่มีประวัตินัดหมาย</div>
          ) : (
            <div className="mt-5 space-y-3">
              {appointments.slice(0, 4).map(apt => (
                <div key={apt.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <div className="font-black text-slate-900">{apt.doctor?.name || 'แพทย์'}</div>
                    <div className="text-sm text-slate-500">{apt.date} • {apt.time}</div>
                  </div>
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800">{apt.status || 'PENDING'}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function StatCard({ icon, label, value, tone }) {
  const toneMap = {
    cyan: 'from-cyan-50 to-cyan-100 text-cyan-700 border-cyan-100',
    amber: 'from-amber-50 to-amber-100 text-amber-700 border-amber-100',
    emerald: 'from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-100',
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-gradient-to-br p-3 border border-white shadow-sm text-cyan-700">
          {icon}
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-slate-900">{value}</div>
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  )
}

function ServiceButton({ icon, label, subtitle, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 hover:bg-cyan-50 transition">
      <span className="flex items-center gap-3">
        <span className="rounded-xl bg-white p-2 text-cyan-700 shadow-sm">{icon}</span>
        <span className="text-left">
          <span className="block font-black text-slate-900">{label}</span>
          <span className="block text-xs text-slate-500">{subtitle}</span>
        </span>
      </span>
      <ArrowRight size={16} className="text-slate-400" />
    </button>
  )
}

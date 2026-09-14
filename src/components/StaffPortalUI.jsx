'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarCheck,
  Calendar,
  Clock3,
  FileText,
  HeartPulse,
  Loader2,
  PlusCircle,
  Stethoscope,
  UserRound,
  Users,
  ClipboardList,
  ListChecks,
  BadgeCheck,
  BriefcaseBusiness,
  XCircle,
  UserCircle,
  Shield,
  UserPlus,
} from 'lucide-react'

export default function StaffPortalUI({ view = 'dashboard' }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.id) {
      setError('กรุณาเข้าสู่ระบบก่อนใช้งาน')
      setLoading(false)
      return
    }

    async function loadData() {
      try {
        setLoading(true)
        const [appointmentsRes, doctorsRes, schedulesRes] = await Promise.all([
          fetch('/api/appointments'),
          fetch('/api/doctors'),
          fetch('/api/schedules'),
        ])

        if (!appointmentsRes.ok || !doctorsRes.ok || !schedulesRes.ok) {
          const msg = 'ไม่สามารถโหลดข้อมูลเจ้าหน้าที่ได้'
          setError(msg)
          return
        }

        const appts = await appointmentsRes.json()
        const docList = await doctorsRes.json()
        const schedList = await schedulesRes.json()

        setAppointments(appts.filter(apt => apt.patient?.active !== false && apt.doctor?.active !== false))
        setDoctors(docList)
        setSchedules(schedList)
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลเจ้าหน้าที่')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [session?.user?.id, status])

  const doctorCount = doctors.length
  const patientCount = new Set(appointments.map(a => a.patient?.id).filter(Boolean)).size
  const appointmentCount = appointments.length
  const pendingCount = appointments.filter(a => (a.status || '').toUpperCase() === 'PENDING').length

  if (view === 'dashboard') {
    return (
      <main className="min-h-[70vh]">
        <div className="max-w-6xl mx-auto space-y-6">
          <section className="bg-gradient-to-r from-cyan-700 to-sky-800 rounded-3xl text-white p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-cyan-100 text-sm font-semibold uppercase tracking-wide">
                  <HeartPulse size={18} /> KueFlex Staff Portal
                </div>
                <h1 className="mt-3 text-4xl font-black tracking-tight">Staff Dashboard</h1>
                <p className="mt-2 text-cyan-50/90 text-lg">{session?.user?.name ? `สวัสดี, ${session.user.name}` : 'Welcome to KueFlex Staff Dashboard.'}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => router.push('/staff/appointments')} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-cyan-800 hover:bg-cyan-50 transition">
                  <CalendarCheck size={18} /> จัดการนัดหมาย
                </button>
                <button onClick={() => router.push('/staff/doctors')} className="inline-flex items-center gap-2 rounded-2xl border border-white/60 px-5 py-3 font-bold text-white hover:bg-white/10 transition">
                  <Stethoscope size={18} /> ข้อมูลแพทย์
                </button>
              </div>
            </div>
          </section>

          {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <section className="grid md:grid-cols-4 gap-4">
            <StatCard icon={<CalendarCheck size={24} />} label="นัดหมายทั้งหมด" value={String(appointmentCount)} tone="cyan" />
            <StatCard icon={<Users size={24} />} label="คนไข้รวม" value={String(patientCount)} tone="emerald" />
            <StatCard icon={<Stethoscope size={24} />} label="แพทย์รวม" value={String(doctorCount)} tone="violet" />
            <StatCard icon={<Clock3 size={24} />} label="รออนุมัติ" value={String(pendingCount)} tone="amber" />
          </section>

          <section className="grid xl:grid-cols-[1.3fr_0.7fr] gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">นัดหมายล่าสุด</div>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">รายการนัดหมายเชื่อมแพทย์-ผู้ป่วย</h2>
                </div>
                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><CalendarCheck size={26} /></div>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-slate-500 mt-8"><Loader2 className="animate-spin" size={20} /> กำลังโหลดข้อมูล...</div>
              ) : appointments.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">ยังไม่มีนัดหมาย</div>
              ) : (
                <div className="mt-6 grid gap-3">
                  {appointments.slice(0, 5).map(apt => (
                    <div key={apt.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                      <div>
                        <div className="font-black text-slate-900">{apt.patient?.name || 'ผู้ป่วย'} → {apt.doctor?.name || 'แพทย์'}</div>
                        <div className="text-sm text-slate-500">{apt.date} • {apt.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-cyan-700">{apt.status}</div>
                        <div className="text-sm text-slate-500">{apt.doctor?.specialty || 'แพทย์ทั่วไป'}</div>
                      </div>
                    </div>
                  ))}
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
                <ServiceButton icon={<CalendarCheck size={18} />} label="จัดการนัดหมาย" subtitle="อัปเดตสถานะคนไข้-แพทย์" onClick={() => router.push('/staff/appointments')} />
                <ServiceButton icon={<Calendar size={18} />} label="ตารางแพทย์" subtitle="ตารางผังการทำงานของแพทย์" onClick={() => router.push('/staff/doctor-schedules')} />
                <ServiceButton icon={<Stethoscope size={18} />} label="ข้อมูลแพทย์" subtitle="ผ่านชื่อและความเชี่ยวชาญแพทย์" onClick={() => router.push('/staff/doctors')} />
              </div>
            </aside>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">แพทย์และตาราง</div>
                <h2 className="text-2xl font-black text-slate-900 mt-2">รายการแพทย์</h2>
              </div>
              <button onClick={() => router.push('/staff/doctors')} className="text-sm font-bold text-cyan-700 hover:text-cyan-900">ดูทั้งหมด</button>
            </div>
            <div className="mt-6 grid gap-3">
              {doctors.slice(0, 5).map(doc => (
                <div key={doc.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div><div className="font-black text-slate-900">{doc.name}</div><div className="text-sm text-slate-500">{doc.specialty || 'แพทย์ทั่วไป'}</div></div>
                  <div className="text-sm font-bold text-cyan-700">{doc.active ? 'Active' : 'Inactive'}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (view === 'appointments') {
    return (
      <main className="min-h-[70vh]">
        <div className="max-w-6xl mx-auto">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Staff Appointments</div>
                <h1 className="text-3xl font-black text-slate-900 mt-2">จัดการนัดหมาย</h1>
              </div>
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><ClipboardList size={28} /></div>
            </div>

            {loading ? (
              <div className="mt-8 flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin" size={20} /> กำลังโหลดนัดหมาย...</div>
            ) : error ? (
              <div className="mt-8 text-red-600">{error}</div>
            ) : (
              <div className="mt-6 grid gap-3">
                {appointments.length === 0 ? <div className="text-slate-500">ยังไม่มีนัดหมาย</div> : appointments.map(apt => (
                  <div key={apt.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <div>
                      <div className="font-black text-slate-900">{apt.patient?.name || 'ผู้ป่วย'} • {apt.doctor?.name || 'แพทย์'}</div>
                      <div className="text-sm text-slate-500">{apt.date} • {apt.time} • {apt.purpose || 'ตรวจรักษา'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-cyan-700">{apt.status || 'PENDING'}</div>
                      <div className="text-sm text-slate-500">{apt.doctor?.specialty || 'แพทย์ทั่วไป'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    )
  }

  if (view === 'doctor-schedules') {
    return (
      <main className="min-h-[70vh]">
        <div className="max-w-6xl mx-auto">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Staff Doctor Schedules</div>
                <h1 className="text-3xl font-black text-slate-900 mt-2">ตารางแพทย์</h1>
              </div>
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><Calendar size={28} /></div>
            </div>

            {loading ? (
              <div className="mt-8 flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin" size={20} /> กำลังโหลดตาราง...</div>
            ) : (
              <div className="mt-6 grid gap-3">
                {schedules.length === 0 ? <div className="text-slate-500">ยังไม่มีตารางแพทย์</div> : schedules.map(sch => (
                  <div key={sch.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <div>
                      <div className="font-black text-slate-900">{sch.doctor?.name || 'แพทย์'}</div>
                      <div className="text-sm text-slate-500">{sch.day} • {sch.startTime} - {sch.endTime}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-cyan-700">{sch.maxSlots || 6} slots</div>
                      <div className="text-sm text-slate-500">{sch.doctor?.specialty || 'แพทย์ทั่วไป'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    )
  }

  if (view === 'doctors') {
    return (
      <main className="min-h-[70vh]">
        <div className="max-w-6xl mx-auto">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Staff Doctors</div>
                <h1 className="text-3xl font-black text-slate-900 mt-2">ข้อมูลแพทย์</h1>
              </div>
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><Stethoscope size={28} /></div>
            </div>

            {loading ? (
              <div className="mt-8 flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin" size={20} /> กำลังโหลดข้อมูลแพทย์...</div>
            ) : (
              <div className="mt-6 grid gap-3">
                {doctors.length === 0 ? <div className="text-slate-500">ยังไม่มีข้อมูลแพทย์</div> : doctors.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-cyan-100 p-3 text-cyan-700"><UserRound size={22} /></div>
                      <div>
                        <div className="font-black text-slate-900">{doc.name}</div>
                        <div className="text-sm text-slate-500">{doc.specialty || 'แพทย์ทั่วไป'} • {doc.license || 'ไม่ระบุใบอนุญาต'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-cyan-700">{doc.phone || 'ไม่มีเบอร์โทร'}</div>
                      <div className="text-sm text-slate-500">{doc.active ? 'Active' : 'Inactive'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    )
  }

  return null
}

function StatCard({ icon, label, value, tone }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-gradient-to-br p-3 border border-white shadow-sm text-cyan-700">{icon}</div>
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

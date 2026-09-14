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
} from 'lucide-react'

export default function DoctorPortalUI({ view = 'dashboard' }) {
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
        const res = await fetch(`/api/appointments?doctorId=${session.user.id}`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error || 'ไม่สามารถโหลดนัดหมายได้')
          return
        }

        const data = await res.json()
        setAppointments(data.filter(apt => apt.doctor?.active !== false && apt.patient?.active !== false))
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลนัดหมาย')
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [session?.user?.id, status])

  const doctorName = session?.user?.name || 'แพทย์'
  const nextAppointment = useMemo(() => {
    const future = appointments
      .filter(apt => apt.status && apt.status !== 'CANCELLED')
      .filter(apt => new Date(`${apt.date}T${apt.time}:00`) >= new Date())
      .sort((a, b) => new Date(`${a.date}T${a.time}:00`) - new Date(`${b.date}T${b.time}:00`))[0]

    return future || null
  }, [appointments])

  const patientCount = new Set(appointments.map(a => a.patient?.id).filter(Boolean)).size
  const activeCount = appointments.filter(apt => apt.status && apt.status !== 'CANCELLED').length

  if (view === 'dashboard') {
    return (
      <main className="min-h-[70vh]">
        <div className="max-w-6xl mx-auto space-y-6">
          <section className="bg-gradient-to-r from-cyan-700 to-sky-800 rounded-3xl text-white p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-cyan-100 text-sm font-semibold uppercase tracking-wide">
                  <HeartPulse size={18} /> KueFlex Doctor Care
                </div>
                <h1 className="mt-3 text-4xl font-black tracking-tight">Welcome to KueFlex Doctor Dashboard</h1>
                <p className="mt-2 text-cyan-50/90 text-lg">{doctorName ? `สวัสดี, ${doctorName}` : 'สวัสดี คุณแพทย์'}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => router.push('/doctor/calendar')} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-cyan-800 hover:bg-cyan-50 transition">
                  <CalendarCheck size={18} /> ปฏิทินนัดหมาย
                </button>
                <button onClick={() => router.push('/doctor/patients')} className="inline-flex items-center gap-2 rounded-2xl border border-white/60 px-5 py-3 font-bold text-white hover:bg-white/10 transition">
                  <Users size={18} /> ผู้ป่วยของฉัน
                </button>
              </div>
            </div>
          </section>

          {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <section className="grid md:grid-cols-4 gap-4">
            <StatCard icon={<CalendarCheck size={24} />} label="นัดหมายทั้งหมด" value={String(appointments.length)} tone="cyan" />
            <StatCard icon={<Users size={24} />} label="คนไข้ติดตาม" value={String(patientCount)} tone="emerald" />
            <StatCard icon={<Clock3 size={24} />} label="นัดที่กำลังดำเนินการ" value={String(activeCount)} tone="amber" />
            <StatCard icon={<Stethoscope size={24} />} label="สถานะแพทย์" value="Active" tone="violet" />
          </section>

          <section className="grid xl:grid-cols-[1.3fr_0.7fr] gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">นัดหมายลำดับถัดไป</div>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">{nextAppointment ? `${nextAppointment.patient?.name || 'ผู้ป่วย'} • ${nextAppointment.date}` : 'ยังไม่มีนัดหมาย'}</h2>
                </div>
                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><CalendarCheck size={26} /></div>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-slate-500 mt-8"><Loader2 className="animate-spin" size={20} /> กำลังโหลดนัดหมาย...</div>
              ) : nextAppointment ? (
                <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">ผู้ป่วย</div>
                      <div className="mt-1 text-lg font-black text-slate-900">{nextAppointment.patient?.name}</div>
                      <div className="text-sm text-cyan-700 font-semibold">{nextAppointment.patient?.phone || 'ไม่มีเบอร์โทร'}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">เวลา</div>
                      <div className="mt-1 text-lg font-black text-slate-900">{nextAppointment.date} • {nextAppointment.time}</div>
                      <div className="text-sm text-slate-500">{nextAppointment.status}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600"><FileText size={16} /> {nextAppointment.purpose || 'การตรวจสุขภาพ'}</div>
                    <button onClick={() => router.push('/doctor/patients')} className="inline-flex items-center gap-2 text-cyan-700 font-bold hover:text-cyan-900">ดูผู้ป่วย <ArrowRight size={16} /></button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <CalendarCheck className="text-cyan-700" size={36} />
                    <h3 className="mt-3 text-lg font-black text-slate-900">ยังไม่มีนัดหมาย</h3>
                    <p className="text-sm text-slate-500 mt-1">ระบบจะเริ่มแสดงวันนัดและรายชื่อผู้ป่วยตามวันที่</p>
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
                <ServiceButton icon={<CalendarCheck size={18} />} label="ปฏิทินนัดหมาย" subtitle="ดูตารางวันตรวจของคุณ" onClick={() => router.push('/doctor/calendar')} />
                <ServiceButton icon={<Users size={18} />} label="ข้อมูลผู้ป่วย" subtitle="ดูรายชื่อคนไข้ที่ได้รับมอบหมาย" onClick={() => router.push('/doctor/patients')} />
                <ServiceButton icon={<ClipboardList size={18} />} label="ภาระงาน" subtitle="สรุปงานและภาระผลงาน" onClick={() => router.push('/doctor/workload')} />
              </div>
            </aside>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">ประวัตินัดหมายล่าสุด</div>
                <h2 className="text-2xl font-black text-slate-900 mt-2">รายการนัดหมาย</h2>
              </div>
              <button onClick={() => router.push('/doctor/calendar')} className="text-sm font-bold text-cyan-700 hover:text-cyan-900">ดูทั้งหมด</button>
            </div>

            {appointments.length === 0 ? (
              <div className="mt-5 text-slate-500 text-sm">ยังไม่มีประวัตินัดหมาย</div>
            ) : (
              <div className="mt-5 space-y-3">
                {appointments.slice(0, 6).map(apt => (
                  <div key={apt.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div>
                      <div className="font-black text-slate-900">{apt.patient?.name || 'ผู้ป่วย'}</div>
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

  if (view === 'calendar') {
    return (
      <main className="min-h-[70vh]">
        <div className="max-w-6xl mx-auto">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Doctor Calendar</div>
                <h1 className="text-3xl font-black text-slate-900 mt-2">ปฏิทินนัดหมายแพทย์</h1>
              </div>
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><Calendar size={28} /></div>
            </div>

            {loading ? (<div className="mt-6 flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin" size={20} /> กำลังโหลดปฏิทิน...</div>) : error ? (<div className="mt-6 text-red-600">{error}</div>) : (
              <div className="mt-6 grid gap-3">
                {appointments.length === 0 ? <div className="text-slate-500">ยังไม่มีนัดหมาย</div> : appointments.map(apt => (
                  <div key={apt.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <div>
                      <div className="font-black text-slate-900">{apt.patient?.name || 'ผู้ป่วย'}</div>
                      <div className="text-sm text-slate-500">{apt.date} • {apt.time}</div>
                      {(apt.status || '').toUpperCase() === 'CANCELLED' && apt.notes && (
                        <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                          หมายเหตุยกเลิก: {apt.notes}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-cyan-700">{apt.status}</div>
                      <div className="text-sm text-slate-500">{apt.purpose}</div>
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

  if (view === 'schedule') {
    return (
      <main className="min-h-[70vh]">
        <div className="max-w-6xl mx-auto">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Doctor Schedule</div>
                <h1 className="text-3xl font-black text-slate-900 mt-2">ตารางปฏิบัติงานแพทย์</h1>
              </div>
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><Clock3 size={28} /></div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <ScheduleCard title="วันจันทร์" time="08:00 - 16:00" />
              <ScheduleCard title="วันอังคาร" time="08:00 - 16:00" />
              <ScheduleCard title="วันพุธ" time="09:00 - 17:00" />
              <ScheduleCard title="วันพฤหัสบดี" time="08:00 - 16:00" />
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (view === 'patients') {
    return (
      <main className="min-h-[70vh]">
        <div className="max-w-6xl mx-auto">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Doctor Patients</div>
                <h1 className="text-3xl font-black text-slate-900 mt-2">ข้อมูลผู้ป่วยของแพทย์</h1>
              </div>
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><Users size={28} /></div>
            </div>

            {loading ? (
              <div className="mt-6 flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin" size={20} /> กำลังโหลดข้อมูลผู้ป่วย...</div>
            ) : (
              <div className="mt-6 grid gap-3">
                {appointments.length === 0 ? <div className="text-slate-500">ยังไม่มีผู้ป่วยที่เชื่อมกับแพทย์</div> : appointments.map(apt => (
                  <div key={apt.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-cyan-100 p-3 text-cyan-700"><UserRound size={22} /></div>
                      <div>
                        <div className="font-black text-slate-900">{apt.patient?.name}</div>
                        <div className="text-sm text-slate-500">{apt.patient?.email || 'ไม่ระบุอีเมล'} • {apt.patient?.phone || 'ไม่ระบุเบอร์'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-cyan-700">{apt.date}</div>
                      <div className="text-sm text-slate-500">{apt.status}</div>
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

  if (view === 'workload') {
    return (
      <main className="min-h-[70vh]">
        <div className="max-w-6xl mx-auto">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Doctor Workload</div>
                <h1 className="text-3xl font-black text-slate-900 mt-2">ภาระงานแพทย์</h1>
              </div>
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><BriefcaseBusiness size={28} /></div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <MetricCard label="นัดหมายทั้งหมด" value={String(appointments.length)} icon={<CalendarCheck size={20} />} />
              <MetricCard label="คนไข้ที่ดูแล" value={String(patientCount)} icon={<Users size={20} />} />
              <MetricCard label="ภาระงาน" value={`${Math.min(100, Math.max(10, appointments.length * 12))}%`} icon={<ListChecks size={20} />} />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wide">สรุปของวันนี้</div>
                  <div className="text-xl font-black text-slate-900 mt-1">{appointments.length} นัดหมาย</div>
                </div>
                <div className="w-40 h-3 rounded-full bg-cyan-100">
                  <div className="h-3 rounded-full bg-cyan-700" style={{ width: `${Math.min(100, appointments.length * 12)}%` }} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (view === 'profile') {
    return (
      <main className="min-h-[70vh]">
        <div className="max-w-4xl mx-auto">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Doctor Profile</div>
                <h1 className="text-3xl font-black text-slate-900 mt-2">ประวัติส่วนตัวแพทย์</h1>
              </div>
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><UserCircle size={28} /></div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-cyan-700 text-white w-16 h-16 flex items-center justify-center text-2xl font-black">{doctorName?.charAt(0) || 'D'}</div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{doctorName}</div>
                  <div className="text-sm text-cyan-700 font-bold">{session?.user?.specialty || 'แพทย์ทั่วไป'}</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <ProfileRow label="อีเมล" value={session?.user?.email || 'ไม่ระบุ'} />
                <ProfileRow label="เบอร์โทร" value={session?.user?.phone || 'ไม่ระบุ'} />
                <ProfileRow label="เลขวุฒิบัตร" value={session?.user?.license || 'ไม่ระบุ'} />
                <ProfileRow label="สถานะการใช้งาน" value={appointmentCountIsValid(appointments) ? 'Active' : 'Inactive'} />
              </div>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return null
}

function appointmentCountIsValid(appointments) {
  return appointments.length >= 0
}

function StatCard({ icon, label, value, tone }) {
  const toneMap = {
    cyan: 'from-cyan-50 to-cyan-100 text-cyan-700 border-cyan-100',
    amber: 'from-amber-50 to-amber-100 text-amber-700 border-amber-100',
    emerald: 'from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-100',
    violet: 'from-violet-50 to-violet-100 text-violet-700 border-violet-100',
  }

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

function ScheduleCard({ title, time }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-black text-slate-900">{title}</div>
          <div className="text-sm text-slate-500">{time}</div>
        </div>
        <Clock3 size={20} className="text-cyan-700" />
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center justify-between">
        <div className="text-slate-500 font-bold text-sm uppercase tracking-wide">{label}</div>
        <span className="text-cyan-700">{icon}</span>
      </div>
      <div className="text-3xl font-black text-slate-900 mt-3">{value}</div>
    </div>
  )
}

function ProfileRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-sm font-black text-slate-900 mt-1">{value}</div>
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

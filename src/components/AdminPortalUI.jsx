'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Activity,
  ArrowRight,
  Bell,
  Calendar,
  CalendarCheck,
  Clock3,
  ClipboardList,
  FileText,
  HeartPulse,
  Loader2,
  Shield,
  Stethoscope,
  UserRound,
  Users,
  UserPlus,
  Settings,
  BarChart3,
  BadgeCheck,
  UserCircle,
  BriefcaseBusiness,
  XCircle,
} from 'lucide-react'

export default function AdminPortalUI({ view = 'dashboard' }) {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [appointments, setAppointments] = useState([])
  const [users, setUsers] = useState([])
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

    async function loadAdminData() {
      try {
        setLoading(true)
        const [appointmentsRes, usersRes, doctorsRes, schedulesRes] = await Promise.all([
          fetch('/api/appointments'),
          fetch('/api/users'),
          fetch('/api/doctors'),
          fetch('/api/schedules'),
        ])

        if (!appointmentsRes.ok || !usersRes.ok || !doctorsRes.ok || !schedulesRes.ok) {
          setError('ไม่สามารถโหลดข้อมูลผู้ดูแลระบบได้')
          return
        }

        const appts = await appointmentsRes.json()
        const userList = await usersRes.json()
        const docList = await doctorsRes.json()
        const schedList = await schedulesRes.json()

        setAppointments(appts.filter(apt => apt.patient?.active !== false && apt.doctor?.active !== false))
        setUsers(userList)
        setDoctors(docList)
        setSchedules(schedList)
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ดูแลระบบ')
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [session?.user?.id, status])

  const patientCount = new Set(appointments.map(a => a.patient?.id).filter(Boolean)).size
  const totalPatients = new Set(users.filter(u => u.role === 'PATIENT').map(u => u.id)).size
  const totalDoctors = doctors.length
  const appointmentCount = appointments.length
  const pendingCount = appointments.filter(a => (a.status || '').toUpperCase() === 'PENDING').length
  const cancelledCount = appointments.filter(a => (a.status || '').toUpperCase() === 'CANCELLED').length

  const adminOverview = useMemo(() => {
    return {
      appointmentsTotal: appointments.length,
      patientsTotal: totalPatients,
      doctorsTotal: totalDoctors,
      schedulesTotal: schedules.length,
      pendingAppointments: pendingCount,
      cancelledAppointments: cancelledCount,
    }
  }, [appointments, totalPatients, totalDoctors, schedules, pendingCount, cancelledCount])

  if (view === 'dashboard') {
    return (
      <main className="min-h-[70vh]">
        <div className="max-w-6xl mx-auto space-y-6">
          <section className="bg-gradient-to-r from-cyan-700 to-sky-800 rounded-3xl text-white p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-cyan-100 text-sm font-semibold uppercase tracking-wide">
                  <HeartPulse size={18} /> KueFlex Admin Portal
                </div>
                <h1 className="mt-3 text-4xl font-black tracking-tight">Admin Dashboard</h1>
                <p className="mt-2 text-cyan-50/90 text-lg">{session?.user?.name ? `สวัสดี, ${session.user.name}` : 'Welcome to KueFlex Admin Dashboard.'}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => router.push('/admin/users')} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-cyan-800 hover:bg-cyan-50 transition">
                  <Users size={18} /> จัดการผู้ใช้
                </button>
                <button onClick={() => router.push('/admin/reports')} className="inline-flex items-center gap-2 rounded-2xl border border-white/60 px-5 py-3 font-bold text-white hover:bg-white/10 transition">
                  <BarChart3 size={18} /> รายงาน
                </button>
              </div>
            </div>
          </section>

          {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <section className="grid md:grid-cols-5 gap-4">
            <StatCard icon={<CalendarCheck size={24} />} label="นัดหมายทั้งหมด" value={String(adminOverview.appointmentsTotal)} tone="cyan" />
            <StatCard icon={<Users size={24} />} label="คนไข้รวม" value={String(adminOverview.patientsTotal)} tone="emerald" />
            <StatCard icon={<Stethoscope size={24} />} label="แพทย์รวม" value={String(adminOverview.doctorsTotal)} tone="violet" />
            <StatCard icon={<ClipboardList size={24} />} label="รออนุมัติ" value={String(adminOverview.pendingAppointments)} tone="amber" />
            <StatCard icon={<Calendar size={24} />} label="ตารางแพทย์" value={String(adminOverview.schedulesTotal)} tone="slate" />
          </section>

          <section className="grid xl:grid-cols-[1.3fr_0.7fr] gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">นัดหมายล่าสุด</div>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">รายการนัดหมายเชื่อมคนไข้-แพทย์</h2>
                </div>
                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><CalendarCheck size={26} /></div>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-slate-500 mt-8"><Loader2 className="animate-spin" size={20} /> กำลังโหลดข้อมูล...</div>
              ) : appointments.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">ยังไม่มีนัดหมาย</div>
              ) : (
                <div className="mt-6 grid gap-3">
                  {appointments.slice(0, 6).map(apt => (
                    <div key={apt.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                      <div>
                        <div className="font-black text-slate-900">{apt.patient?.name || 'ผู้ป่วย'} → {apt.doctor?.name || 'แพทย์'}</div>
                        <div className="text-sm text-slate-500">{apt.date} • {apt.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-cyan-700">{apt.status || 'PENDING'}</div>
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
                <ServiceButton icon={<Users size={18} />} label="จัดการผู้ใช้" subtitle="จัดการคนไข้ แพทย์ เจ้าหน้าที่ และผู้ดูแลระบบ" onClick={() => router.push('/admin/users')} />
                <ServiceButton icon={<Shield size={18} />} label="สิทธิ์การใช้งาน" subtitle="กำหนดบทบาทและสิทธิ์ของผู้ใช้งาน" onClick={() => router.push('/admin/permissions')} />
                <ServiceButton icon={<Settings size={18} />} label="ตั้งค่าระบบ" subtitle="ตั้งค่าระบบและการจัดการข้อมูล" onClick={() => router.push('/admin/system-settings')} />
                <ServiceButton icon={<BarChart3 size={18} />} label="รายงาน" subtitle="รายงานภาพรวมผู้ป่วยและแพทย์" onClick={() => router.push('/admin/reports')} />
              </div>
            </aside>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">ระบบผู้ใช้</div>
                <h2 className="text-2xl font-black text-slate-900 mt-2">จัดการบทบาท</h2>
              </div>
              <button onClick={() => router.push('/admin/users')} className="text-sm font-bold text-cyan-700 hover:text-cyan-900">ดูทั้งหมด</button>
            </div>
            <div className="mt-6 grid gap-3">
              {users.slice(0, 6).map(user => (
                <div key={user.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <div className="font-black text-slate-900">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.email} • {user.role}</div>
                  </div>
                  <div className="text-sm font-bold text-cyan-700">{user.active ? 'Active' : 'Inactive'}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (view === 'users') {
    return (
      <main className="min-h-[70vh]">
        <div className="max-w-6xl mx-auto">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Admin Users</div>
                <h1 className="text-3xl font-black text-slate-900 mt-2">จัดการผู้ใช้</h1>
              </div>
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><Users size={28} /></div>
            </div>

            {loading ? (
              <div className="mt-8 flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin" size={20} /> กำลังโหลดผู้ใช้...</div>
            ) : error ? (
              <div className="mt-8 text-red-600">{error}</div>
            ) : (
              <div className="mt-6 grid gap-3">
                {users.length === 0 ? <div className="text-slate-500">ยังไม่มีผู้ใช้</div> : users.map(user => (
                  <div key={user.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <div>
                      <div className="font-black text-slate-900">{user.name}</div>
                      <div className="text-sm text-slate-500">{user.email} • {user.phone || 'ไม่มีเบอร์โทร'} • {user.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-cyan-700">{user.role}</div>
                      <div className="text-sm text-slate-500">{user.active ? 'Active' : 'Inactive'}</div>
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

  if (view === 'permissions') {
    return (
      <main className="min-h-[70vh]">
        <div className="max-w-6xl mx-auto">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Admin Permissions</div>
                <h1 className="text-3xl font-black text-slate-900 mt-2">สิทธิ์การใช้งาน</h1>
              </div>
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><Shield size={28} /></div>
            </div>

            {loading ? (
              <div className="mt-8 flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin" size={20} /> กำลังโหลดสิทธิ์...</div>
            ) : (
              <div className="mt-6 grid gap-3">
                {['PATIENT', 'DOCTOR', 'STAFF', 'ADMIN'].map(role => {
                  const roleUsers = users.filter(u => u.role === role)
                  return (
                    <div key={role} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-black text-slate-900">{role}</div>
                          <div className="text-sm text-slate-500">{role === 'PATIENT' ? 'คนไข้' : role === 'DOCTOR' ? 'แพทย์' : role === 'STAFF' ? 'เจ้าหน้าที่' : 'ผู้ดูแลระบบ'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-cyan-700">{roleUsers.length} users</div>
                          <div className="text-sm text-slate-500">{role === 'ADMIN' ? 'Full access' : role === 'DOCTOR' ? 'Care access' : role === 'STAFF' ? 'Operations access' : 'Patient access'}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    )
  }

  if (view === 'reports') {
    return (
      <main className="min-h-[70vh]">
        <div className="max-w-6xl mx-auto">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Admin Reports</div>
                <h1 className="text-3xl font-black text-slate-900 mt-2">รายงานประสิทธิภาพ</h1>
              </div>
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><BarChart3 size={28} /></div>
            </div>

            {loading ? (
              <div className="mt-8 flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin" size={20} /> กำลังสร้างรายงาน...</div>
            ) : (
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <ReportCard icon={<Users size={22} />} label="คนไข้ในระบบ" value={String(totalPatients)} tone="emerald" />
                <ReportCard icon={<Stethoscope size={22} />} label="แพทย์ในระบบ" value={String(totalDoctors)} tone="violet" />
                <ReportCard icon={<ClipboardList size={22} />} label="นัดหมายทั้งหมด" value={String(appointmentCount)} tone="cyan" />
                <ReportCard icon={<CalendarCheck size={22} />} label="นัดหมายรออนุมัติ" value={String(pendingCount)} tone="amber" />
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="font-black text-slate-900">รายการเชื่อมข้อมูลล่าสุด</div>
              <div className="mt-4 grid gap-3">
                {appointments.slice(0, 5).map(apt => (
                  <div key={apt.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3">
                    <div>
                      <div className="font-black text-slate-900">{apt.patient?.name || 'ผู้ป่วย'} → {apt.doctor?.name || 'แพทย์'}</div>
                      <div className="text-sm text-slate-500">{apt.date} • {apt.time} • {apt.status}</div>
                    </div>
                    <div className="text-sm font-bold text-cyan-700">{apt.doctor?.specialty || 'แพทย์ทั่วไป'}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (view === 'system-settings') {
    return (
      <main className="min-h-[70vh]">
        <div className="max-w-6xl mx-auto">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Admin System Settings</div>
                <h1 className="text-3xl font-black text-slate-900 mt-2">ตั้งค่าระบบ</h1>
              </div>
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><Settings size={28} /></div>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-4">
              <SettingCard icon={<Users size={24} />} label="คนไข้" detail={`${totalPatients} คน`} />
              <SettingCard icon={<Stethoscope size={24} />} label="แพทย์" detail={`${totalDoctors} คน`} />
              <SettingCard icon={<CalendarCheck size={24} />} label="นัดหมาย" detail={`${appointmentCount} รายการ`} />
              <SettingCard icon={<Calendar size={24} />} label="ตารางแพทย์" detail={`${schedules.length} ตาราง`} />
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[70vh]">
      <div className="max-w-6xl mx-auto">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-slate-700">Admin portal</div>
        </section>
      </div>
    </main>
  )
}

function StatCard({ icon, label, value, tone = 'cyan' }) {
  const toneMap = {
    cyan: 'bg-cyan-50 text-cyan-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl p-3 bg-slate-50 text-slate-700">{icon}</div>
        <div className={`rounded-xl px-2 py-1 text-xs font-black ${toneMap[tone] || toneMap.cyan}`}>{value}</div>
      </div>
      <div className="mt-4 text-sm font-bold text-slate-500">{label}</div>
    </div>
  )
}

function ReportCard({ icon, label, value, tone = 'cyan' }) {
  const toneMap = {
    cyan: 'from-cyan-500 to-sky-500',
    emerald: 'from-emerald-500 to-green-500',
    violet: 'from-violet-500 to-purple-500',
    amber: 'from-amber-500 to-orange-500',
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-2xl bg-gradient-to-r ${toneMap[tone]} p-3 text-white`}>{icon}</div>
        <div>
          <div className="text-sm font-bold text-slate-500">{label}</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{value}</div>
        </div>
      </div>
    </div>
  )
}

function ServiceButton({ icon, label, subtitle, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left hover:bg-cyan-50 transition">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-white p-2 text-cyan-700 shadow-sm">{icon}</span>
        <div>
          <div className="font-black text-slate-900">{label}</div>
          <div className="text-xs text-slate-500 font-medium">{subtitle}</div>
        </div>
      </div>
      <ArrowRight size={16} className="text-slate-400" />
    </button>
  )
}

function SettingCard({ icon, label, detail }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-white p-3 text-cyan-700 shadow-sm">{icon}</span>
        <div>
          <div className="font-black text-slate-900">{label}</div>
          <div className="text-sm text-slate-500">{detail}</div>
        </div>
      </div>
    </div>
  )
}

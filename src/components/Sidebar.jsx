'use client'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import {
    LayoutDashboard, Calendar, Clock, Users, UserCircle, BookOpen,
    ClipboardList, Settings, Shield, BarChart3, LogOut, Bell, Stethoscope
} from 'lucide-react'

const NAV_ITEMS = {
    PATIENT: [
        { href: '/patient/dashboard', icon: LayoutDashboard, label: 'หน้าหลัก' },
        { href: '/patient/booking/select-doctor', icon: BookOpen, label: 'จองนัดหมาย' },
        { href: '/patient/appointments', icon: ClipboardList, label: 'นัดหมายของฉัน' },
    ],
    DOCTOR: [
        { href: '/doctor/dashboard', icon: LayoutDashboard, label: 'หน้าหลัก' },
        { href: '/doctor/calendar', icon: Calendar, label: 'ปฏิทินนัดหมาย' },
        { href: '/doctor/schedule', icon: Clock, label: 'ตารางปฏิบัติงาน' },
        { href: '/doctor/patients', icon: Users, label: 'ข้อมูลผู้ป่วย' },
        { href: '/doctor/workload', icon: BarChart3, label: 'ภาระงาน' },
        { href: '/doctor/profile', icon: UserCircle, label: 'ประวัติส่วนตัว' },
    ],
    STAFF: [
        { href: '/staff/dashboard', icon: LayoutDashboard, label: 'หน้าหลัก' },
        { href: '/staff/appointments', icon: ClipboardList, label: 'จัดการนัดหมาย' },
        { href: '/staff/doctor-schedules', icon: Calendar, label: 'ตารางแพทย์' },
        { href: '/staff/doctors', icon: Stethoscope, label: 'ข้อมูลแพทย์' },
    ],
    ADMIN: [
        { href: '/admin/users', icon: Users, label: 'จัดการผู้ใช้' },
        { href: '/admin/permissions', icon: Shield, label: 'สิทธิ์การใช้งาน' },
        { href: '/admin/system-settings', icon: Settings, label: 'ตั้งค่าระบบ' },
        { href: '/admin/reports', icon: BarChart3, label: 'รายงาน' },
    ],
}

const ROLE_LABELS = { PATIENT: 'ผู้ป่วย', DOCTOR: 'แพทย์', STAFF: 'เจ้าหน้าที่', ADMIN: 'ผู้ดูแลระบบ' }

export default function Sidebar() {
    const { data: session } = useSession()
    const pathname = usePathname()

    if (!session) return null
    const user = session.user
    const navItems = NAV_ITEMS[user.role] || []

    return (
        <aside className="fixed top-0 left-0 bottom-0 w-64 bg-slate-900 text-white flex flex-col z-50">
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
                <Stethoscope size={24} className="text-cyan-400" />
                <span className="text-lg font-bold text-cyan-400">KueFlex</span>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map(item => {
                    const active = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <Link key={item.href} href={item.href}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition
                ${active ? 'bg-cyan-600 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="px-4 py-4 border-t border-white/10">
                <div className="text-sm text-white/70 mb-2">
                    {user.name}
                    <div className="text-xs text-white/50">{ROLE_LABELS[user.role]}</div>
                </div>
                <button onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 text-sm transition">
                    <LogOut size={16} /> ออกจากระบบ
                </button>
            </div>
        </aside>
    )
}

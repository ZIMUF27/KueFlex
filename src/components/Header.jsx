'use client'
import { useSession } from 'next-auth/react'
import { Bell } from 'lucide-react'

const ROLE_LABELS = { PATIENT: 'ผู้ป่วย', DOCTOR: 'แพทย์', STAFF: 'เจ้าหน้าที่', ADMIN: 'ผู้ดูแลระบบ' }

export default function Header() {
    const { data: session } = useSession()
    if (!session) return null
    const user = session.user

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-7 sticky top-0 z-40">
            <h2 className="text-base font-semibold text-gray-700">{ROLE_LABELS[user.role]} Portal</h2>
            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
                    <Bell size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-400 text-white flex items-center justify-center text-sm font-bold">
                        {user.name?.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                </div>
            </div>
        </header>
    )
}

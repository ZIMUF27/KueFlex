'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Bell, CheckCheck } from 'lucide-react'

const ROLE_LABELS = { PATIENT: 'ผู้ป่วย', DOCTOR: 'แพทย์', STAFF: 'เจ้าหน้าที่', ADMIN: 'ผู้ดูแลระบบ' }

export default function Header() {
    const { data: session } = useSession()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [open, setOpen] = useState(false)

    async function loadNotifications() {
        if (!session?.user?.id) return
        const res = await fetch('/api/notifications', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
    }

    useEffect(() => {
        if (!session?.user?.id) return undefined
        loadNotifications()
        const timer = setInterval(loadNotifications, 30000)
        return () => clearInterval(timer)
    }, [session?.user?.id])

    async function markAsRead(id) {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(id ? { id } : {}),
        })
        loadNotifications()
    }

    if (!session) return null
    const user = session.user

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-7 sticky top-0 z-40">
            <h2 className="text-base font-semibold text-gray-700">{ROLE_LABELS[user.role]} Portal</h2>
            <div className="flex items-center gap-4">
                <button onClick={() => setOpen(value => !value)} aria-label="เปิดการแจ้งเตือน" className="relative p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>
                {open && <div className="absolute right-24 top-14 w-80 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="font-bold text-gray-800">การแจ้งเตือน</span>
                        {unreadCount > 0 && <button onClick={() => markAsRead()} className="text-xs text-cyan-700 flex items-center gap-1"><CheckCheck size={14} /> อ่านทั้งหมด</button>}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? <div className="px-4 py-8 text-center text-sm text-gray-500">ยังไม่มีการแจ้งเตือน</div> : notifications.map(item => <button key={item.id} onClick={() => !item.readAt && markAsRead(item.id)} className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${!item.readAt ? 'bg-cyan-50/60' : ''}`}>
                            <div className="text-sm font-semibold text-gray-800">{item.title}</div>
                            <div className="mt-1 text-xs text-gray-600">{item.message}</div>
                            <div className="mt-1 text-[10px] text-gray-400">{new Date(item.createdAt).toLocaleString('th-TH')}</div>
                        </button>)}
                    </div>
                </div>}
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

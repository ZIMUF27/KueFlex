'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AlertCircle, BellRing, CalendarDays, ClipboardCheck, Loader2, Search, Stethoscope } from 'lucide-react'

const LOGIN_REDIRECT_DELAY_MS = 850

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const normalizedEmail = email.trim().toLowerCase()
        const result = await signIn('credentials', {
            email: normalizedEmail,
            password,
            redirect: false,
            callbackUrl: '/',
        })

        if (result?.error) {
            setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
            setLoading(false)
        } else {
            setTimeout(() => {
                router.push(result?.url || '/')
                router.refresh()
            }, LOGIN_REDIRECT_DELAY_MS)
        }
    }

    return (
        <div className="login-page min-h-screen flex items-center justify-center px-4 py-8">
            <div className="login-layout w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl">
                <section className="login-hero p-8 sm:p-10 lg:p-12 text-white">
                    <div className="login-brand-mark mb-8">
                        <Stethoscope size={28} />
                    </div>
                    <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-cyan-100">ดูแลสุขภาพง่ายขึ้น</p>
                    <h1 className="text-4xl font-bold leading-tight sm:text-5xl">KueFlex</h1>
                    <p className="mt-4 max-w-md text-lg leading-relaxed text-cyan-50">
                        ระบบจองนัดพบแพทย์ออนไลน์ที่ช่วยให้คุณจัดการทุกนัดหมายได้ในที่เดียว
                    </p>

                    <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                            { icon: Search, title: 'ค้นหาแพทย์', text: 'เลือกตามแผนกและความเชี่ยวชาญ' },
                            { icon: CalendarDays, title: 'จองคิวออนไลน์', text: 'เลือกวันและเวลาที่สะดวก' },
                            { icon: BellRing, title: 'ไม่พลาดทุกนัด', text: 'รับการแจ้งเตือนก่อนถึงวันนัด' },
                            { icon: ClipboardCheck, title: 'จัดการนัดหมาย', text: 'ดู เลื่อน หรือยกเลิกนัดได้ง่าย' },
                        ].map(({ icon: Icon, title, text }) => (
                            <div key={title} className="login-feature">
                                <Icon size={22} className="shrink-0 text-cyan-200" />
                                <div>
                                    <p className="font-bold">{title}</p>
                                    <p className="mt-1 text-sm text-cyan-100">{text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="mt-9 border-t border-white/20 pt-5 text-sm text-cyan-100">
                        เริ่มต้นใช้งาน: เข้าสู่ระบบ เลือกแพทย์ เลือกเวลา และยืนยันการนัดหมาย
                    </p>
                </section>

                <section className="login-card bg-white p-8 sm:p-10 lg:p-12">
                    <div className="mb-8 text-center">
                        <div className="mb-4 inline-flex rounded-2xl bg-cyan-50 p-3 text-cyan-600">
                            <Stethoscope size={34} />
                        </div>
                        <h2 className="text-3xl font-bold text-cyan-800">เข้าสู่ระบบ</h2>
                        <p className="mt-2 text-gray-500">ยินดีต้อนรับกลับสู่ KueFlex</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold">อีเมล</label>
                            <input type="email" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                value={email} onChange={e => setEmail(e.target.value)} placeholder="กรอกอีเมล" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold">รหัสผ่าน</label>
                            <input type="password" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                value={password} onChange={e => setPassword(e.target.value)} placeholder="กรอกรหัสผ่าน" required />
                        </div>
                        <button type="submit" disabled={loading}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 py-3 text-lg font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50">
                            {loading && <Loader2 size={18} className="animate-spin" />}
                            เข้าสู่ระบบ
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-gray-500">ยังไม่มีบัญชีใช่ไหม? </span>
                        <a href="/register" className="font-semibold text-cyan-700 hover:underline">สมัครสมาชิกใหม่</a>
                    </div>
                </section>
            </div>
            {loading && (
                <div className="login-loading-overlay">
                    <div className="login-loading-card">
                        <Loader2 size={36} className="login-loading-spinner" />
                        <span className="login-loading-text">กำลังเข้าสู่ระบบ...</span>
                        <div className="login-loading-bar">
                            <span className="login-loading-bar-fill" />
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="login-error-toast" role="alert">
                    <AlertCircle size={18} className="login-toast-icon" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
}

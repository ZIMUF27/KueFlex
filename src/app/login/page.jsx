'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Stethoscope, User, UserCog, Shield, Loader2, AlertCircle } from 'lucide-react'

const LOGIN_REDIRECT_DELAY_MS = 850

const DEMO_ACCOUNTS = [
    { role: 'PATIENT', label: 'ผู้ป่วย', icon: User, color: 'border-cyan-500 bg-cyan-50', email: 'somchai@mail.com' },
    { role: 'DOCTOR', label: 'แพทย์', icon: Stethoscope, color: 'border-emerald-500 bg-emerald-50', email: 'surasak@hospital.com' },
    { role: 'STAFF', label: 'เจ้าหน้าที่', icon: UserCog, color: 'border-amber-500 bg-amber-50', email: 'staff@hospital.com' },
    { role: 'ADMIN', label: 'ผู้ดูแลระบบ', icon: Shield, color: 'border-red-500 bg-red-50', email: 'admin@hospital.com' },
]

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

    const handleDemoLogin = async (account) => {
        setLoading(true)
        setError('')
        const result = await signIn('credentials', {
            email: account.email.trim().toLowerCase(),
            password: '123456',
            redirect: false,
            callbackUrl: '/',
        })
        if (result?.error) {
            setError('เกิดข้อผิดพลาด กรุณาตรวจสอบว่าได้ seed ฐานข้อมูลแล้ว')
            setLoading(false)
        } else {
            setTimeout(() => {
                router.push(result?.url || '/')
                router.refresh()
            }, LOGIN_REDIRECT_DELAY_MS)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-700 via-cyan-600 to-cyan-400 px-4 py-8">
            <div className="login-shell bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl min-h-[680px] flex flex-col justify-center">
                <div className="text-center mb-2">
                    <Stethoscope size={56} className="mx-auto text-cyan-600" />
                </div>
                <h1 className="text-4xl font-bold text-center text-cyan-800">KueFlex</h1>
                <p className="text-center text-gray-500 mb-6 text-lg">ระบบจองนัดพบแพทย์</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">อีเมล</label>
                        <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-lg"
                            value={email} onChange={e => setEmail(e.target.value)} placeholder="กรอกอีเมล" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">รหัสผ่าน</label>
                        <input type="password" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-lg"
                            value={password} onChange={e => setPassword(e.target.value)} placeholder="กรอกรหัสผ่าน" required />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg">
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        เข้าสู่ระบบ
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <a href="/register" className="text-cyan-700 font-semibold hover:underline text-lg">สมัครสมาชิกใหม่</a>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-400 text-center mb-3">Demo Login (รหัสผ่าน: 123456)</p>
                    <div className="grid grid-cols-2 gap-2">
                        {DEMO_ACCOUNTS.map(acc => (
                            <button key={acc.role} onClick={() => handleDemoLogin(acc)} disabled={loading}
                                className={`p-3 rounded-lg border-2 text-center transition hover:shadow-md disabled:opacity-50 ${acc.color}`}>
                                <acc.icon size={20} className="mx-auto mb-1" />
                                <div className="text-xs font-semibold">{acc.label}</div>
                            </button>
                        ))}
                    </div>
                </div>
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

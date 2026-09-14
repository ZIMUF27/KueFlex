'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (form.name.trim().length < 2) return 'กรุณากรอกชื่อ-นามสกุลอย่างน้อย 2 ตัวอักษร'
    if (!emailPattern.test(form.email)) return 'รูปแบบอีเมลไม่ถูกต้อง'
    if (!form.phone.trim()) return 'กรุณากรอกเบอร์โทรศัพท์'
    if (form.phone.trim().replace(/[^0-9]/g, '').length < 8) return 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง'
    if (form.password.length < 6) return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationMessage = validate()
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
        setLoading(false)
        return
      }

      router.push('/login')
    } catch (err) {
      setError('ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-700 via-cyan-600 to-cyan-400">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center">
          <div className="text-5xl mb-2">👩‍⚕️</div>
          <h1 className="text-2xl font-bold text-cyan-800">สมัครสมาชิก KueFlex</h1>
          <p className="text-gray-500 mt-2">กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้</p>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-semibold mb-1">ชื่อ-นามสกุล</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="กรอกชื่อ-นามสกุล"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">อีเมล</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="example@mail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">เบอร์โทรศัพท์</label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="081-234-5678"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">รหัสผ่าน</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              required
            />
          </div>

          <button className="w-full bg-cyan-600 text-white py-2.5 rounded-lg font-semibold hover:bg-cyan-700 disabled:opacity-60" disabled={loading}>
            {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-500">มีบัญชีอยู่แล้ว?</span>{' '}
            <a href="/login" className="text-cyan-700 font-semibold hover:underline">เข้าสู่ระบบ</a>
          </div>
        </form>
      </div>
    </div>
  )
}

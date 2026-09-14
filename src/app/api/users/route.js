import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// GET /api/users?phoneMissing=true
export async function GET(req) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const phoneMissingOnly = searchParams.get('phoneMissing') === 'true'

    const where = phoneMissingOnly
        ? {
            OR: [
                { phone: { equals: '' } },
                { phone: null },
            ],
        }
        : {}

    const users = await prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, phone: true, role: true, active: true, specialty: true, license: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(users)
}

// POST /api/users (register a new user)
export async function POST(req) {
    try {
        const rawBody = await req.text()
        console.log('REGISTER_RAW_BODY', rawBody)

        let body = {}
        try {
            body = JSON.parse(rawBody)
        } catch (parseError) {
            return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
        }

        const name = String(body.name || '').trim()
        const email = String(body.email || '').trim().toLowerCase()
        const phone = String(body.phone || '').trim()
        const password = String(body.password || '')

        if (!name || name.length < 2) {
            return NextResponse.json({ error: 'กรุณากรอกชื่อ-นามสกุลอย่างน้อย 2 ตัวอักษร' }, { status: 400 })
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' }, { status: 400 })
        }

        if (!phone || phone.replace(/[^0-9]/g, '').length < 8) {
            return NextResponse.json({ error: 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง' }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' }, { status: 400 })
        }

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return NextResponse.json({ error: 'อีเมลนี้มีผู้ใช้งานแล้ว' }, { status: 409 })
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: passwordHash,
                role: 'PATIENT',
                phone,
                active: true,
            },
        })

        return NextResponse.json({ message: 'สมัครสมาชิกสำเร็จ', user: { id: user.id, name: user.name, email: user.email } }, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message || 'ไม่สามารถสมัครสมาชิกได้' }, { status: 500 })
    }
}

// PATCH /api/users (update user)
export async function PATCH(req) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { id, ...data } = body
    // Don't allow password update via this route
    delete data.password

    const updated = await prisma.user.update({ where: { id }, data })
    return NextResponse.json(updated)
}

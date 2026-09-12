import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/doctors
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const doctors = await prisma.user.findMany({
        where: { role: 'DOCTOR', active: true },
        select: { id: true, name: true, email: true, phone: true, specialty: true, license: true, active: true },
        orderBy: { name: 'asc' },
    })
    return NextResponse.json(doctors)
}

// POST /api/doctors (staff creates doctor)
export async function POST(req) {
    const session = await getServerSession(authOptions)
    if (!session || !['STAFF', 'ADMIN'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const bcrypt = await import('bcryptjs')
    const doctor = await prisma.user.create({
        data: {
            email: body.email,
            password: bcrypt.hashSync(body.password || '123456', 10),
            name: body.name,
            phone: body.phone,
            role: 'DOCTOR',
            specialty: body.specialty,
            license: body.license,
        },
    })
    return NextResponse.json(doctor, { status: 201 })
}

// PATCH /api/doctors
export async function PATCH(req) {
    const session = await getServerSession(authOptions)
    if (!session || !['STAFF', 'ADMIN'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { id, ...data } = body
    const updated = await prisma.user.update({ where: { id }, data })
    return NextResponse.json(updated)
}

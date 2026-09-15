import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30'
]

// GET /api/schedules?doctorId=xxx
export async function GET(req) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const where = {}
    if (searchParams.get('doctorId')) where.doctorId = searchParams.get('doctorId')

    const schedules = await prisma.schedule.findMany({
        where,
        include: { doctor: { select: { id: true, name: true, specialty: true } } },
    })
    return NextResponse.json(schedules)
}

// GET available slots for a doctor on a date: /api/schedules/slots?doctorId=xxx&date=2026-09-10
export async function POST(req) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    if (body.action === 'getAvailability') {
        const { doctorId, startDate, days = 90 } = body
        const start = new Date(`${startDate}T00:00:00Z`)
        const end = new Date(start)
        end.setUTCDate(end.getUTCDate() + Number(days))
        const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
        const schedules = await prisma.schedule.findMany({ where: { doctorId } })
        const appointments = await prisma.appointment.findMany({
            where: { doctorId, date: { gte: start, lt: end }, status: { notIn: ['CANCELLED'] } },
            select: { date: true, time: true },
        })

        const availability = []
        for (let index = 0; index < Number(days); index += 1) {
            const date = new Date(start)
            date.setUTCDate(start.getUTCDate() + index)
            const dateKey = date.toISOString().slice(0, 10)
            const schedule = schedules.find(item => item.day === dayNames[date.getUTCDay()])
            const booked = appointments.filter(item => item.date.toISOString().slice(0, 10) === dateKey)
            const slotCount = schedule
                ? TIME_SLOTS.filter(time => time >= schedule.startTime && time < schedule.endTime).length
                : 0
            availability.push({
                date: dateKey,
                available: Boolean(schedule && booked.length < Math.min(slotCount, schedule.maxSlots)),
                reason: !schedule ? 'แพทย์ไม่เข้าเวร' : booked.length >= Math.min(slotCount, schedule.maxSlots) ? 'คิวเต็ม' : '',
            })
        }
        return NextResponse.json(availability)
    }

    // If action is 'getSlots', return available slots
    if (body.action === 'getSlots') {
        const { doctorId, date } = body
        const dateObj = new Date(date)
        const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
        const dayName = dayNames[dateObj.getDay()]

        const schedule = await prisma.schedule.findFirst({ where: { doctorId, day: dayName } })
        if (!schedule) return NextResponse.json([])

        const allSlots = TIME_SLOTS.filter(t => t >= schedule.startTime && t < schedule.endTime)
        const booked = await prisma.appointment.findMany({
            where: { doctorId, date: dateObj, status: { notIn: ['CANCELLED'] } },
            select: { time: true },
        })
        const bookedTimes = booked.map(b => b.time)

        const slots = allSlots.map(time => ({ time, available: !bookedTimes.includes(time) }))
        return NextResponse.json(slots)
    }

    // Otherwise, create/update schedule (staff only)
    if (!['STAFF', 'ADMIN'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { doctorId, day, startTime, endTime, maxSlots } = body
    const schedule = await prisma.schedule.upsert({
        where: { doctorId_day: { doctorId, day } },
        update: { startTime, endTime, maxSlots },
        create: { doctorId, day, startTime, endTime, maxSlots },
    })
    return NextResponse.json(schedule)
}

// DELETE /api/schedules
export async function DELETE(req) {
    const session = await getServerSession(authOptions)
    if (!session || !['STAFF', 'ADMIN'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    await prisma.schedule.delete({ where: { doctorId_day: { doctorId: body.doctorId, day: body.day } } })
    return NextResponse.json({ success: true })
}

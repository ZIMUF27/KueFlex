import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 30,
    })
    return NextResponse.json({ notifications, unreadCount: notifications.filter(item => !item.readAt).length })
}

export async function PATCH(req) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json().catch(() => ({}))
    const where = id ? { id, userId: session.user.id } : { userId: session.user.id, readAt: null }
    await prisma.notification.updateMany({ where, data: { readAt: new Date() } })
    return NextResponse.json({ ok: true })
}
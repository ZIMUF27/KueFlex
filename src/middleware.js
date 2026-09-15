import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

const ROLE_PATHS = {
    patient: '/patient/dashboard',
    doctor: '/doctor/dashboard',
    staff: '/staff/dashboard',
    admin: '/admin/dashboard',
}

export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('callbackUrl', `${req.nextUrl.pathname}${req.nextUrl.search}`)
        return NextResponse.redirect(loginUrl)
    }

    const pathname = req.nextUrl.pathname
    const role = String(token.role || '').toLowerCase()
    const requiredRole = Object.keys(ROLE_PATHS).find(item => pathname.startsWith(`/${item}`))

    if (requiredRole && role !== requiredRole) {
        return NextResponse.redirect(new URL(ROLE_PATHS[role] || '/login', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/patient/:path*', '/doctor/:path*', '/staff/:path*', '/admin/:path*'],
}

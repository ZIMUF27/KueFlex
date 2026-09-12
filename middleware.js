import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl
        const role = req.nextauth?.token?.role?.toLowerCase()

        // Role-based route protection
        if (pathname.startsWith('/patient') && role !== 'patient') {
            return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url))
        }
        if (pathname.startsWith('/doctor') && role !== 'doctor') {
            return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url))
        }
        if (pathname.startsWith('/staff') && role !== 'staff') {
            return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url))
        }
        if (pathname.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url))
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = {
    matcher: ['/patient/:path*', '/doctor/:path*', '/staff/:path*', '/admin/:path*'],
}

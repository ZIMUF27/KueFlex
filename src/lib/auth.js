import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const email = String(credentials?.email || '').trim().toLowerCase()
                const password = String(credentials?.password || '')

                if (!email || !password) return null

                const user = await prisma.user.findUnique({
                    where: { email },
                })

                if (!user || !user.active) return null

                const valid = await bcrypt.compare(password, user.password)
                if (!valid) return null

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    specialty: user.specialty,
                    license: user.license,
                    phone: user.phone,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.specialty = user.specialty
                token.license = user.license
                token.phone = user.phone
            }
            return token
        },
        async session({ session, token }) {
            session.user.id = token.id
            session.user.role = token.role
            session.user.specialty = token.specialty
            session.user.license = token.license
            session.user.phone = token.phone
            return session
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
}

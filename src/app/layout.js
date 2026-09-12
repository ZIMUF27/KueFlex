import './globals.css'

export const metadata = {
    title: 'KueFlex - ระบบจองนัดพบแพทย์',
    description: 'ระบบจองนัดพบแพทย์ออนไลน์ สะดวก รวดเร็ว ปลอดภัย',
}

export default function RootLayout({ children }) {
    return (
        <html lang="th">
            <body className="bg-gray-50 text-gray-900 antialiased">
                {children}
            </body>
        </html>
    )
}

import Providers from '@/components/Providers'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function PatientLayout({ children }) {
    return (
        <Providers>
            <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 ml-64 flex flex-col">
                    <Header />
                    <main className="flex-1 p-7">{children}</main>
                </div>
            </div>
        </Providers>
    )
}

import Sidebar from '../components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-full">
      <Sidebar>{children}</Sidebar>
    </div>
  )
} 
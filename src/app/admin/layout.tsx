import { Navbar } from '@/src/components/layout/Navbar';
import { Sidebar } from '@/src/components/layout/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f6f8f9]">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

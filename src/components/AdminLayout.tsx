import { useState } from "react";
import TopBar from "./TopBar";
import AppSidebar from "./AppSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full" dir="rtl">
      {/* Sidebar on the right (start in RTL) */}
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content on the left */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

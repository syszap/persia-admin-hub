import { useState } from "react";
import TopBar from "./TopBar";
import AppSidebar from "./AppSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full transition-all duration-300 ease-out" dir="rtl">
      {/* Sidebar on the right (start in RTL) */}
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content — expands fluidly */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-out">
        <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

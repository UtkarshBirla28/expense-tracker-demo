import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { CurrencyDollarIcon, HomeIcon } from "@heroicons/react/24/outline";
import type React from "react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function Layout({ children }: { children: React.ReactNode }) {
  const { open, openMobile, isMobile, setOpenMobile } = useSidebar();
  
  const sidebarContent = (
    <>
      <div className="flex flex-row px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800">Expense Tracker</h1>
      </div>
      <nav className="mt-6">
        <Link to="/" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200">
          <HomeIcon className="w-5 h-5 mr-2" />
          Summary
        </Link>
        <Link to="/transactions" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200">
          <CurrencyDollarIcon className="w-5 h-5 mr-2" />
          Transactions
        </Link>
      </nav>
    </>
  );
  
  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar className={`w-64 bg-white shadow-lg flex-shrink-0 transition-transform duration-300 ${!open ? '-translate-x-full' : ''}`}>
          <SidebarContent>
            {sidebarContent}
          </SidebarContent>
        </Sidebar>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent>
              {sidebarContent}
            </SidebarContent>
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content - Takes remaining space */}
      <div className={`flex-1 min-w-0 bg-gray-100 flex flex-col transition-all duration-300 ${!isMobile && open ? 'ml-64' : 'ml-0'}`}>
        <header className="bg-white shadow">
          <div className="flex items-center px-4 py-3 gap-3">
            <SidebarTrigger />
            <h2 className="text-xl font-semibold text-gray-800">Expense Tracker</h2>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gray-100 p-4">{children}</main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Layout children={children} />
    </SidebarProvider>
  );
}

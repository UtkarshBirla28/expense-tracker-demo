"use client"

import type React from "react"
import { SidebarProvider, useSidebar } from "./ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Sheet, SheetContent } from "./ui/sheet"

interface LayoutProps {
  children: React.ReactNode
}

function LayoutContent({ children }: LayoutProps) {
  const { open, openMobile, isMobile, setOpenMobile } = useSidebar()

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      {!isMobile && <AppSidebar />}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent side="left" className="w-64 p-0 bg-white">
            <AppSidebar />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content - Takes remaining space */}
      <div
        className={`flex-1 min-w-0 bg-gray-100 flex flex-col transition-all duration-300 ${!isMobile && open ? "ml-64" : "ml-0"}`}
      >
        <header className="bg-white shadow">
          <div className="flex items-center px-4 py-3 gap-3">
            <button
              className="p-2 rounded-md hover:bg-gray-200"
              onClick={() => (isMobile ? setOpenMobile(true) : null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-800">Investor Platform</h2>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gray-100 p-4">{children}</main>
      </div>
    </div>
  )
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <LayoutContent children={children} />
    </SidebarProvider>
  )
}

import { useState } from "react";
import type React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
  Menu,
  PiggyBank,
  Target,
  Wallet,
  X,
} from "lucide-react";
import storage from "@/utils/storage";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/budgets", label: "Budgets", icon: PiggyBank },
  { to: "/goals", label: "Goals", icon: Target },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Wallet className="h-[18px] w-[18px]" strokeWidth={2.2} />
      </span>
      <div className="leading-tight">
        <p className="text-[15px] font-semibold tracking-tight">Expense Tracker</p>
        <p className="text-xs text-muted-foreground">Personal finance</p>
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-ink-secondary hover:bg-muted hover:text-foreground"
            )
          }
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function SignOutButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        storage.clearUserData();
        navigate("/signin");
      }}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-negative-soft hover:text-negative"
    >
      <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
      Sign out
    </button>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <Brand />
        <div className="mt-8 flex-1">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
          <NavLinks />
        </div>
        <SignOutButton />
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-ink-secondary hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card px-4 py-6 shadow-xl">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-ink-secondary hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8 flex-1">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>
            <SignOutButton />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}

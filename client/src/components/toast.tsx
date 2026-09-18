import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastKind = "success" | "error"

interface ToastItem {
  id: number
  message: string
  kind: ToastKind
  leaving: boolean
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export const useToast = () => useContext(ToastContext)

const VISIBLE_MS = 2600
const EXIT_MS = 250

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = nextId.current++
    setToasts((current) => [...current.slice(-3), { id, message, kind, leaving: false }])
    window.setTimeout(() => {
      setToasts((current) =>
        current.map((t) => (t.id === id ? { ...t, leaving: true } : t))
      )
    }, VISIBLE_MS)
    window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id))
    }, VISIBLE_MS + EXIT_MS)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4 sm:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-auto items-center gap-2.5 rounded-full border py-2 pl-3 pr-4 shadow-lg backdrop-blur",
              t.leaving ? "toast-exit" : "toast-enter",
              t.kind === "success"
                ? "border-positive/20 bg-card/95 text-foreground"
                : "border-negative/25 bg-card/95 text-foreground"
            )}
          >
            {t.kind === "success" ? (
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-positive" />
            ) : (
              <XCircle className="h-4.5 w-4.5 shrink-0 text-negative" />
            )}
            <p className="text-sm font-medium">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

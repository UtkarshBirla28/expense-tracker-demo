import type React from "react"
import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import usePdfDownload from "@/hooks/use-pdf-download"

const PdfDownloader: React.FC = () => {
  const { downloadPdf } = usePdfDownload()
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const pdfBlob = await downloadPdf()
      if (!pdfBlob) return

      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "expense_report.pdf")
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (error) {
      console.error("Error downloading PDF:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isLoading ? "Generating…" : "Export PDF"}
    </button>
  )
}

export default PdfDownloader

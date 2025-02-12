"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid"
import usePdfDownload from "@/hooks/use-pdf-download"

const PdfDownloader: React.FC = () => {
    const { downloadPdf } = usePdfDownload()
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    const pdfBlob = await downloadPdf();
    if (!pdfBlob) return;
    setIsLoading(true)
    try {

      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "expense_report.pdf")
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-xl font-semibold">Download Expense Report</h3>
      <p className="text-gray-600 text-center">
        Get a detailed PDF report of your expenses and income for your records or financial planning.
      </p>
      <Button
        onClick={handleDownload}
        disabled={isLoading}
        className="w-full max-w-xs flex items-center justify-center"
      >
        {isLoading ? (
          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
        ) : (
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
        )}
        {isLoading ? "Generating PDF..." : "Download PDF Report"}
      </Button>
    </div>
  )
}

export default PdfDownloader

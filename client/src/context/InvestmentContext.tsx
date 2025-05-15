"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface InvestmentData {
  age?: number
  income?: number
  riskTolerance?: string
  investmentGoals?: string
  investmentHorizon?: string
}

interface InvestmentContextType {
  investmentData: InvestmentData
  setInvestmentData: (data: InvestmentData) => void
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined)

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const [investmentData, setInvestmentData] = useState<InvestmentData>({})

  return (
    <InvestmentContext.Provider value={{ investmentData, setInvestmentData }}>{children}</InvestmentContext.Provider>
  )
}

export function useInvestmentContext() {
  const context = useContext(InvestmentContext)
  if (context === undefined) {
    throw new Error("useInvestmentContext must be used within an InvestmentProvider")
  }
  return context
}

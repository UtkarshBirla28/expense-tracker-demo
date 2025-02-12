export interface Expense {
    id: string
    amount: number
    category: string
    createdAt: string
    description: string
  }
  
  export interface Income {
    id: string
    amount: number
    source: string
    createdAt: string
    description: string
  }
  
  export interface FinancialSummary {
    totalIncome: number
    totalExpenses: number
    balance: number
  }
  
  
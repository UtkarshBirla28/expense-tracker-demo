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
  
  
export interface Budget {
  id: number
  category: string
  amount: number
  spent: number
  createdAt: string
}

export interface Goal {
  id: number
  name: string
  targetAmount: number
  savedAmount: number
  createdAt: string
}

export interface TrendPoint {
  month: string
  income: number
  expense: number
}

import useSummary from "@/hooks/use-summary";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ScaleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/solid";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";
import RootLayout from "../layout";
import PdfDownloader from "@/components/pdf-downloader";
import { useNavigate } from "react-router-dom";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface ExpenseCategory {
  category: string;
  _sum: {
    amount: number;
  };
}

export default function Home() {
  const navigate = useNavigate();
  const { getSummary } = useSummary();
  const [expenses, setExpenses] = useState<number>(0);
  const [incomes, setIncomes] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [expensesByCategory, setExpensesByCategory] = useState<
    ExpenseCategory[]
  >([]);

  const fetchData = useCallback(async () => {
    const response = await getSummary();
    if (response) {
      setExpenses(response.summary.totalExpenses);
      setIncomes(response.summary.totalIncome);
      setCurrentBalance(response.summary.currentBalance);
      setExpensesByCategory(response.expensesByCategory);
    }
  }, [setExpenses, setIncomes, setCurrentBalance, setExpensesByCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <RootLayout>
      <div className="py-8 w-full">
        <h2 className="text-3xl font-bold text-center mb-8">
          Financial Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-8">
          <SummaryCard
            title="Total Income"
            amount={incomes}
            icon={<ArrowUpIcon className="h-8 w-8 text-green-500" />}
            color="bg-green-100"
          />
          <SummaryCard
            title="Total Expenses"
            amount={expenses}
            icon={<ArrowDownIcon className="h-8 w-8 text-red-500" />}
            color="bg-red-100"
          />
          <SummaryCard
            title="Balance"
            amount={currentBalance}
            icon={<ScaleIcon className="h-8 w-8 text-blue-500" />}
            color="bg-blue-100"
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-2xl font-semibold mb-4">Spending Breakdown</h3>
          <div className="h-80">
            {expensesByCategory?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {expensesByCategory.map(
                      (_: ExpenseCategory, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="text-center">
                  <PlusCircleIcon
                    className="h-16 w-16 text-gray-400 mx-auto mb-4 hover:text-gray-600"
                    onClick={() => navigate("/transactions")}
                  />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No expenses yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Add your first expense to see your spending breakdown
                  </p>
                  {/* <button 
                  onClick={() => navigate('/transactions')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Add Expense
                </button> */}
                </div>
              </div>
            )}
          </div>
          <PdfDownloader />
        </div>
      </div>
    </RootLayout>
  );
}

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  icon,
  color,
}) => {
  return (
    <div className={`${color} rounded-lg shadow p-6`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold mt-4">${amount}</p>
    </div>
  );
};

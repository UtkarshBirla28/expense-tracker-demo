"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useInvestmentContext } from "../../context/InvestmentContext"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/investor/ui/card"
import { Progress } from "../../components/investor/ui/progress"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { ArrowUpIcon, TrendingUpIcon, WalletIcon } from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function InvestorDashboard() {
  const navigate = useNavigate()
  const { investmentData } = useInvestmentContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // If no investment data, redirect to home

  }, [investmentData, navigate])

  if (!mounted) return null

  // Calculate recommended allocation based on age
  const getRecommendedAllocation = () => {
    const age = investmentData.age || 30
    const income = investmentData.income || 50000

    // Simple allocation logic based on age and income
    let stocks = 0
    let bonds = 0
    let realEstate = 0
    let cash = 0
    let alternatives = 0

    if (age < 30) {
      stocks = 70
      bonds = 10
      realEstate = 10
      cash = 5
      alternatives = 5
    } else if (age < 40) {
      stocks = 60
      bonds = 20
      realEstate = 10
      cash = 5
      alternatives = 5
    } else if (age < 50) {
      stocks = 50
      bonds = 30
      realEstate = 10
      cash = 5
      alternatives = 5
    } else if (age < 60) {
      stocks = 40
      bonds = 40
      realEstate = 10
      cash = 5
      alternatives = 5
    } else {
      stocks = 30
      bonds = 50
      realEstate = 10
      cash = 5
      alternatives = 5
    }

    // Adjust based on income
    if (income > 100000) {
      alternatives += 5
      stocks += 5
      bonds -= 5
      cash -= 5
    }

    return [
      { name: "Stocks", value: stocks },
      { name: "Bonds", value: bonds },
      { name: "Real Estate", value: realEstate },
      { name: "Cash", value: cash },
      { name: "Alternatives", value: alternatives },
    ]
  }

  const allocation = getRecommendedAllocation()

  // Calculate recommended monthly investment
  const recommendedMonthlyInvestment = Math.round(((investmentData.income || 50000) * 0.15) / 12)

  // Calculate potential growth
  const calculatePotentialGrowth = () => {
    const age = investmentData.age || 30
    const retirementAge = 65
    const yearsToInvest = retirementAge - age
    const monthlyInvestment = recommendedMonthlyInvestment
    const annualReturn = 0.07 // 7% average annual return

    let futureValue = 0
    for (let i = 0; i < yearsToInvest; i++) {
      futureValue = (futureValue + monthlyInvestment * 12) * (1 + annualReturn)
    }

    return Math.round(futureValue)
  }

  const potentialGrowth = calculatePotentialGrowth()

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center mb-8">Investment Dashboard</h2>

      {/* User Profile Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Your Investment Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">
              Age: <span className="font-medium text-gray-900">{investmentData.age || "N/A"}</span>
            </p>
            <p className="text-gray-600">
              Annual Income:{" "}
              <span className="font-medium text-gray-900">${investmentData.income?.toLocaleString() || "N/A"}</span>
            </p>
            <p className="text-gray-600">
              Risk Tolerance: <span className="font-medium text-gray-900">{investmentData.riskTolerance || "N/A"}</span>
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              Investment Goals:{" "}
              <span className="font-medium text-gray-900">{investmentData.investmentGoals || "N/A"}</span>
            </p>
            <p className="text-gray-600">
              Investment Horizon:{" "}
              <span className="font-medium text-gray-900">{investmentData.investmentHorizon || "N/A"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center justify-between">
              Recommended Monthly Investment
              <WalletIcon className="h-6 w-6 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${recommendedMonthlyInvestment}</p>
            <p className="text-sm text-gray-600 mt-1">15% of your monthly income</p>
          </CardContent>
        </Card>

        <Card className="bg-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center justify-between">
              Potential Growth
              <TrendingUpIcon className="h-6 w-6 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${potentialGrowth.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1">By retirement age</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center justify-between">
              Expected Annual Return
              <ArrowUpIcon className="h-6 w-6 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">7%</p>
            <p className="text-sm text-gray-600 mt-1">Based on historical market data</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Recommended Asset Allocation</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Investment Recommendations</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">Stocks (Index Funds)</span>
                <span className="text-gray-700 font-medium">{allocation[0].value}%</span>
              </div>
              <Progress value={allocation[0].value} className="h-2" />
              <p className="text-sm text-gray-500 mt-1">Low-cost index funds tracking major market indices</p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">Bonds</span>
                <span className="text-gray-700 font-medium">{allocation[1].value}%</span>
              </div>
              <Progress value={allocation[1].value} className="h-2" />
              <p className="text-sm text-gray-500 mt-1">Government and high-grade corporate bonds</p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">Real Estate</span>
                <span className="text-gray-700 font-medium">{allocation[2].value}%</span>
              </div>
              <Progress value={allocation[2].value} className="h-2" />
              <p className="text-sm text-gray-500 mt-1">REITs and real estate investment funds</p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">Cash & Equivalents</span>
                <span className="text-gray-700 font-medium">{allocation[3].value}%</span>
              </div>
              <Progress value={allocation[3].value} className="h-2" />
              <p className="text-sm text-gray-500 mt-1">High-yield savings and money market funds</p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">Alternative Investments</span>
                <span className="text-gray-700 font-medium">{allocation[4].value}%</span>
              </div>
              <Progress value={allocation[4].value} className="h-2" />
              <p className="text-sm text-gray-500 mt-1">Commodities, private equity, and hedge funds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Schedule a Consultation</h4>
            <p className="text-gray-600 mb-4">
              Speak with one of our financial advisors to refine your investment strategy.
            </p>
            <button className="text-blue-600 font-medium hover:text-blue-800">Book Appointment →</button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Educational Resources</h4>
            <p className="text-gray-600 mb-4">Access our library of investment guides and market insights.</p>
            <button className="text-blue-600 font-medium hover:text-blue-800">View Resources →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

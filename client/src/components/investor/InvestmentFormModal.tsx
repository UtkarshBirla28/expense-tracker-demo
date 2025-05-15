import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useInvestmentContext } from "../../context/InvestmentContext"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface InvestmentFormModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InvestmentFormModal({ isOpen, onClose }: InvestmentFormModalProps) {
  const navigate = useNavigate()
  const { setInvestmentData } = useInvestmentContext()

  const [formData, setFormData] = useState({
    age: "",
    income: "",
    riskTolerance: "moderate",
    investmentGoals: "retirement",
    investmentHorizon: "long-term",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Convert string values to appropriate types
    const processedData = {
      ...formData,
      age: Number.parseInt(formData.age),
      income: Number.parseInt(formData.income.replace(/,/g, "")),
    }

    // Save data to context
    setInvestmentData(processedData)

    // Close modal and navigate to dashboard
    onClose()
    navigate("/investor/dashboard")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md focus:outline-none focus:ring-0">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Investment Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="Enter your age"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="income">Annual Income ($)</Label>
              <Input
                id="income"
                name="income"
                type="text"
                placeholder="Enter your annual income"
                value={formData.income}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskTolerance">Risk Tolerance</Label>
              <Select
                value={formData.riskTolerance}
                onValueChange={(value) => handleSelectChange("riskTolerance", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk tolerance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Investment Goals</Label>
              <RadioGroup
                value={formData.investmentGoals}
                onValueChange={(value: any) => handleSelectChange("investmentGoals", value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retirement" id="retirement" />
                  <Label htmlFor="retirement" className="font-normal">
                    Retirement
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wealth-building" id="wealth-building" />
                  <Label htmlFor="wealth-building" className="font-normal">
                    Wealth Building
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="education" id="education" />
                  <Label htmlFor="education" className="font-normal">
                    Education
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="home-purchase" id="home-purchase" />
                  <Label htmlFor="home-purchase" className="font-normal">
                    Home Purchase
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investmentHorizon">Investment Horizon</Label>
              <Select
                value={formData.investmentHorizon}
                onValueChange={(value) => handleSelectChange("investmentHorizon", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select investment horizon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short-term">Short-term (&lt; 5 years)</SelectItem>
                  <SelectItem value="medium-term">Medium-term (5-10 years)</SelectItem>
                  <SelectItem value="long-term">Long-term (&gt; 10 years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">View Recommendations</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

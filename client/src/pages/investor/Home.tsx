"use client"

import { useState } from "react"
import { Button } from "../../components/investor/ui/button"
import { InvestmentFormModal } from "../../components/investor/InvestmentFormModal"
import {
  ArrowRightIcon,
  BarChartIcon as ChartBarIcon,
  CurrencyIcon as CurrencyDollarIcon,
  ShieldCheckIcon,
} from "lucide-react"

export default function InvestorHome() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Grow Your Wealth with Smart Investments
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Our platform helps you make informed investment decisions based on your financial goals and risk
              tolerance.
            </p>
            <div className="mt-8 flex justify-center">
              <Button onClick={() => setIsFormOpen(true)} className="px-8 py-3 text-base font-medium rounded-md shadow">
                Start Investing Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Our Platform</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-500 mb-4">
                <ChartBarIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Data-Driven Insights</h3>
              <p className="mt-2 text-base text-gray-500">
                Our advanced analytics provide personalized investment recommendations based on market trends and your
                financial profile.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-500 mb-4">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Diversified Portfolios</h3>
              <p className="mt-2 text-base text-gray-500">
                Spread your investments across multiple asset classes to minimize risk and maximize returns.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-100 text-red-500 mb-4">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Secure Platform</h3>
              <p className="mt-2 text-base text-gray-500">
                Your data and investments are protected with enterprise-grade security measures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">What Our Investors Say</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 p-6 rounded-lg shadow">
              <p className="text-gray-600 italic">
                "The personalized investment recommendations helped me grow my portfolio by 15% in just six months."
              </p>
              <div className="mt-4">
                <p className="font-medium text-gray-900">John Smith</p>
                <p className="text-sm text-gray-500">Software Engineer</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow">
              <p className="text-gray-600 italic">
                "I've tried several investment platforms, but this one offers the best balance of simplicity and
                powerful features."
              </p>
              <div className="mt-4">
                <p className="font-medium text-gray-900">Sarah Johnson</p>
                <p className="text-sm text-gray-500">Marketing Director</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow">
              <p className="text-gray-600 italic">
                "As a beginner investor, I found the guidance and educational resources incredibly helpful in building
                my first portfolio."
              </p>
              <div className="mt-4">
                <p className="font-medium text-gray-900">Michael Chen</p>
                <p className="text-sm text-gray-500">Healthcare Professional</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Ready to Start Your Investment Journey?</h2>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Fill out our quick form to get personalized investment recommendations.
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="px-8 py-3 text-base font-medium rounded-md shadow inline-flex items-center"
              >
                Get Started <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Form Modal */}
      <InvestmentFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  )
}

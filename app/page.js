'use client';
import Link from 'next/link';
import { useState } from 'react';

const calculatorCategories = {
  'Loan Calculators': [
    { name: 'Loan EMI Calculator', path: '/calculators/loan-emi', description: 'Calculate your monthly EMI payments for any loan amount' },
    { name: 'Loan Repayment Calculator', path: '/calculators/loan-repayment', description: 'Plan your loan repayment schedule and total interest' },
    { name: 'Home Loan Calculator', path: '/calculators/home-loan', description: 'Calculate EMI and eligibility for home loans' },
    { name: 'Car Loan Calculator', path: '/calculators/car-loan', description: 'Estimate car loan EMI and total interest cost' },
    { name: 'Personal Loan Calculator', path: '/calculators/personal-loan', description: 'Calculate EMI for personal loans with various tenures' },
  ],
  'Investment Calculators': [
    { name: 'PF Calculator', path: '/calculators/pf', description: 'Calculate your Provident Fund returns and final amount' },
    { name: 'PPF Calculator', path: '/calculators/ppf', description: 'Estimate returns on Public Provident Fund investments' },
    { name: 'SIP Calculator', path: '/calculators/sip', description: 'Calculate returns on your systematic investment plans' },
    { name: 'Lumpsum Calculator', path: '/calculators/lumpsum', description: 'Calculate returns on one-time investments' },
    { name: 'FD Calculator', path: '/calculators/fd', description: 'Calculate Fixed Deposit maturity amount and interest' },
    { name: 'RD Calculator', path: '/calculators/rd', description: 'Calculate Recurring Deposit maturity amount' },
    { name: 'Compound Interest', path: '/calculators/compound-interest', description: 'Calculate compound interest with different compounding frequencies' },
  ],
  'Vehicle Calculators': [
    { name: 'EV Savings Calculator', path: '/calculators/ev-savings', description: 'Compare costs and savings between electric and conventional vehicles' },
    { name: 'Fuel Cost Calculator', path: '/calculators/fuel-cost', description: 'Calculate fuel costs for your travel and commute' },
    { name: 'Vehicle Depreciation', path: '/calculators/vehicle-depreciation', description: 'Estimate vehicle value depreciation over time' },
    { name: 'Total Cost of Ownership', path: '/calculators/total-cost-ownership', description: 'Calculate the total cost of owning a vehicle' },
  ],
  'Tax Calculators': [
    { name: 'Income Tax Calculator', path: '/calculators/income-tax', description: 'Calculate your income tax liability under different regimes' },
    { name: 'Capital Gains Tax', path: '/calculators/capital-gains', description: 'Calculate tax on your investment gains' },
    { name: 'GST Calculator', path: '/calculators/gst', description: 'Calculate GST amount and final price' },
    { name: 'HRA Calculator', path: '/calculators/hra', description: 'Calculate HRA exemption and tax benefits' },
  ],
  'Financial Planning': [
    { name: 'Retirement Calculator', path: '/calculators/retirement', description: 'Plan your retirement corpus and monthly investments' },
    { name: 'Education Planning', path: '/calculators/education-planning', description: 'Plan investments for your children\'s education' },
    { name: 'Marriage Planning', path: '/calculators/marriage-planning', description: 'Calculate savings needed for marriage expenses' },
    { name: 'Emergency Fund', path: '/calculators/emergency-fund', description: 'Calculate how much emergency fund you need' },
  ],
  'Business Calculators': [
    { name: 'Profit Margin', path: '/calculators/profit-margin', description: 'Calculate gross and net profit margins' },
    { name: 'Break Even Point', path: '/calculators/break-even', description: 'Calculate when your business will break even' },
    { name: 'ROI Calculator', path: '/calculators/roi', description: 'Calculate return on investment for your business' },
    { name: 'Working Capital', path: '/calculators/working-capital', description: 'Calculate working capital requirements' },
  ],
};

function highlightText(text, searchTerm) {
  if (!searchTerm) return text;
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  return parts.map((part, index) => 
    part.toLowerCase() === searchTerm.toLowerCase() ? 
      <span key={index} className="bg-yellow-200">{part}</span> : part
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');

  const filterCalculators = () => {
    if (!searchTerm) return calculatorCategories;

    const filtered = {};
    Object.entries(calculatorCategories).forEach(([category, items]) => {
      const matchedItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchedItems.length > 0) {
        filtered[category] = matchedItems;
      }
    });
    return filtered;
  };

  const filteredCategories = filterCalculators();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Financial Calculators
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Make informed financial decisions with our easy-to-use calculators
          </p>
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search calculators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute right-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-12">
          {Object.entries(filteredCategories).map(([category, calculators]) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{category}</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {calculators.map((calculator) => (
                  <Link
                    key={calculator.path}
                    href={calculator.path}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {highlightText(calculator.name, searchTerm)}
                    </h3>
                    <p className="text-gray-600">
                      {highlightText(calculator.description, searchTerm)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
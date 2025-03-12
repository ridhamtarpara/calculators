'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const calculatorCategories = {
  'Loan Calculators': [
    { name: 'Loan EMI Calculator', path: '/calculators/loan-emi' },
    { name: 'Loan Repayment Calculator', path: '/calculators/loan-repayment' },
    { name: 'Home Loan Calculator', path: '/calculators/home-loan' },
    { name: 'Car Loan Calculator', path: '/calculators/car-loan' },
    { name: 'Personal Loan Calculator', path: '/calculators/personal-loan' },
  ],
  'Investment Calculators': [
    { name: 'PF Calculator', path: '/calculators/pf' },
    { name: 'PPF Calculator', path: '/calculators/ppf' },
    { name: 'SIP Calculator', path: '/calculators/sip' },
    { name: 'Lumpsum Calculator', path: '/calculators/lumpsum' },
    { name: 'FD Calculator', path: '/calculators/fd' },
    { name: 'RD Calculator', path: '/calculators/rd' },
    { name: 'Compound Interest', path: '/calculators/compound-interest' },
  ],
  'Vehicle Calculators': [
    { name: 'EV Savings Calculator', path: '/calculators/ev-savings' },
    { name: 'Fuel Cost Calculator', path: '/calculators/fuel-cost' },
    { name: 'Vehicle Depreciation', path: '/calculators/vehicle-depreciation' },
    { name: 'Total Cost of Ownership', path: '/calculators/total-cost-ownership' },
  ],
  'Tax Calculators': [
    { name: 'Income Tax Calculator', path: '/calculators/income-tax' },
    { name: 'Capital Gains Tax', path: '/calculators/capital-gains' },
    { name: 'GST Calculator', path: '/calculators/gst' },
    { name: 'HRA Calculator', path: '/calculators/hra' },
  ],
  'Financial Planning': [
    { name: 'Retirement Calculator', path: '/calculators/retirement' },
    { name: 'Education Planning', path: '/calculators/education-planning' },
    { name: 'Marriage Planning', path: '/calculators/marriage-planning' },
    { name: 'Emergency Fund', path: '/calculators/emergency-fund' },
  ],
  'Business Calculators': [
    { name: 'Profit Margin', path: '/calculators/profit-margin' },
    { name: 'Break Even Point', path: '/calculators/break-even' },
    { name: 'ROI Calculator', path: '/calculators/roi' },
    { name: 'Working Capital', path: '/calculators/working-capital' },
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

export default function Sidebar() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');

  const filterItems = () => {
    if (!searchTerm) return calculatorCategories;

    const filtered = {};
    Object.entries(calculatorCategories).forEach(([category, items]) => {
      const matchedItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchedItems.length > 0) {
        filtered[category] = matchedItems;
      }
    });
    return filtered;
  };

  const filteredCategories = filterItems();

  return (
    <div className="w-64 bg-white h-screen shadow-xl fixed left-0 top-0 overflow-y-auto border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <Link 
          href="/" 
          className="flex items-center justify-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>Calculators</span>
        </Link>
      </div>
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            className="w-full px-4 py-2 pr-8 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search calculators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
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
      <nav className="p-4">
        {Object.entries(filteredCategories).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {category}
            </h2>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      pathname === item.path
                        ? 'text-blue-600 bg-blue-50 font-medium'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex-1">{highlightText(item.name, searchTerm)}</span>
                    {pathname === item.path && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
} 
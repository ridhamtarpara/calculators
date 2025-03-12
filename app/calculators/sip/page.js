'use client';

import { useState } from 'react';
import CalculatorLayout from '../../components/CalculatorLayout';
import CalculatorInput from '../../components/CalculatorInput';
import { formatCurrency, amountToWords, formatInputCurrency, parseInputCurrency } from '../../utils/currency';

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [result, setResult] = useState(null);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(value) && value !== '') {
      setMonthlyInvestment(formatInputCurrency(value));
    } else if (value === '') {
      setMonthlyInvestment('');
    }
  };

  const calculateSIP = (e) => {
    e.preventDefault();
    
    const P = parseInputCurrency(monthlyInvestment);
    const r = parseFloat(expectedReturn) / (12 * 100); // Monthly rate
    const n = parseFloat(timePeriod) * 12; // Total months
    
    // SIP calculation formula: P * (((1 + r)^n - 1) / r) * (1 + r)
    const amount = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const totalInvestment = P * n;
    const totalReturns = amount - totalInvestment;
    
    setResult(
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Total Investment</div>
            <div className="text-xl font-semibold text-gray-900">{formatCurrency(totalInvestment)}</div>
            <div className="mt-1 text-xs text-gray-500">{amountToWords(totalInvestment)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Total Returns</div>
            <div className="text-xl font-semibold text-blue-600">{formatCurrency(totalReturns)}</div>
            <div className="mt-1 text-xs text-gray-500">{amountToWords(totalReturns)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Total Amount</div>
            <div className="text-xl font-semibold text-green-600">{formatCurrency(amount)}</div>
            <div className="mt-1 text-xs text-gray-500">{amountToWords(amount)}</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          * The results are based on the assumptions provided and may vary based on market conditions.
        </div>
      </div>
    );
  };

  return (
    <CalculatorLayout
      title="SIP Calculator"
      description="Calculate the future value of your Systematic Investment Plan (SIP) and see how your money grows over time."
      onSubmit={calculateSIP}
      result={result}
    >
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
        <input
          type="text"
          value={monthlyInvestment}
          onChange={handleAmountChange}
          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter monthly investment amount"
          required
        />
      </div>
      
      <CalculatorInput
        label="Expected Annual Return"
        value={expectedReturn}
        onChange={(e) => setExpectedReturn(e.target.value)}
        suffix="%"
        placeholder="Enter expected annual return"
        step="0.1"
        min="1"
      />
      
      <CalculatorInput
        label="Time Period"
        value={timePeriod}
        onChange={(e) => setTimePeriod(e.target.value)}
        suffix="Years"
        placeholder="Enter investment duration"
        min="1"
      />
    </CalculatorLayout>
  );
} 
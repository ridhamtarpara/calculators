'use client';
import { useState, useEffect } from 'react';
import { formatCurrency, amountToWords, calculateLoanEMI, calculateTotalPayment, calculateTotalInterest, formatInputCurrency, parseInputCurrency, calculateAmortizationSchedule } from '../utils/currency';
import CalculatorLayout from './CalculatorLayout';

export default function LoanCalculator({ 
  title, 
  minAmount = 10000,
  maxAmount = 10000000,
  minInterest = 1,
  maxInterest = 30,
  minTerm = 1,
  maxTerm = 30,
  defaultAmount = 500000,
  defaultInterest = 10.5,
  defaultTerm = 5
}) {
  const [loanAmount, setLoanAmount] = useState(formatInputCurrency(defaultAmount.toString()));
  const [interestRate, setInterestRate] = useState(defaultInterest.toString());
  const [loanTerm, setLoanTerm] = useState(defaultTerm.toString());
  const [results, setResults] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [monthlyView, setMonthlyView] = useState(false);
  const [monthlySchedule, setMonthlySchedule] = useState(null);

  useEffect(() => {
    if (schedule) {
      // Calculate monthly schedule when yearly schedule changes
      const months = [];
      let balance = parseInputCurrency(loanAmount);
      const rate = parseFloat(interestRate);
      const monthlyRate = rate / (12 * 100);
      const totalMonths = parseFloat(loanTerm) * 12;
      const emi = calculateLoanEMI(balance, rate, parseFloat(loanTerm));

      for (let month = 1; month <= totalMonths; month++) {
        const interest = balance * monthlyRate;
        const principal = emi - interest;
        balance = balance - principal;

        months.push({
          month,
          year: Math.ceil(month / 12),
          openingBalance: balance + principal,
          emi,
          interest,
          principal,
          closingBalance: balance
        });
      }
      setMonthlySchedule(months);
    }
  }, [schedule, loanAmount, interestRate, loanTerm]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(value) && value !== '') {
      setLoanAmount(formatInputCurrency(value));
    } else if (value === '') {
      setLoanAmount('');
    }
  };

  const calculateLoan = (e) => {
    e.preventDefault();
    const principal = parseInputCurrency(loanAmount);
    const rate = parseFloat(interestRate);
    const term = parseFloat(loanTerm);
    
    const monthlyEMI = calculateLoanEMI(principal, rate, term);
    const totalAmount = calculateTotalPayment(monthlyEMI, term);
    const totalInterest = calculateTotalInterest(totalAmount, principal);
    const amortizationSchedule = calculateAmortizationSchedule(principal, rate, term);
    
    setResults({
      emi: monthlyEMI,
      totalAmount: totalAmount,
      totalInterest: totalInterest,
      principal: principal
    });
    setSchedule(amortizationSchedule);
  };

  const resultContent = results && (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Monthly EMI</h2>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(results.emi)}</p>
          <p className="text-sm text-gray-600 mt-1">{amountToWords(results.emi)}</p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Amount Payable</h2>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(results.totalAmount)}</p>
          <p className="text-sm text-gray-600 mt-1">{amountToWords(results.totalAmount)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-4 bg-gray-50 rounded-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Principal Amount</h2>
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(results.principal)}</p>
          <p className="text-sm text-gray-600 mt-1">{amountToWords(results.principal)}</p>
        </div>
        
        <div className="p-4 bg-orange-50 rounded-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Interest</h2>
          <p className="text-xl font-semibold text-orange-600">{formatCurrency(results.totalInterest)}</p>
          <p className="text-sm text-gray-600 mt-1">{amountToWords(results.totalInterest)}</p>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <h3 className="font-medium text-gray-900">Loan Summary</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Principal Amount: {formatCurrency(results.principal)}</li>
          <li>• Interest Rate: {interestRate}% per annum</li>
          <li>• Loan Term: {loanTerm} years ({loanTerm * 12} months)</li>
          <li>• Monthly EMI: {formatCurrency(results.emi)}</li>
          <li>• Total Interest Payable: {formatCurrency(results.totalInterest)}</li>
          <li>• Total Amount Payable: {formatCurrency(results.totalAmount)}</li>
        </ul>
      </div>

      {schedule && (
        <div className="mt-8">
          <div className="sticky top-0 bg-white z-10 pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Loan Amortization Schedule</h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Yearly</span>
                <button
                  type="button"
                  onClick={() => setMonthlyView(!monthlyView)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    monthlyView ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={monthlyView}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      monthlyView ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">Monthly</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {monthlyView ? 'Month' : 'Year'}
                    </th>
                    <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opening Balance
                    </th>
                    <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {monthlyView ? 'EMI' : 'EMI (Year)'}
                    </th>
                    <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interest Paid
                    </th>
                    <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Principal Paid
                    </th>
                    <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Closing Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthlyView ? (
                    monthlySchedule?.map((row, index) => (
                      <tr key={row.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {`Month ${row.month} (Year ${row.year})`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(row.openingBalance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(row.emi)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(row.interest)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(row.principal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(row.closingBalance)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    schedule.map((row, index) => (
                      <tr key={row.year} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(row.openingBalance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(row.yearlyEMI)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(row.yearlyInterest)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(row.yearlyPrincipal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(row.closingBalance)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <CalculatorLayout
      title={title}
      description="Calculate your loan EMI, total interest payable, and view detailed amortization schedule."
      onSubmit={calculateLoan}
      result={resultContent}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loan Amount
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
          <input
            type="text"
            value={loanAmount}
            onChange={handleAmountChange}
            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter loan amount"
            required
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">Min: {formatCurrency(minAmount)} - Max: {formatCurrency(maxAmount)}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interest Rate (% per annum)
        </label>
        <input
          type="number"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter interest rate"
          step="0.1"
          min={minInterest}
          max={maxInterest}
          required
        />
        <p className="mt-1 text-sm text-gray-500">Min: {minInterest}% - Max: {maxInterest}%</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loan Term (years)
        </label>
        <input
          type="number"
          value={loanTerm}
          onChange={(e) => setLoanTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter loan term in years"
          min={minTerm}
          max={maxTerm}
          required
        />
        <p className="mt-1 text-sm text-gray-500">Min: {minTerm} year - Max: {maxTerm} years</p>
      </div>
    </CalculatorLayout>
  );
} 
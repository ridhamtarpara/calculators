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
  // Simplified: store all prepayments at monthly level only
  const [monthlyPrepayments, setMonthlyPrepayments] = useState({});
  const [savings, setSavings] = useState(null);

  // Calculate savings when prepayments are added
  useEffect(() => {
    if (results && Object.keys(monthlyPrepayments).length > 0) {
      // Calculate original total payment without prepayments
      const principal = parseInputCurrency(loanAmount);
      const rate = parseFloat(interestRate);
      const term = parseFloat(loanTerm);
      const monthlyEMI = calculateLoanEMI(principal, rate, term);
      const originalTotalPayment = calculateTotalPayment(monthlyEMI, term);
      const originalMonths = term * 12;
      
      // Calculate actual total payment with prepayments
      let actualTotalPayment = 0;
      let actualMonths = 0;
      
      if (monthlySchedule) {
        // Sum up all EMIs paid
        actualTotalPayment = monthlySchedule.reduce((total, row) => total + row.emi, 0);
        // Add all prepayments
        actualTotalPayment += monthlySchedule.reduce((total, row) => total + row.prepayment, 0);
        // Count months until loan is paid off
        actualMonths = monthlySchedule.length;
      }
      
      // Calculate savings
      const moneySaved = Math.round(originalTotalPayment - actualTotalPayment);
      const monthsSaved = Math.round(originalMonths - actualMonths);
      
      if (moneySaved > 0 || monthsSaved > 0) {
        setSavings({
          amount: moneySaved,
          months: monthsSaved
        });
      } else {
        setSavings(null);
      }
    } else {
      setSavings(null);
    }
  }, [monthlySchedule, results, loanAmount, interestRate, loanTerm]);

  // Calculate monthly schedule based on prepayments
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
        // If balance is already zero or less, break the loop
        if (balance <= 0) {
          break;
        }
        
        const interest = Math.round(balance * monthlyRate);
        let principal = Math.round(emi - interest);
        
        // Apply prepayment if exists for this month
        const year = Math.ceil(month / 12);
        const monthInYear = month % 12 || 12;
        const monthKey = `${year}-${monthInYear}`;
        const prepayment = monthlyPrepayments[monthKey] || 0;
        
        // Adjust principal payment if it would make balance negative
        if (balance < principal + prepayment) {
          principal = balance - prepayment > 0 ? Math.round(balance - prepayment) : 0;
        }
        
        // Reduce balance by principal and prepayment
        balance = balance - principal - prepayment;
        
        // Ensure balance never goes below zero
        if (balance < 0) {
          balance = 0;
        }

        months.push({
          month,
          year,
          monthInYear,
          openingBalance: Math.round(balance + principal + prepayment),
          emi: Math.round(principal + interest), // Adjusted EMI based on actual principal paid
          interest,
          principal,
          prepayment,
          closingBalance: Math.round(balance)
        });
        
        // If balance is zero, we're done
        if (balance === 0) {
          break;
        }
      }
      setMonthlySchedule(months);
    }
  }, [schedule, loanAmount, interestRate, loanTerm, monthlyPrepayments]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(value) && value !== '') {
      setLoanAmount(formatInputCurrency(value));
    } else if (value === '') {
      setLoanAmount('');
    }
  };

  // Handle prepayment change for both monthly and yearly views
  const handlePrepaymentChange = (period, view) => (e) => {
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(value)) {
      const prepaymentAmount = value ? parseFloat(value) : 0;
      
      if (view === 'yearly') {
        // For yearly view, we're actually editing month 12 of that year
        const year = period;
        
        // Create a copy of the current prepayments
        const updatedPrepayments = { ...monthlyPrepayments };
        
        // Reset all months for this year to 0
        for (let month = 1; month <= 12; month++) {
          const monthKey = `${year}-${month}`;
          if (month === 12) {
            // Set month 12 to the full yearly amount
            updatedPrepayments[monthKey] = prepaymentAmount;
          } else {
            // Reset other months to 0
            updatedPrepayments[monthKey] = 0;
          }
        }
        
        setMonthlyPrepayments(updatedPrepayments);
      } else {
        // For monthly view, store by month-year key
        const year = Math.ceil(period / 12);
        const month = period % 12 || 12;
        const monthKey = `${year}-${month}`;
        
        setMonthlyPrepayments(prev => ({
          ...prev,
          [monthKey]: prepaymentAmount
        }));
      }
    }
  };

  // Handle prepayment blur for both monthly and yearly views
  const handlePrepaymentBlur = (period, view) => (e) => {
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(value)) {
      const prepaymentAmount = value ? parseFloat(value) : 0;
      
      if (view === 'yearly') {
        // For yearly view, we're actually editing month 12 of that year
        const year = period;
        
        // Create a copy of the current prepayments
        const updatedPrepayments = { ...monthlyPrepayments };
        
        // Reset all months for this year to 0
        for (let month = 1; month <= 12; month++) {
          const monthKey = `${year}-${month}`;
          if (month === 12) {
            // Set month 12 to the full yearly amount
            updatedPrepayments[monthKey] = prepaymentAmount;
          } else {
            // Reset other months to 0
            updatedPrepayments[monthKey] = 0;
          }
        }
        
        // Update prepayments state
        setMonthlyPrepayments(updatedPrepayments);
      } else {
        // For monthly view, store by month-year key
        const year = Math.ceil(period / 12);
        const month = period % 12 || 12;
        const monthKey = `${year}-${month}`;
        
        // Update prepayments state
        setMonthlyPrepayments(prev => ({
          ...prev,
          [monthKey]: prepaymentAmount
        }));
      }
      
      // Recalculate amortization schedule with new prepayments
      if (results) {
        const principal = parseInputCurrency(loanAmount);
        const rate = parseFloat(interestRate);
        const term = parseFloat(loanTerm);
        
        // Small delay to ensure prepayments are updated
        setTimeout(() => {
          const amortizationSchedule = calculateAmortizationSchedule(principal, rate, term, monthlyPrepayments);
          setSchedule(amortizationSchedule);
        }, 50);
      }
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
    const amortizationSchedule = calculateAmortizationSchedule(principal, rate, term, monthlyPrepayments);
    
    setResults({
      emi: Math.round(monthlyEMI),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      principal: Math.round(principal)
    });
    setSchedule(amortizationSchedule);
  };

  // Calculate yearly prepayment totals for display in yearly view
  const getYearlyPrepaymentTotal = (year) => {
    let total = 0;
    for (let month = 1; month <= 12; month++) {
      const monthKey = `${year}-${month}`;
      if (monthlyPrepayments[monthKey]) {
        total += monthlyPrepayments[monthKey];
      }
    }
    return total;
  };

  const handleViewToggle = () => {
    setMonthlyView(!monthlyView);
    
    // Force recalculation when switching views
    if (results) {
      setTimeout(() => {
        const principal = parseInputCurrency(loanAmount);
        const rate = parseFloat(interestRate);
        const term = parseFloat(loanTerm);
        const amortizationSchedule = calculateAmortizationSchedule(principal, rate, term, monthlyPrepayments);
        setSchedule(amortizationSchedule);
      }, 50);
    }
  };

  const resultContent = results && (
    <div className="relative pb-16">
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
        <div className="p-4 bg-purple-50 rounded-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Principal Amount</h2>
          <p className="text-xl font-semibold text-purple-600">{formatCurrency(results.principal)}</p>
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
                  onClick={handleViewToggle}
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
                      Prepayment
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
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                            <input
                              type="text"
                              value={
                                monthlyPrepayments[`${row.year}-${row.monthInYear}`] 
                                  ? formatInputCurrency(monthlyPrepayments[`${row.year}-${row.monthInYear}`].toString()) 
                                  : ''
                              }
                              onChange={handlePrepaymentChange(row.month, 'monthly')}
                              onBlur={handlePrepaymentBlur(row.month, 'monthly')}
                              className="w-full pl-7 pr-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                              placeholder="Add prepayment"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(row.closingBalance)}
                          {row.closingBalance > 0 && index === (monthlySchedule?.length - 1) && (
                            <span className="ml-1 inline-flex items-center text-gray-500 cursor-help group relative">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="hidden group-hover:block absolute right-0 top-0 -translate-y-full bg-gray-800 text-white text-xs rounded py-2 px-3 z-50">
                                This small remaining balance is due to rounding. We round numbers to make them easier to read.
                              </span>
                            </span>
                          )}
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
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                            <input
                              type="text"
                              value={getYearlyPrepaymentTotal(row.year) ? formatInputCurrency(getYearlyPrepaymentTotal(row.year).toString()) : ''}
                              onChange={handlePrepaymentChange(row.year, 'yearly')}
                              onBlur={handlePrepaymentBlur(row.year, 'yearly')}
                              className="w-full pl-7 pr-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                              placeholder="Add prepayment"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(row.closingBalance)}
                          {row.closingBalance > 0 && index === (schedule?.length - 1) && (
                            <span className="ml-1 inline-flex items-center text-gray-500 cursor-help group relative">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="hidden group-hover:block absolute right-0 top-0 -translate-y-full bg-gray-800 text-white text-xs rounded py-2 px-3 z-50">
                                This small remaining balance is due to rounding. We round numbers to make them easier to read.
                              </span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Total
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {/* No total for opening balance */}
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {monthlyView 
                        ? formatCurrency(monthlySchedule?.reduce((total, row) => total + row.emi, 0) || 0)
                        : formatCurrency(schedule?.reduce((total, row) => total + row.yearlyEMI, 0) || 0)
                      }
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {monthlyView 
                        ? formatCurrency(monthlySchedule?.reduce((total, row) => total + row.interest, 0) || 0)
                        : formatCurrency(schedule?.reduce((total, row) => total + row.yearlyInterest, 0) || 0)
                      }
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {monthlyView 
                        ? formatCurrency(monthlySchedule?.reduce((total, row) => total + row.principal, 0) || 0)
                        : formatCurrency(schedule?.reduce((total, row) => total + row.yearlyPrincipal, 0) || 0)
                      }
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {monthlyView 
                        ? formatCurrency(monthlySchedule?.reduce((total, row) => total + row.prepayment, 0) || 0)
                        : formatCurrency(schedule?.reduce((total, row) => total + row.yearlyPrepayment, 0) || 0)
                      }
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {/* No total for closing balance */}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add fixed savings banner at the bottom of the calculator section */}
      {savings && savings.amount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:left-[280px] bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3 z-50 shadow-lg" role="alert">
          <p className="font-bold">Savings with Prepayments</p>
          <p className="text-sm">
            You saved {formatCurrency(savings.amount)} 
            {savings.months > 0 && ` (${savings.months} EMI${savings.months > 1 ? 's' : ''})`} with your prepayments!
          </p>
        </div>
      )}
    </div>
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
'use client';
import { useState, useEffect } from 'react';
import { formatCurrency, amountToWords, formatInputCurrency, parseInputCurrency } from '../utils/currency';
import CalculatorLayout from './CalculatorLayout';

export default function SIPCalculator({ 
  title, 
  description,
  minAmount = 500,
  maxAmount = 100000,
  minInterest = 1,
  maxInterest = 30,
  minTerm = 1,
  maxTerm = 50,
  defaultAmount = 10000,
  defaultInterest = 9,
  defaultTerm = 20
}) {
  const [monthlyInvestment, setMonthlyInvestment] = useState(formatInputCurrency(defaultAmount.toString()));
  const [expectedReturn, setExpectedReturn] = useState(defaultInterest.toString());
  const [timePeriod, setTimePeriod] = useState(defaultTerm.toString());
  const [results, setResults] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [monthlyView, setMonthlyView] = useState(false);
  const [monthlySchedule, setMonthlySchedule] = useState(null);
  const [withdrawals, setWithdrawals] = useState({});

  // Calculate monthly schedule based on withdrawals
  useEffect(() => {
    if (schedule) {
      // Calculate monthly schedule when yearly schedule changes
      const months = [];
      const investment = parseInputCurrency(monthlyInvestment);
      const rate = parseFloat(expectedReturn);
      const monthlyRate = rate / (12 * 100);
      const totalMonths = parseFloat(timePeriod) * 12;
      
      let totalValue = 0;

      for (let month = 1; month <= totalMonths; month++) {
        const year = Math.ceil(month / 12);
        const monthInYear = month % 12 || 12;
        const monthKey = `${year}-${monthInYear}`;
        
        // Calculate interest for this month
        const interestEarned = Math.round(totalValue * monthlyRate);
        
        // Apply monthly investment
        totalValue += investment;
        
        // Add interest
        totalValue += interestEarned;
        
        // Apply withdrawal if exists for this month
        const withdrawal = withdrawals[monthKey] || 0;
        
        // Reduce value by withdrawal
        totalValue = Math.max(0, totalValue - withdrawal);

        months.push({
          month,
          year,
          monthInYear,
          startingValue: Math.round(totalValue - investment - interestEarned + withdrawal),
          investment,
          interestEarned,
          withdrawal,
          endingValue: Math.round(totalValue)
        });
        
        // If all money is withdrawn, we're done
        if (totalValue === 0) {
          break;
        }
      }
      setMonthlySchedule(months);
    }
  }, [schedule, monthlyInvestment, expectedReturn, timePeriod, withdrawals]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(value) && value !== '') {
      setMonthlyInvestment(formatInputCurrency(value));
    } else if (value === '') {
      setMonthlyInvestment('');
    }
  };

  // Handle withdrawal change for both monthly and yearly views
  const handleWithdrawalChange = (period, view) => (e) => {
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(value)) {
      const withdrawalAmount = value ? parseFloat(value) : 0;
      
      if (view === 'yearly') {
        // For yearly view, we're actually editing month 12 of that year
        const year = period;
        
        // Create a copy of the current withdrawals
        const updatedWithdrawals = { ...withdrawals };
        
        // Set the yearly amount to the last month of the year
        const monthKey = `${year}-12`;
        updatedWithdrawals[monthKey] = withdrawalAmount;
        
        setWithdrawals(updatedWithdrawals);
      } else {
        // For monthly view, store by month-year key
        const year = Math.ceil(period / 12);
        const month = period % 12 || 12;
        const monthKey = `${year}-${month}`;
        
        setWithdrawals(prev => ({
          ...prev,
          [monthKey]: withdrawalAmount
        }));
      }
    }
  };

  // Handle withdrawal blur for both monthly and yearly views
  const handleWithdrawalBlur = (period, view) => (e) => {
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(value)) {
      const withdrawalAmount = value ? parseFloat(value) : 0;
      
      if (view === 'yearly') {
        // For yearly view, we're actually editing month 12 of that year
        const year = period;
        
        // Create a copy of the current withdrawals
        const updatedWithdrawals = { ...withdrawals };
        
        // Set the yearly amount to the last month of the year
        const monthKey = `${year}-12`;
        updatedWithdrawals[monthKey] = withdrawalAmount;
        
        // Update withdrawals state
        setWithdrawals(updatedWithdrawals);
      } else {
        // For monthly view, store by month-year key
        const year = Math.ceil(period / 12);
        const month = period % 12 || 12;
        const monthKey = `${year}-${month}`;
        
        // Update withdrawals state
        setWithdrawals(prev => ({
          ...prev,
          [monthKey]: withdrawalAmount
        }));
      }
      
      // Recalculate schedule with new withdrawals
      if (results) {
        // Small delay to ensure withdrawals are updated
        setTimeout(() => {
          const results = calculateSIPSchedule();
          setSchedule(results.schedule);
        }, 50);
      }
    }
  };

  const calculateSIPSchedule = () => {
    const investment = parseInputCurrency(monthlyInvestment);
    const rate = parseFloat(expectedReturn);
    const years = parseFloat(timePeriod);
    
    // Calculate SIP returns
    const monthlyRate = rate / (12 * 100);
    const months = years * 12;
    
    // Calculate future value using SIP formula
    // FV = P × ((1 + r)^n - 1) / r × (1 + r)
    // where P is monthly investment, r is monthly rate, n is number of months
    const futureValue = investment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    
    const totalInvestment = investment * months;
    const totalReturns = futureValue - totalInvestment;
    
    // Calculate yearly schedule
    const yearlySchedule = [];
    let yearlyData = {
      year: 1,
      startingValue: 0,
      yearlyInvestment: 0,
      yearlyInterest: 0,
      yearlyWithdrawal: 0
    };
    
    let runningValue = 0;
    
    for (let month = 1; month <= months; month++) {
      // Calculate interest for this month
      const interestEarned = runningValue * monthlyRate;
      
      // Apply monthly investment
      runningValue += investment;
      
      // Add interest
      runningValue += interestEarned;
      
      // Apply withdrawal if exists for this month
      const currentYear = Math.ceil(month / 12);
      const monthInYear = month % 12 || 12;
      const monthKey = `${currentYear}-${monthInYear}`;
      const withdrawal = withdrawals[monthKey] || 0;
      
      // Reduce value by withdrawal
      runningValue = Math.max(0, runningValue - withdrawal);
      
      yearlyData.yearlyInvestment += investment;
      yearlyData.yearlyInterest += interestEarned;
      yearlyData.yearlyWithdrawal += withdrawal;
      
      if (month % 12 === 0 || month === months || runningValue === 0) {
        yearlySchedule.push({
          ...yearlyData,
          yearlyInvestment: Math.round(yearlyData.yearlyInvestment),
          yearlyInterest: Math.round(yearlyData.yearlyInterest),
          yearlyWithdrawal: Math.round(yearlyData.yearlyWithdrawal),
          endingValue: Math.round(runningValue)
        });
        
        if (month < months && runningValue > 0) {
          yearlyData = {
            year: yearlyData.year + 1,
            startingValue: Math.round(runningValue),
            yearlyInvestment: 0,
            yearlyInterest: 0,
            yearlyWithdrawal: 0
          };
        }
      }
      
      // If all money is withdrawn, we're done
      if (runningValue === 0) {
        break;
      }
    }
    
    return {
      totalInvestment: Math.round(totalInvestment),
      totalReturns: Math.round(totalReturns),
      totalAmount: Math.round(futureValue),
      schedule: yearlySchedule
    };
  };

  const calculateSIP = (e) => {
    e.preventDefault();
    
    const results = calculateSIPSchedule();
    
    setResults({
      totalInvestment: results.totalInvestment,
      totalReturns: results.totalReturns,
      totalAmount: results.totalAmount
    });
    
    setSchedule(results.schedule);
  };

  const getYearlyWithdrawalTotal = (year) => {
    // For yearly view, we're only storing the withdrawal in month 12
    const monthKey = `${year}-12`;
    return withdrawals[monthKey] || 0;
  };

  const handleViewToggle = () => {
    setMonthlyView(!monthlyView);
  };

  const resultContent = results && (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-blue-50 rounded-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Investment</h2>
          <p className="text-xl font-semibold text-blue-600">{formatCurrency(results.totalInvestment)}</p>
          <p className="text-sm text-gray-600 mt-1">{amountToWords(results.totalInvestment)}</p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Returns</h2>
          <p className="text-xl font-semibold text-green-600">{formatCurrency(results.totalReturns)}</p>
          <p className="text-sm text-gray-600 mt-1">{amountToWords(results.totalReturns)}</p>
        </div>
        
        <div className="p-4 bg-purple-50 rounded-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Amount</h2>
          <p className="text-xl font-semibold text-purple-600">{formatCurrency(results.totalAmount)}</p>
          <p className="text-sm text-gray-600 mt-1">{amountToWords(results.totalAmount)}</p>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <h3 className="font-medium text-gray-900">SIP Summary</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Monthly Investment: {formatCurrency(parseInputCurrency(monthlyInvestment))}</li>
          <li>• Expected Return Rate: {expectedReturn}% per annum</li>
          <li>• Time Period: {timePeriod} years ({timePeriod * 12} months)</li>
          <li>• Total Investment: {formatCurrency(results.totalInvestment)}</li>
          <li>• Total Returns: {formatCurrency(results.totalReturns)}</li>
          <li>• Total Amount: {formatCurrency(results.totalAmount)}</li>
        </ul>
      </div>
      
      {schedule && (
        <div className="mt-8">
          <div className="sticky top-0 bg-white z-10 pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">SIP Growth Schedule</h3>
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
                      Starting Value
                    </th>
                    <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {monthlyView ? 'Monthly Investment' : 'Yearly Investment'}
                    </th>
                    <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interest Earned
                    </th>
                    <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Withdrawal
                    </th>
                    <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investment Value
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
                          {formatCurrency(row.startingValue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(row.investment)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {formatCurrency(row.interestEarned)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                            <input
                              type="text"
                              value={
                                withdrawals[`${row.year}-${row.monthInYear}`]
                                    ? formatInputCurrency((withdrawals[`${row.year}-${row.monthInYear}`]).toString())
                                    : ''
                              }
                              onChange={handleWithdrawalChange(row.month, 'monthly')}
                              onBlur={handleWithdrawalBlur(row.month, 'monthly')}
                              className="block w-full pl-7 pr-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                              placeholder="Add Withdrawal Amount"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {formatCurrency(row.endingValue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    schedule?.map((row, index) => (
                      <tr key={row.year} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {`Year ${row.year}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(row.startingValue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(row.yearlyInvestment)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {formatCurrency(row.yearlyInterest)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                            <input
                              type="text"
                              value={getYearlyWithdrawalTotal(row.year) ? formatInputCurrency(getYearlyWithdrawalTotal(row.year).toString()) : ''}
                              onChange={handleWithdrawalChange(row.year, 'yearly')}
                              onBlur={handleWithdrawalBlur(row.year, 'yearly')}
                              className="block w-full pl-7 pr-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                              placeholder="Add Withdrawal Amount"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {formatCurrency(row.endingValue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {/* No total for starting value */}
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(results.totalInvestment)}
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(results.totalReturns)}
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {monthlyView 
                        ? formatCurrency(monthlySchedule?.reduce((total, row) => total + row.withdrawal, 0) || 0)
                        : formatCurrency(schedule?.reduce((total, row) => total + row.yearlyWithdrawal, 0) || 0)
                      }
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {formatCurrency(results.totalAmount - (monthlyView 
                        ? (monthlySchedule?.reduce((total, row) => total + row.withdrawal, 0) || 0)
                        : (schedule?.reduce((total, row) => total + row.yearlyWithdrawal, 0) || 0))
                      )}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <CalculatorLayout
      title={title}
      description={description}
      onSubmit={calculateSIP}
      result={resultContent}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Monthly Investment
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
          <input
            type="text"
            value={monthlyInvestment}
            onChange={handleAmountChange}
            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter monthly investment"
            required
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">Min: {formatCurrency(minAmount)} - Max: {formatCurrency(maxAmount)}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expected Annual Return (% per annum)
        </label>
        <input
          type="number"
          value={expectedReturn}
          onChange={(e) => setExpectedReturn(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter expected return rate"
          step="0.1"
          min={minInterest}
          max={maxInterest}
          required
        />
        <p className="mt-1 text-sm text-gray-500">Min: {minInterest}% - Max: {maxInterest}%</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Period (years)
        </label>
        <input
          type="number"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter time period in years"
          min={minTerm}
          max={maxTerm}
          required
        />
        <p className="mt-1 text-sm text-gray-500">Min: {minTerm} year - Max: {maxTerm} years</p>
      </div>
    </CalculatorLayout>
  );
} 
const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

export function formatInputCurrency(value) {
  if (!value) return '';
  // Remove any non-digit characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, '');
  // Ensure only one decimal point
  const parts = cleanValue.split('.');
  const wholePart = parts[0];
  const decimalPart = parts[1] || '';
  
  // Format whole part with commas (Indian system)
  const lastThree = wholePart.substring(wholePart.length - 3);
  const otherNumbers = wholePart.substring(0, wholePart.length - 3);
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const withCommas = otherNumbers ? formatted + ',' + lastThree : lastThree;
  
  // Return with decimal part if exists
  return decimalPart ? `${withCommas}.${decimalPart.slice(0, 2)}` : withCommas;
}

export function parseInputCurrency(value) {
  return parseFloat(value.replace(/,/g, '')) || 0;
}

export function numberToWords(num) {
  if (num === 0) return 'Zero';
  
  function convertLessThanThousand(n) {
    if (n === 0) return '';
    
    if (n < 20) return ones[n] + ' ';
    
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '') + ' ';
    }
    
    return ones[Math.floor(n / 100)] + ' Hundred ' + convertLessThanThousand(n % 100);
  }
  
  let words = '';
  let crore = Math.floor(num / 10000000);
  num %= 10000000;
  let lakh = Math.floor(num / 100000);
  num %= 100000;
  let thousand = Math.floor(num / 1000);
  num %= 1000;
  
  if (crore > 0) {
    words += convertLessThanThousand(crore) + 'Crore ';
  }
  if (lakh > 0) {
    words += convertLessThanThousand(lakh) + 'Lakh ';
  }
  if (thousand > 0) {
    words += convertLessThanThousand(thousand) + 'Thousand ';
  }
  if (num > 0) {
    words += convertLessThanThousand(num);
  }
  
  return words.trim();
}

export function formatCurrency(amount) {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formatter.format(amount);
}

export function amountToWords(amount) {
  const rupees = Math.floor(amount);
  const paisa = Math.round((amount - rupees) * 100);
  
  let result = '';
  if (rupees > 0) {
    result += `Rupees ${numberToWords(rupees)}`;
  }
  
  if (paisa > 0) {
    if (rupees > 0) result += ' and ';
    result += `${numberToWords(paisa)} Paisa`;
  }
  
  return result || 'Zero Rupees';
}

export function calculateLoanEMI(principal, ratePerAnnum, tenureYears) {
  const ratePerMonth = ratePerAnnum / (12 * 100);
  const months = tenureYears * 12;
  const emi = principal * ratePerMonth * Math.pow(1 + ratePerMonth, months) / (Math.pow(1 + ratePerMonth, months) - 1);
  return emi;
}

export function calculateTotalPayment(emi, tenureYears) {
  return emi * tenureYears * 12;
}

export function calculateTotalInterest(totalPayment, principal) {
  return totalPayment - principal;
}

export function calculateAmortizationSchedule(principal, ratePerAnnum, tenureYears) {
  const ratePerMonth = ratePerAnnum / (12 * 100);
  const months = tenureYears * 12;
  const emi = calculateLoanEMI(principal, ratePerAnnum, tenureYears);
  
  let schedule = [];
  let balance = principal;
  let yearlyData = {
    year: 1,
    openingBalance: balance,
    yearlyEMI: 0,
    yearlyInterest: 0,
    yearlyPrincipal: 0
  };
  
  for (let month = 1; month <= months; month++) {
    const interest = balance * ratePerMonth;
    const principalPaid = emi - interest;
    balance = balance - principalPaid;
    
    yearlyData.yearlyEMI += emi;
    yearlyData.yearlyInterest += interest;
    yearlyData.yearlyPrincipal += principalPaid;
    
    if (month % 12 === 0 || month === months) {
      schedule.push({
        ...yearlyData,
        closingBalance: balance
      });
      
      if (month < months) {
        yearlyData = {
          year: yearlyData.year + 1,
          openingBalance: balance,
          yearlyEMI: 0,
          yearlyInterest: 0,
          yearlyPrincipal: 0
        };
      }
    }
  }
  
  return schedule;
} 
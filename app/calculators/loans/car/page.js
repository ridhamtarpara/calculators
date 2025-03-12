import LoanCalculator from '@/app/components/LoanCalculator';

export default function CarLoanCalculator() {
  return (
    <LoanCalculator
      title="Car Loan Calculator"
      minAmount={100000}
      maxAmount={10000000}
      minInterest={7}
      maxInterest={15}
      minTerm={1}
      maxTerm={7}
      defaultAmount={800000}
      defaultInterest={9.5}
      defaultTerm={5}
    />
  );
} 
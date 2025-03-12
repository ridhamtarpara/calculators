import LoanCalculator from '@/app/components/LoanCalculator';

export default function HomeLoanCalculator() {
  return (
    <LoanCalculator
      title="Home Loan Calculator"
      minAmount={100000}
      maxAmount={50000000}
      minInterest={6.5}
      maxInterest={12}
      minTerm={5}
      maxTerm={30}
      defaultAmount={3000000}
      defaultInterest={8.5}
      defaultTerm={20}
    />
  );
} 
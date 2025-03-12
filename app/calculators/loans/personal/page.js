import LoanCalculator from '@/app/components/LoanCalculator';

export default function PersonalLoanCalculator() {
  return (
    <LoanCalculator
      title="Personal Loan Calculator"
      minAmount={10000}
      maxAmount={2000000}
      minInterest={8}
      maxInterest={24}
      minTerm={1}
      maxTerm={5}
      defaultAmount={500000}
      defaultInterest={14}
      defaultTerm={3}
    />
  );
} 
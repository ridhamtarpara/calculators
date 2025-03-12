import LoanCalculator from '@/app/components/LoanCalculator';

export default function EducationLoanCalculator() {
  return (
    <LoanCalculator
      title="Education Loan Calculator"
      minAmount={50000}
      maxAmount={10000000}
      minInterest={7.5}
      maxInterest={14}
      minTerm={3}
      maxTerm={15}
      defaultAmount={1000000}
      defaultInterest={8.5}
      defaultTerm={7}
    />
  );
} 
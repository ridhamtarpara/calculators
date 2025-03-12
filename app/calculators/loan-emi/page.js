import LoanCalculator from '@/app/components/LoanCalculator';

export default function LoanEMICalculator() {
  return (
    <LoanCalculator
      title="Loan EMI Calculator"
      minAmount={10000}
      maxAmount={10000000}
      minInterest={1}
      maxInterest={30}
      minTerm={1}
      maxTerm={30}
      defaultAmount={5000000}
      defaultInterest={9}
      defaultTerm={15}
    />
  );
} 
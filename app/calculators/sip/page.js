import SIPCalculator from '@/app/components/SIPCalculator';

export default function SIPCalculatorPage() {
  return (
    <SIPCalculator
      title="SIP Calculator"
      description="Calculate your SIP returns, total investment, and view detailed growth schedule with this easy-to-use calculator."
      minAmount={500}
      maxAmount={100000}
      minInterest={1}
      maxInterest={30}
      minTerm={1}
      maxTerm={50}
      defaultAmount={10000}
      defaultInterest={9}
      defaultTerm={20}
    />
  );
}

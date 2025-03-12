'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const loanTypes = [
  { name: 'Personal Loan', path: '/calculators/loans/personal' },
  { name: 'Home Loan', path: '/calculators/loans/home' },
  { name: 'Car Loan', path: '/calculators/loans/car' },
  { name: 'Education Loan', path: '/calculators/loans/education' },
];

export default function LoansLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <nav className="mb-8">
          <ul className="flex space-x-4 overflow-x-auto pb-2">
            {loanTypes.map((loan) => (
              <li key={loan.path}>
                <Link
                  href={loan.path}
                  className={`px-4 py-2 rounded-md whitespace-nowrap ${
                    pathname === loan.path
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {loan.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {children}
      </div>
    </div>
  );
} 
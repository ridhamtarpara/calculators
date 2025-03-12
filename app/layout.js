import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Financial Calculators | Easy to use calculators for all your financial needs',
  description: 'Free online financial calculators for loan EMI, investments, PF, EV savings and more. Make informed financial decisions with our easy-to-use calculators.',
  keywords: 'financial calculator, loan EMI calculator, PF calculator, investment calculator, EV savings calculator',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
} 
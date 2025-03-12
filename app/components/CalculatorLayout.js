'use client';

export default function CalculatorLayout({ 
  title, 
  description, 
  children,
  result,
  onSubmit,
}) {
  return (
    <div className="max-w-8xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-2 text-gray-600">{description}</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-6">
            {children}
          </div>

          <button
            type="submit"
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Calculate
          </button>
        </form>

        {result && (
          <div className="border-t border-gray-200">
            <div className="p-6 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Results</h2>
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
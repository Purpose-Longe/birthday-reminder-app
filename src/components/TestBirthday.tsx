import { useState } from 'react';
import { Send, CheckCircle, XCircle } from 'lucide-react';

type TestUser = { username: string; email: string };

type TestResult =
  | {
      message?: string;
      timestamp?: string;
      result?: {
        totalBirthdays: number;
        emailsSent: number;
        emailsFailed: number;
        users?: TestUser[];
      };
    }
  | { error: string };

export const TestBirthday = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const getErrorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err));

  const handleTest = async () => {
    setLoading(true);
    setResult(null);

    const apiBase = import.meta.env.VITE_API_URL || '';

    try {
      const response = await fetch(`${apiBase}/api/birthday/test`);
      if (!response.ok) throw new Error('Failed to test birthday emails');

      const data = (await response.json()) as TestResult;
      setResult(data);
    } catch (err: unknown) {
      setResult({ error: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 w-full max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-amber-50 p-2 rounded-md">
          <Send className="w-5 h-5 text-amber-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Test Birthday Emails</h2>
      </div>

      <p className="text-slate-500 mb-4 text-sm">
        Click the button below to manually trigger the birthday check and send emails to anyone with a birthday today.
      </p>

      <button
        onClick={handleTest}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 text-white px-4 py-2 text-sm font-medium hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Checking Birthdays...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Birthday Emails</span>
          </>
        )}
      </button>

      {result && (
        <div className="mt-4">
          {'error' in result ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-600 text-sm">{result.error}</p>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4">
              <div className="flex items-center gap-2 text-emerald-700 mb-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Success!</span>
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>Birthdays found:</span>
                  <span className="font-semibold">{result.result?.totalBirthdays ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Emails sent:</span>
                  <span className="font-semibold text-emerald-600">{result.result?.emailsSent ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Failed:</span>
                  <span className="font-semibold text-red-600">{result.result?.emailsFailed ?? 0}</span>
                </div>

                {result.result?.users && result.result.users.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-100">
                    <p className="font-medium text-slate-700 mb-1">Birthday celebrants:</p>
                    <div className="space-y-1">
                      {result.result.users.map((user: TestUser, index: number) => (
                        <div key={index} className="text-slate-600 text-xs">
                          {user.username} ({user.email})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

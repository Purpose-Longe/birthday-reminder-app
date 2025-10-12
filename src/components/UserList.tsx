import { useEffect, useState } from 'react';
import { Users, Trash2, Calendar, Mail, Cake } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  date_of_birth: string;
}

interface UserListProps {
  refreshTrigger: number;
}

export const UserList = ({ refreshTrigger }: UserListProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
  const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
  const data = await (await import('../utils/fetchJson')).fetchJson(`${apiBase}/api/users`);
  setUsers(data);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
      await (await import('../utils/fetchJson')).fetchJson(`${apiBase}/api/users/${id}`, {
        method: 'DELETE',
      });

      setUsers(users.filter(user => user.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Error: ${msg}`);
    }
  };

  const formatDate = (dateString: string) => {
    // Normalize input which may be either 'YYYY-MM-DD' or an ISO datetime 'YYYY-MM-DDTHH:mm:...Z'
    const raw = String(dateString || '');
    let y = NaN, m = NaN, d = NaN;
    if (raw.includes('T')) {
      const datePart = raw.split('T')[0];
      const [yy, mm, dd] = datePart.split('-');
      y = Number(yy);
      m = Number(mm) - 1;
      d = Number(dd);
    } else if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      const [yy, mm, dd] = raw.split('-');
      y = Number(yy);
      m = Number(mm) - 1;
      d = Number(dd);
    } else {
      // fallback to Date parsing
      const parsed = new Date(raw);
      if (!isNaN(parsed.getTime())) {
        y = parsed.getUTCFullYear();
        m = parsed.getUTCMonth();
        d = parsed.getUTCDate();
      }
    }

    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) {
      return 'Invalid Date';
    }

    const utcDate = new Date(Date.UTC(y, m, d));
    return utcDate.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUpcomingBirthday = (dateString: string) => {
    // Use UTC-aware calculations so "Today"/"Tomorrow" match server-side UTC birthday checks
    const now = new Date();
    const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    // Normalize date string (handle both YYYY-MM-DD and ISO datetimes)
    const raw = String(dateString || '');
    let birthMonth = NaN;
    let birthDay = NaN;
    if (raw.includes('T')) {
      const datePart = raw.split('T')[0];
      const [, mm, dd] = datePart.split('-');
      birthMonth = Number(mm) - 1;
      birthDay = Number(dd);
    } else if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      const [, mm, dd] = raw.split('-');
      birthMonth = Number(mm) - 1;
      birthDay = Number(dd);
    } else {
      const parsed = new Date(raw);
      if (!isNaN(parsed.getTime())) {
        birthMonth = parsed.getUTCMonth();
        birthDay = parsed.getUTCDate();
      }
    }

    if (Number.isNaN(birthMonth) || Number.isNaN(birthDay)) return 'Invalid Date';

    let thisYear = now.getUTCFullYear();
    let birthdayUTC = Date.UTC(thisYear, birthMonth, birthDay);
    if (birthdayUTC < todayUTC) {
      thisYear += 1;
      birthdayUTC = Date.UTC(thisYear, birthMonth, birthDay);
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysUntil = Math.ceil((birthdayUTC - todayUTC) / msPerDay);

    if (daysUntil === 0) return 'Today!';
    if (daysUntil === 1) return 'Tomorrow!';
    return `In ${daysUntil} days`;
  };

  const isBirthdayToday = (dateString: string) => {
    const now = new Date();
    const raw = String(dateString || '');
    let birthMonth = NaN;
    let birthDay = NaN;
    if (raw.includes('T')) {
      const datePart = raw.split('T')[0];
      const [, mm, dd] = datePart.split('-');
      birthMonth = Number(mm) - 1;
      birthDay = Number(dd);
    } else if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      const [, mm, dd] = raw.split('-');
      birthMonth = Number(mm) - 1;
      birthDay = Number(dd);
    } else {
      const parsed = new Date(raw);
      if (!isNaN(parsed.getTime())) {
        birthMonth = parsed.getUTCMonth();
        birthDay = parsed.getUTCDate();
      }
    }

    if (Number.isNaN(birthMonth) || Number.isNaN(birthDay)) return false;

    return (
      now.getUTCMonth() === birthMonth &&
      now.getUTCDate() === birthDay
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 w-full max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 w-full max-w-4xl">
        <div className="text-center text-red-600 py-8">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 w-full max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-50 p-2 rounded-md">
          <Users className="w-5 h-5 text-emerald-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Customer List ({users.length})</h2>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-10">
          <Cake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-lg">No customers added yet</p>
          <p className="text-slate-400 text-sm mt-2">Add your first customer above to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className={`border rounded-md p-4 transition-shadow ${
                isBirthdayToday(user.date_of_birth)
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-white border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-medium text-slate-900">{user.username}</h3>
                    {isBirthdayToday(user.date_of_birth) && (
                      <span className="bg-amber-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full animate-pulse">
                        Birthday Today!
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(user.date_of_birth)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sky-600 font-medium">
                      <Cake className="w-4 h-4" />
                      <span>{getUpcomingBirthday(user.date_of_birth)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-all"
                  title="Delete user"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import { useState } from 'react';
import { UserForm } from './components/UserForm';
import { UserList } from './components/UserList';
import { TestBirthday } from './components/TestBirthday';
import { Cake } from 'lucide-react';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUserAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-white border border-slate-200 rounded-md p-3 shadow-sm">
              <Cake className="w-8 h-8 text-sky-600" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Birthday Reminder</h1>
              <p className="text-sm text-slate-500">Automate birthday greetings for your customers</p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="flex flex-col gap-6">
            <UserForm onUserAdded={handleUserAdded} />
            <TestBirthday />
          </div>

          <div>
            <UserList refreshTrigger={refreshTrigger} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 text-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Automated Daily Birthday Checks</h3>
          <p className="text-slate-600 text-sm">
            The system checks for birthdays every day at 7:00 AM and automatically sends personalized
            birthday emails to customers. You can also test the email functionality manually using the
            button above.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BF</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">bc-forge</h1>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <a
              href="/vesting"
              className="text-indigo-600 font-medium border-b-2 border-indigo-600 pb-1"
            >
              Lockup &amp; Vesting
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

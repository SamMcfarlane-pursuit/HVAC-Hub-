
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, Map, Package, Wrench, Menu, PieChart, Power } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <NavLink
      to={to}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
          ? 'bg-blue-900/40 text-blue-400 border-r-2 border-blue-400'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 border-b border-slate-800 z-50 p-4 flex justify-between items-center">
        <div className="font-bold text-white text-xl">HVAC<span className="text-blue-500">Hub</span></div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          <Menu />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0
      `}>
        <div className="p-6 border-b border-slate-800">
          <div className="text-2xl font-black text-white tracking-tight flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded mr-2 flex items-center justify-center text-white">H</div>
            HVAC<span className="text-blue-500">Hub</span>
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Operating System v2.0</div>
        </div>

        <nav className="p-4 space-y-2">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/market" icon={PieChart} label="Market Intelligence" />
          <NavItem to="/triage" icon={Activity} label="Smart Triage AI" />
          <NavItem to="/routing" icon={Map} label="Live Routing" />
          <NavItem to="/supply" icon={Package} label="Supply Chain" />
          <NavItem to="/assets" icon={Wrench} label="Asset Network" />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="https://picsum.photos/id/1005/100/100" className="w-10 h-10 rounded-full border border-slate-600" alt="Admin" />
              <div>
                <div className="text-sm font-bold text-white">Admin User</div>
                <div className="text-xs text-slate-500">Dispatch Lead</div>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="text-slate-500 hover:text-white transition-colors"
              title="Sign Out"
            >
              <Power className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden pt-16 md:pt-0 bg-slate-950 relative">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative z-10 h-full">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const userNav = [
    { to: '/dashboard', icon: 'dashboard', label: 'Overview' },
    { to: '/create-listing', icon: 'add_circle', label: 'List Item' },
    { to: '/marketplace', icon: 'storefront', label: 'Marketplace' },
    { to: '/scrap-schedule', icon: 'local_shipping', label: 'Scrap Pickups' },
    { to: '/profile', icon: 'person', label: 'My Profile' },
];

const kabadiwalaNav = [
    { to: '/kabadiwala', icon: 'list_alt', label: 'Pickup Requests' },
    { to: '/kabadiwala?tab=active', icon: 'local_shipping', label: 'Active Pickups' },
    { to: '/kabadiwala?tab=scrap-buy', icon: 'factory', label: 'Scrap Buy Requests' },
    { to: '/kabadiwala?tab=earnings', icon: 'payments', label: 'Earnings' },
    { to: '/kabadiwala?tab=ratings', icon: 'star_rate', label: 'Rating & Stats' },
    { to: '/kabadiwala/profile', icon: 'person', label: 'My Profile' },
];

const recyclerNav = [
    { to: '/recycler', icon: 'dashboard', label: 'Overview' },
    { to: '/recycler?tab=listings', icon: 'list_alt', label: 'My Listings' },
    { to: '/recycler?tab=purchases', icon: 'shopping_cart', label: 'Purchases' },
    { to: '/recycler/profile', icon: 'person', label: 'My Profile' },
];

const adminNav = [
    { to: '/admin', icon: 'dashboard', label: 'Overview' },
    { to: '/admin?tab=users', icon: 'people', label: 'Users' },
    { to: '/admin?tab=transactions', icon: 'receipt_long', label: 'Transactions' },
    { to: '/admin?tab=rates', icon: 'price_change', label: 'Scrap Rates' },
    { to: '/admin?tab=commission', icon: 'percent', label: 'Commission' },
    { to: '/admin?tab=analytics', icon: 'analytics', label: 'Analytics' },
];

export default function Sidebar({ role = 'user' }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems =
        role === 'kabadiwala' ? kabadiwalaNav : role === 'admin' ? adminNav : role === 'recycler' ? recyclerNav : userNav;

    const title =
        role === 'kabadiwala'
            ? 'JunkIn Collector'
            : role === 'admin'
                ? 'JunkIn Admin'
                : role === 'recycler'
                    ? 'JunkIn Recycler'
                    : 'JunkIn';

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-40">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg text-white">
                    <span className="material-symbols-outlined">recycling</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold tracking-tight">{title}</h2>
                    {role === 'admin' && (
                        <p className="text-xs text-primary font-medium">Circular Economy</p>
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/dashboard' || item.to === '/kabadiwala' || item.to === '/admin'}
                        className={({ isActive }) =>
                            isActive ? 'nav-item-active' : 'nav-item'
                        }
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="font-medium text-sm">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Profile */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Log out"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

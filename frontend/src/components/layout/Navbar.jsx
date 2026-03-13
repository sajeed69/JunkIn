import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { isDark, toggle } = useTheme();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const getRedirect = () => {
        if (!user) return '/login';
        if (user.role === 'kabadiwala') return '/kabadiwala';
        if (user.role === 'admin') return '/admin';
        return '/dashboard';
    };

    return (
        <header className="sticky top-0 z-50 w-full px-6 lg:px-20 py-4 glass-card border-b border-primary/10">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                        <span className="material-symbols-outlined text-2xl">recycling</span>
                    </div>
                    <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        JunkIn
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-10">
                    <a href="#how-it-works" className="text-sm font-semibold hover:text-primary transition-colors">
                        How it works
                    </a>
                    <Link to="/marketplace" className="text-sm font-semibold hover:text-primary transition-colors">
                        Explore
                    </Link>
                    <a href="#community" className="text-sm font-semibold hover:text-primary transition-colors">
                        Community
                    </a>
                </nav>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {/* Dark mode toggle */}
                    <button
                        onClick={toggle}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        <span className="material-symbols-outlined text-xl">
                            {isDark ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    {user ? (
                        <>
                            <button
                                onClick={() => navigate(getRedirect())}
                                className="hidden sm:flex items-center gap-2 text-sm font-semibold px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">dashboard</span>
                                Dashboard
                            </button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={logout}
                                icon="logout"
                                className="hidden sm:flex"
                            >
                                Log out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hidden sm:block btn-ghost">
                                Log in
                            </Link>
                            <Link to="/register">
                                <Button size="md">Get Started</Button>
                            </Link>
                        </>
                    )}

                    {/* Mobile menu */}
                    <button
                        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden mt-4 pb-4 border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-3">
                    <Link to="/marketplace" className="text-sm font-semibold py-2 hover:text-primary transition-colors">
                        Explore Marketplace
                    </Link>
                    {user ? (
                        <>
                            <button onClick={() => navigate(getRedirect())} className="text-left text-sm font-semibold py-2 hover:text-primary">
                                Dashboard
                            </button>
                            <button onClick={logout} className="text-left text-sm font-semibold py-2 text-red-500">
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-semibold py-2">Log in</Link>
                            <Link to="/register" className="text-sm font-semibold py-2 text-primary">Get Started</Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}

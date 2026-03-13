import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [rateLimited, setRateLimited] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    useEffect(() => {
        if (countdown <= 0) {
            setRateLimited(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }
        timerRef.current = setInterval(() => {
            setCountdown((c) => c - 1);
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [countdown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rateLimited) return;
        setLoading(true);
        try {
            const user = await login(form);
            if (user.role === 'kabadiwala') navigate('/kabadiwala');
            else if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'recycler') navigate('/recycler');
            else navigate('/dashboard');
        } catch (err) {
            const status = err.response?.status;
            const message = err.response?.data?.message || 'Login failed. Please try again.';

            if (status === 429) {
                // Rate limited
                setRateLimited(true);
                setCountdown(60); // 60 second cooldown displayed to user
                toast.error('Too many attempts. Please wait a moment before trying again.');
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const formatCountdown = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-background-light dark:bg-background-dark">
            {/* Background orbs */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-secondary/20 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                            <span className="material-symbols-outlined text-2xl">recycling</span>
                        </div>
                        <span className="text-2xl font-black tracking-tight">JunkIn</span>
                    </Link>
                    <h1 className="text-3xl font-black mb-2">Welcome back</h1>
                    <p className="text-slate-500 dark:text-slate-400">Sign in to continue your journey</p>
                </div>

                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Email address"
                            type="email"
                            placeholder="you@example.com"
                            icon="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            icon="lock"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />

                        {/* Rate limit warning */}
                        {rateLimited && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                                <span className="material-symbols-outlined text-amber-500 flex-shrink-0">timer</span>
                                <div>
                                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Please wait before trying again</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                                        You can try again in <span className="font-bold">{formatCountdown(countdown)}</span>
                                    </p>
                                    <div className="w-full h-1 bg-amber-200 dark:bg-amber-800 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className="bg-amber-500 h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${(countdown / 60) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full mt-2"
                            loading={loading}
                            icon="login"
                            disabled={rateLimited}
                        >
                            {rateLimited ? `Wait ${formatCountdown(countdown)}` : 'Sign In'}
                        </Button>
                    </form>

                    {/* Demo accounts */}
                    <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                        <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">
                            Demo Accounts
                        </p>
                        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            <p>User: user@junkin.com / password123</p>
                            <p>Kabadiwala: kabadi@junkin.com / password123</p>
                            <p>Recycler: recycler@junkin.com / password123</p>
                            <p>Admin: admin@junkin.com / password123</p>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary font-bold hover:underline">
                                Sign up free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

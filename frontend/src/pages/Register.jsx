import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const ROLES = [
    { value: 'user', label: 'Household User', icon: 'home' },
    { value: 'kabadiwala', label: 'Kabadiwala / Collector', icon: 'local_shipping' },
    { value: 'recycler', label: 'Recycler / Bulk Buyer', icon: 'factory' },
];

export default function Register() {
    const { register, verifyOtp } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1 = form, 2 = OTP
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'user' });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await register(form);
            setUserId(data.userId);
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await verifyOtp({ userId, otp });
            if (user.role === 'kabadiwala') navigate('/kabadiwala');
            else if (user.role === 'admin') navigate('/admin');
            else navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-background-light dark:bg-background-dark">
            {/* BG orbs */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-secondary/20 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                            <span className="material-symbols-outlined text-2xl">recycling</span>
                        </div>
                        <span className="text-2xl font-black tracking-tight">JunkIn</span>
                    </Link>
                    <h1 className="text-3xl font-black mb-2">
                        {step === 1 ? 'Create account' : 'Verify OTP'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {step === 1 ? 'Join 12,000+ conscious consumers' : `OTP sent to ${form.email}`}
                    </p>
                </div>

                <div className="card p-8">
                    {step === 1 ? (
                        <form onSubmit={handleRegister} className="space-y-5">
                            <Input
                                label="Full Name"
                                type="text"
                                placeholder="Amit Sharma"
                                icon="person"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
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
                                label="Phone number"
                                type="tel"
                                placeholder="+91 98765 43210"
                                icon="phone"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="At least 8 characters"
                                icon="lock"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                minLength={8}
                            />

                            {/* Role selector */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    I am a...
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {ROLES.map((r) => (
                                        <label
                                            key={r.value}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.role === r.value
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/40'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="role"
                                                value={r.value}
                                                checked={form.role === r.value}
                                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                                className="hidden"
                                            />
                                            <span className="material-symbols-outlined text-primary">{r.icon}</span>
                                            <span className="text-sm font-semibold">{r.label}</span>
                                            {form.role === r.value && (
                                                <span className="material-symbols-outlined text-primary ml-auto text-sm">
                                                    check_circle
                                                </span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <Button type="submit" size="lg" className="w-full" loading={loading} icon="person_add">
                                Create Account
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl">sms</span>
                                </div>
                                <p className="text-slate-500 text-sm">
                                    Enter the 6-digit code sent to your email.
                                </p>
                                <p className="text-xs text-slate-400 mt-1">Make sure to check your spam folder.</p>
                            </div>
                            <Input
                                label="OTP Code"
                                type="text"
                                maxLength={6}
                                placeholder="······"
                                icon="pin"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                className="text-center text-2xl tracking-[0.5em]"
                            />
                            <Button type="submit" size="lg" className="w-full" loading={loading} icon="verified">
                                Verify & Continue
                            </Button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-sm text-slate-500 hover:text-primary transition-colors"
                            >
                                ← Back to registration
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary font-bold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

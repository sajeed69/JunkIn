import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function UserProfile() {
    const { user, updateUser } = useAuth();
    const { isDark, toggle } = useTheme();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || 'Demo User',
        phone: user?.phone || '+91 98765 43210',
        bio: user?.bio || 'Eco-conscious citizen passionate about reducing waste and reusing items.',
    });

    // Demo data fallback
    const profileData = {
        name: user?.name || 'Demo User',
        email: user?.email || 'user@junkin.com',
        phone: user?.phone || '+91 98765 43210',
        role: 'Household User',
        trustScore: user?.trustScore || 100,
        memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'January 2024',
        bio: user?.bio || 'Eco-conscious citizen passionate about reducing waste and reusing items.',
        stats: {
            itemsListed: 24,
            itemsSold: 18,
            scrapPickups: 12,
            totalEarnings: user?.earnings || 12450,
            co2Saved: '42 kg',
        },
    };

    const trustScoreColor = profileData.trustScore >= 80 ? 'text-emerald-500' : profileData.trustScore >= 50 ? 'text-yellow-500' : 'text-red-500';
    const trustScoreBg = profileData.trustScore >= 80 ? 'stroke-emerald-500' : profileData.trustScore >= 50 ? 'stroke-yellow-500' : 'stroke-red-500';
    const circumference = 2 * Math.PI * 54;
    const dashOffset = circumference - (profileData.trustScore / 200) * circumference;

    const handleSave = () => {
        updateUser({ name: form.name, phone: form.phone, bio: form.bio });
        setEditing(false);
        toast.success('Profile updated successfully!');
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar role="user" />
            <main className="flex-1 ml-64 overflow-y-auto bg-background-light dark:bg-background-dark">
                <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold">My Profile</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={toggle} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-500 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-5xl mx-auto space-y-8">
                    {/* Profile Header Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        {/* Cover */}
                        <div className="h-32 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/10 relative">
                            <div className="absolute -bottom-12 left-8">
                                <div className="w-24 h-24 rounded-2xl bg-primary text-white flex items-center justify-center text-4xl font-black shadow-lg border-4 border-white dark:border-slate-900">
                                    {profileData.name.charAt(0)}
                                </div>
                            </div>
                        </div>
                        <div className="pt-16 pb-6 px-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <h1 className="text-2xl font-black">{profileData.name}</h1>
                                    <p className="text-slate-500 text-sm">{profileData.email}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                                            <span className="material-symbols-outlined text-sm">home</span>
                                            {profileData.role}
                                        </span>
                                        <span className="text-xs text-slate-400">Member since {profileData.memberSince}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 max-w-lg">{profileData.bio}</p>
                                </div>
                                <Button variant="secondary" size="sm" icon="edit" onClick={() => setEditing(!editing)}>
                                    {editing ? 'Cancel' : 'Edit Profile'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Trust Score */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-center">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Trust Score</h3>
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="w-32 h-32 -rotate-90">
                                    <circle cx="64" cy="64" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                                    <circle cx="64" cy="64" r="54" fill="none" strokeWidth="8" strokeLinecap="round"
                                        className={trustScoreBg}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={dashOffset}
                                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-3xl font-black ${trustScoreColor}`}>{profileData.trustScore}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">/ 200</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-4">Based on completed transactions, on-time pickups, and user ratings</p>
                            <div className="mt-4 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
                                <span className="text-xs font-bold text-emerald-500">Excellent Standing</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Activity Summary</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                {[
                                    { label: 'Items Listed', value: profileData.stats.itemsListed, icon: 'inventory', color: 'bg-blue-100 text-blue-600' },
                                    { label: 'Items Sold', value: profileData.stats.itemsSold, icon: 'sell', color: 'bg-emerald-100 text-emerald-600' },
                                    { label: 'Scrap Pickups', value: profileData.stats.scrapPickups, icon: 'local_shipping', color: 'bg-purple-100 text-purple-600' },
                                    { label: 'Total Earnings', value: `₹${profileData.stats.totalEarnings.toLocaleString()}`, icon: 'payments', color: 'bg-amber-100 text-amber-600' },
                                    { label: 'CO₂ Saved', value: profileData.stats.co2Saved, icon: 'eco', color: 'bg-green-100 text-green-600' },
                                    { label: 'Trust Score', value: profileData.trustScore, icon: 'verified_user', color: 'bg-cyan-100 text-cyan-600' },
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color} flex-shrink-0`}>
                                            <span className="material-symbols-outlined text-lg">{stat.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-xl font-black">{stat.value}</p>
                                            <p className="text-xs text-slate-500">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Contact Information</h3>
                        {editing ? (
                            <div className="space-y-4 max-w-md">
                                <Input label="Full Name" icon="person" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                <Input label="Phone Number" icon="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                                    <textarea
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary resize-none"
                                        rows={3}
                                        value={form.bio}
                                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                    />
                                </div>
                                <Button icon="save" onClick={handleSave}>Save Changes</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { label: 'Email', value: profileData.email, icon: 'email' },
                                    { label: 'Phone', value: profileData.phone, icon: 'phone' },
                                    { label: 'Role', value: profileData.role, icon: 'badge' },
                                    { label: 'Member Since', value: profileData.memberSince, icon: 'calendar_month' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <span className="material-symbols-outlined">{item.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase">{item.label}</p>
                                            <p className="font-semibold">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

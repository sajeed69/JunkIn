import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function KabadiwalaProfile() {
    const { user, updateUser } = useAuth();
    const { isDark, toggle } = useTheme();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || 'Ramesh Kumar',
        phone: user?.phone || '+91 98765 12345',
        bio: user?.bio || 'Experienced scrap collector serving Bangalore for 5+ years. Specializing in metals and e-waste.',
        serviceArea: 'HSR Layout, Koramangala, Whitefield',
    });

    const profileData = {
        name: user?.name || 'Ramesh Kumar',
        email: user?.email || 'kabadi@junkin.com',
        phone: user?.phone || '+91 98765 12345',
        role: 'Kabadiwala / Collector',
        trustScore: user?.trustScore || 100,
        rating: user?.rating?.average || 4.8,
        ratingCount: user?.rating?.count || 156,
        memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'March 2023',
        bio: form.bio,
        serviceArea: form.serviceArea,
        stats: {
            pickupsCompleted: 342,
            totalWeight: '2,840 kg',
            earnings: user?.earnings || 84500,
            co2Saved: '1,240 kg',
            accuracy: '98%',
            avgResponseTime: '12 min',
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
        <div className="flex min-h-screen">
            <Sidebar role="kabadiwala" />
            <main className="flex-1 ml-64 overflow-y-auto bg-background-light dark:bg-background-dark">
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
                    <h2 className="text-2xl font-bold">My Profile</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={toggle} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-5xl mx-auto space-y-8">
                    {/* Profile Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="h-32 bg-gradient-to-r from-amber-400/30 via-emerald-400/20 to-primary/30 relative">
                            <div className="absolute -bottom-12 left-8">
                                <div className="w-24 h-24 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-4xl font-black shadow-lg border-4 border-white dark:border-slate-900">
                                    {profileData.name.charAt(0)}
                                </div>
                            </div>
                        </div>
                        <div className="pt-16 pb-6 px-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-black">{profileData.name}</h1>
                                        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                            <span className="material-symbols-outlined text-sm">star</span>
                                            {profileData.rating} ({profileData.ratingCount})
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-sm">{profileData.email}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                                            <span className="material-symbols-outlined text-sm">local_shipping</span>
                                            {profileData.role}
                                        </span>
                                        <span className="text-xs text-slate-400">Since {profileData.memberSince}</span>
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
                            <p className="text-xs text-slate-500 mt-4">Based on accuracy, response time, completed pickups, and customer feedback</p>
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Accuracy Rate</span>
                                    <span className="font-bold text-emerald-500">{profileData.stats.accuracy}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Avg Response</span>
                                    <span className="font-bold text-blue-500">{profileData.stats.avgResponseTime}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Performance Stats</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                {[
                                    { label: 'Pickups Done', value: profileData.stats.pickupsCompleted, icon: 'task_alt', color: 'bg-emerald-100 text-emerald-600' },
                                    { label: 'Total Weight', value: profileData.stats.totalWeight, icon: 'scale', color: 'bg-blue-100 text-blue-600' },
                                    { label: 'Total Earnings', value: `₹${profileData.stats.earnings.toLocaleString()}`, icon: 'payments', color: 'bg-amber-100 text-amber-600' },
                                    { label: 'CO₂ Saved', value: profileData.stats.co2Saved, icon: 'eco', color: 'bg-green-100 text-green-600' },
                                    { label: 'Star Rating', value: `${profileData.rating} ★`, icon: 'star_rate', color: 'bg-yellow-100 text-yellow-600' },
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

                    {/* Service Area & Contact */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Service Area</h3>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined">location_on</span>
                                </div>
                                <div>
                                    <p className="font-bold">Active Zones</p>
                                    <p className="text-sm text-slate-500 mt-1">{profileData.serviceArea}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Contact Info</h3>
                            {editing ? (
                                <div className="space-y-3">
                                    <Input label="Full Name" icon="person" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                    <Input label="Phone" icon="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                                        <textarea
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary resize-none"
                                            rows={3} value={form.bio}
                                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                        />
                                    </div>
                                    <Button icon="save" onClick={handleSave}>Save Changes</Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {[
                                        { label: 'Email', value: profileData.email, icon: 'email' },
                                        { label: 'Phone', value: profileData.phone, icon: 'phone' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-sm">{item.icon}</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{item.label}</p>
                                                <p className="text-sm font-semibold">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

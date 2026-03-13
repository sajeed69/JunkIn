import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { rewardService } from '../api/services';
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

    // Eco Rewards state
    const [rewards, setRewards] = useState(null);
    const [scratchingId, setScratchingId] = useState(null);
    const [revealedReward, setRevealedReward] = useState(null);
    const [showScratchModal, setShowScratchModal] = useState(false);

    useEffect(() => {
        fetchRewards();
    }, []);

    const fetchRewards = async () => {
        try {
            const { data } = await rewardService.getMyRewards();
            if (data.success) setRewards(data);
        } catch (err) {
            console.log('Rewards not available yet:', err.message);
            // Demo data fallback
            setRewards({
                eco_points: 75,
                total_transactions: 8,
                next_reward: { threshold: 100, label: '₹100 Gift Card', points_remaining: 25 },
                scratch_cards: [
                    { _id: 'demo1', amount: 50, label: '₹50 Gift Card', scratched: false, unlockedAt: new Date().toISOString() },
                ],
                claimed_rewards: [
                    { _id: 'demo2', amount: 20, label: '₹20 Platform Credit', brand: 'JunkIn Credits', rewardType: 'credit', scratched: true, claimed: true, claimedAt: new Date(Date.now() - 86400000).toISOString() },
                ],
                reward_history: [],
                point_values: { sell: 10, scrap_pickup: 8, rare_listing: 15, referral: 20, listing: 3 },
                reward_tiers: [
                    { threshold: 50, amount: 50, label: '₹50 Gift Card' },
                    { threshold: 100, amount: 100, label: '₹100 Gift Card' },
                    { threshold: 200, amount: 250, label: '₹250 Gift Card' },
                ],
            });
        }
    };

    const handleScratch = async (rewardId) => {
        setScratchingId(rewardId);
        try {
            const { data } = await rewardService.scratchCard(rewardId);
            if (data.success) {
                setRevealedReward(data.reward);
                setShowScratchModal(true);
                toast.success('🎉 Reward revealed!');
                fetchRewards();
            } else {
                // Demo scratch
                setRevealedReward({
                    brand: ['Amazon', 'Flipkart', 'JunkIn Credits', 'Discount Coupon'][Math.floor(Math.random() * 4)],
                    amount: 50,
                    rewardType: 'gift_card',
                });
                setShowScratchModal(true);
                toast.success('🎉 Reward revealed!');
            }
        } catch {
            // Demo fallback
            setRevealedReward({
                brand: ['Amazon', 'Flipkart', 'JunkIn Credits'][Math.floor(Math.random() * 3)],
                amount: 50,
                rewardType: 'gift_card',
            });
            setShowScratchModal(true);
            toast.success('🎉 Reward revealed!');
        } finally {
            setScratchingId(null);
        }
    };

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

    const ecoPoints = rewards?.eco_points || 0;
    const nextReward = rewards?.next_reward;
    const progressPercent = nextReward ? Math.min(100, ((ecoPoints / nextReward.threshold) * 100)) : 100;

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
                                    { label: 'Eco Points', value: ecoPoints, icon: 'stars', color: 'bg-yellow-100 text-yellow-600' },
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

                    {/* ═══════════════════════════════════════════ */}
                    {/* ═══════ ECO REWARDS SECTION ═══════ */}
                    {/* ═══════════════════════════════════════════ */}
                    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/10 dark:via-teal-900/10 dark:to-cyan-900/10 rounded-2xl border-2 border-emerald-200/50 dark:border-emerald-800/30 overflow-hidden shadow-lg">
                        {/* Section Header */}
                        <div className="p-6 pb-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                    <span className="material-symbols-outlined text-2xl">redeem</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-200 tracking-tight">Eco Rewards</h3>
                                    <p className="text-xs text-emerald-700/60 dark:text-emerald-400/60 font-medium">Earn points. Unlock gift cards. Save the planet.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 pt-0 space-y-6">
                            {/* Points & Progress */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Current Points */}
                                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur rounded-xl p-5 border border-emerald-200/50 dark:border-emerald-800/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Eco Points</span>
                                        <span className="material-symbols-outlined text-emerald-500">stars</span>
                                    </div>
                                    <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                                        {ecoPoints}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Total points earned</p>
                                </div>

                                {/* Next Reward Progress */}
                                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur rounded-xl p-5 border border-emerald-200/50 dark:border-emerald-800/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Next Reward</span>
                                        <span className="text-xs font-bold text-slate-500">
                                            {nextReward ? `${nextReward.points_remaining} pts away` : 'All unlocked!'}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                                        {nextReward?.label || '🏆 All rewards earned!'}
                                    </p>
                                    <div className="relative h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1.5">
                                        <span className="text-[10px] font-bold text-slate-400">{ecoPoints} pts</span>
                                        <span className="text-[10px] font-bold text-slate-400">{nextReward?.threshold || ecoPoints} pts</span>
                                    </div>
                                </div>
                            </div>

                            {/* Scratch Cards */}
                            {rewards?.scratch_cards?.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-black text-emerald-800/50 dark:text-emerald-300/50 uppercase tracking-widest mb-3">
                                        🎁 Available Scratch Cards
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {rewards.scratch_cards.map((card) => (
                                            <button
                                                key={card._id}
                                                onClick={() => handleScratch(card._id)}
                                                disabled={scratchingId === card._id}
                                                className="group relative overflow-hidden rounded-2xl h-40 cursor-pointer transition-all hover:scale-[1.03] active:scale-95 shadow-lg hover:shadow-2xl"
                                            >
                                                {/* Card Background */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400" />
                                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-50" />

                                                {/* Shimmer overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                                                {/* Content */}
                                                <div className="relative h-full flex flex-col items-center justify-center text-white p-4">
                                                    {scratchingId === card._id ? (
                                                        <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-4xl mb-2 drop-shadow-lg">redeem</span>
                                                            <p className="font-black text-lg drop-shadow-md">{card.label}</p>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mt-1">
                                                                Tap to scratch & reveal
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* How to Earn Points */}
                            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur rounded-xl p-5 border border-emerald-200/30 dark:border-emerald-800/20">
                                <h4 className="text-xs font-black text-emerald-800/50 dark:text-emerald-300/50 uppercase tracking-widest mb-3">
                                    How to Earn Eco Points
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { action: 'Sell Item', pts: '+10', icon: 'sell', color: 'text-emerald-500' },
                                        { action: 'Scrap Pickup', pts: '+8', icon: 'local_shipping', color: 'text-blue-500' },
                                        { action: 'Rare Listing', pts: '+15', icon: 'emoji_events', color: 'text-amber-500' },
                                        { action: 'Referral', pts: '+20', icon: 'group_add', color: 'text-purple-500' },
                                    ].map((item, i) => (
                                        <div key={i} className="text-center py-3">
                                            <span className={`material-symbols-outlined text-2xl ${item.color}`}>{item.icon}</span>
                                            <p className="text-lg font-black text-slate-700 dark:text-slate-300 mt-1">{item.pts}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{item.action}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reward History */}
                            {rewards?.claimed_rewards?.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-black text-emerald-800/50 dark:text-emerald-300/50 uppercase tracking-widest mb-3">
                                        Reward History
                                    </h4>
                                    <div className="space-y-2">
                                        {rewards.claimed_rewards.map((r, i) => (
                                            <div key={r._id || i} className="flex items-center justify-between py-3 px-4 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-emerald-500 text-lg">
                                                            {r.rewardType === 'gift_card' ? 'card_giftcard' : r.rewardType === 'credit' ? 'account_balance_wallet' : 'confirmation_number'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{r.label}</p>
                                                        <p className="text-[10px] text-slate-400">
                                                            {r.brand && `${r.brand} • `}
                                                            {r.claimedAt ? new Date(r.claimedAt).toLocaleDateString('en-IN') : 'Pending'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase">
                                                    Claimed
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reward Tiers */}
                            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur rounded-xl p-5 border border-emerald-200/30 dark:border-emerald-800/20">
                                <h4 className="text-xs font-black text-emerald-800/50 dark:text-emerald-300/50 uppercase tracking-widest mb-3">
                                    Reward Tiers
                                </h4>
                                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                                    {(rewards?.reward_tiers || []).map((tier, i) => {
                                        const unlocked = ecoPoints >= tier.threshold;
                                        return (
                                            <div key={i} className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 text-center min-w-[120px] transition-all ${
                                                unlocked
                                                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60'
                                            }`}>
                                                <p className="text-lg font-black text-slate-700 dark:text-slate-300">{tier.threshold}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Points</p>
                                                <p className="text-xs font-bold mt-1 text-emerald-600 dark:text-emerald-400">{tier.label}</p>
                                                {unlocked && <span className="text-emerald-500 text-sm">✓</span>}
                                            </div>
                                        );
                                    })}
                                </div>
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

            {/* Scratch Card Reveal Modal */}
            {showScratchModal && revealedReward && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowScratchModal(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 border border-emerald-200 dark:border-emerald-800 text-center overflow-hidden">
                        {/* Confetti background */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-4 left-8 w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="absolute top-12 right-16 w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <div className="absolute top-8 left-24 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                            <div className="absolute bottom-20 right-8 w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
                            <div className="absolute bottom-12 left-12 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>

                        <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-emerald-500/30 animate-pulse">
                                <span className="material-symbols-outlined text-4xl">celebration</span>
                            </div>

                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">
                                Congratulations! 🎉
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">You unlocked an Eco Reward!</p>

                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border-2 border-emerald-200 dark:border-emerald-800 mb-6">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Your Reward</p>
                                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₹{revealedReward.amount}</p>
                                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-1">{revealedReward.brand}</p>
                                <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase">
                                    {revealedReward.rewardType === 'gift_card' ? 'Gift Card' : revealedReward.rewardType === 'credit' ? 'Platform Credit' : 'Discount Coupon'}
                                </span>
                            </div>

                            <button
                                onClick={() => setShowScratchModal(false)}
                                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                Awesome! 🙌
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const SCRAP_CATEGORIES = ['Paper', 'Metal', 'Plastic', 'E-Waste', 'Glass', 'Rubber', 'Textiles', 'Mixed'];

const DEMO_LISTINGS = [
    { _id: 'rl1', category: 'Paper', pricePerKg: 16.5, minQty: 100, description: 'Old newspapers, magazines, cardboard', status: 'active', filled: 75, totalQty: '500 kg' },
    { _id: 'rl2', category: 'Metal', pricePerKg: 32, minQty: 50, description: 'Mixed scrap metal, iron, aluminum', status: 'active', filled: 25, totalQty: '2000 kg' },
    { _id: 'rl3', category: 'Plastic', pricePerKg: 14, minQty: 200, description: 'Plastic bottles, containers, packaging', status: 'active', filled: 60, totalQty: '800 kg' },
    { _id: 'rl4', category: 'E-Waste', pricePerKg: 45, minQty: 10, description: 'Circuit boards, old phones, cables', status: 'paused', filled: 90, totalQty: '100 kg' },
];

const CATEGORY_ICONS = {
    Paper: { icon: 'newspaper', color: 'bg-blue-100 text-blue-600' },
    Metal: { icon: 'iron', color: 'bg-orange-100 text-orange-600' },
    Plastic: { icon: 'water_bottle', color: 'bg-cyan-100 text-cyan-600' },
    'E-Waste': { icon: 'memory', color: 'bg-purple-100 text-purple-600' },
    Glass: { icon: 'wine_bar', color: 'bg-emerald-100 text-emerald-600' },
    Rubber: { icon: 'tire_repair', color: 'bg-amber-100 text-amber-600' },
    Textiles: { icon: 'checkroom', color: 'bg-pink-100 text-pink-600' },
    Mixed: { icon: 'category', color: 'bg-slate-100 text-slate-600' },
};

export default function RecyclerDashboard() {
    const { user } = useAuth();
    const { isDark, toggle } = useTheme();
    const [listings, setListings] = useState(DEMO_LISTINGS);
    const [showCreate, setShowCreate] = useState(false);
    const [newListing, setNewListing] = useState({
        category: 'Paper', pricePerKg: '', minQty: '', description: '',
    });

    const handleCreate = () => {
        if (!newListing.pricePerKg || !newListing.minQty) {
            toast.error('Please fill in price per kg and minimum quantity');
            return;
        }
        const listing = {
            _id: `rl${Date.now()}`,
            ...newListing,
            pricePerKg: parseFloat(newListing.pricePerKg),
            minQty: parseFloat(newListing.minQty),
            status: 'active',
            filled: 0,
            totalQty: `${newListing.minQty} kg`,
        };
        setListings((prev) => [listing, ...prev]);
        setShowCreate(false);
        setNewListing({ category: 'Paper', pricePerKg: '', minQty: '', description: '' });
        toast.success('Listing created successfully!');
    };

    const toggleStatus = (id) => {
        setListings((prev) => prev.map((l) => l._id === id ? { ...l, status: l.status === 'active' ? 'paused' : 'active' } : l));
    };

    const deleteListing = (id) => {
        setListings((prev) => prev.filter((l) => l._id !== id));
        toast.success('Listing removed');
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar role="recycler" />
            <main className="flex-1 ml-64 overflow-y-auto bg-background-light dark:bg-background-dark">
                {/* Top nav */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
                    <h2 className="text-2xl font-bold">Recycler Dashboard</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={toggle} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
                        </button>
                        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard label="Total Purchases" value="₹2,45,000" trend="+8% this month" icon="shopping_cart" />
                        <StatCard label="Active Listings" value={listings.filter(l => l.status === 'active').length.toString()} sub="Buy requests" icon="list_alt" />
                        <StatCard label="Weight Purchased" value="4,200 kg" sub="This quarter" icon="scale" />
                        <StatCard label="Kabadiwala Partners" value="28" sub="Active suppliers" icon="handshake" />
                    </div>

                    {/* My Listings */}
                    <section>
                        <div className="section-header">
                            <h2 className="text-2xl font-black flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">list_alt</span>
                                My Buy Listings
                            </h2>
                            <Button icon="add" onClick={() => setShowCreate(true)}>Create Listing</Button>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">Set your buying rates per category. Kabadiwalas can see these rates and fulfill your orders.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {listings.map((listing) => {
                                const catInfo = CATEGORY_ICONS[listing.category] || CATEGORY_ICONS.Mixed;
                                return (
                                    <div key={listing._id} className={`bg-white dark:bg-slate-900 rounded-xl border ${listing.status === 'active' ? 'border-slate-200 dark:border-slate-800' : 'border-slate-300 dark:border-slate-700 opacity-60'} shadow-sm overflow-hidden`}>
                                        <div className="p-5">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${catInfo.color} flex-shrink-0`}>
                                                    <span className="material-symbols-outlined">{catInfo.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-bold text-lg">{listing.category}</h4>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${listing.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {listing.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-1">{listing.description}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-3 gap-4">
                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                                                    <p className="text-xs text-slate-400 font-bold uppercase">Rate</p>
                                                    <p className="text-lg font-black text-primary">₹{listing.pricePerKg}</p>
                                                    <p className="text-[10px] text-slate-400">per kg</p>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                                                    <p className="text-xs text-slate-400 font-bold uppercase">Min Qty</p>
                                                    <p className="text-lg font-black">{listing.minQty}</p>
                                                    <p className="text-[10px] text-slate-400">kg</p>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                                                    <p className="text-xs text-slate-400 font-bold uppercase">Filled</p>
                                                    <p className="text-lg font-black">{listing.filled}%</p>
                                                    <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                                                        <div className="bg-primary h-full rounded-full" style={{ width: `${listing.filled}%` }} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <button
                                                    onClick={() => toggleStatus(listing._id)}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1 ${listing.status === 'active' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                                                >
                                                    <span className="material-symbols-outlined text-sm">{listing.status === 'active' ? 'pause' : 'play_arrow'}</span>
                                                    {listing.status === 'active' ? 'Pause' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => deleteListing(listing._id)}
                                                    className="px-4 py-2 rounded-lg text-sm font-bold border border-red-200 text-red-500 hover:bg-red-50 transition-all flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Recent Purchases Table */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">receipt_long</span>
                                Recent Purchases
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Kabadiwala</th>
                                        <th className="px-6 py-4">Material</th>
                                        <th className="px-6 py-4">Weight</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                    {[
                                        { date: 'Mar 8, 2026', kabadiwala: 'Ramesh K.', material: 'Paper', weight: '120 kg', amount: '₹1,980', status: 'Completed' },
                                        { date: 'Mar 6, 2026', kabadiwala: 'Suresh P.', material: 'Metal', weight: '85 kg', amount: '₹2,720', status: 'Completed' },
                                        { date: 'Mar 4, 2026', kabadiwala: 'Ramesh K.', material: 'Plastic', weight: '200 kg', amount: '₹2,800', status: 'In Transit' },
                                    ].map((p, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-6 py-4 font-medium">{p.date}</td>
                                            <td className="px-6 py-4">{p.kabadiwala}</td>
                                            <td className="px-6 py-4">{p.material}</td>
                                            <td className="px-6 py-4 font-semibold">{p.weight}</td>
                                            <td className="px-6 py-4 font-bold text-primary">{p.amount}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${p.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Create Listing Modal */}
                {showCreate && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-xl font-black">Create Buy Listing</h3>
                                <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {SCRAP_CATEGORIES.map((cat) => {
                                            const catInfo = CATEGORY_ICONS[cat] || CATEGORY_ICONS.Mixed;
                                            return (
                                                <button
                                                    key={cat}
                                                    onClick={() => setNewListing({ ...newListing, category: cat })}
                                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-bold transition-all ${newListing.category === cat ? 'bg-primary/10 border-2 border-primary text-primary' : 'bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-primary/40'}`}
                                                >
                                                    <span className="material-symbols-outlined text-lg">{catInfo.icon}</span>
                                                    {cat}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Price per Kg (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-primary focus:ring-2 focus:ring-primary"
                                            placeholder="e.g. 20"
                                            value={newListing.pricePerKg}
                                            onChange={(e) => setNewListing({ ...newListing, pricePerKg: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Min Qty (kg)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold focus:ring-2 focus:ring-primary"
                                            placeholder="e.g. 100"
                                            value={newListing.minQty}
                                            onChange={(e) => setNewListing({ ...newListing, minQty: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                    <textarea
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary resize-none"
                                        rows={3}
                                        placeholder="Describe what materials you accept..."
                                        value={newListing.description}
                                        onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCreate}
                                        className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">add_circle</span>
                                        Create Listing
                                    </button>
                                    <button
                                        onClick={() => setShowCreate(false)}
                                        className="px-6 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

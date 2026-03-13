import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { listingService, scrapService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function UserDashboard() {
    const { user } = useAuth();
    const { isDark, toggle } = useTheme();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [pickups, setPickups] = useState([]);
    const [marketItems, setMarketItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [myL, myP, market] = await Promise.all([
                    listingService.getMine(),
                    scrapService.getMine(),
                    listingService.getAll({ mode: 'reuse', status: 'active', limit: 4 }),
                ]);
                setListings(myL.data.listings || []);
                setPickups(myP.data.pickups || []);
                setMarketItems(market.data.listings || []);
            } catch {
                // show demo data
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const statusBadge = (s) => {
        const map = { active: 'active', sold: 'sold', scrap: 'scrap', converted: 'converted', completed: 'active', pending: 'pending' };
        return <Badge variant={map[s] || 'scrap'}>{s}</Badge>;
    };

    if (loading) return <Loader fullScreen />;

    // Demo data fallback
    const demoListings = listings.length > 0 ? listings : [
        { _id: '1', title: 'Oak Dining Chair', mode: 'reuse', status: 'active', AI_resale_estimate: 45, images: ['/images/demo-chair.png'] },
        { _id: '2', title: 'Circuit Board Mix', mode: 'scrap', status: 'converted', AI_resale_estimate: 12.5, images: ['/images/demo-ewaste.png'] },
        { _id: '3', title: 'Retro 35mm Camera', mode: 'reuse', status: 'sold', AI_resale_estimate: 120, images: ['/images/demo-camera.png'] },
    ];

    const demoPickups = pickups.length > 0 ? pickups : [
        { _id: 'p1', material: 'Mixed Metals', weight: 14.5, finalAmount: 32.4, status: 'completed', createdAt: '2023-10-24T14:30:00' },
        { _id: 'p2', material: 'Paper & Cardboard', weight: 22, finalAmount: 15.2, status: 'completed', createdAt: '2023-10-21T09:15:00' },
        { _id: 'p3', material: 'E-Waste', weight: 4.2, finalAmount: null, status: 'in_transit', createdAt: '2023-10-20T11:00:00' },
    ];

    const demoMarket = marketItems.length > 0 ? marketItems : [
        { _id: 'm1', title: 'Glass Jar Set (12)', price: 10, distance: '1.2 km', condition: 'Excellent', images: ['/images/demo-glass-jars.png'] },
        { _id: 'm2', title: 'Office Swivel Chair', price: 35, distance: '3.5 km', condition: 'Minor scratches', images: ['/images/demo-office-chair.png'] },
        { _id: 'm3', title: 'Terracotta Pot Mix', price: 0, distance: '0.8 km', condition: 'Used – Fair', images: ['/images/demo-terracotta.png'] },
        { _id: 'm4', title: 'Standing Floor Lamp', price: 20, distance: '5.1 km', condition: 'Like New', images: ['/images/demo-lamp.png'] },
    ];

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar role="user" />
            <main className="flex-1 ml-64 overflow-y-auto bg-background-light dark:bg-background-dark">
                {/* Top bar */}
                <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                search
                            </span>
                            <input
                                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary w-64 shadow-sm"
                                placeholder="Search items or pickups..."
                            />
                        </div>
                        <button
                            onClick={toggle}
                            className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-500 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
                        </button>
                        <button className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-500 hover:text-primary transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                        </button>
                        <button className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-500 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <StatCard label="Total Earnings" value="₹12,450" trend="+12.5%" icon="account_balance_wallet" />
                        <StatCard label="Reuse Sales" value="₹7,920" sub="63% of total income" icon="storefront" />
                        <StatCard label="Scrap Value" value="₹4,530" trend="Peak week" icon="recycling" />
                        <StatCard label="Items Sold" value="42" sub="Total cycle count" icon="inventory_2" />
                        <StatCard label="Scrap Pickups" value="18" sub="Completed requests" icon="local_shipping" />
                    </div>

                    {/* My Listings */}
                    <section>
                        <div className="section-header">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">inventory</span>
                                My Listings
                            </h3>
                            <button className="text-sm font-semibold text-primary hover:underline">View All</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {demoListings.map((item) => (
                                <div key={item._id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col group">
                                    <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
                                        {item.images && item.images.length > 0 ? (
                                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-4xl text-primary/20">inventory_2</span>
                                            </div>
                                        )}
                                        <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter text-white ${item.status === 'active' ? 'bg-emerald-500' :
                                            item.status === 'sold' ? 'bg-blue-500' :
                                                item.status === 'converted' ? 'bg-purple-500' : 'bg-slate-500'
                                            }`}>{item.status}</span>
                                    </div>
                                    <div className="p-4 flex-1">
                                        <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                                        <div className="flex justify-between items-center text-sm mb-4">
                                            <span className="text-slate-500">Resale Value:</span>
                                            <span className="font-semibold text-primary">
                                                ₹{item.AI_resale_estimate || '--'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button className="bg-slate-100 dark:bg-slate-700 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                                                Edit
                                            </button>
                                            {item.status === 'active' && item.mode === 'reuse' && (
                                                <button className="bg-primary/10 text-primary py-2 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all">
                                                    Convert Scrap
                                                </button>
                                            )}
                                            {item.status === 'sold' && (
                                                <button className="bg-slate-100 dark:bg-slate-700 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                                                    View Txn
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* Add new */}
                            <button
                                onClick={() => navigate('/create-listing')}
                                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-primary hover:text-primary transition-all group"
                            >
                                <span className="material-symbols-outlined text-4xl mb-2 group-hover:scale-110 transition-transform">
                                    add_circle
                                </span>
                                <span className="font-bold">List New Item</span>
                            </button>
                        </div>
                    </section>

                    {/* Marketplace Preview */}
                    <section>
                        <div className="section-header">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">storefront</span>
                                Reusable Marketplace
                            </h3>
                            <div className="flex items-center gap-2">
                                <select className="bg-white dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-primary shadow-sm py-2 px-3">
                                    <option>Within 5 km</option>
                                    <option>Within 10 km</option>
                                    <option>Within 25 km</option>
                                </select>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold shadow-sm">
                                    <span className="material-symbols-outlined text-sm">filter_list</span>
                                    Filters
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {demoMarket.map((item) => (
                                <div key={item._id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                    <div className="h-40 bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative group-hover:scale-105 transition-all duration-300">
                                        {item.images && item.images.length > 0 ? (
                                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-4xl text-primary/20">storefront</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold">{item.title}</h4>
                                            <span className="text-primary font-bold">
                                                {item.price === 0 ? 'Free' : `₹${item.price}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-3">
                                            <span className="material-symbols-outlined text-xs">distance</span>
                                            {item.distance} away
                                            <span className="mx-1">•</span>
                                            {item.condition}
                                        </div>
                                        <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all">
                                            I'm Interested
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recent Scrap Pickups */}
                    <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">recycling</span>
                                Recent Scrap Pickups
                            </h3>
                            <Button variant="secondary" size="sm" icon="add" onClick={() => navigate('/scrap-schedule')}>
                                Schedule New
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Date & Time</th>
                                        <th className="px-6 py-4">Material / Weight</th>
                                        <th className="px-6 py-4">Earned</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                                    {demoPickups.map((p) => (
                                        <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{format(new Date(p.createdAt), 'MMM dd, yyyy')}</div>
                                                <div className="text-xs text-slate-400">{format(new Date(p.createdAt), 'hh:mm a')}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{p.material}</div>
                                                <div className="text-xs text-slate-400">{p.weight} kg</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${p.finalAmount ? 'text-primary' : 'text-slate-400'}`}>
                                                    {p.finalAmount ? `+₹${p.finalAmount}` : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{statusBadge(p.status)}</td>
                                            <td className="px-6 py-4 text-right">
                                                {p.status === 'completed' ? (
                                                    <button className="text-slate-400 hover:text-primary transition-colors">
                                                        <span className="material-symbols-outlined">download</span>
                                                    </button>
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-300">more_horiz</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

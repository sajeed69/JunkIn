import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Badge from '../components/ui/Badge';
import { listingService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Clothing', 'Appliances', 'Books', 'Other'];

const DEMO_ITEMS = [
    { _id: '1', title: 'Glass Jar Set (12)', AI_resale_estimate: 850, category: 'Other', condition: 'Excellent', location: '1.2 km away', images: ['/images/demo-glass-jars.png'] },
    { _id: '2', title: 'Office Swivel Chair', AI_resale_estimate: 2999, category: 'Furniture', condition: 'Minor scratches', location: '3.5 km away', images: ['/images/demo-office-chair.png'] },
    { _id: '3', title: 'Terracotta Pot Mix', AI_resale_estimate: 0, category: 'Other', condition: 'Used – Fair', location: '0.8 km away', images: ['/images/demo-terracotta.png'] },
    { _id: '4', title: 'Standing Floor Lamp', AI_resale_estimate: 1599, category: 'Other', condition: 'Like New', location: '5.1 km away', images: ['/images/demo-lamp.png'] },
    { _id: '5', title: 'Vintage Trek Bicycle', AI_resale_estimate: 3800, category: 'Other', condition: 'Good', location: '2.3 km away', images: ['/images/demo-bicycle.png'] },
    { _id: '6', title: 'Study Desk', AI_resale_estimate: 2200, category: 'Furniture', condition: 'Good', location: '1.8 km away', images: ['/images/demo-desk.png'] },
    { _id: '7', title: 'Sony Bluetooth Speaker', AI_resale_estimate: 1200, category: 'Electronics', condition: 'Good', location: '4.2 km away', images: ['/images/demo-speaker.png'] },
    { _id: '8', title: 'Book Collection (50)', AI_resale_estimate: 500, category: 'Books', condition: 'Good', location: '0.5 km away', images: ['/images/demo-books.png'] },
];

export default function Marketplace() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [items, setItems] = useState(DEMO_ITEMS); // Start with demo data immediately
    const [loading, setLoading] = useState(false); // Start false - show content immediately
    const [activeCategory, setActiveCategory] = useState('All');
    const [search, setSearch] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data } = await listingService.getAll({ mode: 'reuse', status: 'active' });
                if (!cancelled && data.listings?.length > 0) {
                    setItems(data.listings);
                }
            } catch (err) {
                // Keep demo data - already loaded
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const filtered = items.filter((i) => {
        const matchCat = activeCategory === 'All' || i.category === activeCategory;
        const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const isLoggedIn = !!user;

    const content = (
        <div className={`${isLoggedIn ? 'p-8 max-w-7xl mx-auto' : 'max-w-7xl mx-auto w-full px-6 py-8 flex-1'}`}>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black mb-2">🛍 Reusable Marketplace</h1>
                <p className="text-slate-500">Browse quality pre-loved items from your community</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                    <input
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary shadow-sm"
                        placeholder="Search items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map((c) => (
                        <button
                            key={c}
                            onClick={() => setActiveCategory(c)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === c
                                ? 'bg-primary text-slate-900'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <p className="text-sm text-slate-500 mb-4">{filtered.length} items found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filtered.map((item) => (
                    <div
                        key={item._id}
                        onClick={() => navigate(`/listing/${item._id}`, { state: { item } })}
                        className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all group cursor-pointer"
                    >
                        <div className="h-48 bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative group-hover:scale-105 transition-all duration-300">
                            {item.images && item.images.length > 0 ? (
                                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-5xl text-primary/20">storefront</span>
                                </div>
                            )}
                            <Badge variant="active" className="absolute top-3 left-3">Active</Badge>
                            {item.condition === 'New' && (
                                <Badge variant="sold" className="absolute top-3 right-3">Brand New</Badge>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold group-hover:text-primary transition-colors">{item.title}</h4>
                                <span className="text-primary font-black ml-2 flex-shrink-0">
                                    {item.AI_resale_estimate === 0 ? 'Free' : `₹${item.AI_resale_estimate?.toLocaleString()}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-4">
                                <span className="material-symbols-outlined text-xs">distance</span>
                                {typeof item.location === 'object' ? 'Location set' : (item.location || '—')}
                                <span className="mx-1">•</span>
                                {item.condition}
                            </div>
                            <button className="w-full bg-primary text-slate-900 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all">
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-4 text-center py-20 text-slate-400">
                        <span className="material-symbols-outlined text-6xl mb-4 block">search_off</span>
                        <p className="font-bold">No items found</p>
                    </div>
                )}
            </div>
        </div>
    );

    // When the user is logged in, render inside sidebar layout
    if (isLoggedIn) {
        return (
            <div className="flex min-h-screen">
                <Sidebar role={user.role || 'user'} />
                <main className="flex-1 ml-64 overflow-y-auto bg-background-light dark:bg-background-dark">
                    {content}
                </main>
            </div>
        );
    }

    // When not logged in, render with public Navbar
    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
            <Navbar />
            {content}
        </div>
    );
}

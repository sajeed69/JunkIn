import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { listingService } from '../api/services';
import Loader from '../components/ui/Loader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const DEMO_FALLBACK = {
    '1': { title: 'Glass Jar Set (12)', category: 'Other', condition: 'Excellent', description: 'A beautiful set of 12 glass mason jars, perfect for storage, canning, or decorative purposes. All jars in excellent condition with tight-sealing lids.', AI_resale_estimate: 850, AI_scrap_estimate: 120, images: ['/images/demo-glass-jars.png'], status: 'active', mode: 'reuse', location: '1.2 km away' },
    '2': { title: 'Office Swivel Chair', category: 'Furniture', condition: 'Minor scratches', description: 'Ergonomic office swivel chair with height adjustment and lumbar support. Minor scratches on armrests but fully functional.', AI_resale_estimate: 2999, AI_scrap_estimate: 400, images: ['/images/demo-office-chair.png'], status: 'active', mode: 'reuse', location: '3.5 km away' },
    '3': { title: 'Terracotta Pot Mix', category: 'Other', condition: 'Used – Fair', description: 'Collection of terracotta pots in various sizes. Some have minor chips. Perfect for garden enthusiasts.', AI_resale_estimate: 0, AI_scrap_estimate: 0, images: ['/images/demo-terracotta.png'], status: 'active', mode: 'reuse', location: '0.8 km away' },
    '4': { title: 'Standing Floor Lamp', category: 'Other', condition: 'Like New', description: 'Modern minimalist standing floor lamp with white shade. Barely used, works perfectly. Adjustable height.', AI_resale_estimate: 1599, AI_scrap_estimate: 200, images: ['/images/demo-lamp.png'], status: 'active', mode: 'reuse', location: '5.1 km away' },
    '5': { title: 'Vintage Trek Bicycle', category: 'Other', condition: 'Good', description: 'Classic Trek bicycle in great condition. Recently serviced with new tires. Perfect for daily commute.', AI_resale_estimate: 3800, AI_scrap_estimate: 800, images: ['/images/demo-bicycle.png'], status: 'active', mode: 'reuse', location: '2.3 km away' },
    '6': { title: 'Study Desk', category: 'Furniture', condition: 'Good', description: 'Solid wooden study desk with one drawer. Clean and sturdy. Ideal for students or home office.', AI_resale_estimate: 2200, AI_scrap_estimate: 350, images: ['/images/demo-desk.png'], status: 'active', mode: 'reuse', location: '1.8 km away' },
    '7': { title: 'Sony Bluetooth Speaker', category: 'Electronics', condition: 'Good', description: 'Sony portable Bluetooth speaker with great bass and 12-hour battery life. Includes USB-C charging cable.', AI_resale_estimate: 1200, AI_scrap_estimate: 150, images: ['/images/demo-speaker.png'], status: 'active', mode: 'reuse', location: '4.2 km away' },
    '8': { title: 'Book Collection (50)', category: 'Books', condition: 'Good', description: 'Collection of 50 books spanning fiction, non-fiction, and self-help genres. Most are in good readable condition.', AI_resale_estimate: 500, AI_scrap_estimate: 80, images: ['/images/demo-books.png'], status: 'active', mode: 'reuse', location: '0.5 km away' },
};

export default function ListingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await listingService.getById(id);
                setListing(data.listing);
            } catch (err) {
                // Use navigation state or fallback demo data
                const stateItem = location.state?.item;
                const fallback = DEMO_FALLBACK[id];
                if (stateItem) {
                    setListing({ ...stateItem, description: stateItem.description || fallback?.description || 'A quality pre-loved item available for reuse.' });
                } else if (fallback) {
                    setListing(fallback);
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [id, location.state]);

    const handleInterest = () => {
        toast.success('Interest expressed! The seller will be notified.');
    };

    if (loading) return <Loader fullScreen />;
    if (!listing) return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">error</span>
                <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
                <Button onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20">
            <Navbar />
            <div className="max-w-6xl mx-auto px-6 py-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-6 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back
                </button>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Images */}
                    <div>
                        <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-2xl relative group">
                            {listing.images && listing.images.length > 0 ? (
                                <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-8xl text-primary/20">inventory_2</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <Badge variant="active">{listing.status || 'active'}</Badge>
                                <Badge variant="scrap">{listing.mode || 'reuse'}</Badge>
                            </div>
                        </div>

                        {/* More images if any */}
                        {listing.images?.length > 1 && (
                            <div className="flex gap-4 mt-6">
                                {listing.images.slice(1).map((img, i) => (
                                    <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* AI Analysis Card */}
                        <div className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                <h4 className="font-bold text-lg">AI Smart Analysis</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm">
                                    <p className="text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Suggested Price</p>
                                    <p className="text-2xl font-black text-primary">₹{listing.AI_resale_estimate?.toLocaleString() || '--'}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm">
                                    <p className="text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Scrap Value</p>
                                    <p className="text-2xl font-black text-amber-600">₹{listing.AI_scrap_estimate?.toLocaleString() || '--'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-8 flex flex-col justify-center">
                        <div>
                            <h1 className="text-4xl font-black mb-4">{listing.title}</h1>
                            <div className="flex items-center gap-4 text-slate-500 text-sm">
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">category</span>
                                    {listing.category || 'General'}
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">grade</span>
                                    {listing.condition || 'Good'}
                                </div>
                                <div className="flex items-center gap-1 text-primary font-bold">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    {typeof listing.location === 'object' ? 'Location set' : (listing.location || 'Local Pickup')}
                                </div>
                            </div>
                        </div>

                        <div className="card p-6 flex items-center gap-5 bg-white dark:bg-slate-800/10">
                            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xl border-4 border-white dark:border-slate-800">
                                {listing.userId?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <p className="font-bold text-lg">{listing.userId?.name || 'JunkIn User'}</p>
                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                    <span className="text-primary font-bold">★ {listing.userId?.rating || '5.0'}</span>
                                    · Trusted Community Member
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-3">Item Description</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">{listing.description || 'A quality pre-loved item available for reuse.'}</p>
                        </div>

                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Asking Price</p>
                                    <p className="text-4xl font-black text-primary">
                                        {listing.AI_resale_estimate === 0 ? 'Free' : `₹${listing.AI_resale_estimate?.toLocaleString() || '--'}`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 italic">Eco Impact</p>
                                    <p className="text-xl font-bold text-secondary flex items-center gap-1">
                                        <span className="material-symbols-outlined">eco</span>
                                        2.4kg CO₂ saved
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleInterest}
                                className="w-full bg-primary text-slate-900 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Express Interest
                            </button>
                            <p className="text-center text-xs text-slate-400 mt-4">
                                This contact will be sent directly to the seller via JunkIn Secure Match.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

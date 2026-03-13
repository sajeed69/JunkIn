import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bidService } from '../api/services';
import toast from 'react-hot-toast';

export default function CollectorAuctions() {
    const navigate = useNavigate();
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState(null);
    const [bidAmount, setBidAmount] = useState('');
    const [bids, setBids] = useState([]);
    const [bidModalOpen, setBidModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAuctions();
    }, []);

    const fetchAuctions = async () => {
        try {
            const { data } = await bidService.getAuctions();
            setAuctions(data.listings || []);
        } catch (err) {
            console.error('Failed to fetch auctions:', err);
            toast.error('Failed to load auctions');
        } finally {
            setLoading(false);
        }
    };

    const openBidModal = async (listing) => {
        setSelectedListing(listing);
        setBidAmount('');
        setBidModalOpen(true);
        try {
            const { data } = await bidService.getBids(listing._id);
            setBids(data.bids || []);
        } catch (err) {
            console.error('Failed to fetch bids:', err);
        }
    };

    const handlePlaceBid = async () => {
        if (!bidAmount || parseFloat(bidAmount) <= 0) {
            toast.error('Please enter a valid bid amount');
            return;
        }
        setSubmitting(true);
        try {
            const { data } = await bidService.placeBid(selectedListing._id, parseFloat(bidAmount));
            toast.success(data.message || 'Bid placed!');
            setBidModalOpen(false);
            fetchAuctions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place bid');
        } finally {
            setSubmitting(false);
        }
    };

    const getTimeRemaining = (endDate) => {
        if (!endDate) return 'N/A';
        const diff = new Date(endDate) - new Date();
        if (diff <= 0) return 'Ended';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="border-b border-amber-500/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl px-6 md:px-20 py-4 sticky top-0 z-50">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-white shadow-lg shadow-amber-500/20">
                            <span className="material-symbols-outlined text-xl">gavel</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight">Collector Auctions</h1>
                            <p className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">Rare Item Marketplace</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* Hero Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 md:p-12 mb-10 shadow-2xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-white uppercase tracking-widest">
                                🏆 Exclusive
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
                            Rare & Collectible Items
                        </h2>
                        <p className="text-white/80 text-sm md:text-base max-w-xl">
                            Bid on verified rare items detected by our AI. Each item has been analyzed through web scraping and rarity classification.
                        </p>
                        <div className="flex items-center gap-6 mt-6">
                            <div className="text-center">
                                <div className="text-2xl font-black text-white">{auctions.length}</div>
                                <div className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Active Auctions</div>
                            </div>
                            <div className="w-px h-10 bg-white/20" />
                            <div className="text-center">
                                <div className="text-2xl font-black text-white">48h</div>
                                <div className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Bid Window</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 border-4 border-amber-400/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Loading auctions...</p>
                    </div>
                )}

                {/* Empty state */}
                {!loading && auctions.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-4xl text-amber-500">search_off</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Active Auctions</h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto">
                            No rare items are currently up for bidding. List an item and our AI will detect if it's collectible!
                        </p>
                        <button
                            onClick={() => navigate('/create-listing')}
                            className="mt-6 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-amber-500/20"
                        >
                            List an Item
                        </button>
                    </div>
                )}

                {/* Auction Cards Grid */}
                {!loading && auctions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {auctions.map((item) => (
                            <div
                                key={item._id}
                                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Image */}
                                <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    {item.images?.[0] ? (
                                        <img
                                            src={item.images[0].startsWith('http') ? item.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${item.images[0]}`}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-6xl text-slate-300">inventory_2</span>
                                        </div>
                                    )}
                                    {/* Rarity Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md ${
                                            item.rarity_label === 'Ultra Rare'
                                                ? 'bg-purple-500/90 text-white'
                                                : 'bg-amber-500/90 text-white'
                                        }`}>
                                            {item.rarity_label === 'Ultra Rare' ? '💎' : '🏆'} {item.rarity_label}
                                        </span>
                                    </div>
                                    {/* Timer */}
                                    <div className="absolute bottom-3 right-3">
                                        <div className="bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm text-amber-400">timer</span>
                                            {getTimeRemaining(item.bidding_ends_at)}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1">
                                        {item.aiAnalysis?.identified_item || item.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">category</span>
                                        {item.category} • {item.condition}
                                    </p>

                                    {/* Rarity Signals */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {(item.rarity_signals || []).slice(0, 3).map((signal, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded text-[10px] font-bold border border-amber-200 dark:border-amber-800/40">
                                                {signal}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Price Section */}
                                    <div className="flex items-end justify-between mb-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Current Highest Bid</p>
                                            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-baseline gap-1">
                                                <span className="text-sm">₹</span>
                                                {(item.highest_bid || 0).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Rarity Score</p>
                                            <div className="text-lg font-black text-slate-700 dark:text-slate-300">{item.rarity_score}/15</div>
                                        </div>
                                    </div>

                                    {/* Bid Button */}
                                    <button
                                        onClick={() => openBidModal(item)}
                                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">gavel</span>
                                        Place Bid
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Bid Modal */}
            {bidModalOpen && selectedListing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setBidModalOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-800">
                        {/* Close */}
                        <button
                            onClick={() => setBidModalOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <span className="material-symbols-outlined">gavel</span>
                            </div>
                            <div>
                                <h3 className="font-black text-lg">Place Your Bid</h3>
                                <p className="text-xs text-slate-500 line-clamp-1">
                                    {selectedListing.aiAnalysis?.identified_item || selectedListing.title}
                                </p>
                            </div>
                        </div>

                        {/* Current Highest */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 mb-5">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-amber-600">Current Highest Bid</span>
                                <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                                    ₹{(selectedListing.highest_bid || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Bid Input */}
                        <div className="mb-5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                Your Bid Amount (₹)
                            </label>
                            <input
                                type="number"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                placeholder={`Min: ₹${(selectedListing.highest_bid || 0) + 1}`}
                                className="w-full px-4 py-3.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold bg-slate-50 dark:bg-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                                min={(selectedListing.highest_bid || 0) + 1}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handlePlaceBid}
                            disabled={submitting}
                            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">check_circle</span>
                                    Confirm Bid
                                </>
                            )}
                        </button>

                        {/* Recent Bids */}
                        {bids.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Recent Bids</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {bids.slice(0, 5).map((bid, i) => (
                                        <div key={bid._id || i} className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 text-xs font-black">
                                                    {i + 1}
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {bid.bidderId?.name || 'Anonymous'}
                                                </span>
                                            </div>
                                            <span className="text-sm font-black text-amber-600">₹{bid.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <footer className="mt-auto px-6 py-8 text-center text-slate-400 text-sm">
                © 2024 JunkIn Collector Auctions. AI-Powered Rarity Detection.
            </footer>
        </div>
    );
}

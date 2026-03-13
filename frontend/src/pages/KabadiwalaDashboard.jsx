import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { kabadiwalaService } from '../api/services';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import MapComponent from '../components/ui/MapComponent';


const DEMO_REQUESTS = [
    { _id: 'r1', customerName: 'Anjali Sharma', location: 'HSR Layout, Sector 2', distance: '1.2 km', material: 'Paper & Plastic (Mix)', estWeight: '15-20 kg', badge: 'Fast Pickup', images: ['/images/demo-scrap.png'] },
    { _id: 'r2', customerName: 'Rahul Varma', location: 'Koramangala 4th Block', distance: '3.5 km', material: 'Metal & E-waste', estWeight: '45 kg', badge: null, images: ['/images/demo-ewaste.png'] },
    { _id: 'r3', customerName: 'Meena Patel', location: 'Indiranagar 12th Main', distance: '2.1 km', material: 'Old Newspapers & Bottles', estWeight: '25 kg', badge: 'Nearby', images: ['/images/demo-glass-jars.png'] },
];
const DEMO_BULK = [
    { _id: 'b1', company: 'GreenPaper Ltd.', material: 'Old Newspaper / Magazines', qty: '500 kg', rate: '₹16.50/kg', fillPct: 75, icon: 'newspaper', color: 'bg-blue-100 text-blue-600' },
    { _id: 'b2', company: 'IronWorks Foundry', material: 'Mixed Scrap Metal', qty: '2,000 kg', rate: '₹32.00/kg', fillPct: 25, icon: 'iron', color: 'bg-orange-100 text-orange-600' },
    { _id: 'b3', company: 'PlastiCycle Inc.', material: 'PET Bottles (Grade A)', qty: '800 kg', rate: '₹14.00/kg', fillPct: 60, icon: 'water_bottle', color: 'bg-cyan-100 text-cyan-600' },
];

const DEMO_EARNINGS = [
    { date: 'Mar 10, 2026', customer: 'Anjali S.', material: 'Paper Mix', weight: '18 kg', amount: '₹216', commission: '₹10.80' },
    { date: 'Mar 9, 2026', customer: 'Rahul V.', material: 'Metal Scrap', weight: '45 kg', amount: '₹1,440', commission: '₹72.00' },
    { date: 'Mar 8, 2026', customer: 'Priya K.', material: 'Plastic', weight: '12 kg', amount: '₹216', commission: '₹10.80' },
    { date: 'Mar 7, 2026', customer: 'Vikram M.', material: 'E-waste', weight: '8 kg', amount: '₹360', commission: '₹18.00' },
    { date: 'Mar 6, 2026', customer: 'Sunita R.', material: 'Paper', weight: '25 kg', amount: '₹300', commission: '₹15.00' },
];

const VALID_TABS = ['requests', 'ongoing', 'rejected', 'active', 'scrap-buy', 'earnings', 'ratings'];

export default function KabadiwalaDashboard() {
    const { isDark, toggle } = useTheme();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'requests');
    const [requests, setRequests] = useState(DEMO_REQUESTS);
    const [ongoingOrders, setOngoingOrders] = useState([]);
    const [rejectedOrders, setRejectedOrders] = useState([]);
    const [activeWeight, setActiveWeight] = useState('');
    const [completing, setCompleting] = useState(false);

    // Sync tab with URL
    useEffect(() => {
        if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl]);

    const switchTab = (tab) => {
        setActiveTab(tab);
        setSearchParams(tab === 'requests' ? {} : { tab });
    };

    const handleAccept = async (id) => {
        const order = requests.find((r) => r._id === id);
        if (!order) return;
        try { await kabadiwalaService.accept(id); } catch { /* demo mode */ }
        const acceptedOrder = { ...order, status: 'accepted', acceptedAt: new Date().toISOString() };
        setOngoingOrders((prev) => [acceptedOrder, ...prev]);
        setRequests((prev) => prev.filter((r) => r._id !== id));
        toast.success(`Pickup from ${order.customerName} accepted!`);
    };

    const handleReject = async (id) => {
        const order = requests.find((r) => r._id === id);
        if (!order) return;
        try { await kabadiwalaService.reject(id); } catch { /* demo mode */ }
        const rejectedOrder = { ...order, status: 'rejected', rejectedAt: new Date().toISOString() };
        setRejectedOrders((prev) => [rejectedOrder, ...prev]);
        setRequests((prev) => prev.filter((r) => r._id !== id));
        toast.error(`Pickup from ${order.customerName} rejected.`);
    };

    const handleMarkPickedUp = (id) => {
        setOngoingOrders((prev) => prev.map((o) => o._id === id ? { ...o, status: 'picked_up', pickedUpAt: new Date().toISOString() } : o));
        toast.success('Marked as picked up!');
    };

    const handleComplete = async () => {
        if (!activeWeight) { toast.error('Enter actual weight'); return; }
        setCompleting(true);
        try {
            await kabadiwalaService.completePickup('active1', { weight: activeWeight });
            toast.success('Transaction completed! Digital receipt generated.');
        } catch {
            toast.success('Transaction complete (demo mode). Receipt generated!');
        } finally { setCompleting(false); setActiveWeight(''); }
    };

    const estAmount = activeWeight ? (parseFloat(activeWeight) * 12 * 0.95).toFixed(2) : null;

    const formatTime = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    // Tab config for the top navigation
    const TABS = [
        { key: 'requests', label: 'Requests', icon: 'pending_actions', count: requests.length },
        { key: 'ongoing', label: 'Ongoing', icon: 'local_shipping', count: ongoingOrders.length },
        { key: 'rejected', label: 'Rejected', icon: 'cancel', count: rejectedOrders.length },
        { key: 'active', label: 'Active Pickup', icon: 'directions_car' },
        { key: 'scrap-buy', label: 'Scrap Buy', icon: 'factory' },
        { key: 'earnings', label: 'Earnings', icon: 'payments' },
        { key: 'ratings', label: 'Ratings', icon: 'star_rate' },
    ];

    return (
        <div className="flex min-h-screen">
            <Sidebar role="kabadiwala" />
            <main className="flex-1 ml-64 bg-background-light dark:bg-background-dark">
                {/* Top nav */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-72">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                            <input className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50" placeholder="Search for area or scrap type..." />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={toggle} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
                        </button>
                        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                        </button>
                        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors">
                            <span className="material-symbols-outlined text-sm">online_prediction</span>
                            Go Offline
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard label="Weekly Earnings" value="₹8,450" trend="+12% vs LW" icon="payments" />
                        <StatCard label="Pickups Done" value="42" sub="Target: 50" icon="local_shipping" />
                        <StatCard label="Trust Rating" value="4.8 ★" sub="98% Accuracy" icon="star_rate" iconBg="bg-yellow-100 text-yellow-600" />
                        <StatCard label="Total Saved CO₂" value="124 kg" icon="eco" />
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => switchTab(tab.key)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.key
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* =================== NEW PICKUP REQUESTS =================== */}
                    {activeTab === 'requests' && (
                        <section>
                            <div className="section-header">
                                <h2 className="text-2xl font-black flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">pending_actions</span>
                                    New Pickup Requests
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {requests.map((req) => (
                                    <div key={req._id} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row">
                                        <div className="sm:w-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative min-h-[120px]">
                                            {req.images?.length > 0 ? (
                                                <img src={req.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-5xl text-primary/20">inventory_2</span>
                                                </div>
                                            )}
                                            {req.badge && (
                                                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">{req.badge}</div>
                                            )}
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-lg">{req.customerName}</h4>
                                                    <span className="text-xs text-slate-400">{req.distance} away</span>
                                                </div>
                                                <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                    <p className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">location_on</span>{req.location}</p>
                                                    <p className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">inventory_2</span>{req.material}</p>
                                                    <p className="flex items-center gap-2 font-semibold"><span className="material-symbols-outlined text-xs">scale</span>Est: {req.estWeight}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex gap-3">
                                                <button onClick={() => handleAccept(req._id)} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">check_circle</span> Accept
                                                </button>
                                                <button onClick={() => handleReject(req._id)} className="px-4 border border-red-200 dark:border-red-800 text-red-500 py-2 rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">cancel</span> Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {requests.length === 0 && (
                                    <div className="col-span-2 text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <span className="material-symbols-outlined text-5xl mb-2 block">done_all</span>
                                        <p className="font-bold">All caught up! No pending requests.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* =================== ONGOING ORDERS =================== */}
                    {activeTab === 'ongoing' && (
                        <section>
                            <div className="section-header">
                                <h2 className="text-2xl font-black flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">local_shipping</span> Ongoing Orders
                                </h2>
                                <span className="text-sm text-slate-500">{ongoingOrders.length} active</span>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {ongoingOrders.map((order) => (
                                    <div key={order._id} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border-2 border-emerald-200 dark:border-emerald-800 shadow-md">
                                        <div className="flex items-center gap-2 px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800">
                                            <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                                {order.status === 'picked_up' ? 'Picked Up' : 'Order Accepted'}
                                            </span>
                                            <span className="text-xs text-slate-400 ml-auto">{formatTime(order.acceptedAt)}</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row">
                                            <div className="sm:w-40 bg-slate-100 dark:bg-slate-800 min-h-[100px]">
                                                {order.images?.length > 0 ? (
                                                    <img src={order.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-4xl text-emerald-300">inventory_2</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5 flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-lg">{order.customerName}</h4>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${order.status === 'picked_up' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {order.status === 'picked_up' ? 'Picked Up' : 'Accepted'}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-sm text-slate-500">
                                                    <p className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">location_on</span>{order.location}</p>
                                                    <p className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">inventory_2</span>{order.material}</p>
                                                    <p className="flex items-center gap-2 font-semibold"><span className="material-symbols-outlined text-xs">scale</span>Est: {order.estWeight}</p>
                                                </div>
                                                {order.status === 'accepted' && (
                                                    <button onClick={() => handleMarkPickedUp(order._id)} className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">task_alt</span> Mark as Picked Up
                                                    </button>
                                                )}
                                                {order.status === 'picked_up' && (
                                                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 font-bold">
                                                        <span className="material-symbols-outlined text-sm">schedule</span> Picked up at {formatTime(order.pickedUpAt)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {ongoingOrders.length === 0 && (
                                    <div className="col-span-2 text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <span className="material-symbols-outlined text-5xl mb-2 block">inbox</span>
                                        <p className="font-bold">No ongoing orders yet.</p>
                                        <p className="text-xs mt-1">Accept a pickup request to see it here.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* =================== REJECTED ORDERS =================== */}
                    {activeTab === 'rejected' && (
                        <section>
                            <div className="section-header">
                                <h2 className="text-2xl font-black flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500">cancel</span> Rejected Orders
                                </h2>
                                <span className="text-sm text-slate-500">{rejectedOrders.length} rejected</span>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {rejectedOrders.map((order) => (
                                    <div key={order._id} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-red-200 dark:border-red-800/50 shadow-md opacity-80">
                                        <div className="flex items-center gap-2 px-5 py-3 bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-800/50">
                                            <span className="material-symbols-outlined text-red-500 text-sm">cancel</span>
                                            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Order Rejected</span>
                                            <span className="text-xs text-slate-400 ml-auto">{formatTime(order.rejectedAt)}</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row">
                                            <div className="sm:w-40 bg-slate-100 dark:bg-slate-800 min-h-[100px] grayscale">
                                                {order.images?.length > 0 ? (
                                                    <img src={order.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-4xl text-red-300">inventory_2</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5 flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-lg text-slate-500">{order.customerName}</h4>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-red-100 text-red-700">Rejected</span>
                                                </div>
                                                <div className="space-y-1 text-sm text-slate-400">
                                                    <p className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">location_on</span>{order.location}</p>
                                                    <p className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">inventory_2</span>{order.material}</p>
                                                    <p className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">scale</span>Est: {order.estWeight}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {rejectedOrders.length === 0 && (
                                    <div className="col-span-2 text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <span className="material-symbols-outlined text-5xl mb-2 block">sentiment_satisfied</span>
                                        <p className="font-bold">No rejected orders.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* =================== ACTIVE PICKUP =================== */}
                    {activeTab === 'active' && (
                        <section className="bg-primary/5 rounded-2xl p-6 border-2 border-dashed border-primary/20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-primary text-white p-2 rounded-lg">
                                    <span className="material-symbols-outlined">directions_car</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-black">Active Pickup: On Location</h2>
                                    <p className="text-sm text-slate-500">Currently handling Priya K's request</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                <div className="lg:col-span-1 space-y-4">
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                                        <p className="text-xs font-bold uppercase text-slate-400 mb-2">Customer Details</p>
                                        <p className="font-bold">Priya Krishnan</p>
                                        <p className="text-sm text-slate-500">+91 98XXX XXX01</p>
                                        <p className="text-sm text-slate-500 mt-2">Whitefield Main Road, Apt 4B</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                                        <p className="text-xs font-bold uppercase text-slate-400 mb-2">Materials</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['Paper', 'Cardboard', 'Plastic Bottles'].map((m) => (
                                                <span key={m} className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">{m}</span>
                                            ))}
                                        </div>
                                        <p className="text-sm text-slate-500 mt-2 font-semibold">Estimated Weight: 12 kg</p>
                                    </div>
                                    <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                        <MapComponent height="100%" />
                                    </div>
                                </div>
                                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                                    <h3 className="font-bold text-lg mb-4">Complete Transaction</h3>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Measured Weight (kg)</label>
                                                <div className="relative">
                                                    <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-lg font-bold text-primary" placeholder="0.00" value={activeWeight} onChange={(e) => setActiveWeight(e.target.value)} />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">KG</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Amount Payable</label>
                                                <input className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg p-3 text-lg font-bold" disabled value={estAmount ? `₹ ${estAmount}` : '₹ --'} />
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">Rate Card Used</p>
                                            <div className="flex justify-between text-sm"><span>Paper / Cardboard</span><span className="font-bold">₹12.00 / kg</span></div>
                                            <div className="flex justify-between text-sm mt-2"><span>Plastic (Grade A)</span><span className="font-bold">₹18.00 / kg</span></div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={handleComplete} disabled={completing} className="flex-1 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:bg-emerald-600 transition-all disabled:opacity-60">
                                                {completing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined">receipt_long</span>}
                                                Generate Receipt & Confirm
                                            </button>
                                            <button className="px-6 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* =================== SCRAP BUY REQUESTS (from Recyclers) =================== */}
                    {activeTab === 'scrap-buy' && (
                        <section>
                            <div className="section-header">
                                <h2 className="text-2xl font-black flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">factory</span>
                                    Bulk Buy Requests (Recyclers)
                                </h2>
                                <p className="text-sm text-slate-500">Recycler companies looking to purchase bulk scrap</p>
                            </div>
                            <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Recycler / Material</th>
                                            <th className="px-6 py-4">Quantity Needed</th>
                                            <th className="px-6 py-4">Current Rate</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {DEMO_BULK.map((b) => (
                                            <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`size-10 rounded-lg flex items-center justify-center ${b.color}`}>
                                                            <span className="material-symbols-outlined">{b.icon}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold">{b.company}</p>
                                                            <p className="text-xs text-slate-500">{b.material}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold">{b.qty}</p>
                                                    <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                                        <div className="bg-primary h-full" style={{ width: `${b.fillPct}%` }} />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-primary font-black">{b.rate}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">Fulfill</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* =================== EARNINGS =================== */}
                    {activeTab === 'earnings' && (
                        <section className="space-y-6">
                            <div className="section-header">
                                <h2 className="text-2xl font-black flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">payments</span> Earnings Overview
                                </h2>
                            </div>
                            {/* Earnings Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Today's Earnings</p>
                                    <p className="text-3xl font-black text-primary">₹1,248</p>
                                    <p className="text-xs text-emerald-500 font-bold mt-1 flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-sm">trending_up</span> +18% vs yesterday
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">This Week</p>
                                    <p className="text-3xl font-black text-blue-600">₹8,450</p>
                                    <p className="text-xs text-emerald-500 font-bold mt-1 flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-sm">trending_up</span> +12% vs last week
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">This Month</p>
                                    <p className="text-3xl font-black text-purple-600">₹34,200</p>
                                    <p className="text-xs text-emerald-500 font-bold mt-1 flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-sm">trending_up</span> +8% vs last month
                                    </p>
                                </div>
                            </div>
                            {/* Earnings Table */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="font-bold text-lg">Transaction History</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase">
                                            <tr>
                                                <th className="px-6 py-3">Date</th>
                                                <th className="px-6 py-3">Customer</th>
                                                <th className="px-6 py-3">Material</th>
                                                <th className="px-6 py-3">Weight</th>
                                                <th className="px-6 py-3">Gross</th>
                                                <th className="px-6 py-3">Commission</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {DEMO_EARNINGS.map((e, i) => (
                                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <td className="px-6 py-4 font-medium">{e.date}</td>
                                                    <td className="px-6 py-4">{e.customer}</td>
                                                    <td className="px-6 py-4">{e.material}</td>
                                                    <td className="px-6 py-4 font-semibold">{e.weight}</td>
                                                    <td className="px-6 py-4 font-bold text-primary">{e.amount}</td>
                                                    <td className="px-6 py-4 text-slate-400">{e.commission}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* =================== RATINGS & STATS =================== */}
                    {activeTab === 'ratings' && (
                        <section className="space-y-6">
                            <div className="section-header">
                                <h2 className="text-2xl font-black flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">star_rate</span> Ratings & Stats
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Overall Rating */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Overall Rating</p>
                                    <p className="text-6xl font-black text-yellow-500 mb-2">4.8</p>
                                    <div className="flex items-center justify-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span key={star} className={`material-symbols-outlined text-2xl ${star <= 4 ? 'text-yellow-400' : 'text-yellow-300'}`}>star</span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-500">Based on 156 reviews</p>
                                </div>

                                {/* Rating Breakdown */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Rating Breakdown</p>
                                    {[
                                        { stars: 5, pct: 72, count: 112 },
                                        { stars: 4, pct: 18, count: 28 },
                                        { stars: 3, pct: 6, count: 9 },
                                        { stars: 2, pct: 3, count: 5 },
                                        { stars: 1, pct: 1, count: 2 },
                                    ].map((r) => (
                                        <div key={r.stars} className="flex items-center gap-3 mb-3">
                                            <span className="text-xs font-bold w-4 text-right">{r.stars}</span>
                                            <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${r.pct}%` }} />
                                            </div>
                                            <span className="text-xs text-slate-500 w-8">{r.count}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Performance Highlights */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Performance</p>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'On-Time Pickups', value: '96%', icon: 'schedule', color: 'text-emerald-500' },
                                            { label: 'Weight Accuracy', value: '98%', icon: 'scale', color: 'text-blue-500' },
                                            { label: 'Response Time', value: '12 min', icon: 'speed', color: 'text-purple-500' },
                                            { label: 'Completion Rate', value: '99%', icon: 'task_alt', color: 'text-amber-500' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`material-symbols-outlined text-sm ${item.color}`}>{item.icon}</span>
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                                                </div>
                                                <span className="font-black text-lg">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Reviews */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Reviews</p>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Anjali S.', rating: 5, comment: 'Very professional and punctual. Gave fair price for all materials.', date: '2 days ago' },
                                        { name: 'Rahul V.', rating: 5, comment: 'Quick response and handled the e-waste properly. Highly recommended!', date: '5 days ago' },
                                        { name: 'Priya K.', rating: 4, comment: 'Good service overall. Slightly late but communicated well.', date: '1 week ago' },
                                    ].map((review, i) => (
                                        <div key={i} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                                                {review.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-sm">{review.name}</p>
                                                        <div className="flex gap-0.5 mt-0.5">
                                                            {[...Array(5)].map((_, j) => (
                                                                <span key={j} className={`material-symbols-outlined text-xs ${j < review.rating ? 'text-yellow-400' : 'text-slate-300'}`}>star</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400">{review.date}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{review.comment}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}

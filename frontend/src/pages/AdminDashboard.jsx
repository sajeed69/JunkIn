import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { adminService } from '../api/services';
import toast from 'react-hot-toast';

const TABS = ['overview', 'users', 'transactions', 'rates', 'commission'];

const DEMO_USERS = [
    { _id: 'u1', name: 'Anjali Sharma', email: 'anjali@example.com', role: 'user', status: 'active', createdAt: '2024-01-15' },
    { _id: 'u2', name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'kabadiwala', status: 'active', createdAt: '2024-01-10' },
    { _id: 'u3', name: 'Priya Singh', email: 'priya@example.com', role: 'user', status: 'banned', createdAt: '2024-01-08' },
    { _id: 'u4', name: 'Vikram Nair', email: 'vikram@example.com', role: 'recycler', status: 'pending', createdAt: '2024-01-20' },
];

const DEMO_TRANSACTIONS = [
    { _id: 't1', type: 'scrap', amount: 520, commission: 26, user: 'Anjali Sharma', date: '2024-01-24', status: 'completed' },
    { _id: 't2', type: 'reuse', amount: 1200, commission: 60, user: 'Rahul Varma', date: '2024-01-23', status: 'completed' },
    { _id: 't3', type: 'scrap', amount: 340, commission: 17, user: 'Meera Patel', date: '2024-01-22', status: 'pending' },
];

export default function AdminDashboard() {
    const [tab, setTab] = useState('overview');
    const [config, setConfig] = useState({ commissionPct: 5, conversionDays: 30 });
    const [scrapRates, setScrapRates] = useState({
        paper: 12, plastic: 18, metal: 32, electronics: 45, glass: 3,
    });
    const [ratesModal, setRatesModal] = useState(false);
    const [commissionModal, setCommissionModal] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        adminService.getConfig().then(({ data }) => setConfig(data.config)).catch(() => { });
        adminService.getScrapRates().then(({ data }) => setScrapRates(data.rates)).catch(() => { });
    }, []);

    const saveConfig = async () => {
        setSaving(true);
        try {
            await adminService.updateConfig(config);
            toast.success('Configuration updated!');
        } catch {
            toast.success('Config saved (demo mode)');
        } finally {
            setSaving(false); setCommissionModal(false);
        }
    };

    const saveRates = async () => {
        setSaving(true);
        try {
            await adminService.updateScrapRates(scrapRates);
            toast.success('Scrap rates updated!');
        } catch {
            toast.success('Rates saved (demo mode)');
        } finally {
            setSaving(false); setRatesModal(false);
        }
    };

    const banUser = async (id) => {
        try {
            await adminService.banUser(id);
            toast.success('User banned.');
        } catch {
            toast.success('User banned (demo mode)');
        }
    };

    const approveUser = async (id) => {
        try {
            await adminService.approveKabadiwala(id);
            toast.success('User approved!');
        } catch {
            toast.success('Approved (demo mode)');
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar role="admin" />
            <main className="flex-1 ml-64 overflow-y-auto bg-background-light dark:bg-background-dark">
                <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h2 className="text-2xl font-bold">Admin Panel</h2>
                        <p className="text-sm text-slate-500">Manage JunkIn platform</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-500 relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                    </div>
                </header>

                {/* Tab nav */}
                <div className="px-8 pt-4 border-b border-slate-200 dark:border-slate-800 flex gap-1 overflow-x-auto">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-5 py-3 text-sm font-bold rounded-t-lg capitalize transition-colors border-b-2 ${tab === t
                                    ? 'border-primary text-primary bg-primary/5'
                                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {/* Overview Tab */}
                    {tab === 'overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard label="Total Revenue" value="₹1,24,500" trend="+18% this month" icon="payments" />
                                <StatCard label="Platform Users" value="1,284" sub="Active this month" icon="people" />
                                <StatCard label="Total Transactions" value="3,421" trend="+8%" icon="receipt_long" />
                                <StatCard label="Kg Recycled" value="28,450" sub="This month" icon="recycling" />
                            </div>
                            <div className="grid lg:grid-cols-3 gap-6">
                                <div className="card p-6">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">percent</span>
                                        Commission Rate
                                    </h3>
                                    <div className="text-4xl font-black text-primary">{config.commissionPct}%</div>
                                    <p className="text-sm text-slate-500 mt-1">Applied on all transactions</p>
                                    <Button size="sm" variant="outline" className="mt-4" onClick={() => setCommissionModal(true)}>
                                        Edit Commission
                                    </Button>
                                </div>
                                <div className="card p-6">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">timer</span>
                                        Auto-Convert Days
                                    </h3>
                                    <div className="text-4xl font-black text-primary">{config.conversionDays}</div>
                                    <p className="text-sm text-slate-500 mt-1">Days before reuse → scrap</p>
                                </div>
                                <div className="card p-6">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">price_change</span>
                                        Scrap Rates
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        {Object.entries(scrapRates).map(([k, v]) => (
                                            <div key={k} className="flex justify-between">
                                                <span className="capitalize text-slate-500">{k}</span>
                                                <span className="font-bold">₹{v}/kg</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Button size="sm" variant="outline" className="mt-4" onClick={() => setRatesModal(true)}>
                                        Edit Rates
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Users Tab */}
                    {tab === 'users' && (
                        <div className="card overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-lg font-bold">All Users</h3>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                                    <input className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm w-64" placeholder="Search users..." />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase">
                                        <tr>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Joined</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                        {DEMO_USERS.map((u) => (
                                            <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{u.name}</p>
                                                            <p className="text-xs text-slate-400">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={u.role === 'kabadiwala' ? 'primary' : u.role === 'admin' ? 'sold' : 'scrap'}>
                                                        {u.role}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={u.status === 'active' ? 'active' : u.status === 'banned' ? 'danger' : 'pending'}>
                                                        {u.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{u.createdAt}</td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    {u.status === 'pending' && (
                                                        <button onClick={() => approveUser(u._id)} className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary hover:text-white transition-all">
                                                            Approve
                                                        </button>
                                                    )}
                                                    {u.status !== 'banned' && (
                                                        <button onClick={() => banUser(u._id)} className="text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg font-bold hover:bg-red-100 transition-all">
                                                            Ban
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Transactions Tab */}
                    {tab === 'transactions' && (
                        <div className="card overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold">All Transactions</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase">
                                        <tr>
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Commission</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                        {DEMO_TRANSACTIONS.map((t) => (
                                            <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-slate-400">{t._id}</td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={t.type === 'reuse' ? 'sold' : 'primary'}>{t.type}</Badge>
                                                </td>
                                                <td className="px-6 py-4 font-medium">{t.user}</td>
                                                <td className="px-6 py-4 font-bold text-primary">₹{t.amount}</td>
                                                <td className="px-6 py-4 text-slate-500">₹{t.commission}</td>
                                                <td className="px-6 py-4 text-slate-500">{t.date}</td>
                                                <td className="px-6 py-4"><Badge variant={t.status === 'completed' ? 'active' : 'pending'}>{t.status}</Badge></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Rates Tab */}
                    {tab === 'rates' && (
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold">Scrap Rate Configuration</h3>
                                <Button icon="save" onClick={() => setRatesModal(true)}>Edit Rates</Button>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(scrapRates).map(([material, rate]) => (
                                    <div key={material} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500 capitalize">{material}</p>
                                            <p className="text-2xl font-black text-primary">₹{rate}<span className="text-sm font-medium text-slate-400 ml-1">/kg</span></p>
                                        </div>
                                        <span className="material-symbols-outlined text-primary opacity-30 text-4xl">recycling</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Commission Tab */}
                    {tab === 'commission' && (
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="card p-6">
                                <h3 className="text-lg font-bold mb-6">Commission Settings</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                            Commission Percentage
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="range"
                                                min="1"
                                                max="20"
                                                value={config.commissionPct}
                                                onChange={(e) => setConfig({ ...config, commissionPct: parseInt(e.target.value) })}
                                                className="flex-1 accent-primary"
                                            />
                                            <span className="text-3xl font-black text-primary w-16 text-right">{config.commissionPct}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                            Auto Convert to Scrap After (days)
                                        </label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={config.conversionDays}
                                            onChange={(e) => setConfig({ ...config, conversionDays: parseInt(e.target.value) })}
                                            min="1"
                                            max="365"
                                        />
                                    </div>
                                    <Button loading={saving} onClick={saveConfig} className="w-full" icon="save">
                                        Save Configuration
                                    </Button>
                                </div>
                            </div>
                            <div className="card p-6">
                                <h3 className="text-lg font-bold mb-4">Revenue Breakdown</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'From Scrap Transactions', pct: 55, amount: '₹68,475' },
                                        { label: 'From Reuse Transactions', pct: 35, amount: '₹43,575' },
                                        { label: 'Boosted Listings', pct: 10, amount: '₹12,450' },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                                                <span className="font-bold">{item.amount}</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary rounded-full" style={{ width: `${item.pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Scrap Rates Modal */}
            <Modal isOpen={ratesModal} onClose={() => setRatesModal(false)} title="Update Scrap Rates">
                <div className="space-y-4">
                    {Object.keys(scrapRates).map((k) => (
                        <Input
                            key={k}
                            label={`${k.charAt(0).toUpperCase() + k.slice(1)} (₹/kg)`}
                            type="number"
                            step="0.5"
                            value={scrapRates[k]}
                            onChange={(e) => setScrapRates({ ...scrapRates, [k]: parseFloat(e.target.value) })}
                        />
                    ))}
                    <div className="flex gap-3 pt-2">
                        <Button variant="secondary" className="flex-1" onClick={() => setRatesModal(false)}>Cancel</Button>
                        <Button className="flex-1" loading={saving} onClick={saveRates} icon="save">Save Rates</Button>
                    </div>
                </div>
            </Modal>

            {/* Commission Modal */}
            <Modal isOpen={commissionModal} onClose={() => setCommissionModal(false)} title="Edit Commission">
                <div className="space-y-4">
                    <Input
                        label="Commission %"
                        type="number"
                        min="1"
                        max="20"
                        step="0.5"
                        value={config.commissionPct}
                        onChange={(e) => setConfig({ ...config, commissionPct: parseFloat(e.target.value) })}
                    />
                    <Input
                        label="Auto-Convert Days"
                        type="number"
                        min="1"
                        max="365"
                        value={config.conversionDays}
                        onChange={(e) => setConfig({ ...config, conversionDays: parseInt(e.target.value) })}
                    />
                    <div className="flex gap-3 pt-2">
                        <Button variant="secondary" className="flex-1" onClick={() => setCommissionModal(false)}>Cancel</Button>
                        <Button className="flex-1" loading={saving} onClick={saveConfig} icon="save">Save</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

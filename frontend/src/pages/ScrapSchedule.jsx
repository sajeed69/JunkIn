import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { scrapService } from '../api/services';
import toast from 'react-hot-toast';

const TIME_SLOTS = ['09:00 AM – 11:00 AM', '11:00 AM – 01:00 PM', '02:00 PM – 04:00 PM', '04:00 PM – 06:00 PM'];
const SCRAP_TYPES = [
    { value: 'paper', label: 'Paper / Cardboard', icon: 'newspaper', rate: '₹12/kg' },
    { value: 'plastic', label: 'Plastic (Grade A)', icon: 'water_drop', rate: '₹18/kg' },
    { value: 'metal', label: 'Mixed Metals', icon: 'construction', rate: '₹32/kg' },
    { value: 'electronics', label: 'E-Waste', icon: 'devices', rate: '₹45/kg' },
    { value: 'glass', label: 'Glass', icon: 'liquor', rate: '₹3/kg' },
];

export default function ScrapSchedule() {
    const navigate = useNavigate();
    const location = useLocation();
    const listing = location.state?.listing;

    const today = new Date().toISOString().split('T')[0];
    const [form, setForm] = useState({
        date: '',
        timeSlot: '',
        scrapType: listing?.category || '',
        estimatedWeight: listing?.estimatedWeight || '',
        address: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.date || !form.timeSlot || !form.address) {
            toast.error('Please fill all required fields.');
            return;
        }
        setLoading(true);
        try {
            await scrapService.schedule({ ...form, listingId: listing?._id });
            toast.success('Pickup scheduled successfully! A kabadiwala will be assigned shortly.');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to schedule pickup.');
        } finally {
            setLoading(false);
        }
    };

    const selectedType = SCRAP_TYPES.find((s) => s.value === form.scrapType);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar role="user" />
            <main className="flex-1 ml-64 overflow-y-auto bg-background-light dark:bg-background-dark">
                <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-8 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold">Schedule Scrap Pickup</h2>
                        <p className="text-sm text-slate-500">Choose a time and a kabadiwala will come to you</p>
                    </div>
                </header>

                <div className="p-8 max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Left column */}
                            <div className="space-y-6">
                                {/* Scrap Type */}
                                <div className="card p-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">category</span>
                                        Scrap Type
                                    </h3>
                                    <div className="space-y-2">
                                        {SCRAP_TYPES.map((t) => (
                                            <label
                                                key={t.value}
                                                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${form.scrapType === t.value
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary/40'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input type="radio" name="scrapType" value={t.value} checked={form.scrapType === t.value}
                                                        onChange={(e) => setForm({ ...form, scrapType: e.target.value })} className="hidden" />
                                                    <span className="material-symbols-outlined text-primary">{t.icon}</span>
                                                    <span className="text-sm font-semibold">{t.label}</span>
                                                </div>
                                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                    {t.rate}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Weight estimate */}
                                <div className="card p-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">scale</span>
                                        Estimated Weight
                                    </h3>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 15"
                                        step="0.5"
                                        icon="scale"
                                        value={form.estimatedWeight}
                                        onChange={(e) => setForm({ ...form, estimatedWeight: e.target.value })}
                                    />
                                    {selectedType && form.estimatedWeight && (
                                        <div className="mt-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
                                            <p className="text-sm">Estimated earnings:</p>
                                            <p className="text-2xl font-black text-primary">
                                                ₹{(parseFloat(form.estimatedWeight) * parseInt(selectedType.rate)).toLocaleString() || '--'}
                                            </p>
                                            <p className="text-xs text-slate-500">After 5% platform commission</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right column */}
                            <div className="space-y-6">
                                {/* Date & Time */}
                                <div className="card p-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">calendar_month</span>
                                        Select Date
                                    </h3>
                                    <Input
                                        label="Pickup Date"
                                        type="date"
                                        min={today}
                                        value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="card p-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">schedule</span>
                                        Select Time Slot
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {TIME_SLOTS.map((slot) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => setForm({ ...form, timeSlot: slot })}
                                                className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all ${form.timeSlot === slot
                                                        ? 'border-primary bg-primary text-white'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                                    }`}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="card p-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">location_on</span>
                                        Pickup Address
                                    </h3>
                                    <div className="space-y-3">
                                        <Input
                                            placeholder="House/Flat No., Street, Locality"
                                            icon="home"
                                            value={form.address}
                                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                                            required
                                        />
                                        <textarea
                                            className="input-field min-h-[80px] resize-none"
                                            placeholder="Additional notes for kabadiwala (e.g. call before coming)..."
                                            value={form.notes}
                                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        {form.date && form.timeSlot && (
                            <div className="card p-6 bg-primary/5 border-primary/20">
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">check_circle</span>
                                    Pickup Summary
                                </h3>
                                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                                    <div><p className="text-slate-500">Date</p><p className="font-bold">{form.date}</p></div>
                                    <div><p className="text-slate-500">Time Slot</p><p className="font-bold">{form.timeSlot}</p></div>
                                    <div><p className="text-slate-500">Material</p><p className="font-bold">{selectedType?.label || '—'}</p></div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" loading={loading} icon="local_shipping">
                                Confirm Pickup
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

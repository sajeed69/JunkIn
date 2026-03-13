import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import Sidebar from '../components/layout/Sidebar';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { listingService } from '../api/services';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Appliances', 'Metals', 'Plastics', 'Paper', 'Glass', 'Other'];
const CONDITIONS = ['New', 'Good', 'Moderate', 'Poor', 'Scrap'];

export default function CreateListing() {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [form, setForm] = useState({ title: '', category: '', description: '', condition: 'Good', estimatedWeight: '', brand: '', age: '' });
    const [loading, setLoading] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles((prev) => [...prev, ...acceptedFiles.map((f) => Object.assign(f, { preview: URL.createObjectURL(f) }))].slice(0, 5));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxSize: 5 * 1024 * 1024,
    });

    const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0) { toast.error('Please add at least one image.'); return; }
        setLoading(true);
        try {
            const fd = new FormData();
            files.forEach((f) => fd.append('images', f));
            Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
            const { data } = await listingService.create(fd);
            toast.success('Listing created! Analyzing with AI...');
            navigate('/ai-analysis', { state: { listing: data.listing } });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create listing.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar role="user" />
            <main className="flex-1 ml-64 overflow-y-auto bg-background-light dark:bg-background-dark">
                <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-8 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold">List an Item</h2>
                        <p className="text-sm text-slate-500">Our AI will suggest Reuse or Scrap mode for you</p>
                    </div>
                </header>

                <div className="p-8 max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Image Upload */}
                        <div className="card p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">photo_camera</span>
                                Item Photos
                            </h3>
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragActive
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <span className="material-symbols-outlined text-5xl text-primary/40 mb-3 block">cloud_upload</span>
                                <p className="font-bold text-lg mb-1">
                                    {isDragActive ? 'Drop images here' : 'Drag & drop or click to upload'}
                                </p>
                                <p className="text-sm text-slate-500">PNG, JPG up to 5MB each — max 5 images</p>
                            </div>

                            {files.length > 0 && (
                                <div className="flex gap-3 mt-4 flex-wrap">
                                    {files.map((f, i) => (
                                        <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-primary/30">
                                            <img src={f.preview} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(i)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Item Details */}
                        <div className="card p-6 space-y-5">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">inventory_2</span>
                                Item Details
                            </h3>
                            <Input
                                label="Item Title"
                                placeholder="e.g. Vintage Trek Bicycle, 26-inch"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Category
                                    </label>
                                    <select
                                        className="input-field"
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Condition
                                    </label>
                                    <select
                                        className="input-field"
                                        value={form.condition}
                                        onChange={(e) => setForm({ ...form, condition: e.target.value })}
                                    >
                                        {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Brand / Manufacturer"
                                    placeholder="e.g. Trek, Samsung, IKEA"
                                    value={form.brand}
                                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                />
                                <Input
                                    label="Age (Years)"
                                    type="number"
                                    placeholder="e.g. 2"
                                    value={form.age}
                                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    className="input-field min-h-[120px] resize-none"
                                    placeholder="Describe the item — brand, age, defects, any accessories included..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    required
                                />
                            </div>
                            <Input
                                label="Estimated Weight (kg) — optional"
                                type="number"
                                placeholder="e.g. 5.5"
                                step="0.1"
                                icon="scale"
                                value={form.estimatedWeight}
                                onChange={(e) => setForm({ ...form, estimatedWeight: e.target.value })}
                            />
                        </div>

                        {/* AI Analysis note */}
                        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                            <span className="material-symbols-outlined text-primary mt-0.5">auto_awesome</span>
                            <div>
                                <p className="font-bold text-sm">AI Analysis Included</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    After submitting, our AI will analyze your item and provide resale and scrap value estimates, then suggest the best mode.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" loading={loading} icon="auto_awesome">
                                Analyze with AI
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

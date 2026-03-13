import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const avatars = [
    'https://i.pravatar.cc/40?img=1',
    'https://i.pravatar.cc/40?img=2',
    'https://i.pravatar.cc/40?img=3',
];

const stats = [
    { value: '500k+', label: 'Kg Recycled', color: 'text-primary' },
    { value: '125k', label: 'Items Reused', color: 'text-secondary' },
    { value: '2.4k', label: 'Tons CO₂ Saved', color: 'text-primary' },
];

const howItWorks = [
    {
        icon: 'cloud_upload',
        title: '1. Upload',
        desc: 'Take a photo and let our AI categorize your items instantly.',
        color: 'bg-primary/10 text-primary',
    },
    {
        icon: 'rule',
        title: '2. Choose Reuse or Scrap',
        desc: 'Sell usable items to neighbors or schedule a professional pickup for scrap material.',
        color: 'bg-secondary/10 text-secondary',
    },
    {
        icon: 'payments',
        title: '3. Earn Money',
        desc: 'Get paid for your sales and earn credits or cash for your recyclable scrap.',
        color: 'bg-primary/10 text-primary',
    },
];

const whyChoose = [
    {
        icon: 'auto_awesome',
        title: 'AI Suggestions',
        desc: 'Our smart engine suggests whether to sell or scrap based on market demand and condition.',
    },
    {
        icon: 'price_check',
        title: 'Transparent Scrap Pricing',
        desc: 'Get real-time rates for metals, electronics, and plastics before you even book a pickup.',
    },
    {
        icon: 'monitoring',
        title: 'Impact Tracking',
        desc: "See exactly how much CO₂ you've saved and the weight of materials diverted from landfills.",
    },
];

export default function Landing() {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            <Navbar />
            <main className="flex-1">
                {/* Hero */}
                <section className="relative px-6 pt-16 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
                    {/* Background orbs */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 blur-[120px] pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full animate-pulse-slow" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full animate-pulse-slow" />
                    </div>

                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                        <div className="flex flex-col gap-8 text-left">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider w-fit">
                                <span className="material-symbols-outlined text-sm">eco</span>
                                Join the Circular Economy
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                                Reuse First. <br />
                                Recycle{' '}
                                <span className="gradient-text">Smart.</span>
                            </h1>

                            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                                The hybrid circular economy platform that helps you sell items to neighbors or
                                book professional scrap pickups for recycling. Maximize value, minimize waste.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link to="/create-listing">
                                    <button className="bg-primary text-slate-900 px-8 py-4 rounded-xl font-extrabold text-lg shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all flex items-center gap-2 group">
                                        Sell an Item
                                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                                            sell
                                        </span>
                                    </button>
                                </Link>
                                <Link to="/scrap-schedule">
                                    <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined">recycling</span>
                                        Book Scrap Pickup
                                    </button>
                                </Link>
                            </div>

                            {/* Social proof */}
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex -space-x-3">
                                    {avatars.map((src, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-200">
                                            <img src={src} alt="user" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <span>Joined by 12,000+ local swappers</span>
                            </div>
                        </div>

                        {/* Hero image */}
                        <div className="relative">
                            <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 aspect-square">
                                <img src="/images/hero-image.png" alt="Person packing items for reuse and recycling" className="w-full h-full object-cover" />
                            </div>
                            {/* Floating card */}
                            <div className="absolute -top-6 -right-6 z-20 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl flex items-center gap-4 animate-bounce">
                                <div className="w-12 h-12 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                                    <span className="material-symbols-outlined">local_shipping</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400">Recent Swap</p>
                                    <p className="text-sm font-bold">Vintage Camera → Plant</p>
                                </div>
                            </div>
                            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-br from-primary to-secondary rounded-full -z-10 blur-3xl opacity-20" />
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section id="how-it-works" className="py-24 px-6 bg-white dark:bg-slate-900/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center flex flex-col items-center gap-4 mb-16">
                            <h2 className="text-3xl lg:text-5xl font-black tracking-tight">How It Works</h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
                                Turning your unwanted items into value in three simple steps.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {howItWorks.map((item, i) => (
                                <div
                                    key={i}
                                    className="group bg-background-light dark:bg-background-dark p-8 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all hover:shadow-lg"
                                >
                                    <div className={`w-16 h-16 rounded-xl ${item.color} flex items-center justify-center mb-6`}>
                                        <span className="material-symbols-outlined text-4xl">{item.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose */}
                <section className="py-24 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="lg:w-1/2">
                                <h2 className="text-3xl lg:text-5xl font-black mb-8 leading-tight">
                                    Why Choose JunkIn?
                                </h2>
                                <div className="space-y-8">
                                    {whyChoose.map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                <span className="material-symbols-outlined">{item.icon}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-xl mb-1">{item.title}</h4>
                                                <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:w-1/2">
                                <div className="rounded-2xl overflow-hidden aspect-video">
                                    <img src="/images/demo-scrap.png" alt="Recyclable materials sorted for recycling" className="w-full h-full object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Banner */}
                <section className="py-16 px-6 bg-slate-900 text-white">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {stats.map((s, i) => (
                            <div key={i}>
                                <div className={`text-4xl lg:text-6xl font-black mb-2 ${s.color}`}>{s.value}</div>
                                <p className="text-slate-400 uppercase tracking-widest text-sm font-bold">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 px-6 overflow-hidden">
                    <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 lg:p-16 relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                            <div className="text-center lg:text-left">
                                <h2 className="text-3xl lg:text-4xl font-black mb-4">Ready to clear the clutter?</h2>
                                <p className="text-lg text-slate-600 dark:text-slate-400">
                                    Join the movement and start your first swap today.
                                </p>
                            </div>
                            <Link to="/register">
                                <button className="bg-primary text-slate-900 px-10 py-4 rounded-xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-105 transition-all whitespace-nowrap">
                                    Start Earning with JunkIn
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
                            <span className="material-symbols-outlined text-lg">recycling</span>
                        </div>
                        <span className="text-xl font-black tracking-tight">JunkIn</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 text-sm font-semibold text-slate-500">
                        {['Privacy Policy', 'Terms of Service', 'Contact', 'Blog'].map((l) => (
                            <a key={l} href="#" className="hover:text-primary transition-colors">{l}</a>
                        ))}
                    </div>
                    <div className="flex gap-4">
                        {['share', 'language', 'feed'].map((icon) => (
                            <a
                                key={icon}
                                href="#"
                                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all"
                            >
                                <span className="material-symbols-outlined text-xl">{icon}</span>
                            </a>
                        ))}
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 text-center text-slate-400 text-xs">
                    © 2024 JunkIn. Made with love for the planet.
                </div>
            </footer>
        </div>
    );
}

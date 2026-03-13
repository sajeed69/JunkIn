import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function RequestlyApiClient() {
    const navigate = useNavigate();
    const [selectedRoute, setSelectedRoute] = useState('/api/scrap-prices');
    const [jsonContent, setJsonContent] = useState('');
    const [isIntercepting, setIsIntercepting] = useState(false);
    const [activeTab, setActiveTab] = useState('editor');

    const ROUTES = [
        { path: '/api/scrap-prices', label: 'Scrap Prices', icon: 'payments' },
        { path: '/api/resale-demand', label: 'Resale Demand', icon: 'trending_up' },
        { path: '/api/collector-availability', label: 'Collector Availability', icon: 'group' }
    ];

    const SCENARIOS = [
        {
            name: 'Scrap Price Surge',
            route: '/api/scrap-prices',
            data: { plastic: 45, iron: 85, copper: 1200, electronics: 150 }
        },
        {
            name: 'Demand Crash',
            route: '/api/resale-demand',
            data: { electronics: 0.25, furniture: 0.15, bicycle: 0.30 }
        },
        {
            name: 'Peak Operations',
            route: '/api/collector-availability',
            data: { available_collectors: 2, avg_pickup_time: '24 hours', peak_hours: true }
        }
    ];

    useEffect(() => {
        // Load default values for selected route
        const defaults = {
            '/api/scrap-prices': { plastic: 18, iron: 32, copper: 680, electronics: 50 },
            '/api/resale-demand': { electronics: 0.82, furniture: 0.65, bicycle: 0.75 },
            '/api/collector-availability': { available_collectors: 12, avg_pickup_time: '2 hours', peak_hours: false }
        };
        setJsonContent(JSON.stringify(defaults[selectedRoute], null, 2));
    }, [selectedRoute]);

    const handleApplyScenario = (scenario) => {
        setSelectedRoute(scenario.route);
        setJsonContent(JSON.stringify(scenario.data, null, 2));
        setIsIntercepting(true);
        toast.success(`Scenario "${scenario.name}" applied!`);
        
        // In a real app, this would update a global state or a mock server
        localStorage.setItem(`rq_mock_${scenario.route}`, JSON.stringify(scenario.data));
    };

    const handleSave = () => {
        try {
            JSON.parse(jsonContent);
            setIsIntercepting(true);
            localStorage.setItem(`rq_mock_${selectedRoute}`, jsonContent);
            toast.success('Response Mock Saved!');
        } catch (e) {
            toast.error('Invalid JSON format');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-mono text-sm selection:bg-primary/30">
            {/* Top Navigation */}
            <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded shadow-lg shadow-primary/20 flex items-center justify-center text-white ring-1 ring-white/20">
                            <span className="material-symbols-outlined text-sm">terminal</span>
                        </div>
                        <h1 className="text-lg font-black tracking-tighter text-white uppercase">
                            Requestly <span className="text-primary italic">API Client</span>
                        </h1>
                    </div>
                    <div className="h-6 w-px bg-slate-800 mx-2" />
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 text-[10px] font-bold tracking-widest uppercase">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Connected
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => navigate('/ai-analysis')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                    >
                        Return to App
                    </Button>
                </div>
            </nav>

            <div className="flex h-[calc(100vh-57px)]">
                {/* Left Sidebar: Endpoints */}
                <aside className="w-64 border-r border-slate-800 bg-slate-900/30 overflow-y-auto">
                    <div className="p-4 border-b border-slate-800">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Simulation Endpoints</h3>
                        <div className="space-y-1">
                            {ROUTES.map(route => (
                                <button
                                    key={route.path}
                                    onClick={() => setSelectedRoute(route.path)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${selectedRoute === route.path ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-slate-800 text-slate-400 border border-transparent'}`}
                                >
                                    <span className={`material-symbols-outlined text-sm ${selectedRoute === route.path ? 'text-primary' : 'text-slate-600 group-hover:text-slate-400'}`}>
                                        {route.icon}
                                    </span>
                                    <span className="truncate font-bold tracking-tight">{route.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-4">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Global Network Logic</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between group cursor-pointer">
                                <span className="text-xs text-slate-400 font-bold group-hover:text-white transition-colors">Interception Engine</span>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${isIntercepting ? 'bg-primary' : 'bg-slate-700'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isIntercepting ? 'left-4.5' : 'left-0.5'}`} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between group cursor-pointer opacity-50">
                                <span className="text-xs text-slate-400 font-bold">Network Delay (ms)</span>
                                <span className="text-xs font-black text-primary">0</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content: Editor */}
                <main className="flex-1 flex flex-col bg-slate-950">
                    {/* URL Bar */}
                    <div className="px-6 py-4 bg-slate-900/20 border-b border-slate-800 flex items-center gap-3">
                        <div className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">GET</div>
                        <div className="flex-1 font-bold text-slate-400 break-all select-all py-1 px-3 bg-slate-900 rounded border border-slate-800/50">
                            http://localhost:5000<span className="text-white">{selectedRoute}</span>
                        </div>
                        <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={handleSave}
                            className="bg-primary hover:bg-emerald-600 shadow-lg shadow-primary/20"
                        >
                            Save & Intercept
                        </Button>
                    </div>

                    {/* Editor Tabs */}
                    <div className="flex border-b border-slate-800">
                        {['Response Editor', 'Simulation Scenarios', 'Network Headers'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase().split(' ')[0])}
                                className={`px-6 py-3 text-xs font-bold transition-all border-b-2 ${activeTab === tab.toLowerCase().split(' ')[0] ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-hidden flex">
                        <div className={`flex-1 flex flex-col ${activeTab === 'response' ? 'block' : 'hidden md:flex'}`}>
                            {activeTab === 'response' ? (
                                <div className="flex-1 relative flex flex-col">
                                    <div className="flex items-center justify-between px-6 py-2 bg-slate-900/30 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                                        <span>JSON Response Body</span>
                                        <span className="text-primary italic">MOCK ACTIVE</span>
                                    </div>
                                    <textarea
                                        value={jsonContent}
                                        onChange={(e) => setJsonContent(e.target.value)}
                                        className="flex-1 bg-slate-950 p-6 focus:outline-none resize-none font-mono text-emerald-400 border-none leading-relaxed"
                                        spellCheck="false"
                                    />
                                </div>
                            ) : activeTab === 'simulation' ? (
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                                    {SCENARIOS.map(s => (
                                        <div 
                                            key={s.name}
                                            onClick={() => handleApplyScenario(s)}
                                            className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-primary/5"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="bg-primary/10 text-primary p-2 rounded-xl group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined">{s.route.includes('scrap') ? 'recycling' : 'trending_up'}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase">Preset Scenario</span>
                                            </div>
                                            <h4 className="text-lg font-black text-white mb-2">{s.name}</h4>
                                            <p className="text-xs text-slate-500 mb-6 leading-relaxed">Automatically modifies {s.route} to simulate market shifts.</p>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-primary group-hover:gap-3 transition-all">
                                                <span>APPLY SIMULATION</span>
                                                <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center p-12 text-center">
                                    <div className="max-w-xs">
                                        <span className="material-symbols-outlined text-4xl text-slate-800 mb-4">settings_input_component</span>
                                        <h4 className="font-bold text-slate-500 mb-2 tracking-tight">Advanced Proxy Settings</h4>
                                        <p className="text-xs text-slate-600 leading-relaxed italic">System headers, authentication simulation, and payload transformation settings are currently locked for the demo.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Panel: Presets Overlay for Editor */}
                        {activeTab === 'response' && (
                            <div className="w-80 border-l border-slate-800 bg-slate-900/20 p-6 hidden lg:block overflow-y-auto">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Simulation Presets</h3>
                                <div className="space-y-4">
                                    {SCENARIOS.filter(s => s.route === selectedRoute).map(s => (
                                        <button 
                                            key={s.name}
                                            onClick={() => handleApplyScenario(s)}
                                            className="w-full text-left p-4 rounded-xl border border-slate-800 hover:border-primary/40 transition-all group bg-slate-900/40"
                                        >
                                            <div className="text-xs font-black text-white mb-1 group-hover:text-primary transition-colors">{s.name}</div>
                                            <div className="text-[10px] text-slate-500 italic">One-click data fill</div>
                                        </button>
                                    ))}
                                    <div className="p-4 rounded-xl border border-dashed border-slate-800 mt-8">
                                        <p className="text-[10px] text-slate-600 italic leading-relaxed">
                                            Pro-Tip: You can manually edit the JSON on the left to create hyper-specific edge cases for your demo.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Status */}
                    <footer className="px-6 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-600">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> HTTP/2</span>
                            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> TLS 1.3</span>
                            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> JSON EDITOR v2.4</span>
                        </div>
                        <div className="uppercase tracking-widest text-slate-700">Powered by REQUESTLY v5.24.1</div>
                    </footer>
                </main>
            </div>
        </div>
    );
}

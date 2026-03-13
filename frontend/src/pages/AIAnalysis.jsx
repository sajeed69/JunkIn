import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { aiService } from '../api/services';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';

export default function AIAnalysis() {
    const location = useLocation();
    const navigate = useNavigate();
    const listing = location.state?.listing;

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scrapPrices, setScrapPrices] = useState(null);

    const fetchScrapPrices = async () => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        try {
            // Check for Requestly Client Mock
            const mockPrices = localStorage.getItem('rq_mock_/api/scrap-prices');
            if (mockPrices) {
                const data = JSON.parse(mockPrices);
                setScrapPrices(data);
                console.log('%c[REQUESTLY CLIENT] Intercepted /api/scrap-prices', 'color: #2ecc70; font-weight: bold');
                return;
            }

            const response = await fetch(`${baseUrl}/api/scrap-prices`);
            const data = await response.json();
            setScrapPrices(data);
            console.log(`[LOG] Market Prices Updated: Plastic: ₹${data.plastic}, Iron: ₹${data.iron}, Copper: ₹${data.copper}, Electronics: ₹${data.electronics}`);
        } catch (error) {
            console.error('Failed to fetch scrap prices:', error);
        }
    };

    // Reactive recommendation update for Requestly demo
    useEffect(() => {
        if (result && scrapPrices) {
            const material = result.material_type || 'iron';
            const price = scrapPrices[material] || 0;
            const weight = 5; // assume 5kg for demo
            const scrapVal = weight * price;
            const avgResale = (result.resale_estimate.min + result.resale_estimate.max) / 2;
            const threshold = 0.6;
            const newRec = scrapVal > (avgResale * threshold) ? 'scrap' : 'reuse';

            if (newRec !== result.recommended_mode) {
                console.log(`%c[REQUESTLY DEMO] Recommendation Change!`, 'color: #10b981; font-weight: bold; font-size: 14px');
                console.log(`Item: ${result.identified_item}`);
                console.log(`Material: ${material}`);
                console.log(`New Market Price: ₹${price}/kg`);
                console.log(`Scrap Value (₹${scrapVal}) vs Resale (Avg ₹${avgResale})`);
                console.log(`New Recommendation: ${newRec.toUpperCase()}`);
                
                setResult(prev => ({
                    ...prev,
                    recommended_mode: newRec,
                    scrap_estimate: scrapVal,
                    reasoning: newRec === 'scrap'
                        ? `🚀 Market spike detected! Material "${material}" is currently priced at ₹${price}/kg. Your scrap value (₹${scrapVal}) is now highly competitive compared to resale value. We recommend Scrapping.`
                        : `Resale value remains higher than the current scrap value (₹${scrapVal}). We recommend Listing for Resale.`
                }));
            }
        }
    }, [scrapPrices, result]);

    useEffect(() => {
        fetchScrapPrices();
        if (!listing) {
            // Demo mode for testing/intro
            setTimeout(() => {
                setResult({
                    resale_estimate: { min: 2400, max: 3800 },
                    scrap_estimate: 850,
                    recommended_mode: 'reuse',
                    resale_probability: 85,
                    confidence: 98,
                    identified_item: 'Vintage Trek MultiTrack Bicycle',
                    reasoning: 'Our vision model identified this as a Vintage Trek MultiTrack. Based on local market trends, similar items sell within 48 hours. We highly recommend listing for Resale.',
                    material_type: 'Other',
                });
                setLoading(false);
            }, 2000);
            return;
        }

        // 1. Use existing analysis if available from listing creation
        if (listing.aiAnalysis) {
            console.log('[LOG] Using existing AI analysis from listing');
            const ai = listing.aiAnalysis;
            setResult({
                resale_estimate: {
                    min: ai.resale_estimate?.min || 500,
                    max: ai.resale_estimate?.max || 2000,
                },
                scrap_estimate: ai.scrap_estimate || 0,
                recycle_value: ai.recycle_value || (ai.scrap_estimate || 0) * 1.2,
                recommended_mode: ai.recommended_mode || 'reuse',
                resale_probability: ai.resale_probability || 70,
                confidence: ai.confidence || 50,
                identified_item: ai.identified_item || listing.title,
                reasoning: ai.reasoning || '',
                material_type: ai.material_type || 'Other',
                co2_saving_est: ai.co2_saving_est || 0,
                market_demand: ai.market_demand || 'Moderate',
                environmental_impact: ai.environmental_impact || '',
                source: ai.source || 'unknown',
            });
            setLoading(false);
            return;
        }

        // 2. Fetch fresh analysis with full metadata
        (async () => {
            try {
                const { data } = await aiService.analyze({
                    title: listing.title,
                    category: listing.category,
                    condition: listing.condition,
                    brand: listing.brand,
                    age: listing.age,
                    description: listing.description,
                    estimated_weight: listing.estimatedWeight
                });
                setResult(data.data);
            } catch (err) {
                console.error('AI Refresh failed:', err);
                toast.error('Failed to get real-time AI valuation.');
            } finally {
                setLoading(false);
            }
        })();
    }, [listing]);

    const [simMode, setSimMode] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [marketData, setMarketData] = useState({ resaleDemand: null, collectors: null });
    const [futureResult, setFutureResult] = useState(null);

    const SCENARIOS = [
        { id: 'demand_drop', label: 'Future Resale Demand Drop', icon: 'trending_down', color: 'text-red-500' },
        { id: 'price_surge', label: 'Scrap Market Price Surge', icon: 'trending_up', color: 'text-emerald-500' },
        { id: 'collector_load', label: 'High Collector Demand', icon: 'group', color: 'text-blue-500' }
    ];

    const fetchMarketData = async () => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        try {
            // Check for Requestly Client Mocks
            const mockDemand = localStorage.getItem('rq_mock_/api/resale-demand');
            const mockCollectors = localStorage.getItem('rq_mock_/api/collector-availability');

            let demand, collectors;

            if (mockDemand) {
                demand = JSON.parse(mockDemand);
                console.log('%c[REQUESTLY CLIENT] Intercepted /api/resale-demand', 'color: #2ecc70; font-weight: bold');
            } else {
                const demandRes = await fetch(`${baseUrl}/api/resale-demand`);
                demand = await demandRes.json();
            }

            if (mockCollectors) {
                collectors = JSON.parse(mockCollectors);
                console.log('%c[REQUESTLY CLIENT] Intercepted /api/collector-availability', 'color: #2ecc70; font-weight: bold');
            } else {
                const collectorRes = await fetch(`${baseUrl}/api/collector-availability`);
                collectors = await collectorRes.json();
            }

            setMarketData({ resaleDemand: demand, collectors });
        } catch (error) {
            console.error('Failed to fetch market data:', error);
        }
    };

    const runSimulation = (scenarioId) => {
        if (!result || !scrapPrices || !marketData.resaleDemand) return;
        
        setSelectedScenario(scenarioId);
        const material = result.material_type || 'iron';
        const category = 'electronics'; // simplified for demo
        
        let modScrapPrice = scrapPrices[material] || 0;
        let modResaleDemand = marketData.resaleDemand[category] || 0.8;
        
        // Scenario logic
        if (scenarioId === 'demand_drop') {
            modResaleDemand = 0.35; // Significant drop
        } else if (scenarioId === 'price_surge') {
            modScrapPrice = modScrapPrice * 2.5; // Price spike
        } else if (scenarioId === 'collector_load') {
            // Affects logic but maybe not price directly in this demo
        }

        const weight = 5;
        const futureScrapVal = weight * modScrapPrice;
        const avgResale = (result.resale_estimate.min + result.resale_estimate.max) / 2;
        const futureResaleVal = avgResale * (modResaleDemand / 0.82); // scale by demand
        
        const futureRec = futureScrapVal > futureResaleVal ? 'scrap' : 'reuse';

        const simResult = {
            resaleValue: Math.round(futureResaleVal),
            scrapValue: Math.round(futureScrapVal),
            recommendation: futureRec,
            scenario: scenarioId
        };

        setFutureResult(simResult);

        // Logging as requested
        console.log(`%c[FUTURE VALUE SIMULATOR] ${scenarioId.toUpperCase()} ACTIVATED`, 'background: #3b82f6; color: white; padding: 2px 5px; border-radius: 3px');
        console.log('Original AI Prediction:', result.recommended_mode);
        console.log('Modified Values:', { modScrapPrice, modResaleDemand });
        console.log('Recalculated Recommendation:', futureRec.toUpperCase());
        console.log('Simulated Financials:', { futureResaleVal, futureScrapVal });
    };

    useEffect(() => {
        if (result) {
            fetchMarketData();
        }
    }, [result]);

    const handleMode = (mode) => {
        if (mode === 'reuse') {
            toast.success('Item listed for resale!');
            navigate('/dashboard');
        } else {
            navigate('/scrap-schedule', { state: { listing } });
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-primary/10 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md px-6 md:px-20 py-4 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-lg text-white">
                        <span className="material-symbols-outlined">recycling</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">
                        JunkIn <span className="text-primary">AI</span>
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Simulation Mode</span>
                        <button 
                            onClick={() => {
                                setSimMode(!simMode);
                                if (!simMode) toast.success('Simulation Mode Enabled with Requestly');
                                else { setFutureResult(null); setSelectedScenario(null); }
                            }}
                            className={`w-9 h-5 rounded-full relative transition-colors ${simMode ? 'bg-primary' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${simMode ? 'left-5' : 'left-1'}`} />
                        </button>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
                {loading ? (
                    <div className="text-center py-24">
                        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
                        <h3 className="text-xl font-bold mb-2">Analyzing your item...</h3>
                        <p className="text-slate-500">Our AI is processing market data and visual features</p>
                    </div>
                ) : result && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Left: Image + AI Recommendation */}
                        <div className="space-y-6">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-400 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
                                <div className="relative aspect-square w-full rounded-xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-900 group">
                                    {listing?.images?.[0] ? (
                                        <img 
                                            src={listing.images[0].startsWith('http') ? listing.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${listing.images[0]}`}
                                            alt={listing.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[120px] text-primary/30">inventory_2</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            Analyzed
                                        </span>
                                    </div>
                                    {simMode && (
                                        <div className="absolute bottom-4 inset-x-4">
                                            <div className="bg-blue-600/90 backdrop-blur-md text-white px-4 py-2 rounded-lg text-xs font-bold text-center border border-blue-400/30">
                                                Simulated Future Market Conditions
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* AI Decision Card */}
                            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <span className="material-symbols-outlined text-6xl scale-150">auto_awesome</span>
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-primary">auto_graph</span>
                                    <h3 className="text-lg font-bold">AI Decision Recommendation</h3>
                                </div>
                                <div className={`px-4 py-2 rounded-lg inline-block font-bold mb-3 shadow-md text-white ${result.recommended_mode === 'reuse' ? 'bg-primary' : 'bg-amber-500'
                                    }`}>
                                    {result.recommended_mode === 'reuse' ? '🎯 High chance of selling!' : '♻️ Best to recycle'}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                    {result.reasoning}
                                </p>
                            </div>

                            {/* Market Scrap Prices Card (Requestly Demo) - Visible when not simulating */}
                            {!simMode && scrapPrices && (
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
                                    
                                    <div className="flex items-center justify-between mb-6 relative">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                <span className="material-symbols-outlined">analytics</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white">Live Market Rates</h3>
                                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Dynamic Scrap Valuation</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            LIVE DATA
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 relative">
                                        {[
                                            { label: 'Plastic', key: 'plastic', icon: 'layers' },
                                            { label: 'Iron', key: 'iron', icon: 'hardware' },
                                            { label: 'Copper', key: 'copper', icon: 'settings_input_component' },
                                            { label: 'Electronics', key: 'electronics', icon: 'memory' }
                                        ].map((item) => (
                                            <div key={item.key} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:border-primary/30 transition-all hover:shadow-inner">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="material-symbols-outlined text-sm text-slate-400">{item.icon}</span>
                                                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">{item.label}</div>
                                                </div>
                                                <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-0.5">
                                                    <span className="text-sm font-bold text-primary">₹</span>
                                                    {scrapPrices[item.key]}
                                                    <span className="text-[10px] text-slate-400 font-bold ml-1">/kg</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <p className="text-[10px] text-slate-400 italic">
                                            *Intercepted by Requestly for Demo
                                        </p>
                                        <button
                                            onClick={fetchScrapPrices}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:scale-105 transition-all shadow-lg active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-sm">sync</span>
                                            Refresh Market
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Future Value Simulator Section */}
                            {simMode && (
                                <section className="bg-white dark:bg-slate-900 border-2 border-primary/20 rounded-2xl p-6 shadow-xl space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500 rounded-lg text-white">
                                            <span className="material-symbols-outlined">rocket_launch</span>
                                        </div>
                                        <h3 className="text-lg font-black tracking-tight uppercase">Future Value Simulator</h3>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-500 font-medium">Predict how market shifts will impact your item's value.</p>
                                        <button 
                                            onClick={() => navigate('/requestly-client')}
                                            className="text-[10px] font-black text-primary hover:underline flex items-center gap-1"
                                        >
                                            OPEN API CLIENT
                                            <span className="material-symbols-outlined text-xs">open_in_new</span>
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-2">
                                        {SCENARIOS.map((s) => (
                                            <button 
                                                key={s.id}
                                                onClick={() => runSimulation(s.id)}
                                                className={`flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all ${selectedScenario === s.id ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/40'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`material-symbols-outlined text-sm ${s.color}`}>{s.icon}</span>
                                                    {s.label}
                                                </div>
                                                <span className="material-symbols-outlined text-sm opacity-30">chevron_right</span>
                                            </button>
                                        ))}
                                    </div>

                                    {futureResult && (
                                        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Today</p>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs"><span>Resale:</span><span className="font-bold">₹{((result.resale_estimate.min + result.resale_estimate.max)/2)}</span></div>
                                                        <div className="flex justify-between text-xs"><span>Scrap:</span><span className="font-bold">₹{result.scrap_estimate}</span></div>
                                                        <div className={`text-[10px] font-black uppercase mt-2 px-2 py-0.5 rounded inline-block ${result.recommended_mode === 'reuse' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {result.recommended_mode}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
                                                    <p className="text-[10px] font-bold text-blue-500 uppercase mb-2">Future Scenario</p>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs"><span>Resale:</span><span className="font-bold">₹{futureResult.resaleValue}</span></div>
                                                        <div className="flex justify-between text-xs"><span>Scrap:</span><span className="font-bold text-blue-600 dark:text-blue-400">₹{futureResult.scrapValue}</span></div>
                                                        <div className={`text-[10px] font-black uppercase mt-2 px-2 py-0.5 rounded inline-block ${futureResult.recommendation === 'reuse' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {futureResult.recommendation}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-start gap-2">
                                                <span className="material-symbols-outlined text-sm">info</span>
                                                Under this market scenario, {futureResult.recommendation === 'scrap' ? 'recycling the item may become more profitable.' : 'reselling remains the optimal financial choice.'}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>

                        {/* Right: Values + Actions */}
                        <div className="space-y-6">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-4xl font-black tracking-tight">Analysis Results</h1>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Intelligent valuation for{' '}
                                    <strong>{result.identified_item}</strong>
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {/* Resale Value */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                            <span className="material-symbols-outlined text-primary text-sm">local_offer</span>
                                            Resale Value
                                        </div>
                                        <span className="text-emerald-500 text-sm font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                                            +15% vs last week
                                        </span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
                                        ₹{result.resale_estimate?.min?.toLocaleString()} – ₹{result.resale_estimate?.max?.toLocaleString()}
                                    </div>
                                </div>

                                {/* Scrap Value */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                            <span className="material-symbols-outlined text-amber-500 text-sm">precision_manufacturing</span>
                                            Scrap Value
                                        </div>
                                        <span className="text-slate-400 text-sm font-bold">+2%</span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
                                        ₹{result.scrap_estimate?.toLocaleString()}
                                    </div>
                                </div>

                                {/* Recycle Value - NEW */}
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                            <span className="material-symbols-outlined text-sm">recycling</span>
                                            Recycle Value
                                        </div>
                                        <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Premium
                                        </span>
                                    </div>
                                    <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                                        ₹{(result.recycle_value || result.scrap_estimate * 1.2)?.toLocaleString()}
                                    </div>
                                    <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 mt-2 font-medium">
                                        Specialized recycler price for high-quality recovery
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                     {/* Resale Probability */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                                <span className="material-symbols-outlined text-blue-500 text-sm">trending_up</span>
                                                Resale Probability
                                            </div>
                                        </div>
                                        <div className="flex items-end gap-4">
                                            <div className="text-3xl font-black">{result.resale_probability}%</div>
                                        </div>
                                    </div>

                                    {/* Market Demand - NEW */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                                <span className="material-symbols-outlined text-purple-500 text-sm">analytics</span>
                                                Market Demand
                                            </div>
                                        </div>
                                        <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
                                            {result.market_demand || 'Moderate'}
                                        </div>
                                    </div>

                                    {/* CO2 Savings */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all col-span-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                                <span className="material-symbols-outlined text-emerald-500 text-sm">eco</span>
                                                CO₂ Savings Estimate
                                            </div>
                                            <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                Environmental Impact
                                            </span>
                                        </div>
                                        <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                            {(result.co2_saving_est || 0).toFixed(1)} kg
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1 font-medium">
                                            Estimated CO₂ prevented from entering the atmosphere
                                        </p>
                                    </div>
                                </div>

                                {/* ── Rarity Analysis Section ── */}
                                {listing?.is_rare_item ? (
                                    <div className="relative overflow-hidden border-2 border-amber-400/50 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/10 dark:to-orange-900/10 rounded-2xl p-6 shadow-xl">
                                        {/* Shimmer effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" style={{animation: 'shimmer 3s ease-in-out infinite'}} />
                                        
                                        <div className="relative">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                                                        <span className="material-symbols-outlined text-2xl">emoji_events</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-amber-900 dark:text-amber-200 tracking-tight">Rare Collectible Detected!</h3>
                                                        <p className="text-xs text-amber-700/70 dark:text-amber-400/70 font-medium">Our AI & web search identified this as a rare item</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{listing.rarity_score}</div>
                                                    <div className="text-[8px] font-black text-amber-600/60 uppercase tracking-widest">Rarity Score</div>
                                                </div>
                                            </div>

                                            {/* Rarity Label Badge */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
                                                    listing.rarity_label === 'Ultra Rare' 
                                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                                        : listing.rarity_label === 'Rare'
                                                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                                                        : 'bg-slate-200 text-slate-700'
                                                }`}>
                                                    {listing.rarity_label === 'Ultra Rare' ? '💎' : '🏆'} {listing.rarity_label}
                                                </span>
                                                <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60 font-bold">
                                                    Collector Bidding Active
                                                </span>
                                            </div>

                                            {/* Rarity Signals */}
                                            {listing.rarity_signals?.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-[10px] font-black text-amber-800/50 dark:text-amber-300/50 uppercase tracking-widest mb-2">Detected Signals</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {listing.rarity_signals.map((signal, i) => (
                                                            <span key={i} className="px-2.5 py-1 bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300 rounded-lg text-[11px] font-bold border border-amber-200 dark:border-amber-700/50">
                                                                {signal}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Highest Bid & Timer */}
                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 border border-amber-200/50 dark:border-amber-700/30">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Current Highest Bid</p>
                                                    <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                                                        ₹{(listing.highest_bid || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 border border-amber-200/50 dark:border-amber-700/30">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Bidding Ends</p>
                                                    <div className="text-lg font-black text-slate-700 dark:text-slate-200">
                                                        {listing.bidding_ends_at 
                                                            ? new Date(listing.bidding_ends_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
                                                            : '48h from listing'
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CTA to Auction Page */}
                                            <button
                                                onClick={() => navigate('/collector-auctions')}
                                                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-lg">gavel</span>
                                                View Collector Auctions
                                            </button>
                                        </div>
                                    </div>
                                ) : listing && (
                                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                                <span className="material-symbols-outlined text-slate-400">search_off</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-600 dark:text-slate-300">Rarity Analysis</h4>
                                                <p className="text-xs text-slate-400">No rarity signals detected for this item</p>
                                            </div>
                                            <span className="ml-auto px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500 uppercase">Common</span>
                                        </div>
                                    </div>
                                )}
                            </div>


                            {/* CTA Buttons */}
                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    onClick={() => handleMode('reuse')}
                                    className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-emerald-600 text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:scale-105"
                                >
                                    <span className="material-symbols-outlined">shopping_cart</span>
                                    List for Resale
                                </button>
                                <button
                                    onClick={() => handleMode('scrap')}
                                    className="w-full flex items-center justify-center gap-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 h-14 rounded-xl font-bold text-lg transition-all"
                                >
                                    <span className="material-symbols-outlined">delete_sweep</span>
                                    Convert to Scrap
                                </button>
                            </div>

                            {/* Trust badges */}
                            <div className="flex items-center justify-center gap-8 py-4 opacity-50">
                                {[['eco', 'Eco-Friendly'], ['security', 'Safe Pick-up'], ['bolt', 'Fast Payment']].map(([icon, label]) => (
                                    <div key={icon} className="flex flex-col items-center gap-1">
                                        <span className="material-symbols-outlined text-2xl">{icon}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Trust section */}
                        <div className="lg:col-span-2 mt-4 p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-900 border border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="flex-1 space-y-2">
                                    <h4 className="text-xl font-bold">Why trust JunkIn AI?</h4>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                        {result.environmental_impact || 'Our neural network processes over 10 million marketplace listings daily to give you real-time valuation accuracy within 98%. Your choice helps reduce landfill waste by ensuring items find their next best life.'}
                                    </p>
                                </div>
                                {/* Circular confidence meter */}
                                <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle className="text-slate-200 dark:text-slate-800" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8" />
                                        <circle
                                            className="text-primary"
                                            cx="50" cy="50" fill="transparent" r="40"
                                            stroke="currentColor"
                                            strokeDasharray={`${2 * Math.PI * 40}`}
                                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - (result?.confidence || 95) / 100)}`}
                                            strokeLinecap="round"
                                            strokeWidth="8"
                                        />
                                    </svg>
                                    <div className="text-center">
                                        <div className="text-2xl font-black">{result?.confidence || 95}%</div>
                                        <div className="text-[8px] uppercase font-bold text-slate-500">Confidence</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <footer className="mt-auto px-6 py-8 text-center text-slate-400 text-sm">
                © 2024 JunkIn AI Analysis. Powered by CleanTech Vision.
            </footer>
        </div>
    );
}

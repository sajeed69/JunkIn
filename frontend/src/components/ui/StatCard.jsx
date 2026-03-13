export default function StatCard({ label, value, sub, icon, iconBg, trend }) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-500 text-sm font-medium">{label}</p>
                    <div className="flex items-end gap-2 mt-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{value}</h3>
                        {trend && (
                            <span
                                className={`text-xs font-bold px-2 py-0.5 rounded mb-0.5 ${trend.startsWith('+')
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-red-50 text-red-500 dark:bg-red-900/20'
                                    }`}
                            >
                                {trend}
                            </span>
                        )}
                    </div>
                    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
                </div>
                {icon && (
                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg || 'bg-primary/10 text-primary'
                            }`}
                    >
                        <span className="material-symbols-outlined">{icon}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

import { forwardRef } from 'react';

const Input = forwardRef(function Input(
    { label, error, icon, className = '', ...props },
    ref
) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        {icon}
                    </span>
                )}
                <input
                    ref={ref}
                    className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder-slate-400 dark:placeholder-slate-500 ${icon ? 'pl-10' : ''
                        } ${error ? 'border-red-400 focus:ring-red-400/50' : ''}`}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
});

export default Input;

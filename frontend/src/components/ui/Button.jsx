import { forwardRef } from 'react';

const variants = {
    primary: 'bg-primary text-slate-900 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95',
    secondary: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-primary text-primary hover:bg-primary/10',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
    xl: 'px-10 py-4 text-lg',
};

const Button = forwardRef(function Button(
    { children, variant = 'primary', size = 'md', className = '', loading = false, icon, ...props },
    ref
) {
    return (
        <button
            ref={ref}
            disabled={loading || props.disabled}
            className={`inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {loading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : icon ? (
                <span className="material-symbols-outlined text-[1.1em]">{icon}</span>
            ) : null}
            {children}
        </button>
    );
});

export default Button;

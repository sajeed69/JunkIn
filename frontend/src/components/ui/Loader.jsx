export default function Loader({ fullScreen = false, size = 'md' }) {
    const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

    const spinner = (
        <div className="flex flex-col items-center gap-3">
            <div
                className={`${sizes[size]} border-4 border-primary/20 border-t-primary rounded-full animate-spin`}
            />
            <span className="text-sm text-slate-500 font-medium">Loading...</span>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-background-light dark:bg-background-dark flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return <div className="flex items-center justify-center py-12">{spinner}</div>;
}

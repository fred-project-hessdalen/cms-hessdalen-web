interface SiteSearchProps {
    placeholder?: string;
    action?: string;
    className?: string;
}

export default function SiteSearch({
    placeholder = "Search…",
    action = "/search",
    className = "w-full md:max-w-xl mx-auto"
}: SiteSearchProps) {
    return (
        <form action={action} method="GET" className={className}>
            <label htmlFor="site-search" className="sr-only">Search</label>
            <div className="relative">
                <input
                    id="site-search"
                    name="q"
                    type="search"
                    placeholder={placeholder}
                    className="w-full rounded-full border border-gray-300 bg-white/80 dark:bg-gray-900 dark:text-gray-100 px-4 py-2 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <button
                    type="submit"
                    aria-label="Search"
                    className="absolute inset-y-0 right-0 px-3 hover:opacity-80"
                >
                    {/* Magnifier icon (inline SVG, no extra deps) */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2"
                        className="h-5 w-5 text-gray-500 dark:text-gray-300">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                </button>
            </div>
        </form>
    );
}
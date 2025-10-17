import Link from "next/link";

interface Category {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    color?: string;
}

interface CategoryListProps {
    categories: Category[];
    className?: string;
}

// Map category colors to Tailwind classes
const getColorClasses = (color?: string) => {
    switch (color) {
        case 'blue':
            return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800';
        case 'green':
            return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800';
        case 'red':
            return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800';
        case 'yellow':
            return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800';
        case 'purple':
            return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800';
        case 'pink':
            return 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 hover:bg-pink-200 dark:hover:bg-pink-800';
        case 'gray':
            return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800';
        default:
            return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800';
    }
};

export function CategoryList({ categories, className = "" }: CategoryListProps) {
    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {categories.map((category) => (
                <Link
                    key={category._id}
                    href={`/search?tag=${category.slug}`}
                    className={`inline-block px-2 py-1 text-xs rounded-md transition-colors ${getColorClasses(category.color)}`}
                >
                    {category.title}
                </Link>
            ))}
        </div>
    );
}

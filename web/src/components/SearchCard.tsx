import Link from "next/link";
import React from "react";
import { CategoryList } from "./CategoryList";

interface Category {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    color?: string;
}

interface SearchCardProps {
    link: string;
    label: string;
    title?: string;
    categories?: Category[];
}

export function SearchCard({ link, label, title, categories }: SearchCardProps) {
    return (
        <div className="relative rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-2">
            <Link href={link} className="block">
                <div className="flex items-center justify-between">
                    <span className="text-blue-600 hover:underline">{link}</span>
                    <span className="text-sm text-gray-500">{label}</span>
                </div>
                {title && <h1 className="text-2xl font-bold mb-2 text-left">{title}</h1>}
            </Link>
            {categories && categories.length > 0 && (
                <div className="mt-2">
                    <CategoryList categories={categories} />
                </div>
            )}
        </div>
    );
}

import Link from "next/link";
import React from "react";

interface SearchCardProps {
    link: string;
    label: string;
    title: string;
}

export function SearchCard({ link, label, title }: SearchCardProps) {
    return (
        <Link href={link} className="block">
            <div className="relative rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-blue-600 hover:underline">{link}</span>
                    <span className="text-sm text-gray-500">{label}</span>
                </div>
                <h1 className="text-2xl font-bold mb-2 text-left">{title}</h1>
            </div>
        </Link>
    );
}

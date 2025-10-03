// src/components/ClientSiteNavigation.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
// NOTE: adjust this path to where your zod types live (from the nav.query we made)
import type { MenuItemType } from "@/lib/sanity/query/nav.query";

interface ClientSiteNavigationProps {
    menuItems: MenuItemType[];
}

export default function ClientSiteNavigation({ menuItems }: ClientSiteNavigationProps) {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const closeDropdown = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setHoveredItem(null);
    };

    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
        return (
            <div className="relative bg-gray-50 px-4 py-1">
                <nav className="flex justify-center items-center gap-8">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide py-2 px-3">
                        Loading navigation...
                    </div>
                </nav>
            </div>
        );
    }

    const hoveredItemData = hoveredItem ? menuItems.find((item) => item.label === hoveredItem) : null;

    const handleMouseEnter = (itemLabel: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setHoveredItem(itemLabel);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setHoveredItem(null), 300);
    };

    const handleDropdownMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleDropdownMouseLeave = () => setHoveredItem(null);

    return (
        <div className="relative bg-gray-50 px-4 py-1">
            {/* Main menu bar */}
            <nav className="flex flex-wrap items-center justify-center gap-3 md:gap-8 mx-auto container max-w-6xl">
                {menuItems.map((item) => (
                    <div key={item.label}>
                        {item.useDirectLink ? (
                            /* Direct link */
                            <a
                                href={item.href || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-700 hover:text-gray-900 font-medium uppercase tracking-wide py-2 px-3 transition-colors flex items-center gap-1"
                            >
                                {item.label}
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        ) : (
                            /* Regular menu item with dropdown */
                            <div onMouseEnter={() => handleMouseEnter(item.label)} onMouseLeave={handleMouseLeave}>
                                <button className="text-xs text-gray-700 hover:text-gray-900 font-medium uppercase tracking-wide py-2 px-3 transition-colors">
                                    {item.label}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Single dropdown positioned relative to the entire navigation */}
            {hoveredItemData && !hoveredItemData.useDirectLink && hoveredItemData.links && (
                <div
                    className="absolute top-full z-50 mt-1 left-0 right-0 max-w-6xl md:left-1/2 md:right-auto md:w-4/5 md:-translate-x-1/2"
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                >
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                        <div className="flex gap-8">
                            {/* Left: Links */}
                            <div className={hoveredItemData.useInfoCard ? "flex-[2]" : "flex-1"}>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{hoveredItemData.label}</h3>

                                {(() => {
                                    const links = hoveredItemData.links ?? [];
                                    const isColumns = !!hoveredItemData.useColumns;

                                    let usedColumns = isColumns ? [1, 2, 3].filter((c) => links.some((l) => l.column === c)) : [1];
                                    if (usedColumns.length === 0) usedColumns = [1];

                                    const gridClass =
                                        usedColumns.length === 1
                                            ? "grid grid-cols-1 gap-6"
                                            : usedColumns.length === 2
                                                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                                                : "grid grid-cols-1 md:grid-cols-3 gap-6";

                                    const columnLinks = (col: 1 | 2 | 3) => (isColumns ? links.filter((l) => l.column === col) : links);

                                    return (
                                        <div className={gridClass}>
                                            {usedColumns.map((col) => (
                                                <div key={col} className="space-y-2">
                                                    {columnLinks(col).map((link) => (
                                                        <div key={`${link.href}-${link.label}`}>
                                                            {link.separator && <hr className="my-3 border-gray-200" />}
                                                            <Link
                                                                href={link.href}
                                                                onClick={closeDropdown}
                                                                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
                                                            >
                                                                <div>
                                                                    <div>{link.label}</div>
                                                                    {link.description && <div className="text-xs text-gray-500 mt-1">{link.description}</div>}
                                                                </div>
                                                            </Link>

                                                            {link.subItems && (
                                                                <div className="ml-4 mt-1 space-y-1">
                                                                    {link.subItems.map((sub) => (
                                                                        <Link
                                                                            key={`${sub.href}-${sub.label}`}
                                                                            href={sub.href || "#"}
                                                                            onClick={closeDropdown}
                                                                            className="block px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded transition-colors"
                                                                        >
                                                                            • {sub.label}
                                                                            {sub.description && <div className="text-xs text-gray-500 mt-1 px-2">{sub.description}</div>}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Right: Info card */}
                            {hoveredItemData.useInfoCard && (
                                <div
                                    className={`flex-[1] rounded-lg relative overflow-hidden ${hoveredItemData.info?.backgroundImage ? "" : "bg-gray-50 p-4"
                                        }`}
                                    style={
                                        hoveredItemData.info?.backgroundImage
                                            ? {
                                                backgroundImage: `url(${hoveredItemData.info.backgroundImage})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                backgroundRepeat: "no-repeat",
                                            }
                                            : {}
                                    }
                                >
                                    <div className={`relative z-10 ${hoveredItemData.info?.backgroundImage ? "p-4" : ""}`}>
                                        <h4 className={`${hoveredItemData.info?.backgroundImage ? "text-white text-lg" : "text-gray-900 text-md"} font-medium mb-2`}>
                                            {hoveredItemData.info?.title}
                                        </h4>
                                        <p className={`${hoveredItemData.info?.backgroundImage ? "text-gray-100 text-base" : "text-gray-600 text-sm"} mb-4`}>
                                            {hoveredItemData.info?.description}
                                        </p>

                                        {hoveredItemData.info?.useLink &&
                                            hoveredItemData.info?.buttonLabel &&
                                            hoveredItemData.info?.buttonLink && (
                                                <Link
                                                    href={hoveredItemData.info.buttonLink}
                                                    className="inline-block bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors px-3 py-1.5 text-xs"
                                                >
                                                    {hoveredItemData.info.buttonLabel}
                                                </Link>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

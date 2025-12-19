"use client";

import Image from "next/image";
import Link from "next/link";
import type { PeopleType } from "@/lib/sanity/query/people.query";
import Tooltip from "./Tooltip";

export function PeopleCard({ info, current, isLoggedIn, isAdmin }: { info: PeopleType, current?: string, isLoggedIn?: boolean, isAdmin?: boolean }) {
    const getInitials = (name?: string) =>
        name ? name.split(/\s+/).map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";

    const isCurrent = current === info.slug;

    // If logged in, show email/mobile regardless of privacy settings
    const showEmail = isLoggedIn ? !!info.email : (info.canShowEmail && info.email);
    const showMobile = isLoggedIn ? !!info.mobile : (info.canShowMobileNumber && info.mobile);

    return (
        <div
            key={info.slug}
            className={`relative rounded-2xl border-2 ${isCurrent ? 'border-black dark:border-yellow-300' : 'border-gray-200 dark:border-gray-800'} bg-white/70 dark:bg-gray-900/60 shadow-sm hover:shadow-md transition-shadow p-4 flex items-start gap-4 ${!isCurrent ? 'hover:border-blue-500 hover:dark:border-blue-400' : ''}`}
        >
            {/* Stretched link overlay to make the whole card clickable */}
            {!isCurrent && (
                <Link
                    href={`/people/${info.slug}`}
                    aria-label={`Open ${info.displayName ? info.displayName : info.name}`}
                    className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
            )}

            {/* Avatar */}
            {info.image ? (
                <a
                    href={info.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-90 transition-opacity"
                >
                    <Image
                        src={info.image}
                        alt={info.displayName ? info.displayName : info.name}
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                        sizes="56px"
                    />
                </a>
            ) : (
                <div
                    className="rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-200 flex-none"
                    style={{ width: 56, height: 56, minWidth: 56, minHeight: 56, maxWidth: 56, maxHeight: 56 }}
                >
                    {getInitials(info.displayName ? info.displayName : info.name)}
                </div>
            )}

            {/* Text */}
            <div className="min-w-0 text-left w-full">
                <h3 className="text-base font-semibold truncate flex items-center gap-1">
                    <span className="truncate">{info.displayName ? info.displayName : info.name}</span>
                    {info.isPublic === false && (
                        <Tooltip content="Not public" position="left">
                            <span className="relative z-20 flex-shrink-0 text-lg">
                                🚫
                            </span>
                        </Tooltip>
                    )}
                </h3>

                {info.professionalTitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {info.professionalTitle.title}
                    </p>
                )}



                {showEmail && (
                    <a
                        href={`mailto:${info.email}`}
                        className="relative z-20 text-sm text-blue-600 hover:underline break-all"
                    >
                        {info.email}
                    </a>
                )}
                {showMobile && (
                    <a
                        href={`tel:${info.mobile!.replace(/\s+/g, "")}`}
                        className="relative z-20 text-sm text-blue-600 hover:underline break-all ml-2"
                    >
                        📞 {info.mobile}
                    </a>
                )}


                {info.summary && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {info.summary}
                    </p>
                )}
            </div>
        </div>
    );
}

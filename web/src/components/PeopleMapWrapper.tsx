"use client";

import dynamic from "next/dynamic";
import type { MemberLocation } from "./PeopleMap";

const PeopleMapClient = dynamic(() => import("./PeopleMapClient"), {
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
});

export default function PeopleMapWrapper({ members }: { members: MemberLocation[] }) {
    return <PeopleMapClient members={members} />;
}

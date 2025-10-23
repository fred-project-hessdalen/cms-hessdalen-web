"use client";
import PeopleMap, { MemberLocation } from "./PeopleMap";

export default function PeopleMapClient({ members }: { members: MemberLocation[] }) {
    return <PeopleMap members={members} />;
}

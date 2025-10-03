import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { NAV_TAG } from "@/lib/sanity/query/nav.query";
import { SITE_SETTINGS_TAG } from "@/lib/sanity/query/site.query";


export async function POST() {
    await revalidateTag(NAV_TAG);
    await revalidateTag(SITE_SETTINGS_TAG);
    return NextResponse.json({ success: true });
}

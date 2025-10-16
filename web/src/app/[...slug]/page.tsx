import { notFound, redirect } from "next/navigation";
import { fetchAndParse } from "@/lib/sanity/fetch";
import { PAGE_BY_PATH_QUERY, Page, type PageType } from "@/lib/sanity/query/page.query";
import { PageRenderer } from "@/components/PageRenderer";

export default async function CatchAllPage(props: { params: { slug?: string[] } } | { params: Promise<{ slug?: string[] }> }) {
    // Await params if it's a Promise (Next.js dynamic API)
    const rawParams = ("then" in props.params) ? await props.params : props.params;
    const path = (rawParams.slug ?? []).join("/");
    if (!path) return notFound();

    const doc = await fetchAndParse(PAGE_BY_PATH_QUERY, { path }, Page) as PageType | null;
    if (!doc) return notFound();

    // Handle redirect if redirectTo is set
    if (doc.redirectTo) {
        // Check if it's an external URL (contains ://)
        const isExternal = doc.redirectTo.includes("://");
        if (isExternal) {
            redirect(doc.redirectTo);
        } else {
            redirect(`/${doc.redirectTo}`);
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <PageRenderer page={doc} />
        </div>
    );
}

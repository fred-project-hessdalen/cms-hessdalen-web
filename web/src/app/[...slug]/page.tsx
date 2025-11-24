import { notFound, redirect } from "next/navigation";
import { fetchAndParse } from "@/lib/sanity/fetch";
import { PAGE_BY_PATH_QUERY, Page, type PageType } from "@/lib/sanity/query/page.query";
import { PageRenderer } from "@/components/PageRenderer";
import { auth } from "@/lib/auth";
import { client } from "@/lib/sanity/live";

export default async function CatchAllPage(props: { params: { slug?: string[] }, searchParams?: { key?: string } } | { params: Promise<{ slug?: string[] }>, searchParams?: Promise<{ key?: string }> }) {
    // Await params if it's a Promise (Next.js dynamic API)
    const rawParams = ("then" in props.params) ? await props.params : props.params;
    const rawSearchParams = props.searchParams && ("then" in props.searchParams) ? await props.searchParams : props.searchParams;

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

    // Check if user is authenticated
    const session = await auth();
    const isAuthenticated = !!session?.user;

    // Check for access key in URL
    let accessKeyData = null;
    const keyParam = rawSearchParams?.key;

    if (keyParam) {
        // Validate the access key
        accessKeyData = await client.fetch(
            `*[_type == "accessKey" && key == $key && isActive == true][0]{
                key,
                name,
                email,
                expiresAt,
                isActive
            }`,
            { key: keyParam }
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <PageRenderer
                page={doc}
                isAuthenticated={isAuthenticated}
                accessKey={accessKeyData}
            />
        </div>
    );
}

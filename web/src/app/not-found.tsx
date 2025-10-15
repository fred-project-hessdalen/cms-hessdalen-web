import SiteMap from "@/components/SiteMap";
import Link from "next/link";
import Image from "next/image";
import { getSiteSettings } from "@/lib/sanity/getSiteSettings";


export default async function NotFound() {
    const siteSettings = await getSiteSettings();

    return (
        <div className="min-h-screen flex flex-col items-center pt-8 bg-gray-100 dark:bg-gray-900">
            <h1 className="text-4xl font-bold mb-4 text-red-600 dark:text-red-400">404 – Page Not Found</h1>
            {siteSettings.notFoundImage && (
                <Image src={siteSettings.notFoundImage} alt="Not Found" width={400} height={400} className="mb-6" />
            )}
            <p className="mb-6 text-gray-700 dark:text-gray-300">Sorry, the page you are looking for does not exist.</p>
            <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">Go back home</Link>
            <div className="w-full mt-8">
                <SiteMap />
            </div>
        </div>
    );
}

import Link from "next/link";

interface SiteLogoAndNameProps {
    logo?: string;
    siteName?: string;
}

export default function SiteLogoAndName({ logo, siteName }: SiteLogoAndNameProps) {
    return (
        <div className="flex items-center gap-4">
            {logo && (
                <Link href="/" className="hover:opacity-75 transition-opacity">
                    <img
                        src={logo}
                        alt="logo"
                        className="h-12 w-12 object-contain"
                    />
                </Link>
            )}
            <h1 className="text-2xl font-semibold leading-none">
                {siteName || "Site Name"}
            </h1>
        </div>
    );
}
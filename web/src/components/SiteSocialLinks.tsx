import Tooltip from "@/components/Tooltip";
import Link from "next/link";

interface SocialLink {
    logo: string;
    label: string;
    url: string;
}

interface SiteSocialLinksProps {
    links?: SocialLink[];
}

export default function SiteSocialLinks({ links }: SiteSocialLinksProps) {
    if (!links || links.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2 w-full justify-center md:w-auto md:justify-end">
            {links.map((social, index) => (
                <Tooltip key={index} content={social.label} position="bottom">
                    <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-75 transition-opacity"
                        aria-label={social.label}
                    >
                        <img
                            src={social.logo}
                            alt={social.label}
                            className="h-8 w-8 object-contain"
                        />
                    </a>
                </Tooltip>
            ))}
            <Tooltip content="Members" position="bottom">
                <Link
                    href="/people"
                >
                    <svg className="h-8 w-8 p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </Link>
            </Tooltip>
        </div>
    );
}
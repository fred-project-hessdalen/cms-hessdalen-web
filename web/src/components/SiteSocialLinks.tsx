import Tooltip from "@/components/Tooltip";

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
        </div>
    );
}
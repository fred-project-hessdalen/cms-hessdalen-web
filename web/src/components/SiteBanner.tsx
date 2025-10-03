interface Banner {
    enabled?: boolean;
    message?: string;
    variant?: "info" | "warning" | "success" | "danger";
}

interface SiteBannerProps {
    banner?: Banner;
}

export default function SiteBanner({ banner }: SiteBannerProps) {

    if (!banner || banner.enabled == false) {
        return null;
    }

    const tone = {
        info: "bg-blue-50 text-blue-900 border-blue-200",
        success: "bg-green-50 text-green-900 border-green-200",
        warning: "bg-amber-50 text-amber-900 border-amber-200",
        danger: "bg-red-50 text-red-900 border-red-200",
    }[banner.variant ?? "info"];

    return (
        <div
            role="region"
            aria-label="Site announcement"
            className={"border-b " + tone}
        >
            <div className="mx-auto max-w-6xl px-4 py-2 text-center ">
                <p className="leading-relaxed">{banner.message}</p>
            </div>
        </div>
    );
}
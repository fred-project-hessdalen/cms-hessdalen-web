import { PortableTextBlock } from "next-sanity";

export interface PTImageBlock {
    _type: "image";
    asset: { url: string };
    alt?: string;
    caption?: string;
    layout?: "standard" | "banner" | "banner-top" | "banner-bottom" | "original";
    link?: string;
}

export interface PTImageGalleryBlock {
    _type: "imageGallery";
    columns?: number;
    images: Array<{
        asset: { url: string };
        alt?: string;
        caption?: string;
        description?: PortableTextBlock[];
        credit?: string;
        link?: string;
    }>;
}

export interface PTTextColumnsBlock {
    _type: "textColumns";
    cols?: number;
    columns?: number;
    content: PortableTextBlock[]; // Usually PortableTextBlock[]
}
export interface PTCalloutBlock {
    _type: "callout";
    tone?: "info" | "success" | "warning" | "danger";
    icon?: string;
    title?: string;
    content?: PortableTextBlock[]; // Usually PortableTextBlock[]
    compact?: boolean;
}

export interface PTYouTubeBlock {
    _type: "youtubeVideo";
    url: string;
    title?: string;
    aspectRatio?: "16:9" | "4:3" | "21:9";
}

export interface PTCollapsibleBlock {
    _type: "collapsible";
    header: string;
    content?: PortableTextBlock[];
    defaultOpen?: boolean;
}
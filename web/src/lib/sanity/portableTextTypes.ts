import { PortableTextBlock } from "next-sanity";

export interface PTImageBlock {
    _type: "image";
    asset: { url: string };
    alt?: string;
    caption?: string;
    layout?: "standard" | "banner";
}

export interface PTImageGalleryBlock {
    _type: "imageGallery";
    columns?: number;
    images: Array<{
        asset: { url: string };
        alt?: string;
        caption?: string;
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
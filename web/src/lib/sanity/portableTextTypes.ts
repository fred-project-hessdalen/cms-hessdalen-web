import { PortableTextBlock } from "next-sanity";

export interface PTImageBlock {
    _type: "image";
    asset: { url: string };
    alt?: string;
    caption?: string;
    layout?: "standard" | "banner" | "banner-top" | "banner-bottom" | "original";
    align?: "left" | "center" | "right";
    width?: "column" | "full" | "screen";
    link?: string;
}

export interface PTImageGalleryBlock {
    _type: "imageGallery";
    columns?: number;
    aspect?: "video" | "portrait" | "square";
    images: Array<{
        asset: { url: string };
        alt?: string;
        caption?: string;
        description?: PortableTextBlock[];
        credit?: string;
        link?: string;
    }>;
}

export interface PTImageListBlock {
    _type: "imageList";
    title?: string;
    description?: PortableTextBlock[];
    highlight?: boolean;
    aspect?: "video" | "portrait" | "square";
    items: Array<{
        icon: { url: string };
        title: string;
        description?: PortableTextBlock[];
        link?: string;
    }>;
}

export interface PTPartsListBlock {
    _type: "partsList";
    title?: string;
    description?: PortableTextBlock[];
    highlight?: boolean;
    items: Array<{
        _id: string;
        name: string;
        title?: string;
        description: PortableTextBlock[];
        image?: {
            url?: string;
            alt?: string;
        } | null;
        aspect: 'video' | 'portrait' | 'square';
        imageURL?: string;
        buttons: Array<{
            name: string;
            url: string;
            style?: 'default' | 'highlight' | 'text-only';
        }>;
        align?: 'left' | 'center' | 'right';
        layout?: 'plain' | 'framed' | 'featured' | 'card';
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
    aspectRatio?: "16:9" | "9:16" | "4:3" | "21:9";
}

export interface PTCollapsibleBlock {
    _type: "collapsible";
    header: string;
    content?: PortableTextBlock[];
    defaultOpen?: boolean;
}

export interface PTGoogleSlidesBlock {
    _type: "googleSlidesEmbed";
    title?: string;
    embedUrl: string;
    autoplay?: boolean;
    loop?: boolean;
    delaySec?: number;
    aspect?: "video" | "landscape" | "square";
}

export interface PTGoogleDocumentBlock {
    _type: "googleDocumentEmbed";
    title?: string;
    embedUrl: string;
    aspect?: "landscape" | "square" | "portrait";
}

export interface PTKofiEmbedBlock {
    _type: "kofiEmbed";
    username: string;
    widgetType?: 'button' | 'floating' | 'panel';
    text?: string;
    color?: 'blue' | 'red' | 'orange' | 'pink' | 'white' | 'black';
    caption?: string;
}

export interface PTCustomHtmlEmbedBlock {
    _type: "customHtmlEmbed";
    html: string;
    caption?: string;
}
import { PortableText } from "next-sanity";
import type { PortableTextBlock } from "sanity";

export function SimplePortableText({ value }: { value: PortableTextBlock[] }) {
    return <PortableText value={value} />;
}

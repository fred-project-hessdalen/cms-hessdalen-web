import { PortableText, PortableTextComponents } from "next-sanity";
import type { PortableTextBlock } from "sanity";
import Image from "next/image";

const portableTextComponents: PortableTextComponents = {
    types: {
        // types: {

    },
};

export function SimplePortableText({ value }: { value: PortableTextBlock[] }) {
    return (
        <article className="mt-8 prose prose-zinc dark:prose-invert max-w-none">
            <PortableText value={value} components={portableTextComponents} />
        </article>
    );
}

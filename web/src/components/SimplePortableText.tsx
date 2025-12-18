import { PortableText, PortableTextComponents } from "next-sanity";
import type { PortableTextBlock } from "sanity";
import Image from "next/image";

const portableTextComponents: PortableTextComponents = {
    types: {
        // Custom types like images, callouts, etc.
        image: ({ value }) => (
            <a
                href={value.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-opacity cursor-pointer"
            >
                <Image src={value.url} alt={value.alt} />
            </a>
        ),
    },

    block: {
        // Customize block styles (paragraphs, headings)
        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-semibold mb-2">{children}</h3>,
        normal: ({ children }) => <p className="mt-0 mb-1">{children}</p>,
    },

    marks: {
        // Customize inline marks
        strong: ({ children }) => <strong className="font-bold text-indigo-600">{children}</strong>,
        em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
        link: ({ children, value }) => <a href={value.href} className="text-blue-600 hover:underline">{children}</a>,
    },

    list: {
        // Customize lists
        bullet: ({ children }) => <ul className="list-disc pl-6 mb-2">{children}</ul>,
        number: ({ children }) => <ol className="list-decimal pl-6 mb-2">{children}</ol>,
    },

    listItem: {
        bullet: ({ children }) => <li className="mt-0 mb-0">{children}</li>,
        number: ({ children }) => <li className="mt-0 mb-0">{children}</li>,
    },
};

export function SimplePortableText({ value }: { value: PortableTextBlock[] }) {
    return (
        <article className="mt-8 prose prose-zinc dark:prose-invert max-w-none">
            <PortableText value={value} components={portableTextComponents} />
        </article>
    );
}

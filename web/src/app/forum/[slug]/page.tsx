import { notFound, redirect } from "next/navigation";
import { publicClient } from "@/sanity/client";
import type { PortableTextBlock } from "sanity";
import Image from "next/image";
import Link from "next/link";
import { SimplePortableText } from "@/components/SimplePortableText";
import ForumResponsesSection from "@/components/ForumResponsesSection";
import { createClient } from "next-sanity";
import { env } from "@/lib/sanity/env";
import { auth } from "@/lib/auth";

// Disable caching to always show latest responses
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Client without CDN for fresh data
const freshClient = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
    useCdn: false, // Disable CDN for fresh data
});

interface ForumPost {
    _id: string;
    title: string;
    slug: { current: string };
    body: PortableTextBlock[];
    image?: {
        asset: {
            url: string;
        };
        alt?: string;
    };
    author: {
        _id: string;
        name: string;
        slug: {
            current: string;
        };
        image?: {
            asset: {
                url: string;
            };
        };
    };
    type?: {
        _id: string;
        title: string;
    };
    createdAt: string;
    links?: Array<{
        label: string;
        url: string;
    }>;
}

async function getForumPost(slug: string): Promise<ForumPost | null> {
    const query = `*[_type == "forumPost" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    body,
    image {
      asset-> {
        url
      },
      alt
    },
    author-> {
      _id,
      name,
      slug,
      image {
        asset-> {
          url
        }
      }
    },
    type-> {
      _id,
      title
    },
    createdAt,
    links
  }`;

    return await publicClient.fetch(query, { slug });
}

interface ForumResponse {
    _id: string;
    title: string;
    body: PortableTextBlock[];
    image?: {
        asset: {
            url: string;
        };
    };
    author: {
        _id: string;
        name: string;
        slug: {
            current: string;
        };
        image?: {
            asset: {
                url: string;
            };
        };
    };
    createdAt: string;
    links?: Array<{
        label: string;
        url: string;
    }>;
    replyTo?: {
        _id: string;
        title: string;
    };
}

async function getForumResponses(postId: string): Promise<ForumResponse[]> {
    const query = `*[_type == "forumPostResponse" && parentPost._ref == $postId] | order(createdAt desc) {
    _id,
    title,
    body,
    image {
      asset-> {
        url
      }
    },
    author-> {
      _id,
      name,
      slug,
      image {
        asset-> {
          url
        }
      }
    },
    createdAt,
    links,
    replyTo-> {
      _id,
      title
    }
  }`;

    return await freshClient.fetch(query, { postId });
}

export default async function ForumPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await auth();

    // Redirect to sign-in if not authenticated
    if (!session) {
        redirect("/auth/signin");
    }

    const { slug } = await params;
    const post = await getForumPost(slug);

    if (!post) {
        notFound();
    }

    // Fetch responses for this post
    const responses = await getForumResponses(post._id);

    const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-screen-2xl mx-auto px-4">
                {/* Back to Forum Link */}
                <Link
                    href="/forum"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 mb-6"
                >
                    ← Back to Forum
                </Link>

                {/* Two-column layout: Article left, Responses right */}
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                    {/* Left column: Article */}
                    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-fit">
                        {/* Post Type Badge */}
                        {post.type && (
                            <div className="px-6 pt-4">
                                <span className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm font-medium px-3 py-1 rounded-full">
                                    {post.type.title}
                                </span>
                            </div>
                        )}

                        {/* Header */}
                        <header className="px-6 py-6 text-left">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                {post.title}
                            </h1>

                            {/* Author & Date */}
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    {post.author.image?.asset?.url ? (
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                            <Image
                                                src={post.author.image.asset.url}
                                                alt={post.author.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                            <span className="text-gray-600 dark:text-gray-300 font-semibold">
                                                {post.author.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <Link
                                            href={`/people/${post.author.slug.current}`}
                                            className="font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                                        >
                                            {post.author.name}
                                        </Link>
                                        <div className="text-xs">{formattedDate}</div>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Featured Image */}
                        {post.image?.asset?.url && (
                            <div className="relative w-full h-96">
                                <Image
                                    src={post.image.asset.url}
                                    alt={post.image.alt || post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        )}

                        {/* Body Content */}
                        <div className="px-6 py-8 text-left">
                            <SimplePortableText value={post.body} />
                        </div>

                        {/* Links */}
                        {post.links && post.links.length > 0 && (
                            <div className="text-left px-6 pb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Related Links
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {post.links.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            {link.label}
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                            </svg>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>

                    {/* Right column: Responses Section */}
                    <div>
                        <ForumResponsesSection postId={post._id} responses={responses} />
                    </div>
                </div>
            </div>
        </div>
    );
}

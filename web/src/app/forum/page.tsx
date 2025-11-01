import Link from "next/link";
import { publicClient } from "@/sanity/client";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface ForumPost {
    _id: string;
    title: string;
    slug: { current: string };
    author: {
        _id: string;
        name: string;
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
    image?: {
        asset: {
            url: string;
        };
    };
    // First block of body text for preview
    body?: Array<{
        children?: Array<{
            text?: string;
        }>;
    }>;
    // Responders - unique authors who have replied to this post
    responders?: Array<{
        _id: string;
        name: string;
        image?: {
            asset: {
                url: string;
            };
        };
    }>;
}

async function getForumPosts(): Promise<ForumPost[]> {
    const query = `*[_type == "forumPost"] | order(createdAt desc) {
    _id,
    title,
    slug,
    author-> {
      _id,
      name,
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
    image {
      asset-> {
        url
      }
    },
    body[0..1],
    "responders": *[_type == "forumPostResponse" && references(^._id)].author->{
      _id,
      name,
      image {
        asset-> {
          url
        }
      }
    } | order(_createdAt desc)
  }`;

    return await publicClient.fetch(query);
}

export default async function ForumPage() {
    const session = await auth();

    // Redirect to sign-in if not authenticated
    if (!session) {
        redirect("/auth/signin");
    }

    const posts = await getForumPosts();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-left flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Forum
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Join the discussion and share your thoughts
                        </p>
                    </div>
                    <Link
                        href="/member/forum/new"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md transition-colors"
                    >
                        Create Post
                    </Link>
                </div>

                {/* Posts List */}
                {posts.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            No forum posts yet. Be the first to start a discussion!
                        </p>
                        <Link
                            href="/member/forum/new"
                            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                        >
                            Create First Post
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => {
                            const formattedDate = new Date(post.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                }
                            );

                            // Extract preview text from body
                            const previewText = post.body
                                ?.flatMap((block) => block.children?.map((child) => child.text) || [])
                                .join(" ")
                                .substring(0, 150);

                            return (
                                <article
                                    key={post._id}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <Link href={`/forum/${post.slug.current}`}>
                                        <div className="flex gap-4 p-6">
                                            {/* Thumbnail */}
                                            {post.image?.asset?.url ? (
                                                <div className="flex-shrink-0 w-32 h-32 relative rounded-lg overflow-hidden">
                                                    <Image
                                                        src={post.image.asset.url}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex-shrink-0 w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                    <svg
                                                        className="w-12 h-12 text-gray-400 dark:text-gray-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 text-left">
                                                {/* Post Type Badge */}
                                                {post.type && (
                                                    <div className="mb-2">
                                                        <span className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2 py-1 rounded-full">
                                                            {post.type.title}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Title */}
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                    {post.title}
                                                </h2>

                                                {/* Preview Text */}
                                                {previewText && (
                                                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                        {previewText}
                                                        {previewText.length >= 150 && "..."}
                                                    </p>
                                                )}

                                                {/* Author & Date + Responders */}
                                                <div className="flex items-center justify-between gap-3">
                                                    {/* Left: Author & Date */}
                                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                                        <div className="flex items-center gap-2">
                                                            {post.author.image?.asset?.url ? (
                                                                <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                                                    <Image
                                                                        src={post.author.image.asset.url}
                                                                        alt={post.author.name}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                                        {post.author.name.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <span className="font-medium">{post.author.name}</span>
                                                        </div>
                                                        <span>•</span>
                                                        <span>{formattedDate}</span>
                                                    </div>

                                                    {/* Right: Responders */}
                                                    {post.responders && post.responders.length > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            {/* Get unique responders (first 5) */}
                                                            {Array.from(new Map(post.responders.map(r => [r._id, r])).values())
                                                                .slice(0, 5)
                                                                .map((responder, idx) => (
                                                                    <div
                                                                        key={responder._id}
                                                                        className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-white dark:border-gray-800"
                                                                        style={{ marginLeft: idx > 0 ? '-8px' : '0' }}
                                                                        title={responder.name}
                                                                    >
                                                                        {responder.image?.asset?.url ? (
                                                                            <Image
                                                                                src={responder.image.asset.url}
                                                                                alt={responder.name}
                                                                                fill
                                                                                className="object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                                                    {responder.name.charAt(0).toUpperCase()}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            {/* Show count if more than 5 responders */}
                                                            {new Set(post.responders.map(r => r._id)).size > 5 && (
                                                                <div
                                                                    className="relative w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300"
                                                                    style={{ marginLeft: '-8px' }}
                                                                >
                                                                    +{new Set(post.responders.map(r => r._id)).size - 5}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fetchAndParse } from "@/lib/sanity/fetch";
import { PEOPLE_BY_EMAIL_QUERY, People, type PeopleType } from "@/lib/sanity/query/people.query";
import ForumPostForm from "@/components/ForumPostForm";
import { publicClient } from "@/sanity/client";

interface ForumPostType {
    _id: string;
    title: string;
    description?: string;
}

async function getForumPostTypes(): Promise<ForumPostType[]> {
    const query = `*[_type == "forumPostType"] | order(title asc) {
    _id,
    title,
    description
  }`;

    return await publicClient.fetch(query);
}

export default async function NewForumPostPage() {
    const session = await auth();

    // Redirect to sign-in if not authenticated
    if (!session) {
        redirect("/auth/signin");
    }

    // Fetch the person record for this user
    const person = session.user?.email
        ? await fetchAndParse(PEOPLE_BY_EMAIL_QUERY, { email: session.user.email }, People) as PeopleType | null
        : null;

    // Fetch available forum post types
    const postTypes = await getForumPostTypes();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4">
            <div className="text-left max-w-3xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Create New Forum Post
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Share your thoughts and start a discussion with the community
                    </p>

                    {!person ? (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                            <p>You need to have a person profile to create forum posts.</p>
                            <p className="text-sm mt-2">Please contact an administrator to set up your profile.</p>
                        </div>
                    ) : null}

                    <ForumPostForm
                        postTypes={postTypes}
                        personId={person?._id || null}
                    />
                </div>
            </div>
        </div>
    );
}

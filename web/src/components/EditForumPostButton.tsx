'use client';

import { useState } from 'react';
import { EditForumItemModal } from './EditForumItemModal';
import { useRouter } from 'next/navigation';

interface ForumPost {
    _id: string;
    title: string;
    body: Array<Record<string, unknown>>;
    author: {
        _id: string;
        authUserId?: string;
        email?: string;
    };
    links?: Array<{
        label: string;
        url: string;
    }>;
}

interface Session {
    user?: {
        id?: string;
        email?: string | null;
    };
}

interface EditForumPostButtonProps {
    post: ForumPost;
    session: Session | null;
}

export function EditForumPostButton({ post, session }: EditForumPostButtonProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const router = useRouter();

    // Check if current user can edit this post
    const canEdit = session?.user && (
        session.user.id === post.author.authUserId || 
        session.user.email === post.author.email
    );

    if (!canEdit) {
        return null;
    }

    // Convert Sanity blocks to HTML for editing
    const bodyToHtml = (blocks: Array<Record<string, unknown>>) => {
        return blocks
            .filter(block => block._type === 'block')
            .map(block => 
                (block.children as Array<Record<string, unknown>>)
                    ?.map((child: Record<string, unknown>) => child.text)
                    .join('')
            )
            .join('\n\n');
    };

    const handleEditSuccess = () => {
        router.refresh(); // Refresh the page to show updated content
    };

    return (
        <>
            <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
            >
                Edit
            </button>

            <EditForumItemModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                itemType="post"
                itemId={post._id}
                initialTitle={post.title}
                initialBody={bodyToHtml(post.body)}
                initialLinks={post.links || []}
                onSuccess={handleEditSuccess}
            />
        </>
    );
}
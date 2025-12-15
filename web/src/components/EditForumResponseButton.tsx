'use client';

import { useState } from 'react';
import { EditForumItemModal } from './EditForumItemModal';
import { useRouter } from 'next/navigation';

interface ForumResponse {
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

interface EditForumResponseButtonProps {
    response: ForumResponse;
    session: Session | null;
}

export function EditForumResponseButton({ response, session }: EditForumResponseButtonProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const router = useRouter();

    // Check if current user can edit this response
    const canEdit = session?.user && (
        session.user.id === response.author.authUserId || 
        session.user.email === response.author.email
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
                itemType="response"
                itemId={response._id}
                initialTitle={response.title}
                initialBody={bodyToHtml(response.body)}
                initialLinks={response.links || []}
                onSuccess={handleEditSuccess}
            />
        </>
    );
}
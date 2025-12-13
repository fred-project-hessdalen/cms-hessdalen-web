"use client";

import { useState } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import ForumResponseForm from "./ForumResponseForm";
import ForumResponsesList from "./ForumResponsesList";
import type { PortableTextBlock } from "sanity";

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
    editedAt?: string;
    links?: Array<{
        label: string;
        url: string;
    }>;
    replyTo?: {
        _id: string;
        title: string;
    };
}

interface Session {
    user?: {
        id?: string;
        email?: string | null;
    };
}

interface ForumResponsesSectionProps {
    postId: string;
    responses: ForumResponse[];
    session: Session | null;
}

export default function ForumResponsesSection({
    postId,
    responses,
    session,
}: ForumResponsesSectionProps) {
    const [replyToId, setReplyToId] = useState<string | null>(null);
    const [replyToTitle, setReplyToTitle] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleReply = (responseId: string, responseTitle: string) => {
        setReplyToId(responseId);
        setReplyToTitle(responseTitle);
        setIsFormOpen(true); // Open the collapsible section

        // Scroll to the form after a brief delay to allow the section to open
        setTimeout(() => {
            const element = document.getElementById("ResponseForm");
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }, 100);
    };

    const handleCancelReply = () => {
        setReplyToId(null);
        setReplyToTitle(null);
    };

    const handleSuccess = () => {
        setReplyToId(null);
        setReplyToTitle(null);
        setIsFormOpen(false);
        // Add a small delay to ensure Sanity has processed the new response
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    return (
        <div className="text-left mt-0 space-y-8">
            {/* Response Form in Collapsible Section */}
            <div id="ResponseForm" className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <CollapsibleSection
                    header="Write a Response"
                    isOpen={isFormOpen}
                    onToggle={setIsFormOpen}
                >
                    <div className="p-6">
                        <ForumResponseForm
                            parentPostId={postId}
                            replyToId={replyToId}
                            replyToTitle={replyToTitle || undefined}
                            onSuccess={handleSuccess}
                            onCancel={replyToId ? handleCancelReply : undefined}
                        />
                    </div>
                </CollapsibleSection>
            </div>

            {/* Responses List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Responses ({responses.length})
                </h2>
                <ForumResponsesList responses={responses} onReply={handleReply} session={session} />
            </div>
        </div>
    );
}

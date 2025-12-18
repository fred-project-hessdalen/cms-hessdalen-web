'use client';

import { useState } from 'react';

interface EditForumItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemType: 'post' | 'response';
    itemId: string;
    initialTitle: string;
    initialBody: string;
    initialLinks?: Array<{ label: string; url: string }>;
    onSuccess: () => void;
}

export function EditForumItemModal({
    isOpen,
    onClose,
    itemType,
    itemId,
    initialTitle,
    initialBody,
    initialLinks = [],
    onSuccess,
}: EditForumItemModalProps) {
    const [title, setTitle] = useState(initialTitle);
    const [body, setBody] = useState(initialBody);
    const [links, setLinks] = useState(initialLinks);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('body', body);
            formData.append('links', JSON.stringify(links));

            const endpoint = itemType === 'post' 
                ? `/api/forum-post/${itemId}` 
                : `/api/forum-response/${itemId}`;

            const response = await fetch(endpoint, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update');
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addLink = () => {
        setLinks([...links, { label: '', url: '' }]);
    };

    const updateLink = (index: number, field: 'label' | 'url', value: string) => {
        const newLinks = [...links];
        newLinks[index][field] = value;
        setLinks(newLinks);
    };

    const removeLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Edit {itemType === 'post' ? 'Post' : 'Response'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>

                    {/* Body */}
                    <div>
                        <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Content
                        </label>
                        <textarea
                            id="body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={10}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Write your content here..."
                            required
                        />
                    </div>

                    {/* Links */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Links (optional)
                            </label>
                            <button
                                type="button"
                                onClick={addLink}
                                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                            >
                                + Add Link
                            </button>
                        </div>
                        {links.map((link, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Label"
                                    value={link.label}
                                    onChange={(e) => updateLink(index, 'label', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="url"
                                    placeholder="URL"
                                    value={link.url}
                                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeLink(index)}
                                    className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
}
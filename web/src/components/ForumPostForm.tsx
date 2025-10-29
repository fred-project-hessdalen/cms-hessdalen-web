"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import RichTextEditor from "./RichTextEditor";

interface ForumPostType {
    _id: string;
    title: string;
    description?: string;
}

interface ForumPostFormProps {
    postTypes: ForumPostType[];
    personId: string | null;
}

export default function ForumPostForm({ postTypes, personId }: ForumPostFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        postType: "",
        body: "",
        links: [{ label: "", url: "" }],
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!personId) {
            setError("You must have a person profile to create a forum post.");
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("title", formData.title);
            formDataToSend.append("body", formData.body);
            formDataToSend.append("authorId", personId);

            if (formData.postType) {
                formDataToSend.append("postType", formData.postType);
            }

            if (imageFile) {
                formDataToSend.append("image", imageFile);
            }

            // Only add non-empty links
            const validLinks = formData.links.filter(link => link.label && link.url);
            if (validLinks.length > 0) {
                formDataToSend.append("links", JSON.stringify(validLinks));
            }

            const response = await fetch("/api/forum-post", {
                method: "POST",
                body: formDataToSend,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create forum post");
            }

            const data = await response.json();
            router.push(`/forum/${data.slug}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setIsSubmitting(false);
        }
    };

    const addLink = () => {
        setFormData({
            ...formData,
            links: [...formData.links, { label: "", url: "" }],
        });
    };

    const removeLink = (index: number) => {
        setFormData({
            ...formData,
            links: formData.links.filter((_, i) => i !== index),
        });
    };

    const updateLink = (index: number, field: "label" | "url", value: string) => {
        const newLinks = [...formData.links];
        newLinks[index][field] = value;
        setFormData({ ...formData, links: newLinks });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                </label>
                <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your post title"
                />
            </div>

            {/* Post Type */}
            <div>
                <label htmlFor="postType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Post Type (optional)
                </label>
                <select
                    id="postType"
                    value={formData.postType}
                    onChange={(e) => setFormData({ ...formData, postType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                    <option value="">Select a post type...</option>
                    {postTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                            {type.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Body */}
            <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Body *
                </label>
                <RichTextEditor
                    value={formData.body}
                    onChange={(value) => setFormData({ ...formData, body: value })}
                    placeholder="Write your post content here..."
                    className="w-full"
                />
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image (optional)
                </label>
                {imagePreview ? (
                    <div className="space-y-2">
                        <div className="relative w-full max-w-md h-64">
                            <Image
                                src={imagePreview}
                                alt="Preview"
                                fill
                                className="object-cover rounded-md border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={removeImage}
                            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                            Remove Image
                        </button>
                    </div>
                ) : (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100
              dark:file:bg-indigo-900 dark:file:text-indigo-300"
                    />
                )}
            </div>

            {/* Links */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Links (optional)
                </label>
                {formData.links.map((link, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="Label"
                            value={link.label}
                            onChange={(e) => updateLink(index, "label", e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                            type="url"
                            placeholder="URL"
                            value={link.url}
                            onChange={(e) => updateLink(index, "url", e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                        {formData.links.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeLink(index)}
                                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addLink}
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                    + Add Link
                </button>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-md transition-colors"
                >
                    {isSubmitting ? "Creating..." : "Create Forum Post"}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

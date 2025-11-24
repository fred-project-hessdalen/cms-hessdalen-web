// Helper function to extract YouTube video ID from various URL formats
export function getYouTubeVideoId(url: string): string | null {
    if (!url) return null;

    // Handle youtube.com/watch?v= format
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (watchMatch) return watchMatch[1];

    // Handle youtube.com/shorts/ format
    const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&\s]+)/);
    if (shortsMatch) return shortsMatch[1];

    // Handle youtube.com/embed/ format
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&\s]+)/);
    if (embedMatch) return embedMatch[1];

    // Handle youtube.com/v/ format
    const vMatch = url.match(/youtube\.com\/v\/([^?&\s]+)/);
    if (vMatch) return vMatch[1];

    return null;
}

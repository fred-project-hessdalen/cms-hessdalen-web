'use client';

import React from 'react';

interface CustomHtmlEmbedBlockProps {
  html: string;
  caption?: string;
}

export function CustomHtmlEmbedBlock({ html, caption }: CustomHtmlEmbedBlockProps) {
  if (!html) {
    return null;
  }

  return (
    <div className="not-prose relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Custom HTML Container */}
        <div className="rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800">
          <div 
            className="custom-html-embed w-full [&_iframe]:w-full [&_iframe]:border-none [&_iframe]:rounded-xl [&_iframe]:bg-white [&_iframe]:dark:bg-gray-800"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
        
        {/* Optional Caption */}
        {caption && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center italic">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
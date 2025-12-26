'use client';

import React from 'react';

interface KofiEmbedBlockProps {
  username: string;
  widgetType?: 'button' | 'floating' | 'panel';
  text?: string;
  color?: 'blue' | 'red' | 'orange' | 'pink' | 'white' | 'black';
  caption?: string;
}

export function KofiEmbedBlock({ 
  username, 
  widgetType = 'button', 
  text, 
  color = 'blue',
  caption 
}: KofiEmbedBlockProps) {
  if (!username) {
    return null;
  }

  // Generate Ko-fi widget HTML based on type
  const generateKofiWidget = () => {
    const cleanUsername = username.replace('@', ''); // Remove @ if present
    const buttonText = text || `Support ${cleanUsername}`;
    
    switch (widgetType) {
      case 'floating':
        return `<script type='text/javascript' src='https://storage.ko-fi.com/cdn/widget/Widget_2.js'></script><script type='text/javascript'>kofiwidget2.init('${buttonText}', '${color}', '${cleanUsername}');kofiwidget2.draw();</script>`;
      
      case 'panel':
        return `<iframe id='kofiframe' src='https://ko-fi.com/${cleanUsername}/?hidefeed=true&widget=true&embed=true&preview=true' style='border:none;width:100%;height:900px;background:transparent;' title='${cleanUsername}'></iframe>`;
      
      case 'button':
      default:
        return `<script type='text/javascript' src='https://storage.ko-fi.com/cdn/widget/Widget_2.js'></script><script type='text/javascript'>kofiwidget2.init('${buttonText}', '${color}', '${cleanUsername}');kofiwidget2.draw();</script>`;
    }
  };

  const widgetHtml = generateKofiWidget();

  return (
    <div className="not-prose relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Ko-fi Widget Container */}
        <div className="rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800">
          <div 
            className="ko-fi-widget w-full [&_iframe]:w-full [&_iframe]:border-none [&_iframe]:rounded-xl"
            dangerouslySetInnerHTML={{ __html: widgetHtml }}
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
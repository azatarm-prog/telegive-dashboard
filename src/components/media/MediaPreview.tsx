import React from 'react';
import { Play, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MediaPreviewProps {
  url: string;
  type: string;
  filename?: string;
  className?: string;
  showControls?: boolean;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({
  url,
  type,
  filename,
  className,
  showControls = true,
}) => {
  const isImage = type.startsWith('image/');
  const isVideo = type.startsWith('video/');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'media-file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(url, '_blank');
  };

  return (
    <div className={cn('relative group', className)}>
      {isImage && (
        <div className="relative">
          <img
            src={url}
            alt={filename || 'Media preview'}
            className="w-full h-auto rounded-lg shadow-md"
            loading="lazy"
          />
          {showControls && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleOpenInNewTab}
                  className="bg-white/90 hover:bg-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownload}
                  className="bg-white/90 hover:bg-white"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {isVideo && (
        <div className="relative">
          <video
            src={url}
            controls
            className="w-full h-auto rounded-lg shadow-md"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
          {showControls && (
            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleOpenInNewTab}
                className="bg-white/90 hover:bg-white"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownload}
                className="bg-white/90 hover:bg-white"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {!isImage && !isVideo && (
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <Play className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              {filename || 'Media file'}
            </p>
            {showControls && (
              <div className="mt-4 flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenInNewTab}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPreview;


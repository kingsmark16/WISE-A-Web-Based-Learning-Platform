import React, { memo, useCallback } from 'react';
import { ExternalLink, Loader2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Individual link item component - memoized for performance
 */
const LinkItem = memo(({ link, index, onOpenLink }) => {
  const handleClick = useCallback(() => {
    if (link?.url) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
      if (typeof onOpenLink === 'function') {
        onOpenLink(link);
      }
    }
  }, [link, onOpenLink]);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-input bg-card hover:bg-accent/50 transition-colors group">
      {/* Link Number */}
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">{index + 1}</span>
      </div>

      {/* Link Icon */}
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400">
          <LinkIcon className="h-5 w-5" />
        </div>
      </div>

      {/* Link Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {link?.title || 'Untitled Link'}
            </h4>
            {link?.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {link.description}
              </p>
            )}
            {link?.url && (
              <p className="text-xs text-blue-600 dark:text-blue-400 line-clamp-1 mt-1 break-all hover:underline">
                {new URL(link.url).hostname}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Open Link Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleClick}
        className="flex-shrink-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
        title="Open link in new tab"
      >
        <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
  );
});

LinkItem.displayName = 'LinkItem';

/**
 * Links list container - memoized
 */
const StudentLinksList = memo(({ links = [], isLoading = false, onOpenLink }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading links...
      </div>
    );
  }

  if (!links || links.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        <LinkIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No additional links available in this module.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <LinkIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-foreground">
          Additional Links ({links.length})
        </h3>
      </div>
      <div className="space-y-2">
        {links.map((link, index) => (
          <LinkItem
            key={link.id}
            link={link}
            index={index}
            onOpenLink={onOpenLink}
          />
        ))}
      </div>
    </div>
  );
});

StudentLinksList.displayName = 'StudentLinksList';

export default StudentLinksList;

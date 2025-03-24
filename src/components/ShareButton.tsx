
import * as React from 'react';
import { Share, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { HierarchyNode, PeopleData } from '@/types';
import { generateShareId, saveSharedData, encodeDataForSharing, saveSharedDataToServer } from '@/utils/shareUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ShareButtonProps {
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
}

const ShareButton: React.FC<ShareButtonProps> = ({ organizationData, peopleData }) => {
  const [isSharing, setIsSharing] = React.useState(false);
  const [shareId, setShareId] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const copyTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      if (copyTimeout.current) {
        clearTimeout(copyTimeout.current);
      }
      
      copyTimeout.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      return true;
    } catch (error) {
      console.error("Failed to copy text:", error);
      return false;
    }
  };

  const handleShareOrganization = async () => {
    if (!organizationData) {
      toast.error("No organization data to share");
      return;
    }
    
    try {
      setIsSharing(true);
      
      // Create a share name
      const shareName = `Organization Structure ${new Date().toLocaleDateString()}`;
      
      // Generate a unique ID
      const shareId = generateShareId();
      setShareId(shareId);
      
      // Save to server first
      try {
        await saveSharedDataToServer(shareId, organizationData, peopleData, shareName);
        console.log("Data saved successfully to server with ID:", shareId);
      } catch (serverError) {
        console.error("Error saving to server:", serverError);
        toast.error("Could not save share data to server", {
          description: "Falling back to local storage only, which may not be accessible across different browsers."
        });
        
        // Try local storage as fallback
        try {
          saveSharedData(shareId, organizationData, peopleData, shareName);
          console.log("Data saved to local storage as fallback with ID:", shareId);
        } catch (storageError) {
          console.error("Error saving to localStorage:", storageError);
          toast.error("Could not save share data locally", {
            description: "The data might not persist if you close your browser."
          });
        }
      }
      
      // Create the ID-based URL
      const idBasedUrl = `${window.location.origin}/shared/${shareId}`;
      
      // Always use the ID-based URL now that we have server storage
      let shareUrl = idBasedUrl;
      
      // Copy the URL to clipboard
      const copied = await copyToClipboard(shareUrl);
      
      if (copied) {
        toast.success("Share link copied to clipboard!", {
          description: (
            <div className="space-y-2">
              <p>Your link is now saved on our server and can be accessed from any browser.</p>
              <p className="text-xs text-muted-foreground">Share ID: {shareId}</p>
              <div className="flex gap-2 mt-1">
                <Button size="sm" variant="outline" onClick={() => window.open(shareUrl, "_blank")} className="h-7 text-xs">
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Open Link
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(shareUrl)} className="h-7 text-xs">
                  <Copy className="mr-1 h-3 w-3" />
                  Copy Again
                </Button>
              </div>
            </div>
          ),
        });
      } else {
        toast.info("Share link created", {
          description: (
            <div className="space-y-2">
              <p>Copy this link manually to share with others:</p>
              <code className="block p-2 bg-muted rounded text-xs overflow-x-auto">{shareUrl}</code>
              <p className="text-xs text-muted-foreground">Share ID: {shareId}</p>
            </div>
          ),
        });
      }
      
      console.log("Generated share URL:", shareUrl);
      
    } catch (error) {
      console.error("Error sharing organization:", error);
      toast.error("Failed to create share link", {
        description: "There was an error creating the share link. Please try again.",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <Button 
        variant="default" 
        size="sm" 
        onClick={handleShareOrganization} 
        className="flex items-center gap-2"
        disabled={!organizationData || isSharing}
      >
        {isSharing ? (
          <span className="w-4 h-4 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
        ) : (
          <Share className="h-4 w-4" />
        )}
        <span>{isSharing ? 'Creating link...' : 'Share Organization'}</span>
      </Button>
    </>
  );
};

export default ShareButton;

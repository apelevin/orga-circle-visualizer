
import * as React from 'react';
import { Share } from 'lucide-react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { HierarchyNode, PeopleData } from '@/types';
import { generateShareId, saveSharedData, encodeDataForSharing } from '@/utils/shareUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ShareButtonProps {
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
}

const ShareButton: React.FC<ShareButtonProps> = ({ organizationData, peopleData }) => {
  const [isSharing, setIsSharing] = React.useState(false);

  const handleShareOrganization = async () => {
    if (!organizationData) {
      toast.error("No organization data to share");
      return;
    }
    
    try {
      setIsSharing(true);
      
      // Create a share name
      const shareName = `Organization Structure ${new Date().toLocaleDateString()}`;
      
      // ALWAYS use the ID-based approach first (most reliable)
      const shareId = generateShareId();
      
      // Save to localStorage with a try-catch to handle storage errors
      try {
        saveSharedData(shareId, organizationData, peopleData, shareName);
        console.log("Data saved successfully with ID:", shareId);
      } catch (storageError) {
        console.error("Error saving to localStorage:", storageError);
        toast.error("Could not save share data locally", {
          description: "The data might not persist if you close your browser."
        });
      }
      
      // Create the ID-based URL (this always works)
      const idBasedUrl = `${window.location.origin}/shared/${shareId}`;
      
      // Always use the ID-based URL for large datasets
      let shareUrl = idBasedUrl;
      
      // For smaller datasets, try the URL parameter approach too
      try {
        // Check if the stringified data is manageable for a URL parameter
        const dataSize = JSON.stringify({
          org: organizationData,
          people: peopleData
        }).length;
        
        // Only use URL parameter for reasonably sized data (< 10KB)
        // This is much more conservative than before to avoid 400 Bad Request errors
        if (dataSize < 10000) {
          const encodedData = encodeDataForSharing(organizationData, peopleData, shareName);
          // Make sure the encoded URL param isn't too long
          if (encodedData.length < 1500) {
            shareUrl = `${window.location.origin}/shared?data=${encodedData}`;
            console.log("Using URL parameter sharing, data size:", dataSize);
          } else {
            console.log("Encoded data too long for URL, using ID-based approach instead:", encodedData.length);
          }
        } else {
          console.log("Data too large for URL parameter sharing, using ID-based approach instead:", dataSize);
        }
      } catch (encodeError) {
        console.error("Error encoding data for URL:", encodeError);
        // Already using ID-based URL if encoding fails
      }
      
      // Copy the URL to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied to clipboard!", {
          description: "You can now share this link with others.",
          action: {
            label: "View Link",
            onClick: () => window.open(shareUrl, "_blank"),
          },
        });
      } catch (clipboardErr) {
        console.error("Failed to copy link: ", clipboardErr);
        toast.info("Share link created", {
          description: "Copy this link manually to share with others: " + shareUrl,
        });
      }
      
      console.log("Generated share URLs:", {
        primaryUrl: shareUrl,
        fallbackUrl: idBasedUrl
      });
      
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

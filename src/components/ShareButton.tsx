
import * as React from 'react';
import { Share } from 'lucide-react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { HierarchyNode, PeopleData } from '@/types';
import { generateShareId, saveSharedData, encodeDataForSharing } from '@/utils/shareUtils';

interface ShareButtonProps {
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
}

const ShareButton: React.FC<ShareButtonProps> = ({ organizationData, peopleData }) => {
  const handleShareOrganization = () => {
    if (!organizationData) {
      toast.error("No organization data to share");
      return;
    }
    
    try {
      // Create a share name
      const shareName = `Organization Structure ${new Date().toLocaleDateString()}`;
      
      // Always generate a share ID and save to localStorage first (reliable method)
      const shareId = generateShareId();
      saveSharedData(shareId, organizationData, peopleData, shareName);
      
      // Create the ID-based URL (this always works)
      const idBasedUrl = `${window.location.origin}/shared/${shareId}`;
      
      // Try the URL parameter approach as well if the data isn't too large
      let shareUrl = idBasedUrl;
      try {
        // First check if the stringified data is manageable for a URL parameter
        const dataSize = JSON.stringify({
          org: organizationData,
          people: peopleData
        }).length;
        
        // Only use URL parameter for reasonably sized data (< 50KB)
        if (dataSize < 50000) {
          const encodedData = encodeDataForSharing(organizationData, peopleData, shareName);
          shareUrl = `${window.location.origin}/shared?data=${encodedData}`;
          console.log("Using URL parameter sharing, data size:", dataSize);
        } else {
          console.log("Data too large for URL parameter sharing, using ID-based approach instead:", dataSize);
        }
      } catch (encodeError) {
        console.error("Error encoding data for URL:", encodeError);
        // Fallback to ID-based URL if encoding fails
        shareUrl = idBasedUrl;
      }
      
      // Copy the URL to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success("Share link copied to clipboard!", {
          description: "You can now share this link with others.",
          action: {
            label: "View Link",
            onClick: () => window.open(shareUrl, "_blank"),
          },
        });
      }).catch(err => {
        console.error("Failed to copy link: ", err);
        toast.info("Share link created", {
          description: "Copy this link manually to share with others: " + shareUrl,
        });
      });
      
      console.log("Generated share URLs:", {
        primaryUrl: shareUrl,
        fallbackUrl: idBasedUrl
      });
      
    } catch (error) {
      console.error("Error sharing organization:", error);
      toast.error("Failed to create share link", {
        description: "There was an error creating the share link. Please try again.",
      });
    }
  };

  return (
    <Button 
      variant="default" 
      size="sm" 
      onClick={handleShareOrganization} 
      className="flex items-center gap-2"
      disabled={!organizationData}
    >
      <Share className="h-4 w-4" />
      <span>Share Organization</span>
    </Button>
  );
};

export default ShareButton;

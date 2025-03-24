
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
      
      // First, try the URL-based sharing approach
      const encodedData = encodeDataForSharing(organizationData, peopleData, shareName);
      
      // Generate the share URL with the data as a URL parameter
      const shareUrl = `${window.location.origin}/shared?data=${encodedData}`;
      
      // Also save to localStorage as a fallback
      const shareId = generateShareId();
      saveSharedData(shareId, organizationData, peopleData, shareName);
      
      // Create a fallback URL that uses the ID-based approach
      const fallbackUrl = `${window.location.origin}/shared/${shareId}`;
      
      // Copy the URL parameter based sharing to clipboard
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
        fallbackUrl: fallbackUrl
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

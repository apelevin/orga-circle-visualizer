
import React, { useState } from 'react';
import { HierarchyNode, PeopleData } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { FileSpreadsheet, Link, Share2 } from 'lucide-react';
import { generateShareableId, storeSharedData } from '@/utils/excelParser';
import FileUpload from '@/components/FileUpload';

interface AdminZoneProps {
  onFileProcessed: (data: HierarchyNode) => void;
  onPeopleFileProcessed: (data: PeopleData[]) => void;
  organizationData: HierarchyNode | null;
  peopleData: PeopleData[];
  isLoading: boolean;
}

const AdminZone: React.FC<AdminZoneProps> = ({
  onFileProcessed,
  onPeopleFileProcessed,
  organizationData,
  peopleData,
  isLoading,
}) => {
  const [shareableLink, setShareableLink] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const generateShareableLink = () => {
    if (!organizationData) {
      toast.error('Please upload organization data first');
      return;
    }

    const shareId = storeSharedData(organizationData, peopleData);
    const shareUrl = `${window.location.origin}/shared/${shareId}`;
    setShareableLink(shareUrl);
  };

  const copyToClipboard = () => {
    if (!shareableLink) {
      return;
    }

    navigator.clipboard.writeText(shareableLink).then(() => {
      setIsCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Admin Zone</h2>
        <p className="text-muted-foreground">Upload organization structure and generate shareable links</p>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Upload Files</h3>
        <FileUpload
          onFileProcessed={onFileProcessed}
          onPeopleFileProcessed={onPeopleFileProcessed}
          isLoading={isLoading}
          hasOrganizationData={!!organizationData}
          hasPeopleData={peopleData.length > 0}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Share Organization</h3>
        <p className="text-sm text-muted-foreground">
          Generate a shareable link to your organization structure that can be viewed by anyone with the link.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={generateShareableLink}
            disabled={!organizationData}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Generate Shareable Link
          </Button>

          {shareableLink && (
            <div className="flex-1 flex gap-2">
              <Input
                value={shareableLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="secondary"
                size="icon"
                onClick={copyToClipboard}
                className={isCopied ? "bg-green-100" : ""}
                title="Copy to clipboard"
              >
                <Link className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminZone;

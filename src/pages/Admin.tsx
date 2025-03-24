
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { parseExcelFile, processExcelData, processPeopleData, transformToHierarchy } from "@/utils/excelParser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { Copy, Globe, Share2, Trash2, ArrowLeft } from "lucide-react";
import { Circle, ExcelData, HierarchyNode, PeopleData } from "@/types";
import { generateShareId, saveSharedData, getAllSharedData, deleteSharedData } from "@/utils/shareUtils";

const Admin = () => {
  const [orgFile, setOrgFile] = useState<File | null>(null);
  const [peopleFile, setPeopleFile] = useState<File | null>(null);
  const [organizationData, setOrganizationData] = useState<HierarchyNode | null>(null);
  const [peopleData, setPeopleData] = useState<PeopleData[]>([]);
  const [orgName, setOrgName] = useState<string>("");
  const [sharedData, setSharedData] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load all shared data on component mount
    loadSharedData();
  }, []);

  const loadSharedData = () => {
    const data = getAllSharedData();
    setSharedData(data);
  };

  const handleOrgFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setOrgFile(event.target.files[0]);
    }
  };

  const handlePeopleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPeopleFile(event.target.files[0]);
    }
  };

  const processFiles = async () => {
    if (!orgFile) {
      toast.error("Please select an organization structure file");
      return;
    }

    if (!orgName.trim()) {
      toast.error("Please enter an organization name");
      return;
    }

    setIsProcessing(true);

    try {
      // Process organization data
      const orgData = await parseExcelFile(orgFile);
      const circles = processExcelData(orgData);
      const hierarchyData = transformToHierarchy(circles);
      setOrganizationData(hierarchyData);

      // Process people data if available
      if (peopleFile) {
        const people = await parseExcelFile(peopleFile, true);
        const processedPeopleData = processPeopleData(people);
        setPeopleData(processedPeopleData);
      } else {
        setPeopleData([]);
      }

      toast.success("Files processed successfully!");
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Error processing files. Please check the format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = () => {
    if (!organizationData) {
      toast.error("Please process organization data first");
      return;
    }

    const shareId = generateShareId();
    saveSharedData(shareId, organizationData, peopleData, orgName);
    loadSharedData();
    toast.success("Shareable link generated!");
  };

  const handleDelete = (id: string) => {
    deleteSharedData(id);
    loadSharedData();
    toast.success("Shared link deleted");
  };

  const copyToClipboard = (id: string) => {
    const shareableLink = `${window.location.origin}/shared/${id}`;
    navigator.clipboard.writeText(shareableLink);
    toast.success("Link copied to clipboard!");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Upload organization data and create shareable links</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload Organization Data</CardTitle>
              <CardDescription>Upload Excel files with organization structure information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Organization Name</label>
                <Input 
                  type="text" 
                  placeholder="Enter organization name" 
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Organization Structure File (Required)</label>
                <Input 
                  type="file" 
                  accept=".xlsx,.xls" 
                  onChange={handleOrgFileChange}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Excel file with columns: Circle Name, Role, FTE
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">People Data File (Optional)</label>
                <Input 
                  type="file" 
                  accept=".xlsx,.xls" 
                  onChange={handlePeopleFileChange}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Excel file with columns: Circle Name, Role Name, Person Name, FTE
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                onClick={processFiles} 
                disabled={isProcessing || !orgFile || !orgName.trim()}
                className="flex-1"
              >
                {isProcessing ? "Processing..." : "Process Files"}
              </Button>
              
              <Button 
                onClick={handleShare} 
                disabled={!organizationData || isProcessing}
                variant="secondary"
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Generate Shareable Link
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shareable Links</CardTitle>
              <CardDescription>Manage your organization's shareable views</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(sharedData).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(sharedData).map(([id, data]) => (
                      <TableRow key={id}>
                        <TableCell className="font-medium">{data.name}</TableCell>
                        <TableCell>{formatDate(data.timestamp)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => copyToClipboard(id)}
                              title="Copy link"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              asChild
                              title="Open link"
                            >
                              <Link to={`/shared/${id}`} target="_blank">
                                <Globe className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(id)}
                              title="Delete link"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Share2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No shareable links created yet</p>
                  <p className="text-sm text-muted-foreground">Process files and generate a shareable link to see it here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;

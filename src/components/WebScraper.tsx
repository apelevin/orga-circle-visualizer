
import React, { useState } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Globe } from 'lucide-react';
import { HierarchyNode, PeopleData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface WebScraperProps {
  onOrganizationDataParsed: (data: HierarchyNode) => void;
  onPeopleDataParsed: (data: PeopleData[]) => void;
  isLoading: boolean;
}

const WebScraper: React.FC<WebScraperProps> = ({ 
  onOrganizationDataParsed,
  onPeopleDataParsed,
  isLoading
}) => {
  const [url, setUrl] = useState('');
  const [scrapingInProgress, setScrapingInProgress] = useState(false);

  const parseWebPageData = async () => {
    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    setScrapingInProgress(true);
    
    try {
      // Validate URL format
      try {
        new URL(url);
      } catch (e) {
        toast.error('Please enter a valid URL with http:// or https://');
        setScrapingInProgress(false);
        return;
      }

      toast.info('Parsing web page, this may take a moment...', { duration: 5000 });
      
      // Fetch the web page content
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch the page: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Create a DOM parser to work with the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Find tables in the document
      const tables = doc.querySelectorAll('table');
      
      if (tables.length === 0) {
        toast.error('No tables found on the page. Please try a different URL.');
        return;
      }
      
      // Process organization structure table
      // We'll assume the first table contains organization data
      const organizationTable = tables[0];
      const orgData = processOrganizationTable(organizationTable);
      
      if (!orgData || !orgData.length) {
        toast.error('Could not extract valid organization data from the table');
        return;
      }
      
      // Process people assignments if there's a second table
      let peopleData: PeopleData[] = [];
      if (tables.length > 1) {
        peopleData = processPeopleTable(tables[1]);
      }
      
      // Transform to the format needed by the application
      const { circles, hierarchy } = transformTableData(orgData);
      
      console.log('Parsed organization data:', circles);
      console.log('Transformed hierarchy:', hierarchy);
      console.log('Parsed people data:', peopleData);
      
      if (!hierarchy.children || hierarchy.children.length === 0) {
        toast.error('Failed to create a valid organization hierarchy from the parsed data');
        return;
      }
      
      // Update application state with the parsed data
      onOrganizationDataParsed(hierarchy);
      
      if (peopleData.length > 0) {
        onPeopleDataParsed(peopleData);
        toast.success(`Parsed organization structure with ${peopleData.length} people assignments`);
      } else {
        toast.success('Parsed organization structure successfully');
      }
      
    } catch (error) {
      console.error('Error parsing web page:', error);
      toast.error('Error parsing the web page. Please try a different URL or check console for details.');
    } finally {
      setScrapingInProgress(false);
    }
  };
  
  // Process the organization table to extract Circle, Role, FTE data
  const processOrganizationTable = (table: HTMLTableElement): { circle: string, role: string, fte: number }[] => {
    const rows = Array.from(table.querySelectorAll('tr'));
    const result: { circle: string, role: string, fte: number }[] = [];
    
    // Skip header row if present
    const dataRows = rows.slice(1);
    
    for (const row of dataRows) {
      const cells = Array.from(row.querySelectorAll('td, th'));
      if (cells.length >= 3) {
        const circle = cells[0].textContent?.trim() || '';
        const role = cells[1].textContent?.trim() || '';
        const fteText = cells[2].textContent?.trim() || '0';
        
        // Convert FTE to number
        const fte = parseFloat(fteText.replace(',', '.')) || 0;
        
        if (circle && role) {
          result.push({ circle, role, fte });
        }
      }
    }
    
    return result;
  };
  
  // Process the people table to extract Circle, Role, Person, FTE data
  const processPeopleTable = (table: HTMLTableElement): PeopleData[] => {
    const rows = Array.from(table.querySelectorAll('tr'));
    const result: PeopleData[] = [];
    
    // Skip header row if present
    const dataRows = rows.slice(1);
    
    for (const row of dataRows) {
      const cells = Array.from(row.querySelectorAll('td, th'));
      if (cells.length >= 4) {
        const circleName = cells[0].textContent?.trim() || '';
        const roleName = cells[1].textContent?.trim() || '';
        const personName = cells[2].textContent?.trim() || '';
        const fteText = cells[3].textContent?.trim() || '0';
        
        // Convert FTE to number
        const fte = parseFloat(fteText.replace(',', '.')) || 0;
        
        if (circleName && roleName && personName) {
          result.push({ circleName, roleName, personName, fte });
        }
      }
    }
    
    return result;
  };
  
  // Transform the extracted data into the hierarchical structure needed by the app
  const transformTableData = (data: { circle: string, role: string, fte: number }[]) => {
    // Group by circle
    const circleMap = new Map<string, { roles: { name: string, fte: number }[], totalFTE: number }>();
    
    data.forEach(item => {
      if (!circleMap.has(item.circle)) {
        circleMap.set(item.circle, { roles: [], totalFTE: 0 });
      }
      
      const circle = circleMap.get(item.circle)!;
      circle.roles.push({ name: item.role, fte: item.fte });
      circle.totalFTE += item.fte;
    });
    
    // Convert to circles array
    const circles = Array.from(circleMap.entries()).map(([name, data]) => ({
      name,
      roles: data.roles,
      totalFTE: data.totalFTE
    }));
    
    // Create hierarchy structure
    const hierarchy: HierarchyNode = {
      name: "Organization",
      children: circles.map(circle => ({
        name: circle.name,
        value: circle.totalFTE,
        children: circle.roles.map(role => ({
          name: role.name,
          value: role.fte
        }))
      }))
    };
    
    return { circles, hierarchy };
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Web Page Parser
        </CardTitle>
        <CardDescription>
          Extract organization structure from a web page with tables
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter URL of the page with organization tables"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={scrapingInProgress || isLoading}
              className="flex-1"
            />
            <Button 
              onClick={parseWebPageData} 
              disabled={scrapingInProgress || isLoading || !url.trim()}
            >
              {scrapingInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing
                </>
              ) : (
                'Parse'
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            The page should contain tables with Circle, Role, and FTE data (first 3 columns)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebScraper;

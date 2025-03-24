
import React, { useCallback } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload, Users } from 'lucide-react';
import { HierarchyNode, PeopleData } from '@/types';

interface FileUploadProps {
  onFileProcessed: (data: HierarchyNode) => void;
  onPeopleFileProcessed: (data: PeopleData[]) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, onPeopleFileProcessed, isLoading }) => {
  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        toast.error('Please upload an Excel file (.xlsx or .xls)');
        return;
      }

      try {
        // Dynamically import the Excel parser to reduce initial load time
        const { parseExcelFile, processExcelData, transformToHierarchy } = await import('@/utils/excelParser');
        
        const excelData = await parseExcelFile(file);
        console.log('Excel data parsed:', excelData);
        
        if (!excelData || excelData.length === 0) {
          toast.error('No data found in the Excel file');
          return;
        }
        
        // We no longer check for specific column names, as we'll use positional columns
        
        const circles = processExcelData(excelData);
        console.log('Processed circles:', circles);
        
        const hierarchy = transformToHierarchy(circles);
        console.log('Hierarchy data:', hierarchy);
        
        // Check if hierarchy has children
        if (!hierarchy.children || hierarchy.children.length === 0) {
          toast.error('No valid organizational data found in the Excel file');
          return;
        }
        
        onFileProcessed(hierarchy);
        toast.success('Organization file processed successfully');
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error('Error processing file. Please check the format and try again.');
      } finally {
        // Reset the input value to allow uploading the same file again
        event.target.value = '';
      }
    },
    [onFileProcessed]
  );

  const handlePeopleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        toast.error('Please upload an Excel file (.xlsx or .xls)');
        return;
      }

      try {
        // Dynamically import the Excel parser to reduce initial load time
        const { parseExcelFile, processPeopleData } = await import('@/utils/excelParser');
        
        const excelData = await parseExcelFile(file, true); // true to indicate this is people data
        console.log('People Excel data parsed:', excelData);
        
        if (!excelData || excelData.length === 0) {
          toast.error('No data found in the Excel file');
          return;
        }
        
        const peopleData = processPeopleData(excelData);
        console.log('Processed people data:', peopleData);
        
        if (peopleData.length === 0) {
          toast.error('No valid people data found in the Excel file');
          return;
        }
        
        onPeopleFileProcessed(peopleData);
        toast.success('People data processed successfully');
      } catch (error) {
        console.error('Error processing people file:', error);
        toast.error('Error processing file. Please check the format and try again.');
      } finally {
        // Reset the input value to allow uploading the same file again
        event.target.value = '';
      }
    },
    [onPeopleFileProcessed]
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Button 
          className="relative overflow-hidden transition-all duration-300 px-6"
          size="lg"
          disabled={isLoading}
        >
          <span className="flex items-center gap-2">
            {isLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload Organization Structure
          </span>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isLoading}
          />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
        <FileSpreadsheet className="h-3.5 w-3.5" />
        <span>Excel files with circle, role, and FTE data (first 3 columns)</span>
      </p>

      <div className="relative group mt-2">
        <Button 
          className="relative overflow-hidden transition-all duration-300 px-6"
          size="lg"
          variant="outline"
          disabled={isLoading}
        >
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Upload People Assignments
          </span>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handlePeopleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isLoading}
          />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
        <FileSpreadsheet className="h-3.5 w-3.5" />
        <span>Excel files with circle, role, person, and FTE data (first 4 columns)</span>
      </p>
    </div>
  );
};

export default FileUpload;

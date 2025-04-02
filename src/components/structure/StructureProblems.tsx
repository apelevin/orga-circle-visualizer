
import React, { useMemo, useState } from 'react';
import { HierarchyNode, PeopleData } from '@/types';
import { analyzeStructure, StructureProblem } from '@/utils/structureAnalysis';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { CircleAlert } from 'lucide-react';
import StructureStats from './StructureStats';
import ProblemsTable from './ProblemsTable';
import type { StructureProblemsProps } from './types';
import EditFTEDialog from '../EditFTEDialog';
import { toast } from 'sonner';

const StructureProblems: React.FC<StructureProblemsProps> = ({ 
  organizationData, 
  peopleData,
  onCircleClick,
  onPersonClick,
  onUpdatePerson,
}) => {
  const problems = analyzeStructure(organizationData, peopleData);
  const [normalizeDialog, setNormalizeDialog] = useState<{
    isOpen: boolean;
    person: string;
    currentFTE: number;
  }>({
    isOpen: false,
    person: '',
    currentFTE: 0
  });
  
  const problemStats = useMemo(() => {
    const stats = {
      'person-low-fte': 0,
      'person-high-fte': 0,
      'circle-low-fte': 0,
      'circle-high-fte': 0,
      'circle-single-role': 0,
      'circle-zero-fte': 0,
      'role-unassigned': 0,
      total: 0
    };
    
    problems.forEach(problem => {
      stats[problem.type]++;
      stats.total++;
    });
    
    return stats;
  }, [problems]);
  
  const handleItemClick = (problem: StructureProblem) => {
    if ((problem.type === 'person-low-fte' || problem.type === 'person-high-fte') && onPersonClick) {
      onPersonClick(problem.name);
    } else if (
      ['circle-low-fte', 'circle-high-fte', 'circle-single-role', 'circle-zero-fte'].includes(problem.type) && 
      onCircleClick
    ) {
      onCircleClick(problem.name);
    } else if (problem.type === 'role-unassigned' && onCircleClick) {
      const match = problem.details.match(/in\s+(.+)$/);
      if (match && match[1]) {
        onCircleClick(match[1]);
      }
    }
  };

  const handleNormalize = (problem: StructureProblem) => {
    if ((problem.type === 'person-low-fte' || problem.type === 'person-high-fte') && onUpdatePerson) {
      // Get current FTE from the details string
      const match = problem.details.match(/FTE:\s+([\d.]+)/);
      if (match && match[1]) {
        const currentFTE = parseFloat(match[1]);
        setNormalizeDialog({
          isOpen: true,
          person: problem.name,
          currentFTE: currentFTE
        });
      }
    }
  };

  const handleSaveNormalization = (newFTE: number) => {
    if (onUpdatePerson && normalizeDialog.person) {
      // Update all roles for this person to distribute the FTE evenly
      const personRoles = peopleData.filter(p => p.personName === normalizeDialog.person);
      
      if (personRoles.length > 0) {
        // Calculate how to distribute 1.0 FTE across all roles
        const newRoleFTE = 1.0 / personRoles.length;
        
        personRoles.forEach(role => {
          onUpdatePerson(role.personName, role.roleName, role.circleName, newRoleFTE);
        });
        
        toast.success(`Normalized ${normalizeDialog.person}'s FTE to 1.0`);
      }
    }
  };

  if (!organizationData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please upload organization data to analyze structure problems</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleAlert className="h-5 w-5 text-red-500" />
            Structure Problems ({problems.length})
          </CardTitle>
          <CardDescription>
            Analysis of organizational structure issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {problems.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No structure problems detected!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your organization structure is well-balanced
              </p>
            </div>
          ) : (
            <>
              <StructureStats stats={problemStats} />
              <ProblemsTable 
                problems={problems}
                onItemClick={handleItemClick}
                onNormalize={onUpdatePerson ? handleNormalize : undefined}
              />
              
              {normalizeDialog.isOpen && (
                <EditFTEDialog
                  isOpen={normalizeDialog.isOpen}
                  onClose={() => setNormalizeDialog(prev => ({ ...prev, isOpen: false }))}
                  onSave={handleSaveNormalization}
                  title="Normalize FTE to 1.0"
                  description={`Distribute a total of 1.0 FTE across all of ${normalizeDialog.person}'s roles`}
                  currentFTE={1.0}
                  entityName={normalizeDialog.person}
                  entityType="person"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StructureProblems;

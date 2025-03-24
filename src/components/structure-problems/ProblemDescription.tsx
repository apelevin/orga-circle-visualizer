
import React from 'react';
import { StructureProblem } from '@/utils/structureAnalysis';

interface ProblemDescriptionProps {
  type: StructureProblem['type'];
}

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ type }) => {
  switch (type) {
    case 'person-low-fte':
      return <>Person with less than 1.0 FTE</>;
    case 'circle-low-fte':
      return <>Circle with insufficient assigned FTE</>;
    case 'circle-high-fte':
      return <>Circle exceeding 12 FTE (too large)</>;
    case 'circle-single-role':
      return <>Circle with only one role</>;
    case 'circle-zero-fte':
      return <>Circle with 0 FTE</>;
    default:
      return <>Unknown issue</>;
  }
};

export default ProblemDescription;

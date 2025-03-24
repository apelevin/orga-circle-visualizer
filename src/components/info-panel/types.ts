
import { PeopleData } from '@/types';

export interface SelectedCircle {
  name: string;
  value: number;
  roles?: { name: string; value: number }[];
  parent?: string;
  parentCircles?: string[];
  isRole?: boolean;
  type?: string;
}

export interface InfoPanelBaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface PeopleGroupProps {
  people: PeopleData[];
  onPersonClick?: (personName: string) => void;
}

export interface RoleGroupProps {
  roleName: string;
  people: PeopleData[];
  totalFTE: number;
  onPersonClick?: (personName: string) => void;
  onRoleClick?: (roleName: string) => void;
}

export interface CircleGroupProps {
  circleName: string;
  people: PeopleData[];
  totalFTE: number;
  onPersonClick?: (personName: string) => void;
  onCircleClick?: (circleName: string) => void;
}

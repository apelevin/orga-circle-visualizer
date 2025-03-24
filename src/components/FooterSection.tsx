
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FooterSection = () => {
  return (
    <footer className="py-4 border-t border-border/40 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <Button variant="outline" size="sm" asChild className="flex items-center gap-2">
            <Link to="/admin" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Admin Zone</span>
            </Link>
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Organization Circle Visualizer — Upload an Excel file to visualize your organization structure
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;

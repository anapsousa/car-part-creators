import { Card } from "@/components/ui/card";
import { Box } from "lucide-react";

interface Model3DViewerProps {
  modelUrl?: string;
  className?: string;
}

// Placeholder component - 3D viewer temporarily disabled due to React compatibility issues
export const Model3DViewer = ({ className }: Model3DViewerProps) => {
  return (
    <Card className={`bg-gradient-to-br from-card via-card to-primary/5 border-2 overflow-hidden ${className}`}>
      <div className="relative w-full h-[400px] md:h-[500px] flex flex-col items-center justify-center bg-muted/30">
        <Box className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground text-center">
          3D Preview
        </p>
        <p className="text-xs text-muted-foreground/60 mt-2">
          Interactive 3D viewer coming soon
        </p>
      </div>
    </Card>
  );
};

import { Box } from "lucide-react";

interface ModelViewerProps {
  modelUrl: string;
}

// Placeholder component - 3D viewer temporarily disabled due to React compatibility issues
const ModelViewer = ({ modelUrl }: ModelViewerProps) => {
  return (
    <div className="w-full h-[400px] bg-card rounded-lg border border-border/50 overflow-hidden relative flex flex-col items-center justify-center bg-muted/30">
      <Box className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground text-center">
        3D Model Preview
      </p>
      <p className="text-xs text-muted-foreground/60 mt-2">
        Interactive 3D viewer coming soon
      </p>
    </div>
  );
};

export default ModelViewer;
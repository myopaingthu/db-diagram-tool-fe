import { type FC } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  className?: string;
}

export const LoadingOverlay: FC<LoadingOverlayProps> = ({
  isLoading,
  text = "Loading...",
  className,
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-8" />
        {text && (
          <p className="text-sm font-medium text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  );
};


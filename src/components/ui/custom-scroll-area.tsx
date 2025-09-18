import * as React from "react";
import { cn } from "@/lib/utils";
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

interface CustomScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string | number;
  autoHide?: boolean;
  forceVisible?: boolean;
  scrollableNodeProps?: React.HTMLAttributes<HTMLDivElement>;
}

const CustomScrollArea = React.forwardRef<HTMLDivElement, CustomScrollAreaProps>(
  ({ className, children, maxHeight, autoHide = true, forceVisible = false, scrollableNodeProps, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn("relative overflow-hidden", className)} 
        {...props}
      >
        <SimpleBar
          autoHide={autoHide}
          forceVisible={forceVisible ? "y" : false}
          style={{ maxHeight: maxHeight }}
          scrollableNodeProps={{
            ...scrollableNodeProps,
            className: cn("custom-scrollbar", scrollableNodeProps?.className)
          }}
          className={cn(
            "[&_.simplebar-scrollbar]:!w-2",
            "[&_.simplebar-scrollbar]:!bg-transparent",
            "[&_.simplebar-track.simplebar-vertical]:!bg-transparent",
            "[&_.simplebar-track.simplebar-vertical]:!w-2",
            "[&_.simplebar-scrollbar:before]:!bg-border/30",
            "[&_.simplebar-scrollbar:before]:!rounded-full",
            "[&_.simplebar-scrollbar:before]:hover:!bg-border/50",
            "[&_.simplebar-scrollbar:before]:!transition-colors",
            "[&_.simplebar-scrollbar:before]:!duration-200",
            "dark:[&_.simplebar-scrollbar:before]:!bg-border/40",
            "dark:[&_.simplebar-scrollbar:before]:hover:!bg-border/60"
          )}
        >
          {children}
        </SimpleBar>
      </div>
    );
  }
);

CustomScrollArea.displayName = "CustomScrollArea";

export { CustomScrollArea };
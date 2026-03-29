import * as React from "react";
import { cn } from "@/lib/utils";

type InputGroupProps = React.ComponentProps<"div">;

type InputGroupAddonProps = React.ComponentProps<"div"> & {
  side?: "left" | "right";
};

function InputGroup({ className, ...props }: InputGroupProps) {
  return <div data-slot="input-group" className={cn("relative flex w-full items-center", className)} {...props} />;
}

function InputGroupAddon({ className, side = "left", ...props }: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn(
        "pointer-events-none absolute inset-y-0 z-10 flex items-center text-muted-foreground",
        side === "left" ? "left-2.5" : "right-2.5",
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon };
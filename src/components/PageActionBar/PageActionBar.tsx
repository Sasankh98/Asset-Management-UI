import { type ReactNode } from "react";

interface PageActionBarProps {
  children: ReactNode;
}

export default function PageActionBar({ children }: PageActionBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        margin: "1rem 0",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}

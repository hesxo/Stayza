import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const theme = "light"; // or "dark" or "system" as default

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)"
      }}
      {...props}
    />
  );
};

export { Toaster };
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";

export const DarkModeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div>
      <input
        type="checkbox"
        id="toggle"
        checked={theme === "light" ? false : true}
        className="toggle--checkbox"
        onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      <Label htmlFor="toggle" className="toggle--label float-right mr-2">
        <span className="toggle--label-background" />
      </Label>
    </div>
  );
};
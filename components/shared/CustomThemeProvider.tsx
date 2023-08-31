import React, { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

interface CustomThemeProviderProps {
  children: ReactNode;
}

const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({
  children,
}) => {
  return <ThemeProvider attribute="class">{children}</ThemeProvider>;
};

export default CustomThemeProvider;

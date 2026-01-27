import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 configuration
 *
 * Note: In Tailwind v4, most configuration is done via CSS.
 * This file is kept minimal for compatibility with tools that
 * need a JS config file. Theme customization is in globals.css.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  // ... your content paths ...
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'), // <--- ADD THIS LINE
  ],
};
export default config;
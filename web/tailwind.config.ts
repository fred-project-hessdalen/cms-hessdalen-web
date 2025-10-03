import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
    content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
    theme: { extend: {} },
    plugins: [typography],
} satisfies Config;

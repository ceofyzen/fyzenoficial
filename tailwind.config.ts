import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Você pode ajustar esses tons de roxo
        'brand-purple-dark': '#2E104E', // Roxo bem escuro do footer
        'brand-purple-medium': '#4A237E', // Roxo dos cards do footer
        'brand-purple-light': '#6D28D9', // Roxo principal para texto e ícones
        'brand-bg-light': '#F9F7FD', // Fundo levemente roxo/cinza
      },
    },
  },
  plugins: [],
};
export default config;
// Uso: npm run build:pages -- nome-do-repo   (sem argumento = domínio próprio ou usuario.github.io)
import { execSync } from "node:child_process";
import { copyFileSync } from "node:fs";

const repo = (process.argv[2] || "").replace(/^\/+|\/+$/g, "");
const base = repo ? `/${repo}/` : "/";
execSync(`npx vite build --base=${base}`, { stdio: "inherit" });
copyFileSync("dist/index.html", "dist/404.html"); // fallback do React Router no GitHub Pages
console.log(`\nBuild pronto em dist/ com base "${base}"`);

# veio (React + nginx, 100% estático)

Desenvolvimento: `npm install && npm run dev`
Catálogo: edite `src/products.js`. WhatsApp: constante `WHATSAPP` em `src/App.jsx`.

Produção:
1. Troque `exemplo.com.br` em `nginx/default.conf`.
2. Emita o certificado (certbot, webroot em ./certbot) em /etc/letsencrypt.
3. `docker compose up -d --build`

Contêiner sem root, sistema de arquivos somente leitura, sem capabilities.
Atrás de CDN ou proxy, configure `real_ip_header` para o rate limit enxergar o IP do visitante.

GitHub Pages: `npm run build:pages -- nome-do-repo && npm run deploy:pages`
(sem o nome do repo, para domínio próprio ou usuario.github.io). Depois, em Settings → Pages, escolha a branch gh-pages.
Lá os cabeçalhos do nginx (CSP, HSTS, cache) não se aplicam.

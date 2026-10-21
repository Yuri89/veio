# veio (React + nginx, 100% estático)

Desenvolvimento: `npm install && npm run dev`
Catálogo: edite `src/products.js`. WhatsApp: constante `WHATSAPP` em `src/App.jsx`.

Produção:
1. Troque `exemplo.com.br` em `nginx/default.conf`.
2. Emita o certificado (certbot, webroot em ./certbot) em /etc/letsencrypt.
3. `docker compose up -d --build`

Contêiner sem root, sistema de arquivos somente leitura, sem capabilities.
Atrás de CDN ou proxy, configure `real_ip_header` para o rate limit enxergar o IP do visitante.

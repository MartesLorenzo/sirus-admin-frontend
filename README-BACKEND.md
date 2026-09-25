# Ligação ao backend

Configura `VITE_API_BASE_URL=https://origem-da-api` no build do painel. O mesmo valor é necessário no build do website público. A API precisa de `ADMIN_ORIGIN` com a origem deste painel e `CLIENT_ORIGIN` com a origem do website.

O login usa a conta criada com `npm run admin:create` no repositório Sirus-Backend. O token fica em `sessionStorage` e desaparece quando a sessão do separador termina; usa “Sair” para o apagar imediatamente.

O painel deixa de usar os registos de demonstração quando ligado: reuniões e disponibilidade, clientes, portfólio, notícias, transações e contactos são carregados da API. Nos clientes, “Tracking” permite gerar uma senha, publicar atualizações e avisos, e responder aos relatos. O código de rastreio é criado pelo backend e deve ser entregue apenas ao cliente.

Nas galerias, adiciona URLs HTTPS de imagens alojadas externamente. O backend ainda não implementa upload de ficheiros. Os projetos só aparecem no website após marcar “Publicar no website”. Notícias aparecem quando definidas como “Publicado”.

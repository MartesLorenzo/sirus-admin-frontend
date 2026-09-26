# Ligação ao backend

Configura `VITE_API_BASE_URL=https://origem-da-api` no build do painel. O mesmo valor é necessário no build do website público. A API precisa de `ADMIN_ORIGIN` com a origem deste painel e `CLIENT_ORIGIN` com a origem do website.

O login usa a conta criada com `npm run admin:create` no repositório Sirus-Backend. O token fica em `sessionStorage` e desaparece quando a sessão do separador termina; usa “Sair” para o apagar imediatamente.

O painel carrega reuniões, clientes, projetos, portfólio, notícias, transações e contactos da API. A aba Projetos define objetivos, prazos, pagamentos, cliente opcional e links de demonstração; o progresso é calculado pelos objetivos concluídos. O tracking do projeto permite publicar atualizações, avisos e responder aos relatos. A aba Clientes contém apenas os dados de contacto, a origem e a recuperação manual da senha.

Nas galerias de portfólio e notícias, carrega ficheiros diretamente: a API atribui-lhes nomes únicos e guarda-os em `UPLOAD_DIR`. O servidor precisa de armazenamento persistente em produção. Os trabalhos só aparecem no website após marcar “Publicar no website”. Notícias aparecem quando definidas como “Publicado”.

A aba Testemunhos gere os relatos e os logótipos das empresas. Ambos podem ser destacados (até três por coleção) e publicados. Cada testemunho aceita texto com zero a 40 imagens; o site mostra até três miniaturas no card e todas na galeria ao clicar.

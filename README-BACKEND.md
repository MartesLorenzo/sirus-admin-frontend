# Ligação ao backend

Configura `VITE_API_BASE_URL=https://origem-da-api` no build do painel. O mesmo valor é necessário no build do website público. A API precisa de `ADMIN_ORIGIN` com a origem deste painel e `CLIENT_ORIGIN` com a origem do website.

O login usa a conta criada com `npm run admin:create` no repositório Sirus-Backend. O token fica em `sessionStorage` e desaparece quando a sessão do separador termina; usa “Sair” para o apagar imediatamente.

O painel carrega reuniões, clientes, projetos, portfólio, notícias, transações e contactos da API. A aba Projetos define objetivos, prazos, pagamentos, cliente opcional e links de demonstração; o progresso é calculado pelos objetivos concluídos. O tracking do projeto permite publicar atualizações, avisos e responder aos relatos. A aba Clientes contém apenas os dados de contacto, a origem e a recuperação manual da senha.

Nas galerias de portfólio e notícias, carrega ficheiros diretamente: a API atribui-lhes nomes únicos e guarda-os em `UPLOAD_DIR`. O servidor precisa de armazenamento persistente em produção. Os trabalhos só aparecem no website após marcar “Publicar no website”. Notícias aparecem quando definidas como “Publicado”.

A aba Testemunhos gere os relatos e os logótipos das empresas. Ambos podem ser destacados (até três por coleção) e publicados. Cada testemunho aceita texto com zero a 40 imagens; o site mostra até três miniaturas no card e todas na galeria ao clicar.

### Equipa e projetos recebidos

Em **Equipa & segurança**, um administrador cria funcionários, atribui cargo e marca permissões para cada aba (Ver, Criar, Editar, Eliminar), gere senhas e consulta ações registadas. Qualquer conta pode mudar a própria senha em **Minha senha**.

O projeto é criado automaticamente quando o cliente marca reunião, com o mesmo código para tracking. Abre **Projetos → Ver ficha / editar** para consultar o briefing, os dados da reunião e os contactos, atualizar o estado, definir prazos, pagamentos e objetivos. O backend precisa da migração `20260926000300_team_and_project_requests` antes de reiniciar.

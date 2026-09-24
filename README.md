# Sirus Cloud · Painel administrativo

Frontend inicial em React + Vite + Tailwind CSS. O objetivo desta etapa é validar a estrutura, a linguagem visual e os fluxos administrativos. **Os registos exibidos são fictícios** e as alterações são guardadas apenas no `localStorage` do navegador. Não há autenticação, sincronização entre dispositivos, envio por WhatsApp ou publicação no website público.

## Executar

```bash
npm install
npm run dev
```

Abrir o endereço apresentado pelo Vite. Para verificar a compilação: `npm run build`.

## Escopo do produto

| Área                       | O que esta primeira versão permite                                                                                                | Integração necessária depois                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Dashboard                  | Ver marcações por confirmar, clientes, projetos em curso, orçamento previsto, agenda e atalhos                                    | Indicadores calculados pela API                                                                             |
| Reuniões                   | Procurar pelo código, nome ou projeto; abrir briefing completo; alterar o estado                                                  | Agendamento real, geração de código no site cliente, notificação WhatsApp, conflitos de vagas, fuso horário |
| Disponibilidade            | Abrir dias com vários horários, pausar ou remover datas                                                                           | Publicar vagas na agenda cliente e reservar atomicamente                                                    |
| Clientes                   | Pesquisar por código ou contacto; cadastrar e editar potenciais, em aberto, por responder, a acompanhar e finalizados             | Permissões, histórico de contactos, consentimento e importação de leads                                     |
| Projetos dos clientes      | Definir início, prazo, progresso de 0–100%, notas e orçamento; calcular dias decorridos                                           | Vários projetos por cliente, marcos, anexos e alertas                                                       |
| Portfólio Web, Mobile e PC | Gerir título, descrição, visão, funcionalidades, estado, observação, galeria por URLs, ligação e até três destaques por categoria | Upload de imagens, publicação, revisão, links de lojas e downloads por plataforma                           |
| Notícias                   | Artigos com título, subtítulo, resumo, secções, checklists, várias imagens, estado e até três destaques                           | Editor rico, media storage, SEO, versão e publicação                                                        |
| Gestão                     | Somar orçamentos previstos, despesas e outros ganhos; associar movimentos a clientes                                              | Pagamentos efetivos, recebimentos, faturas e relatórios                                                     |
| Contactos                  | Editar telefones de chamada, destino WhatsApp, email e morada                                                                     | API de configurações usada pelo site público                                                                |

### Contrato com o website público

- Categorias admin `websites`, `mobile`, `pc` correspondem a `websites`, `apps-mobile`, `software-pc` no site público. A API fará esta tradução.
- Cada marcação terá um código único gerado **no servidor**. O site cliente recebe esse código após uma reserva confirmada, e o painel pesquisa por ele. A entrega por WhatsApp só deve ocorrer depois da confirmação do utilizador e da configuração do canal de mensagens.
- O site público atual apresenta um formulário demonstrativo; ainda não envia dados nem reserva horários. Esta interface administrativa não o altera automaticamente.
- Conteúdo em rascunho continua privado. Só itens publicados deverão entrar nos endpoints públicos.
- Orçamento é valor **previsto**, e a projeção mostrada no painel não significa dinheiro recebido.

## Sequência recomendada de implementação

1. Backend com autenticação de admin, modelos, validação e API de configurações.
2. Agenda pública e painel ligados ao mesmo inventário de vagas; códigos únicos, proteção contra duas reservas do mesmo horário e notificações.
3. Clientes e projetos com histórico e estados; associar automaticamente uma marcação a um cliente mediante código.
4. Upload de media, revisão e publicação das categorias de portfólio e notícias no site cliente.
5. Gestão financeira com recebimentos reais separados de orçamento, despesas e outros ganhos.

## Estrutura

```
src/
  components/   # layout, campos reutilizáveis e galerias
  data/         # dados de demonstração removíveis
  lib/          # estado local, datas e formatação
  pages/        # secções do painel
  App.jsx       # rotas e estado partilhado
  styles.css    # tema e responsividade
```

Este frontend **não deve ser disponibilizado publicamente como painel administrativo real** antes da autenticação e dos controlos de acesso no backend.

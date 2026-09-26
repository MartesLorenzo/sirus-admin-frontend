export const areaFromPath = (path) => {
  if (path === "/") return "dashboard";
  if (path.startsWith("/reunioes")) return "meetings";
  if (path.startsWith("/clientes")) return "clients";
  if (path.startsWith("/projetos")) return "projects";
  if (path.startsWith("/portfolio/websites")) return "portfolio_web";
  if (path.startsWith("/portfolio/mobile")) return "portfolio_mobile";
  if (path.startsWith("/portfolio/pc")) return "portfolio_pc";
  if (path.startsWith("/noticias")) return "news";
  if (path.startsWith("/testemunhos")) return "testimonials";
  if (path.startsWith("/gestao")) return "finance";
  if (path.startsWith("/configuracoes")) return "settings";
  if (path.startsWith("/equipa")) return "team";
  return null;
};
export const permitted = (user, area, action = "view") => user?.role === "ADMIN" || Boolean(user?.active !== false && user?.permissions?.[area]?.[action]);
export const firstAllowed = (user) => ["/", "/reunioes", "/clientes", "/projetos", "/portfolio/websites", "/portfolio/mobile", "/portfolio/pc", "/noticias", "/testemunhos", "/gestao", "/configuracoes"].find((path) => permitted(user, areaFromPath(path))) || "/sem-acesso";

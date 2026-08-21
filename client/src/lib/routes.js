export function parsePath(pathname) {
  const path = String(pathname || "/")
    .replace(/\/+$/, "")
    .replace(/^$/, "/");

  const share = path.match(/^\/s\/([^/]+)$/);
  if (share) {
    return { name: "share", token: share[1] };
  }
  if (path === "/mapa") {
    return { name: "mapa" };
  }
  if (path === "/listas") {
    return { name: "listas" };
  }
  return { name: "estante" };
}

export function pathForView(name) {
  if (name === "mapa") {
    return "/mapa";
  }
  if (name === "listas") {
    return "/listas";
  }
  return "/";
}

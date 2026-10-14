/** Escapa um texto literal para uso dentro de `RegExp`. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** RegExp que casa o texto literal em qualquer posição, ignorando caixa. */
export function containing(value: string): RegExp {
  return new RegExp(escapeRegExp(value), 'i');
}

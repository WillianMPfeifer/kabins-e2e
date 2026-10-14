/**
 * Memória de curto prazo de um cenário.
 *
 * Steps não compartilham variáveis de módulo (isso vaza estado entre cenários
 * paralelos). O que um step produz e outro consome — "a reserva criada", "a
 * cabana da vitrine" — passa por aqui, com chave tipada.
 *
 * A instância é criada por fixture de escopo `test`: morre com o cenário.
 */
export class ScenarioContext<TShape extends object> {
  private readonly store = new Map<keyof TShape, unknown>();

  set<K extends keyof TShape>(key: K, value: TShape[K]): void {
    this.store.set(key, value);
  }

  /** Lê um valor obrigatório. Falha com mensagem clara se um step anterior não o produziu. */
  get<K extends keyof TShape>(key: K): TShape[K] {
    if (!this.store.has(key)) {
      throw new Error(
        `[ScenarioContext] "${String(key)}" não foi definido neste cenário. ` +
          'Verifique se o step que cria esse dado foi executado antes (Dado/Contexto).',
      );
    }
    return this.store.get(key) as TShape[K];
  }

  find<K extends keyof TShape>(key: K): TShape[K] | undefined {
    return this.store.get(key) as TShape[K] | undefined;
  }

  has(key: keyof TShape): boolean {
    return this.store.has(key);
  }
}

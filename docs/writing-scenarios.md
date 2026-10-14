# Como escrever um novo cenário

Passo a passo para adicionar cobertura sem quebrar os contratos da suíte.

## 1. Comece pelo comportamento

Escreva o cenário no `.feature` do módulo (ou crie `features/<módulo>/<assunto>.feature`).
Reaproveite frases existentes — liste-as com:

```bash
npm run steps:list
```

```gherkin
# language: pt
@reservas
Funcionalidade: ...

  @regression
  Cenário: Hóspede não consegue reservar a própria cabana
    Dado que existe uma cabana ativa com diária de R$ 300
    E que estou conectado como o anfitrião da cabana
    Quando solicito uma reserva de 2 noites com chegada daqui a 7 dias
    Então vejo o erro de reserva "..."
```

Boas práticas:

- Um comportamento por cenário. Se o título precisa de "e", provavelmente são dois.
- `Dado` prepara o mundo (massa via API), `Quando` é a ação do usuário, `Então` é o que ele vê.
- Use `Esquema do Cenário` + `Exemplos` para variações da mesma regra (validações, perfis).
- Nada de detalhe de implementação: o leitor ideal é o PO, não o dev.

## 2. Gere e veja o que falta

```bash
npx bddgen
```

Com `missingSteps: 'fail-on-gen'`, a geração falha listando os steps sem definição
e já sugerindo o esqueleto.

## 3. Implemente de baixo para cima

1. **Locator** — no `*.locators.ts` da tela, descreva o elemento pelo papel acessível:
   ```ts
   ownCabinError: { text: /não pode reservar a própria cabana/ },
   ```
   Se o elemento não tem papel/rótulo acessível, prefira pedir um `aria-label` ou
   `data-testid` no `cabanas-web` a usar `css`.
2. **Page Object** — exponha uma ação ou uma asserção com nome de negócio:
   ```ts
   async expectOwnCabinError(): Promise<void> {
     await expect(this.el(L.ownCabinError)).toBeVisible();
   }
   ```
3. **Step** — só delega:
   ```ts
   Then('vejo que não posso reservar minha própria cabana', async ({ bookingRequestPage }) => {
     await bookingRequestPage.expectOwnCabinError();
   });
   ```
4. **Massa** — se o cenário precisa de um estado novo, adicione um método na
   `TestDataFactory` (e, se preciso, um endpoint no adapter da API).

## 4. Rode só o que você mexeu

```bash
npm run test:module -- bookings
npx bddgen && npx playwright test --grep "própria cabana" --headed
```

## 5. Antes do PR

```bash
npm run quality
```

Checklist:

- [ ] Tag de prioridade no cenário (`@smoke`, `@critical` ou `@regression`)
- [ ] Nenhum `expect`/`page` nos steps, nenhum seletor fora de `*.locators.ts`
- [ ] Massa criada pela API, sem depender de dado pré-existente
- [ ] Rodou 2× seguidas sem falhar (cenário estável em paralelo)
- [ ] Bug encontrado? Cenário com `@bug @fail` + entrada em `docs/cobertura-e-bugs.md`

# Cobertura e bugs encontrados

Estado em 10/10/2026, depois das correções: **122 testes** em 23 funcionalidades (120 no Chromium
desktop + 2 `@mobile` no Pixel 7). Duas execuções completas seguidas com 4 workers, cerca de 115 s cada:

| Resultado                                                      | Testes |
| -------------------------------------------------------------- | ------ |
| Comportamento correto, verde                                   | 117    |
| Bug conhecido (`@bug @fail`), falhando pelo motivo documentado | 5      |

**Situação dos bugs**

- **Corrigidos (22):** 001 a 008, 009, 010, 011 a 018, 019, 020, 021 e 022, além da observação "guia
  salvo só em memória". Os cenários deixaram de ser `@bug @fail` e viraram testes de regressão.
- **Decisões de negócio de 11/10/2026:** 009, 010, 019 e 021 foram corrigidos conforme as regras da
  seção 3. A suíte E2E ainda não foi reexecutada depois dessas correções (os números acima são de 10/10).
- O cenário do BUG-007 mudou: o painel agora recusa reescrever noites em hold, com mensagem, como
  já fazia com noites confirmadas. O cenário da mensagem de conflito saiu da suíte, porque o caminho
  que levava a ele deixou de existir; a API ainda converte a violação da restrição em 409.

## 1. Cobertura por funcionalidade

Referências `TPxx-TSxx-TCxx` apontam para o plano de testes manual do projeto (documento interno).

| Feature                            | Testes | Bugs | Cobre                                                                                                                                                                                                                                    |
| ---------------------------------- | ------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth/login`                       | 7      | 0    | Redirecionamento por perfil (TP01-TS02-TC01/02), troca de papel ativo (TP01-TS03-TC02), retorno ao destino, mensagem idêntica para senha errada × e-mail inexistente (TC04/05), conta desativada (TP05-TS01-TC05), mostrar/ocultar senha |
| `auth/cadastro`                    | 10     | 0    | Cadastro válido (TP01-TS01-TC01), máscara de CPF, CPF com DV errado, menor de idade (TC07), senha curta/sem número (TC05), confirmação diferente, e-mail duplicado (TC02)                                                                |
| `auth/sessao`                      | 6      | 0    | `/conta/reservas`, `/perfil`, `/painel`, `/admin` exigem login (TC07); logout encerra a sessão (TC09); sessão persiste após reload                                                                                                       |
| `auth/conta-e-senha`               | 7      | 2    | Troca de senha (vale no login, antiga para de funcionar), senha atual errada, nova igual à atual, sessão em outro dispositivo, conta desativada com sessão aberta, telefone no perfil, telefone chega ao anfitrião                       |
| `cabins/pagina-cabana`             | 4      | 0    | Página pública, "Reservar agora", slug inexistente, cabana em análise não é pública (TP02-TS02-TC01)                                                                                                                                     |
| `bookings/solicitar-reserva`       | 6      | 0    | Solicitação HELD com código (TP03-TS01-TC01), total diária × noites, limite de 5 noites (TC06), noite bloqueada pelo dono (TP02-TS03-TC04, TP03-TS02-TC03), noites em HOLD de outro hóspede (TP03-TS02-TC01), visitante sem login        |
| `bookings/regras-de-solicitacao`   | 5      | 0    | Um hold por cabana, cota de 3 solicitações por hora, aviso de conflito com outra cabana, anfitrião no modo hóspede, total com diárias diferentes                                                                                         |
| `bookings/ofertas`                 | 2      | 1    | Desconto da oferta no calendário e no valor registrado da reserva                                                                                                                                                                        |
| `bookings/cancelar-reserva`        | 2      | 0    | Cancelar HOLD e datas liberadas (TP03-TS05-TC01), cancelar CONFIRMADA antes do check-in (TC02)                                                                                                                                           |
| `bookings/regras-de-cancelamento`  | 2      | 0    | Sem cancelamento pelo site a partir do check-in; cancelamento mantém o bloqueio do anfitrião                                                                                                                                             |
| `guide/acesso-ao-guia`             | 9      | 6    | Contagem regressiva, hold/recusada/cancelada, cabana de mesmo nome, preview do dono, anfitrião alheio, escrita cruzada, visitante → login → guia                                                                                         |
| `guide/guia-sem-configuracao`      | 1      | 0    | Guia não configurado orienta a falar com o anfitrião                                                                                                                                                                                     |
| `host/aprovacao-solicitacao`       | 8      | 3    | Aprovar (TP03-TS03-TC01) e hóspede vê confirmada, recusar com motivo + datas liberadas (TC03), link já processado (TP03-TS04-TC05), link sem login (TC01), token adulterado (TC04)                                                       |
| `host/painel-reservas`             | 2      | 0    | Reserva confirmada em "Próximas chegadas"; anfitrião não vê reservas de outro (TP06-TS02-TC02)                                                                                                                                           |
| `host/calendario-e-precos`         | 4      | 2    | Editar período não reabre hold, mensagem de conflito, bloqueio de período, nova diária para o hóspede                                                                                                                                    |
| `host/cadastro-e-edicao-cabana`    | 4      | 4    | Curadoria da cabana nova, diária com centavos, edição de cabana alheia                                                                                                                                                                   |
| `host/ical`                        | 8      | 1    | Feed com confirmada e sem cancelada, link de exportação do painel, importação recusa 5 endereços internos, domínio inexistente                                                                                                           |
| `reviews/avaliar-estadia`          | 7      | 2    | Avaliação completa até a página pública, duplicada, não concluída, reserva alheia, limite de 500 caracteres, conclusão antes do check-out, resposta do anfitrião                                                                         |
| `admin/gestao-plataforma`          | 4      | 0    | Acesso do admin, anfitrião criado aparece, hóspede/anfitrião não acessam `/admin`                                                                                                                                                        |
| `security/isolamento-entre-contas` | 3      | 0    | IDOR: comprovante de outro hóspede pela URL (TP06-TS01-TC01), "Minhas reservas" só lista as próprias, visitante → login                                                                                                                  |
| `security/vazamento-dados-reserva` | 5      | 5    | Consulta pública por código e por id, link do anfitrião pelo código, observação privada no iCal e na disponibilidade                                                                                                                     |
| `security/ssrf-servidor-web`       | 1      | 1    | Servidor-canário local detecta requisição feita pelo servidor do site                                                                                                                                                                    |
| `quality/qualidade-das-paginas`    | 14     | 1    | 7 telas a 360 px sem rolagem horizontal; as mesmas 7 sem erro de hidratação nem exceção no console                                                                                                                                       |

### Fora do escopo E2E (e por quê)

| Item                                                                      | Onde fica melhor                                                                                                  |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Concorrência real (overbooking com N requisições simultâneas)             | Integração da API — já coberto (`reservas-concorrencia.spec.ts`)                                                  |
| Limites numéricos de DTO (preço com 3 casas, 401 dias no lote, nota 0/6…) | Integração/HTTP da API — barato e determinístico lá                                                               |
| Expiração do hold de 2h                                                   | Integração da API com TTL reduzido; E2E esperaria 2h                                                              |
| Rate limiting                                                             | Testes HTTP da API (`http-rate-limit*.spec.ts`); ver BUG-E2E-022, que esses testes não pegaram                    |
| Google OAuth                                                              | Exige provedor simulado — candidato a cenário futuro com mock do provedor                                         |
| Guia digital durante a estadia e expiração em 30 dias                     | A regra roda em Server Component; `page.clock` não a alcança. Exige reserva com datas no passado, criada no banco |
| Liberação do guia às 14h e "hoje" no fuso do navegador (BUG-E2E-012/013)  | Teste de unidade da regra extraída para função pura; em E2E depende da hora em que a suíte roda                   |

## 2. Bugs encontrados

Todos têm cenário `@bug @fail`, exceto onde indicado. A severidade é uma estimativa.

### BUG-E2E-001 — Qualquer conta autenticada vê os dados do hóspede no link do anfitrião · **Alta (privacidade)** · **Corrigido**

- **Onde:** `cabanas-web/src/app/c/[token]/page.tsx`
- **Causa:** a autorização usa `reserva.donoId`, mas a API devolve o campo como `anfitriaoId`.
  Como `donoId` é sempre `undefined`, a tela "Acesso Não Autorizado" nunca é exibida.
- **Efeito:** outro anfitrião, ou o próprio hóspede, vê nome, telefone e valores da solicitação.
  A API recusa a ação (403), então o problema é exposição de dados pessoais.
- **Correção sugerida:** comparar com `reserva.anfitriaoId` e deixar de devolver `tokenConfirmacao`
  para quem não é o anfitrião.

### BUG-E2E-002 — "Entrar como Anfitrião" não volta para a solicitação · **Média (UX)** · **Corrigido**

- **Onde:** `cabanas-web/src/app/c/[token]/page.tsx` (link) × `src/app/(auth)/login/page.tsx`
- **Causa:** o link envia `returnUrl`; a tela de login só lê `destino`, `redirect` e `callbackUrl`.
- **Correção sugerida:** usar `?destino=` no link.

### BUG-E2E-003 — Consulta pública devolve telefone, e-mail e token pelo código curto · **Crítica (privacidade)** · **Corrigido**

- **Onde:** `cabanas-api/src/modules/reservas/reservas.service.ts` (`detalharPorToken`)
- **Causa:** `GET /reservas/solicitacao/:token` é público e busca por token, **código curto** ou **id**.
- **Efeito:** quem tem o código (`CB-XXXXXX`, enviado por WhatsApp e mostrado no guia) ou o id
  (presente em `/reserva/<id>` e `/avaliar/<id>`) lê nome, telefone, e-mail e o token de confirmação.
  Com o BUG-001, qualquer conta logada também vê esses dados em `/c/<código>`.
- **Correção sugerida:** buscar só por token; criar um endpoint autenticado para a busca por código do painel.

### BUG-E2E-004 — Qualquer anfitrião vê Wi-Fi e senha da fechadura de qualquer cabana · **Alta** · **Corrigido**

- **Onde:** `cabanas-web/src/app/guia/[slug]/page.tsx` (`isHostOrAdmin`)
- **Causa:** o modo de visualização confere só se a conta é anfitrião, não se a cabana é dela.
- **Correção sugerida:** liberar o preview apenas para o dono da cabana e para o admin.

### BUG-E2E-005 — Guia liberado para reserva pendente, recusada, cancelada ou de outra cabana · **Alta** · **Corrigido**

- **Onde:** `cabanas-web/src/app/guia/[slug]/page.tsx` (`matchingBooking`)
- **Causa:** a reserva é encontrada por id **ou nome** da cabana, sem olhar o status.
- **Efeito:** a tela afirma "Sua estadia está confirmada!" para uma solicitação pendente. No dia do
  check-in, mostra Wi-Fi e fechadura sem confirmação. Cabanas de mesmo nome compartilham o acesso.
- **Correção sugerida:** casar só pelo id e aceitar só reserva confirmada ou concluída.

### BUG-E2E-006 — Anfitrião sobrescreve o guia de cabana alheia · **Alta** · **Corrigido**

- **Onde:** `cabanas-web/src/features/guide/services/guide-actions.ts`
- **Causa:** as actions do guia conferem o papel, não a posse da cabana enviada no formulário.
- **Cenário:** o teste troca o campo oculto `cabanaId` e confirma que o Wi-Fi do outro anfitrião mudou.
- **Correção sugerida:** validar a posse da cabana em todas as actions do guia.

### BUG-E2E-007 — Editar preço de um período reabre noites em hold · **Alta** · **Corrigido**

- **Onde:** `cabanas-api/src/modules/disponibilidade/disponibilidade.service.ts` (`atualizarEmLote`) e
  `cabanas-web/.../dashboard-actions.ts` (`updateDayPriceAndBlockAction`)
- **Causa:** o lote só protege noites de reserva CONFIRMADA. O editor envia `disponivel: true` para todas.
- **Efeito:** as noites aparecem livres para o público. A restrição `no_overlap_reservas` do banco impede
  a reserva dupla, mas o erro sobe como 500 e o hóspede lê "Estamos com um problema por aqui".
- **Correção sugerida:** proteger noites com `reservaId` de hold ativo e mapear a violação da restrição para 409.

### BUG-E2E-008 — Observação privada do bloqueio é pública · **Média (privacidade)** · **Corrigido**

- **Onde:** `cabanas.service.ts` (`gerarFeedIcal`) e `disponibilidade.service.ts` (`consultar`)
- **Efeito:** "Uso pessoal - aniversário da sogra" aparece no feed iCal e na consulta de disponibilidade.
- **Correção sugerida:** texto fixo no feed e `detalhesBloqueio` fora da resposta pública.

### BUG-E2E-009 — "380,50" vira R$ 38.050 no cadastro e na edição de cabana · **Média (dinheiro)** · **Corrigido**

- **Onde:** `NewCabinPageContent.tsx` e `EditCabinPageContent.tsx` (`handlePriceChange`)
- **Causa:** o campo descarta tudo que não é dígito. O DTO aceita até R$ 100.000.

### BUG-E2E-010 — Estadia pode ser concluída no dia do check-in · **Média** · **Corrigido**

- **Onde:** `reservas.service.ts` (`concluir`) compara o check-in; o comentário diz "após o check-out".
- **Efeito:** a avaliação fica disponível antes de a estadia terminar.

### BUG-E2E-011 — Trocar a senha não encerra as outras sessões · **Média (segurança)** · **Corrigido**

- **Onde:** `auth.service.ts` (`alterarSenha`). O refresh token antigo continua válido.
- **Correção sugerida:** chamar a mesma revogação de `logout-todos`, que já invalida tokens na hora.

### BUG-E2E-012 e 013 — Fuso horário (sem cenário E2E) · **Corrigido**

- **012:** o calendário calcula "hoje" no fuso do navegador e a API em UTC. Entre 21h e 0h de Brasília,
  a noite de hoje aparece livre e a API recusa com "data passada".
- **013:** a liberação das 14h do guia usa a data de check-in em UTC no fuso do servidor. Em servidor com
  horário de Brasília, libera às 14h do dia anterior; no Cloud Run (UTC), às 11h de Brasília.

### BUG-E2E-014 — Servidor do site busca qualquer URL (SSRF) · **Alta (segurança)** · **Corrigido**

- **Onde:** `dashboard-actions.ts` (`extractMapsAddressAction`): sem sessão, sem lista de domínios,
  seguindo redirecionamentos.
- **Cenário:** um servidor-canário em 127.0.0.1 recebeu 3 requisições do servidor do site.
- **Correção sugerida:** exigir sessão de anfitrião, aceitar só domínios do Google Maps e reaproveitar
  o validador anti-SSRF da API.

### BUG-E2E-015 — Anfitrião abre a edição da cabana de outro anfitrião · **Média** · **Corrigido**

- **Onde:** `app/painel/cabanas/[id]/editar/page.tsx`. O formulário abre preenchido; salvar falha na API.

### BUG-E2E-016 — Link de exportação iCal do painel devolve 404 · **Alta (funcional)** · **Corrigido**

- **Onde:** `IcalSyncModal.tsx` monta o link com a origem do site; o feed é servido pela API.
- **Efeito:** o anfitrião cola no Airbnb um link que não funciona e as reservas não sincronizam.

### BUG-E2E-017 — Resposta do anfitrião a uma avaliação nunca aparece na página pública · **Média** · **Corrigido**

- **Onde:** `AvaliacaoResumoDto` não tem `resposta` e `CabinReviews.tsx` não a renderiza.

### BUG-E2E-018 — Telefone com +55 aparece sem os dois últimos dígitos · **Média (dados)** · **Corrigido**

- **Onde:** `shared/utils/phone.util.ts` (`formatPhoneMask`) trata o "55" como DDD e corta em 11 dígitos.
- **Efeito:** "+55 54 99999-0000" vira "(55) 54999-9900" no perfil, no formulário de reserva e no painel.
  Salvar o perfil grava o número errado.

### BUG-E2E-019 — Cabana cadastrada pelo painel vai ao ar sem curadoria · **Alta (regra de negócio)** · **Corrigido**

- **Onde:** `dashboard-service.ts` (`createOwnerCabin`) envia `status: 'ATIVA'`, e `criar-cabana.dto.ts`
  aceita status no cadastro. A curadoria só é exigida na troca de status.

### BUG-E2E-020 — Perfil estoura a largura do celular com e-mail longo · **Baixa (layout)** · **Corrigido**

- **Onde:** cabeçalho de `/perfil`; o e-mail não quebra linha a 360 px.

### BUG-E2E-021 — Reserva ignora a oferta que o site mostrou · **Alta (dinheiro)** · **Corrigido**

- **Onde:** `reservas.service.ts` (`criar`) soma diárias e extras; o calendário aplica a oferta.
- **Efeito:** o hóspede vê R$ 480 e a reserva nasce com R$ 600.

### BUG-E2E-022 — Limite de requisições acumula para sempre e bloqueia o IP de vez · **Crítica (disponibilidade, sem cenário E2E)** · **Corrigido**

- **Onde:** `cabanas-api/src/common/throttler/postgres-throttler-storage.service.ts` (`increment`)
- **Causa:** quando a janela expira, o prazo é renovado mas `total_hits` não volta a zero. Depois do
  primeiro bloqueio, a requisição seguinte soma de novo acima do limite e bloqueia outra vez. O ramo que
  zera o contador nunca executa. A limpeza só remove chaves paradas há mais de 1 hora.
- **Evidência:** a chave de login deste ambiente acumulou 1.014 requisições desde as 15h06 e ficou
  bloqueada em sequência, mesmo com tentativas espaçadas.
- **Efeito em produção:** com o limite padrão de 5, um IP fica sem login nem cadastro depois da 6ª
  tentativa, até passar 1 hora sem tentar. Redes móveis com IP compartilhado agravam o problema.
- **Correção sugerida:** zerar `totalHits` ao renovar a janela e liberar o bloqueio expirado antes de
  somar. Cobrir com teste de integração que avança o relógio além do TTL.

### Observações sem cenário

- **Guia salvo só em memória quando o banco falha.** `guide-service.ts` (`saveGuestGuide`) captura o erro,
  grava em memória e responde sucesso. A leitura também cai para dados fictícios. O anfitrião perderia o
  guia sem saber. **Corrigido.**

## 3. Regras decididas em 11/10/2026

Decisões do dono do produto que resolveram os pontos em que código, documentação e tela discordavam.
Os cenários seguem estas regras.

| Tema                            | Regra                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Curadoria (BUG-019)             | Cabana do anfitrião nasce em análise; admin aprova ou reprova (reprovar exclui). Exclusão pedida pelo anfitrião espera o admin; edição é livre.                                                                                                                                                                                                                           |
| Diária com centavos (BUG-009)   | Aceita centavos ("380,50" ou "380.50": um "." final seguido de até 2 dígitos vale como separador decimal).                                                                                                                                                                                                                                                                |
| Conclusão da estadia (BUG-010)  | Automática no dia do check-out, a partir do horário de check-out (padrão 12:00). Conclusão manual só a partir desse dia. Hóspede vê convite para avaliar.                                                                                                                                                                                                                 |
| Ofertas (BUG-021)               | A API aplica as ofertas e grava o desconto; o nome da oferta não é exibido na reserva.                                                                                                                                                                                                                                                                                    |
| Hold no feed iCal               | Pré-reservas em hold saem no feed. Limitação: Airbnb/Booking leem o feed em intervalos próprios (horas).                                                                                                                                                                                                                                                                  |
| Importação iCal                 | Nunca sobrescreve o que já está marcado no site (reserva, bloqueio do anfitrião, manutenção, outro canal); essas noites voltam como conflitos para o anfitrião resolver. Noite que some do feed do canal é liberada. Resposta que não é um calendário iCal é recusada e nada muda. Limitação: dois feeds genéricos (ICAL_EXTERNO) na mesma cabana se liberam um ao outro. |
| Motivo da recusa                | Aparece ao hóspede em "Minhas reservas".                                                                                                                                                                                                                                                                                                                                  |
| Senha                           | 8 a 72 caracteres, com maiúscula, minúscula e número; sem senhas comuns. Mesmo texto em todas as telas: "Mínimo de 8 caracteres, com letra maiúscula, letra minúscula e número."                                                                                                                                                                                          |
| Cancelamento no dia do check-in | Mantido: bloqueado para o hóspede desde 0h do dia (reserva é por diária).                                                                                                                                                                                                                                                                                                 |
| Cota de 3 solicitações por hora | Mantida, contando canceladas.                                                                                                                                                                                                                                                                                                                                             |
| Anfitrião no login              | Entra direto no painel.                                                                                                                                                                                                                                                                                                                                                   |

### Como a curadoria funciona na prática

- O anfitrião vê a cabana nova no painel com o selo "Em análise". Ela não aparece no site nem aceita
  reservas até a aprovação. Cabana criada pelo admin nasce ativa.
- O admin aprova ou reprova na aba "Curadoria" do painel de admin. Reprovar exclui a cabana; o motivo
  fica no log e volta ao admin na resposta.
- O anfitrião não exclui sozinho: usa "Solicitar exclusão", que o admin confirma ou recusa. Enquanto
  isso a cabana segue como está, e o anfitrião pode desistir do pedido. Exclusão aprovada de cabana com
  reservas no histórico a inativa em vez de apagar. Sem reservas, a exclusão é física.
- O anfitrião pode ocultar e mostrar a cabana ("Ocultar do site" / "Mostrar no site"), exceto enquanto
  ela está em análise.
- A conclusão automática roda a cada 10 minutos. No Cloud Run só roda enquanto houver uma instância viva.

### Limitação dos testes

O cenário E2E do conflito de importação iCal não foi escrito: o validador anti-SSRF bloqueia feeds
locais. A regra é coberta por testes de unidade da API.

## 4. Recomendações para o `cabanas-web` (testabilidade)

Não bloqueiam a suíte, mas a deixariam mais robusta a mudanças de layout:

1. `aria-label` no botão do menu de conta (hoje o nome acessível é "papel + iniciais + primeiro nome").
2. Associar mensagens de erro de campo ao input com `aria-describedby` (hoje são `<p>` soltos).
3. `data-testid` nos pares `<dt>/<dd>` do comprovante e do link do anfitrião, no campo de exportação iCal
   e no campo oculto do guia. São os 4 locators por CSS da suíte.
4. O anunciador de rotas do Next também é `role="alert"`; os alertas do app poderiam usar
   um contêiner nomeado (`aria-labelledby`) para não depender de filtro por texto.
5. Rótulo nos campos de senha do perfil; hoje o nome acessível é o placeholder.

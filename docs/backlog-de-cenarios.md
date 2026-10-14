# Backlog de cenários E2E

Estado em 10/10/2026. Complementa [cobertura-e-bugs.md](cobertura-e-bugs.md).

Este documento nasceu da revisão de um mapeamento feito por outra IA. Cada item abaixo foi
conferido no código de `cabanas-web` e `cabanas-api`, com o arquivo de origem indicado.
Cenários marcados `@bug @fail` descrevem o comportamento **correto** e devem falhar hoje, como
manda a convenção da suíte.

## Situação da implementação

A maior parte deste backlog já virou teste. O resultado, com os bugs confirmados e numerados, está em
[cobertura-e-bugs.md](cobertura-e-bugs.md). A numeração de bugs daquele documento é a oficial.

**Implementado:** seções 3.1 a 3.11, com estas diferenças:

- Cancelamento pelo anfitrião no painel e importação iCal com feed real ficaram de fora.
- Acessibilidade automática (axe) ficou de fora para não adicionar dependência sem combinar antes.
- A janela do guia durante a estadia, a expiração em 30 dias e os bugs de fuso (BUG-E2E-012 e 013)
  continuam pendentes. Exigem massa com datas no passado ou teste de unidade.
- Surgiram cenários que este backlog não previa: ofertas, link de exportação iCal, resposta pública
  do anfitrião, curadoria da cabana nova e telefone no perfil.

---

## 1. O que aproveitar e o que descartar do mapeamento anterior

**Já coberto pela suíte (não reescrever):** login por perfil, troca de papel, mensagem neutra,
mostrar senha, cadastro com máscara/CPF/idade/senha/e-mail duplicado, rotas restritas, logout,
página pública, slug inexistente, cabana em análise, solicitação HELD, limite de 5 noites,
noite bloqueada, noite em hold, cancelamento HELD/CONFIRMADA, aprovar/recusar pelo link,
link já processado, token adulterado, IDOR de comprovante, `/admin` restrito.

**Afirmações que não batem com o código:**

| Afirmação                                                  | Realidade                                                                       | Onde                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------- |
| Comentário da avaliação com 3 a 1000 caracteres            | 3 a 500 (DTO e `maxLength` do form)                                             | `avaliacoes/dto/avaliacao.dto.ts`   |
| Guia só abre com reserva **confirmada**                    | Abre com **qualquer** reserva da cabana, em qualquer status                     | `app/guia/[slug]/page.tsx`          |
| Preview do guia só para o anfitrião **da cabana**          | Qualquer conta com papel ativo de anfitrião vê qualquer guia                    | idem                                |
| Visitante é redirecionado ao login no guia                 | Vê uma tela de bloqueio com botão "Entrar"                                      | idem                                |
| Gating do guia testável com relógio simulado               | A regra roda em Server Component; `page.clock` só altera o relógio do navegador | idem                                |
| Botão "Copiar chave PIX" e cronômetro de 2h no comprovante | Não existe chave PIX na web                                                     | busca por `chavePix`/`chave PIX`    |
| Recuperação de senha ("esqueci minha senha")               | Não existe endpoint nem tela                                                    | `auth.controller.ts`                |
| Indicador de força de senha                                | Não existe                                                                      | busca em `cabanas-web/src`          |
| Admin aprova cabana `EM_ANALISE` pela tela                 | Não há UI; só `PATCH /cabanas/:id/status`                                       | `features/admin`                    |
| Anfitrião cai em `/painel` após login                      | Entra como hóspede (já documentado)                                             | `auth.service#escolherPapelInicial` |
| Concorrência/overbooking em E2E                            | Camada errada; já coberto em `reservas-concorrencia.spec.ts`                    | API                                 |
| Tela de erro com a API fora do ar                          | Fetch roda no servidor Next; `page.route` não intercepta                        | —                                   |
| Importação iCal com feed de teste local                    | O validador anti-SSRF bloqueia `localhost`/IPs privados                         | `ssrf-validator.util.ts`            |

**Regras reais que o mapeamento não viu:** um hold ativo por hóspede por cabana; no máximo 3
solicitações por hora na mesma cabana; aviso de conflito com reserva em outra cabana, com
confirmação explícita; cancelamento pelo hóspede bloqueado a partir do dia do check-in;
cabana não pode ser inativada com reserva confirmada futura nem excluída com reservas; janela
de 90 dias para avaliar; avaliação exibe só o primeiro nome do autor.

---

## 2. Bugs levantados na leitura do código

Todos foram confirmados por cenários E2E e corrigidos. Descrição, severidade e situação de cada
um estão em [cobertura-e-bugs.md](cobertura-e-bugs.md#2-bugs-encontrados).

---

## 3. Cenários novos por módulo

Legenda de infraestrutura (ver seção 4): **[API]** precisa de método novo em adapter;
**[GUIA]** precisa configurar guia; **[DB]** precisa de massa com datas no passado;
**[SONDA]** checagem HTTP sem navegador; **[CANÁRIO]** servidor HTTP local de detecção.

### 3.1 `security/vazamento-dados-reserva.feature` (novo)

```gherkin
# language: pt
@security @isolamento
Funcionalidade: Dados da reserva não vazam por identificadores públicos

  @critical @bug @fail
  Cenário: Código curto da reserva não revela os dados do hóspede sem login   # [SONDA] BUG-E2E-003
    Dado que um hóspede solicitou uma reserva numa cabana ativa
    Quando alguém sem login consulta a solicitação pelo código da reserva
    Então a consulta é recusada
    E a resposta não contém telefone, e-mail nem token de confirmação

  @critical @bug @fail
  Cenário: Anfitrião de outra cabana não vê o hóspede abrindo o link pelo código   # BUG-E2E-001 + 003
    Dado que um hóspede solicitou uma reserva numa cabana ativa
    E que estou conectado como anfitrião de outra cabana
    Quando abro o link de solicitação usando o código da reserva
    Então vejo a tela de acesso não autorizado
    E não vejo o nome nem o telefone do hóspede

  @regression @bug @fail
  Cenário: Observação privada de bloqueio não aparece no calendário público   # [SONDA] BUG-E2E-008
    Dado que o anfitrião bloqueou uma noite com a observação "Reforma do deck - orçamento João"
    Quando alguém sem login baixa o feed iCal da cabana
    Então o feed marca a noite como indisponível
    Mas o feed não contém a observação do anfitrião
```

### 3.2 `guide/acesso-ao-guia.feature` (novo)

O vínculo correto é "reserva CONFIRMADA ou CONCLUÍDA desta cabana, por ID".

```gherkin
# language: pt
@guia
Funcionalidade: Acesso ao guia digital

  @smoke @critical
  Cenário: Hóspede com reserva confirmada vê a contagem regressiva antes do check-in   # [GUIA]
    Dado que o anfitrião configurou o guia da cabana com Wi-Fi "Kabins_5G" e senha "segredo123"
    E que um hóspede tem reserva confirmada para daqui a 3 dias
    Quando o hóspede abre o guia da cabana
    Então vê que o guia será liberado às 14:00 do dia do check-in
    E não vê a senha do Wi-Fi

  @security @critical @bug @fail
  Cenário: Solicitação ainda não aprovada não libera o guia   # [GUIA] BUG-E2E-005
    Dado que o anfitrião configurou o guia da cabana
    E que um hóspede tem uma solicitação aguardando aprovação para daqui a 3 dias
    Quando o hóspede abre o guia da cabana
    Então não vê a mensagem "Sua estadia está confirmada"
    E é orientado a aguardar a confirmação do anfitrião

  @security @bug @fail
  Esquema do Cenário: Reserva <status> não dá acesso ao guia   # [GUIA] BUG-E2E-005
    Dado que o anfitrião configurou o guia da cabana
    E que um hóspede teve uma reserva <status> nesta cabana
    Quando o hóspede abre o guia da cabana
    Então vê que não possui reserva ativa para a cabana
    Exemplos:
      | status    |
      | recusada  |
      | cancelada |

  @security @bug @fail
  Cenário: Reserva em cabana de mesmo nome não abre o guia de outra cabana   # [GUIA] BUG-E2E-005
    Dado que dois anfitriões têm cabanas com o mesmo nome
    E que o segundo anfitrião configurou o guia da cabana dele
    E que um hóspede tem reserva confirmada na cabana do primeiro anfitrião
    Quando o hóspede abre o guia da cabana do segundo anfitrião
    Então vê que não possui reserva ativa para a cabana

  @security @critical @bug @fail
  Cenário: Anfitrião de outra cabana não vê Wi-Fi e fechadura   # [GUIA] BUG-E2E-004
    Dado que o anfitrião configurou o guia da cabana com senha da fechadura "4821#"
    E que estou conectado como anfitrião de outra cabana
    Quando abro o guia dessa cabana
    Então não vejo a senha da fechadura

  @regression
  Cenário: Anfitrião da cabana vê o guia em modo de visualização   # [GUIA]
    Dado que o anfitrião configurou o guia da cabana
    Quando o anfitrião abre o guia da própria cabana
    Então vê o aviso "Modo Visualização de Anfitrião"
    E vê a senha do Wi-Fi

  @regression @usabilidade
  Cenário: Guia sem configuração orienta o hóspede a falar com o anfitrião
    Dado uma cabana ativa sem guia configurado
    E que um hóspede tem reserva confirmada nela
    Quando o hóspede abre o guia da cabana
    Então vê "Guia Digital em Breve"
    E vê o botão "Falar com o Anfitrião"

  @regression
  Cenário: Visitante sem login é convidado a entrar e volta ao guia
    Dado uma cabana ativa com guia configurado
    Quando um visitante abre o guia e entra com uma conta de hóspede
    Então volta para o guia da cabana

  # Requer [DB]: reserva com check-in no passado
  @regression
  Cenário: Hóspede em estadia vê e copia a senha do Wi-Fi   # [GUIA][DB]
  @regression
  Cenário: Guia expira 30 dias depois do check-out   # [GUIA][DB]

  @security @bug @fail
  Cenário: Anfitrião não altera o guia de cabana alheia trocando o identificador   # [GUIA] BUG-E2E-006
    Dado que o anfitrião A configurou o guia com Wi-Fi "RedeA"
    E que estou conectado como anfitrião B na edição do guia da minha cabana
    Quando envio o formulário do guia apontando para a cabana do anfitrião A
    Então a alteração é recusada
    E o guia da cabana do anfitrião A continua com Wi-Fi "RedeA"
```

> BUG-E2E-013 (liberação às 14h no fuso do servidor) não é determinístico em E2E: depende da hora
> em que a suíte roda e do fuso do servidor. Recomenda-se extrair a regra para uma função pura e
> testá-la em unidade, com casos para servidor em UTC e em `America/Sao_Paulo`.

### 3.3 `bookings/regras-de-solicitacao.feature` (novo)

```gherkin
# language: pt
@reservas @regras-negocio
Funcionalidade: Regras que limitam solicitações

  @regression
  Cenário: Segunda solicitação na mesma cabana com hold ativo é recusada
    Dado que um hóspede tem uma solicitação aguardando aprovação numa cabana
    Quando ele tenta solicitar outras datas na mesma cabana
    Então vê "Você já possui uma solicitação de reserva em andamento para esta cabana"

  @regression @security
  Cenário: Ciclo de solicitar e cancelar é limitado a 3 por hora   # [API] cancelar
    Dado que um hóspede solicitou e cancelou 3 reservas na mesma cabana na última hora
    Quando ele tenta solicitar novamente
    Então vê que atingiu o limite de 3 solicitações nesta hora

  @regression
  Cenário: Hóspede é avisado de reserva no mesmo período em outra cabana
    Dado que um hóspede tem reserva confirmada numa cabana para daqui a 10 dias
    Quando ele seleciona as mesmas noites em outra cabana
    Então vê o aviso de reserva ativa na outra cabana
    E só consegue solicitar depois de marcar que tem certeza

  @regression @security
  Cenário: Anfitrião no modo hóspede não reserva a própria cabana
    Dado que um anfitrião com papel de hóspede ativo abre a página de reserva da própria cabana
    Quando ele tenta solicitar 2 noites
    Então vê "Você não pode reservar a própria cabana"

  @regression @dinheiro
  Cenário: Total soma o preço de cada noite, não diária vezes noites
    Dado uma cabana com diária de R$ 300,00 e sábado a R$ 450,00
    Quando o hóspede seleciona de sexta a domingo
    Então o valor estimado é R$ 750,00
    E o comprovante mostra o mesmo valor

  @regression @bug @fail @fuso
  Cenário: Noite de hoje exibida como livre é aceita pela API   # BUG-E2E-012
    Dado que o navegador do hóspede está num fuso em que a data local ainda é a de ontem em UTC
    Quando o hóspede seleciona a noite de "hoje" no calendário e solicita
    Então a solicitação é criada
    # Implementação: escolher em tempo de execução um fuso (ex.: Pacific/Pago_Pago, UTC-11)
    # cuja data local seja diferente da data UTC; pular o cenário se não houver diferença.
```

### 3.4 `bookings/cancelamento-e-recusa.feature` (amplia `cancelar-reserva.feature`)

```gherkin
  @regression @regras-negocio
  Cenário: Hóspede não cancela pelo site a partir do dia do check-in
    Dado que um hóspede tem reserva confirmada com check-in hoje
    Quando ele tenta cancelar a reserva
    Então vê "A estadia já começou. Fale com o suporte"

  @regression
  Cenário: Cancelar libera só as noites da reserva, não os bloqueios do anfitrião
    Dado que o anfitrião bloqueou a noite seguinte ao check-out de uma reserva confirmada
    Quando o hóspede cancela a reserva
    Então as noites da reserva voltam a ficar livres
    E a noite bloqueada pelo anfitrião continua indisponível

  @regression
  Cenário: Hóspede vê a recusa e o motivo em "Minhas reservas"   # [API] recusar
    Dado que o anfitrião recusou a solicitação com o motivo "Cabana em manutenção"
    Quando o hóspede abre "Minhas reservas"
    Então vê a reserva como recusada com o motivo informado

  @regression
  Cenário: Anfitrião cancela uma reserva confirmada pelo painel
    Dado que o anfitrião tem uma reserva confirmada para daqui a 10 dias
    Quando ele cancela a reserva pelo painel
    Então o hóspede vê a reserva como cancelada
    E as noites voltam a ficar livres
```

### 3.5 `host/calendario-e-precos.feature` (novo)

```gherkin
# language: pt
@anfitriao @calendario
Funcionalidade: Calendário e preços pelo anfitrião

  @critical @bug @fail
  Cenário: Mudar o preço de um período não reabre noites em solicitação   # BUG-E2E-007
    Dado que um hóspede solicitou as noites de daqui a 10 e 11 dias
    Quando o anfitrião altera para R$ 500,00 a diária de daqui a 9 a 12 dias pelo painel
    Então outro hóspede vê as noites de daqui a 10 e 11 dias indisponíveis

  @critical @bug @fail
  Cenário: Anfitrião não confirma duas reservas para a mesma noite   # [API] BUG-E2E-007
    Dado que duas solicitações para a mesma noite foram criadas após o anfitrião editar o calendário
    Quando o anfitrião aprova a primeira e depois a segunda
    Então a segunda aprovação é recusada por conflito de datas

  @regression
  Cenário: Data com reserva confirmada não pode ser editada
    Dado que a cabana tem reserva confirmada para daqui a 10 dias
    Quando o anfitrião tenta bloquear essa noite pelo painel
    Então vê que a data tem reserva confirmada e não pode ser alterada

  @regression
  Cenário: Bloqueio de período fecha todas as noites do intervalo
    Quando o anfitrião bloqueia de daqui a 20 a 22 dias pelo painel
    Então o hóspede vê as 3 noites indisponíveis

  @regression
  Cenário: Novo preço aparece para o hóspede
    Quando o anfitrião define R$ 620,00 para a noite de daqui a 15 dias
    Então o hóspede vê R$ 620,00 nessa noite ao reservar
```

### 3.6 `host/cadastro-e-edicao-cabana.feature` (novo; cobre o trabalho em andamento)

```gherkin
# language: pt
@anfitriao @cabanas
Funcionalidade: Cadastro e edição de cabana pelo anfitrião

  @smoke @critical
  Cenário: Cabana nova nasce em análise e não fica pública
    Dado que estou conectado como anfitrião
    Quando cadastro a cabana "Refúgio Teste" pelo painel
    Então ela aparece no meu painel como "Em análise"
    E um visitante não encontra a página pública dela

  @regression @dinheiro @bug @fail
  Esquema do Cenário: Diária digitada como "<digitado>" é salva como <valor>   # BUG-E2E-009
    Dado que estou editando a minha cabana
    Quando informo a diária "<digitado>" e salvo
    Então a página pública mostra a diária de <valor>
    Exemplos:
      | digitado | valor      |
      | 380,50   | R$ 380,50  |
      | 1.250    | R$ 1.250   |

  @security
  Cenário: Anfitrião não abre a edição da cabana de outro anfitrião
    Dado que existe uma cabana de outro anfitrião
    Quando abro a edição dela pelo endereço
    Então vejo a página não encontrada

  @regression
  Cenário: Cabana com reserva confirmada futura não pode ser inativada
    Dado que a minha cabana tem reserva confirmada para daqui a 10 dias
    Quando tento inativá-la
    Então vejo que preciso cancelar as reservas antes

  @regression
  Cenário: Cabana com reservas não pode ser excluída
  @regression
  Cenário: Cabana sem reservas é excluída e sai do painel

  @regression
  Cenário: Edição de nome e capacidade reflete na página pública
```

### 3.7 `host/ical.feature` (novo)

```gherkin
# language: pt
@anfitriao @ical
Funcionalidade: Sincronização de calendário por iCal

  @regression
  Cenário: Feed exportado traz reservas confirmadas e não traz canceladas   # [SONDA]
    Dado que a cabana tem uma reserva confirmada e outra cancelada
    Quando baixo o feed iCal da cabana
    Então o feed tem um evento "Reservado" para a confirmada
    E não tem evento para a cancelada

  @security
  Esquema do Cenário: Importação recusa endereço interno "<url>"
    Dado que estou conectado como anfitrião
    Quando importo o calendário de "<url>"
    Então vejo uma mensagem de link inválido
    E a mensagem não expõe detalhes técnicos do erro
    Exemplos:
      | url                                     |
      | http://127.0.0.1:3333/health            |
      | http://169.254.169.254/latest/meta-data |
      | file:///etc/passwd                      |

  # Importação positiva exige um feed público estável (ex.: arquivo .ics versionado e servido
  # por URL pública) ou uma lista de hosts permitidos só no ambiente de E2E.
```

### 3.8 `reviews/avaliar-estadia.feature` (novo)

Viável hoje sem [DB]: uma reserva com check-in hoje pode ser confirmada e concluída no mesmo dia.

```gherkin
# language: pt
@avaliacoes
Funcionalidade: Avaliação da estadia

  @smoke @critical
  Cenário: Hóspede avalia a estadia concluída e a nota aparece na cabana   # [API] concluir
    Dado que um hóspede tem uma estadia concluída
    Quando ele avalia com 5 estrelas e o comentário "Lugar incrível, voltaremos"
    Então vê "Avaliação enviada com sucesso!"
    E a página pública da cabana mostra a avaliação com o primeiro nome do hóspede
    E a nota média da cabana é 5,0

  @regression
  Cenário: Estadia não pode ser avaliada duas vezes   # [API] avaliar
  @regression @usabilidade
  Cenário: Reserva ainda não concluída não mostra formulário de avaliação
  @security
  Cenário: Hóspede não avalia a reserva de outro hóspede
  @regression
  Cenário: Comentário acima de 500 caracteres é limitado no campo

  @regression
  Cenário: Resposta do anfitrião aparece abaixo da avaliação   # [API] avaliar
    Dado que a cabana recebeu uma avaliação
    Quando o anfitrião responde "Obrigado pela visita!" pelo painel
    Então a página pública mostra a resposta abaixo da avaliação

  @regression @bug @fail
  Cenário: Estadia não é concluída antes do check-out   # BUG-E2E-010
    Dado que um hóspede tem reserva confirmada com check-in hoje e check-out em 2 dias
    Quando o anfitrião tenta concluir a estadia
    Então vê que a estadia ainda não terminou
```

### 3.9 `auth/conta-e-senha.feature` (novo)

```gherkin
# language: pt
@auth @conta
Funcionalidade: Dados da conta e senha

  @regression
  Cenário: Troca de senha passa a valer no próximo login
    Dado que estou conectado como hóspede
    Quando troco a senha informando a senha atual
    Então consigo entrar com a nova senha
    E não consigo entrar com a senha antiga

  @regression @validacao
  Esquema do Cenário: Troca de senha recusada quando <situação>
    Exemplos:
      | situação                     |
      | a senha atual está errada    |
      | a nova senha é igual à atual |

  @security @bug @fail
  Cenário: Trocar a senha encerra a sessão em outros dispositivos   # BUG-E2E-011
    Dado que estou conectado como hóspede em dois navegadores
    Quando troco a senha no primeiro navegador
    Então o segundo navegador volta para o login ao recarregar "Minhas reservas"

  @security
  Cenário: Conta desativada perde o acesso mesmo com sessão aberta
    Dado que um anfitrião está com o painel aberto
    Quando o administrador desativa a conta dele
    Então a próxima navegação do anfitrião leva ao login

  @regression
  Cenário: Telefone atualizado no perfil chega ao anfitrião
    Dado que o hóspede atualizou o telefone no perfil
    Quando ele solicita uma reserva
    Então o anfitrião vê o novo telefone no link da solicitação
```

### 3.10 `security/ssrf-web.feature` (novo)

```gherkin
# language: pt
@security
Funcionalidade: Servidor web não busca endereços arbitrários

  @critical @bug @fail
  Cenário: Extração de endereço do Maps não acessa rede interna   # [CANÁRIO] BUG-E2E-014
    Dado um servidor-canário escutando em endereço local
    E que estou conectado como anfitrião no cadastro de cabana
    Quando colo o endereço do canário no campo de link do Google Maps
    Então o canário não recebe nenhuma requisição
```

### 3.11 `cross-cutting/qualidade-das-paginas.feature` (novo)

Cenários baratos que pegam regressões de layout e de renderização em qualquer tela.

```gherkin
# language: pt
@qualidade
Funcionalidade: Qualidade mínima das páginas principais

  @mobile @regression
  Esquema do Cenário: "<página>" não tem rolagem horizontal no celular
    Quando abro "<página>" num celular de 360 px de largura
    Então a página não tem rolagem horizontal
    Exemplos:
      | página               |
      | home                 |
      | página da cabana     |
      | reservar             |
      | comprovante          |
      | minhas reservas      |
      | painel do anfitrião  |

  @regression
  Esquema do Cenário: "<página>" carrega sem erro de hidratação
    Quando abro "<página>"
    Então o console não registra erro de hidratação nem erro não tratado
    # Datas formatadas no servidor e no navegador com fusos diferentes geram hydration mismatch.

  @a11y @regression
  Esquema do Cenário: "<página>" não tem violação grave de acessibilidade
    Quando abro "<página>"
    Então a análise automática não encontra violação crítica ou séria
    # Implementação: @axe-core/playwright, regras WCAG 2.1 AA.
```

---

## 4. Infraestrutura necessária

| Item               | O que fazer                                                                                                                                                              | Destrava                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| **[API]** adapters | `BookingsAdapter`: `cancel`, `refuse`, `complete`, `review`; `ReviewsAdapter.reply`; `CabinsAdapter.setStatus`, `createExperience`                                       | 3.3, 3.4, 3.8                                         |
| **[GUIA]**         | Configurar o guia pelo painel do anfitrião num `guide-setup.flow.ts`. O guia é salvo pela web direto no banco, sem endpoint na API                                       | 3.2                                                   |
| **[DB]**           | Fixture opcional ligada por `E2E_DATABASE_URL` para criar reservas com datas no passado. A API recusa datas passadas, então não há outro caminho                         | Estadia em andamento, guia expirado, prazo de 90 dias |
| **[SONDA]**        | `*.probe.ts` em `support/modules/<módulo>/` com `APIRequestContext` sem cookies e asserções `expect*()`. Ajustar `check-architecture.mjs` para tratá-lo como Page Object | 3.1, 3.7                                              |
| **[CANÁRIO]**      | Fixture que sobe um `http.createServer` numa porta livre e registra requisições recebidas                                                                                | 3.10                                                  |
| Multi-sessão       | Fixture `secondBrowser` com outro `BrowserContext` e a mesma persona                                                                                                     | 3.9                                                   |
| Fuso por cenário   | Tag `@fuso` lida por fixture que cria o contexto com `timezoneId` calculado                                                                                              | 3.3                                                   |
| Console            | Fixture que coleta `pageerror` e `console.error` e expõe para o Page Object                                                                                              | 3.11                                                  |

---

## 5. Ordem sugerida

1. **Segurança e dinheiro primeiro:** 3.1, guia de anfitrião alheio e reserva não confirmada (3.2), overbooking pelo calendário (3.5) e diária com centavos (3.6). São os bugs com maior impacto e os cenários são curtos.
2. **Fluxos ainda sem cobertura:** avaliação completa (3.8), cadastro de cabana (3.6), regras de solicitação (3.3).
3. **Conta e operação:** 3.4, 3.9, 3.7.
4. **Transversais:** 3.11 e 3.10, que dependem de fixtures novas.
5. **Dependentes de [DB]:** janela do guia durante a estadia e expiração.

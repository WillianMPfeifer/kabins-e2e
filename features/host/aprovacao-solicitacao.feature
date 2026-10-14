# language: pt
@anfitriao @aprovacao
Funcionalidade: Aprovação da solicitação pelo link do anfitrião
  Como anfitrião
  Quero abrir o link recebido e aprovar ou recusar a solicitação
  Para confirmar a estadia ou liberar as datas rapidamente

  Contexto:
    Dado que existe uma cabana ativa com diária de R$ 300
    E um hóspede solicitou 2 noites com chegada daqui a 7 dias

  Regra: O anfitrião dono decide sobre a solicitação

    @smoke @critical
    Cenário: Anfitrião aprova a solicitação e o hóspede vê a reserva confirmada
      Dado que estou conectado como o anfitrião da cabana
      Quando abro o link de aprovação da solicitação
      Então vejo a solicitação pendente com os dados do hóspede
      Quando aprovo a solicitação
      Então vejo que a reserva foi aprovada
      E o hóspede vê a reserva em "Minhas reservas" como "confirmada"

    @critical
    Cenário: Anfitrião recusa com motivo e as noites são liberadas
      Dado que estou conectado como o anfitrião da cabana
      Quando abro o link de aprovação da solicitação
      E recuso a solicitação informando o motivo "Manutenção da hidromassagem"
      Então vejo que a solicitação foi recusada
      E as noites dessa reserva voltam a ficar disponíveis no calendário da cabana

    @regression
    Cenário: Link de solicitação já aprovada não permite nova decisão
      Dado que o anfitrião já aprovou essa solicitação
      E que estou conectado como o anfitrião da cabana
      Quando abro o link de aprovação da solicitação
      Então vejo que a reserva foi aprovada
      E não há mais botões de aprovar ou recusar

  Regra: Só o anfitrião dono da cabana acessa os dados da solicitação

    @smoke @security
    Cenário: Link aberto sem login pede autenticação de anfitrião
      Dado que não estou conectado
      Quando abro o link de aprovação da solicitação
      Então vejo a tela de acesso restrito ao anfitrião

    @regression @security
    Cenário: Link adulterado mostra página não encontrada
      Dado que estou conectado como o anfitrião da cabana
      Quando abro um link de aprovação adulterado
      Então vejo a página não encontrada

    # Regressão do BUG-E2E-001 (corrigido em 10/10/2026): `app/c/[token]/page.tsx` autoriza por `reserva.donoId`, mas a API
    # devolve `anfitriaoId`. Como `donoId` é sempre undefined, qualquer conta logada
    # passa na checagem e vê nome/telefone do hóspede. @fail: quando o bug for corrigido,
    # o cenário passa a "falhar como esperado" e a tag deve ser removida.
    @security
    Cenário: Anfitrião de outra cabana não vê os dados do hóspede
      Dado que estou conectado como outro anfitrião
      Quando abro o link de aprovação da solicitação
      Então vejo a tela de acesso não autorizado
      E os dados do hóspede não aparecem

    @security
    Cenário: O próprio hóspede não acessa a tela de decisão do anfitrião
      Dado que estou conectado como o hóspede que fez a solicitação
      Quando abro o link de aprovação da solicitação
      Então vejo a tela de acesso não autorizado

    # Regressão do BUG-E2E-002 (corrigido em 10/10/2026): o link "Entrar como Anfitrião" envia `?returnUrl=`, mas a tela de
    # login só lê `destino`/`redirect`/`callbackUrl`. Após entrar, o anfitrião cai no
    # painel em vez de voltar para a solicitação (TP03-TS04-TC01).
    @regression
    Cenário: Após entrar pelo link, o anfitrião volta para a solicitação
      Dado que não estou conectado
      Quando abro o link de aprovação da solicitação
      E sigo para "Entrar como Anfitrião" e entro com a conta do anfitrião da cabana
      Então vejo a solicitação pendente com os dados do hóspede

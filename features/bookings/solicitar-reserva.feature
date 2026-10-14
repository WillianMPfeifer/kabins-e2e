# language: pt
@reservas
Funcionalidade: Solicitação de reserva pelo hóspede
  Como hóspede conectado
  Quero escolher as datas no calendário da cabana e enviar uma solicitação
  Para pré-bloquear as noites enquanto o anfitrião confirma (hold de 2h)

  Regra: Uma solicitação válida pré-bloqueia as noites e gera um comprovante

    @smoke @critical @mobile
    Cenário: Hóspede solicita uma reserva de 2 noites
      Dado que existe uma cabana ativa com diária de R$ 300
      E que estou conectado como "hóspede"
      Quando solicito uma reserva de 2 noites com chegada daqui a 7 dias
      Então vejo o comprovante da solicitação aguardando confirmação do anfitrião
      E o comprovante mostra o código da reserva
      E a reserva aparece em "Minhas reservas" como "aguardando aprovação"

    @regression
    Cenário: Valor estimado considera diária vezes número de noites
      Dado que existe uma cabana ativa com diária de R$ 300
      E que estou conectado como "hóspede"
      Quando seleciono no calendário 3 noites com chegada daqui a 7 dias
      Então o calendário indica 3 noites selecionadas
      E o botão de envio mostra o total de "R$ 900"

  Regra: O calendário só permite períodos que respeitam as regras da cabana

    @regression @regras-negocio
    Cenário: Estadia com mais de 5 noites não pode ser selecionada
      Dado que existe uma cabana ativa com diária de R$ 300
      E que estou conectado como "hóspede"
      Quando seleciono no calendário 6 noites com chegada daqui a 7 dias
      Então vejo o aviso de limite de 5 noites por estadia
      E não consigo enviar a solicitação

    @regression @regras-negocio
    Cenário: Noite fechada pelo anfitrião aparece indisponível e quebra o período
      Dado que existe uma cabana ativa com a noite de daqui a 10 dias fechada pelo anfitrião
      E que estou conectado como "hóspede"
      Quando abro o formulário de reserva da cabana
      Então o dia daqui a 10 dias aparece indisponível no calendário
      Quando seleciono no calendário 3 noites com chegada daqui a 9 dias
      Então vejo o aviso de que há noites ocupadas no período

    @regression @regras-negocio
    Cenário: Noites já solicitadas por outro hóspede ficam indisponíveis
      Dado que existe uma cabana ativa com diária de R$ 300
      E outro hóspede já solicitou 2 noites com chegada daqui a 7 dias
      E que estou conectado como "hóspede"
      Quando abro o formulário de reserva da cabana
      Então o dia daqui a 7 dias aparece indisponível no calendário

  Regra: Somente pessoas conectadas concluem a solicitação

    @regression @security
    Cenário: Visitante sem login não consegue concluir a solicitação
      Dado que existe uma cabana ativa com diária de R$ 300
      E que não estou conectado
      Quando seleciono no calendário 2 noites com chegada daqui a 7 dias
      E informo meus dados de contato e envio a solicitação
      Então vejo o erro de reserva "Você precisa estar conectado para realizar uma reserva."

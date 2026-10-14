# language: pt
@reservas @ofertas @dinheiro
Funcionalidade: Ofertas do anfitrião no valor da reserva
  Como hóspede
  Quero pagar o valor com desconto que o site me mostrou
  Para não ter surpresa ao combinar o pagamento com o anfitrião

  @regression
  Cenário: Calendário mostra o desconto da oferta de temporada
    Dado que existe uma cabana ativa com diária de R$ 300
    E o anfitrião criou uma oferta de 20% para as próximas 4 semanas
    E que estou conectado como "hóspede"
    Quando seleciono no calendário 2 noites com chegada daqui a 7 dias
    Então o botão de envio mostra o total de "R$ 480"

  # BUG-E2E-021 — reservas.service.ts (criar) soma só as diárias e os extras; ignora ofertas.
  # O site mostra o total com desconto e a reserva nasce com o preço cheio.
  @critical
  Cenário: Reserva registra o valor com o desconto que o hóspede viu
    Dado que existe uma cabana ativa com diária de R$ 300
    E o anfitrião criou uma oferta de 20% para as próximas 4 semanas
    E que estou conectado como "hóspede"
    Quando seleciono no calendário 2 noites com chegada daqui a 7 dias
    E envio a solicitação
    Então o comprovante mostra o total de "R$ 480"

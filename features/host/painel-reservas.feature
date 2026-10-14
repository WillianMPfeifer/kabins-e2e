# language: pt
@anfitriao @painel
Funcionalidade: Painel de reservas recebidas
  Como anfitrião
  Quero ver as reservas confirmadas das minhas cabanas organizadas por momento
  Para me preparar para as próximas chegadas

  Contexto:
    Dado que existe uma cabana ativa com diária de R$ 300
    E existe uma reserva confirmada de 2 noites com chegada daqui a 7 dias

  @smoke
  Cenário: Reserva confirmada aparece em "Próximas chegadas"
    Dado que estou conectado como o anfitrião da cabana
    Quando abro o painel de reservas recebidas
    Então vejo o grupo "Próximas chegadas"
    E a reserva aparece no painel

  @security
  Cenário: Anfitrião não vê reservas de cabanas de outro anfitrião
    Dado que estou conectado como outro anfitrião
    Quando abro o painel de reservas recebidas
    Então a reserva não aparece no painel

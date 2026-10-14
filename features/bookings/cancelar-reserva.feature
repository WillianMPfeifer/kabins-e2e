# language: pt
@reservas @cancelamento
Funcionalidade: Cancelamento de reserva pelo hóspede
  Como hóspede
  Quero cancelar uma solicitação ou reserva antes do check-in
  Para liberar as datas quando tiver um imprevisto

  Contexto:
    Dado que existe uma cabana ativa com diária de R$ 300

  @critical
  Cenário: Hóspede cancela a própria solicitação e as noites voltam a ficar livres
    Dado que tenho uma solicitação de 2 noites com chegada daqui a 7 dias
    E que estou conectado como "hóspede"
    Quando cancelo essa reserva em "Minhas reservas" informando o motivo "Tive um imprevisto com o trabalho"
    Então a reserva aparece em "Minhas reservas" como "cancelada"
    E não consigo mais cancelar essa reserva
    E as noites dessa reserva voltam a ficar disponíveis no calendário da cabana

  @regression
  Cenário: Hóspede cancela uma reserva já confirmada pelo anfitrião
    Dado que tenho uma reserva confirmada de 2 noites com chegada daqui a 7 dias
    E que estou conectado como "hóspede"
    Quando cancelo essa reserva em "Minhas reservas"
    Então a reserva aparece em "Minhas reservas" como "cancelada"

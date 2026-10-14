# language: pt
@reservas @cancelamento @regras-negocio
Funcionalidade: Regras do cancelamento pelo hóspede
  Como anfitrião
  Quero que cancelamentos respeitem o início da estadia e meus bloqueios
  Para não perder noites que eu mesmo fechei nem receber cancelamento com o hóspede já na cabana

  @regression
  Cenário: Hóspede não cancela pelo site a partir do dia do check-in
    Dado que existe uma cabana ativa aberta desde hoje
    E que estou conectado como "hóspede"
    E que tenho uma reserva confirmada de 2 noites com chegada hoje
    Quando tento cancelar essa reserva em "Minhas reservas"
    Então vejo no card da reserva "A estadia já começou. Fale com o suporte para tratar o cancelamento."
    E a reserva aparece em "Minhas reservas" como "confirmada"

  @regression
  Cenário: Cancelar libera só as noites da reserva e mantém o bloqueio do anfitrião
    Dado que existe uma cabana ativa com diária de R$ 300
    E que tenho uma reserva confirmada de 2 noites com chegada daqui a 7 dias
    E o anfitrião bloqueou a noite de daqui a 9 dias com a observação "Manutenção da banheira"
    E que estou conectado como "hóspede"
    Quando cancelo essa reserva em "Minhas reservas"
    Então as noites dessa reserva voltam a ficar disponíveis no calendário da cabana
    E o dia daqui a 9 dias aparece indisponível no calendário

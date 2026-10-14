# language: pt
@guia
Funcionalidade: Guia digital ainda não configurado
  Como hóspede
  Quero saber o que fazer quando o anfitrião ainda não preencheu o guia
  Para não ficar sem as informações de chegada

  @regression @usabilidade
  Cenário: Hóspede com reserva confirmada é orientado a falar com o anfitrião
    Dado que existe uma cabana ativa com calendário aberto
    E que estou conectado como "hóspede"
    E que tenho uma reserva confirmada de 2 noites com chegada daqui a 3 dias
    Quando abro o guia da cabana
    Então vejo que o guia digital ainda não está disponível e posso falar com o anfitrião

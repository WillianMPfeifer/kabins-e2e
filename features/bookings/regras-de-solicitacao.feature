# language: pt
@reservas @regras-negocio
Funcionalidade: Regras que limitam as solicitações de reserva
  Como plataforma
  Quero impedir solicitações repetidas, conflitantes ou do próprio dono
  Para que o calendário do anfitrião não seja travado por engano ou por abuso

  Regra: Cada hóspede tem no máximo uma solicitação em andamento por cabana

    @regression
    Cenário: Segunda solicitação na mesma cabana com outra ainda pendente é recusada
      Dado que existe uma cabana ativa com diária de R$ 300
      E que estou conectado como "hóspede"
      E que tenho uma solicitação de 2 noites com chegada daqui a 7 dias
      Quando seleciono no calendário 2 noites com chegada daqui a 14 dias
      E envio a solicitação
      Então vejo o erro de reserva "Você já possui uma solicitação de reserva em andamento para esta cabana."

    @regression @security
    Cenário: Ciclo de solicitar e cancelar é limitado a 3 por hora na mesma cabana
      Dado que existe uma cabana ativa com diária de R$ 300
      E que estou conectado como "hóspede"
      E que já solicitei e cancelei 3 vezes nesta cabana na última hora
      Quando seleciono no calendário 2 noites com chegada daqui a 14 dias
      E envio a solicitação
      Então vejo o erro de reserva "Você atingiu o limite de 3 solicitações de reserva para esta cabana nesta hora."

  Regra: Reservar o mesmo período em duas cabanas exige confirmação explícita

    @regression
    Cenário: Hóspede é avisado de reserva confirmada no mesmo período em outra cabana
      Dado que existe uma cabana ativa com diária de R$ 300
      E que estou conectado como "hóspede"
      E que tenho uma reserva confirmada de 2 noites com chegada daqui a 10 dias
      E que existe outra cabana ativa
      Quando seleciono no calendário da outra cabana as mesmas noites
      Então vejo o aviso de que já tenho reserva ativa nessas datas
      E não consigo enviar a solicitação
      Quando confirmo que estou ciente do conflito
      E envio a solicitação
      Então vejo o comprovante da solicitação aguardando confirmação do anfitrião

  Regra: O anfitrião não reserva a própria cabana

    @regression @security
    Cenário: Anfitrião no modo hóspede não consegue reservar a própria cabana
      Dado que existe uma cabana ativa com diária de R$ 300
      E que estou conectado como o anfitrião da cabana no modo hóspede
      Quando seleciono no calendário 2 noites com chegada daqui a 7 dias
      E envio a solicitação
      Então vejo o erro de reserva "Você não pode reservar a própria cabana."

  Regra: O total é a soma do preço de cada noite

    @regression @dinheiro
    Cenário: Total soma diárias diferentes no mesmo período
      Dado que existe uma cabana ativa com diária de R$ 300 e a noite de daqui a 8 dias a R$ 450
      E que estou conectado como "hóspede"
      Quando seleciono no calendário 3 noites com chegada daqui a 7 dias
      Então o botão de envio mostra o total de "R$ 1.050"
      E envio a solicitação
      E o comprovante mostra o total de "R$ 1.050"

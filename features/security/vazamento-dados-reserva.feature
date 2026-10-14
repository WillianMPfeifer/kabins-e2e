# language: pt
@security @isolamento
Funcionalidade: Dados da reserva não vazam por identificadores públicos
  Como hóspede
  Quero que meu telefone e meu e-mail fiquem só com o anfitrião da cabana
  Para não ser exposto a quem descobre o código ou o endereço da minha reserva

  Regra: O código curto e o identificador da reserva não abrem os dados do hóspede

    # Regressão do BUG-E2E-003 (corrigido em 10/10/2026): cabanas-api/src/modules/reservas/reservas.service.ts (detalharPorToken)
    # A consulta pública de solicitação aceita o código curto (CB-XXXXXX) e o id da reserva,
    # além do token. Devolve nome, telefone, e-mail e o próprio token de confirmação.
    @critical
    Cenário: Código curto da reserva não revela o hóspede para quem não está conectado
      Dado que existe uma cabana ativa com calendário aberto
      E um hóspede solicitou 2 noites com chegada daqui a 10 dias
      Quando alguém sem login consulta a solicitação pelo código da reserva
      Então a consulta é recusada sem revelar telefone, e-mail nem token do hóspede

    @critical
    Cenário: Identificador da reserva não revela o hóspede para quem não está conectado
      Dado que existe uma cabana ativa com calendário aberto
      E um hóspede solicitou 2 noites com chegada daqui a 10 dias
      Quando alguém sem login consulta a solicitação pelo identificador da reserva
      Então a consulta é recusada sem revelar telefone, e-mail nem token do hóspede

    # Regressão do BUG-E2E-001 + BUG-E2E-003 (corrigido em 10/10/2026): o código aparece no WhatsApp e no guia; não é segredo.
    @security
    Cenário: Anfitrião de outra cabana não vê o hóspede abrindo o link pelo código
      Dado que existe uma cabana ativa com calendário aberto
      E um hóspede solicitou 2 noites com chegada daqui a 10 dias
      E que estou conectado como outro anfitrião
      Quando abro o link de solicitação usando o código da reserva
      Então os dados do hóspede não aparecem

  Regra: Observações privadas do anfitrião não saem em canais públicos

    # Regressão do BUG-E2E-008 (corrigido em 10/10/2026): cabanas.service.ts (gerarFeedIcal) e disponibilidade.service.ts (consultar)
    @regression
    Cenário: Observação privada de um bloqueio não aparece no feed iCal público
      Dado que existe uma cabana ativa com calendário aberto
      E o anfitrião bloqueou a noite de daqui a 20 dias com a observação "Reforma do deck - orcamento Joao"
      Quando alguém sem login baixa o feed iCal da cabana
      Então o feed marca a noite de daqui a 20 dias como indisponível
      Mas o feed não contém a observação do anfitrião

    @regression
    Cenário: Observação privada de um bloqueio não aparece na consulta pública de disponibilidade
      Dado que existe uma cabana ativa com calendário aberto
      E o anfitrião bloqueou a noite de daqui a 20 dias com a observação "Uso pessoal - aniversario da sogra"
      Quando alguém sem login consulta a disponibilidade da noite de daqui a 20 dias
      Então a resposta não contém a observação do anfitrião

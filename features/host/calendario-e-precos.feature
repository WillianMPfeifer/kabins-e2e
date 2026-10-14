# language: pt
@anfitriao @calendario
Funcionalidade: Calendário e preços pelo painel do anfitrião
  Como anfitrião
  Quero mudar preços e bloquear períodos no painel
  Sem desfazer solicitações que hóspedes já fizeram

  Regra: Editar preço ou disponibilidade não mexe em noites já solicitadas

    # Regressão do BUG-E2E-007 (corrigido em 10/10/2026): o editor de período reabria noites em
    # hold. Agora a API recusa reescrever noites de solicitação pendente, como já fazia com as
    # confirmadas, e o painel mostra o motivo.
    @critical
    Cenário: Período com noites em solicitação não é reescrito pelo painel
      Dado que existe uma cabana ativa com diária de R$ 300
      E um hóspede solicitou 2 noites com chegada daqui a 10 dias
      E que estou conectado como o anfitrião da cabana
      Quando tento alterar pelo painel a diária de daqui a 9 a 12 dias para R$ 500
      Então vejo no painel que as datas têm solicitação pendente
      E outro hóspede vê a noite de daqui a 10 dias indisponível
      E outro hóspede vê a noite de daqui a 11 dias indisponível

  Regra: O que o anfitrião salva no painel é o que o hóspede vê

    @regression
    Cenário: Bloqueio de período fecha todas as noites do intervalo
      Dado que existe uma cabana ativa com diária de R$ 300
      E que estou conectado como o anfitrião da cabana
      Quando bloqueio pelo painel as noites de daqui a 20 a 22 dias
      Então outro hóspede vê a noite de daqui a 20 dias indisponível
      E outro hóspede vê a noite de daqui a 21 dias indisponível
      E outro hóspede vê a noite de daqui a 22 dias indisponível

    @regression @dinheiro
    Cenário: Nova diária de um período vale para o hóspede
      Dado que existe uma cabana ativa com diária de R$ 300
      E que estou conectado como o anfitrião da cabana
      Quando altero pelo painel a diária de daqui a 15 a 16 dias para R$ 620
      E outro hóspede seleciona 2 noites com chegada daqui a 15 dias
      Então o botão de envio mostra o total de "R$ 1.240"

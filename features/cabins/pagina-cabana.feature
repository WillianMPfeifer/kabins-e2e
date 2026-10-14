# language: pt
@cabanas
Funcionalidade: Página pública da cabana
  Como visitante que recebeu o link de uma cabana
  Quero ver os detalhes, a disponibilidade e o preço
  Para decidir se vou solicitar uma reserva

  @smoke @critical @mobile
  Cenário: Visitante vê os detalhes públicos de uma cabana ativa
    Dado que existe uma cabana ativa com calendário aberto
    E que não estou conectado
    Quando abro a página da cabana
    Então vejo o nome, a cidade e a capacidade da cabana
    E vejo as seções de descrição, disponibilidade e avaliações
    E vejo o valor da diária

  @smoke
  Cenário: "Reservar agora" leva ao formulário de reserva
    Dado que existe uma cabana ativa com calendário aberto
    Quando abro a página da cabana
    E clico em "Reservar agora"
    Então vejo o formulário de reserva da cabana

  @regression
  Cenário: Endereço de cabana inexistente mostra página não encontrada
    Quando acesso "/cabana/cabana-que-nao-existe-e2e"
    Então vejo a página não encontrada

  @regression @curadoria
  Cenário: Cabana ainda em análise pela curadoria não fica pública
    Dado que existe uma cabana aguardando aprovação da curadoria
    Quando abro a página da cabana
    Então vejo a página não encontrada

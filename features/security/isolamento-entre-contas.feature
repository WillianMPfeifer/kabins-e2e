# language: pt
@security @isolamento
Funcionalidade: Isolamento de dados entre contas
  Como plataforma que registra estadias de casais
  Quero que cada pessoa veja apenas as próprias reservas
  Para que histórico de hospedagem nunca vaze para terceiros (IDOR)

  Contexto:
    Dado que existe uma cabana ativa com diária de R$ 300
    E outro hóspede já solicitou 2 noites com chegada daqui a 7 dias

  @critical
  Cenário: Hóspede não acessa o comprovante de reserva de outro hóspede pela URL
    Dado que estou conectado como "hóspede"
    Quando acesso o comprovante da reserva do outro hóspede
    Então vejo a página não encontrada

  @critical
  Cenário: "Minhas reservas" lista apenas as reservas do próprio hóspede
    Dado que estou conectado como "hóspede"
    Quando abro "Minhas reservas"
    Então a reserva do outro hóspede não aparece na lista

  @regression
  Cenário: Visitante que acessa um comprovante é enviado ao login
    Dado que não estou conectado
    Quando acesso o comprovante da reserva do outro hóspede
    Então sou redirecionado para o login

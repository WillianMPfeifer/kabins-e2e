# language: pt
@auth @sessao
Funcionalidade: Sessão e áreas restritas
  Como plataforma que guarda dados pessoais e reservas
  Quero exigir login nas áreas restritas e encerrar a sessão quando pedido
  Para que ninguém veja dados de outra pessoa

  @smoke @security
  Esquema do Cenário: Área restrita "<rota>" exige login
    Dado que não estou conectado
    Quando acesso "<rota>"
    Então sou redirecionado para o login guardando o destino "<rota>"

    Exemplos:
      | rota            |
      | /conta/reservas |
      | /perfil         |
      | /painel         |
      | /admin          |

  @critical
  Cenário: Sair da conta encerra a sessão
    Dado que estou conectado como "hóspede"
    E estou na página "/conta/reservas"
    Quando saio da conta pelo menu do cabeçalho
    Então o cabeçalho mostra a opção de entrar
    E ao acessar "/conta/reservas" sou redirecionado para o login guardando o destino "/conta/reservas"

  @regression
  Cenário: Sessão injetada continua válida após recarregar a página
    Dado que estou conectado como "hóspede"
    Quando acesso "/conta/reservas"
    E recarrego a página
    Então vejo a área "Minhas reservas"

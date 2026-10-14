# language: pt
@auth @login
Funcionalidade: Login na plataforma
  Como pessoa cadastrada (hóspede, anfitrião ou administrador)
  Quero entrar com meu e-mail e senha
  Para acessar a área correspondente ao meu perfil

  Regra: Cada perfil é levado para a sua área depois de entrar

    @smoke @critical
    Esquema do Cenário: <perfil> entra e é levado para a sua área
      Dado que existe uma conta de "<perfil>"
      Quando a pessoa entra com o e-mail e a senha corretos
      Então ela é levada para "<destino>"
      E o cabeçalho mostra que ela está conectada

      Exemplos:
        | perfil        | destino |
        | hóspede       | /       |
        | administrador | /admin  |

    # A API escolhe ANFITRIAO como papel inicial de quem tem os dois papéis
    # (auth.service#escolherPapelInicial). Anfitrião entra direto no painel e
    # volta para o site como hóspede pelo menu da conta.
    @smoke @critical
    Cenário: Anfitrião entra direto no painel e alterna para o perfil de hóspede
      Dado que existe uma conta de "anfitrião"
      Quando a pessoa entra com o e-mail e a senha corretos
      Então ela é levada para "/painel"
      Quando a pessoa alterna para o perfil de hóspede pelo menu do cabeçalho
      Então ela é levada para "/"

    @regression
    Cenário: Hóspede volta para a página que tentava acessar
      Dado que existe uma conta de "hóspede"
      Quando a pessoa tenta acessar "/conta/reservas" sem estar conectada
      Então ela é redirecionada para o login guardando o destino "/conta/reservas"
      Quando a pessoa entra com o e-mail e a senha corretos
      Então ela é levada para "/conta/reservas"

  Regra: O login não pode dar pistas sobre quais contas existem

    @regression @security
    Cenário: Senha errada e e-mail inexistente exibem a mesma mensagem
      Dado que existe uma conta de "hóspede"
      Quando a pessoa tenta entrar com a senha errada
      E alguém tenta entrar com um e-mail que não está cadastrado
      Então as duas tentativas exibem exatamente a mesma mensagem de erro
      E a pessoa continua na tela de login

    @regression @security
    Cenário: Conta desativada pelo administrador não consegue entrar
      Dado que existe uma conta de "hóspede"
      E o administrador desativou essa conta
      Quando a pessoa entra com o e-mail e a senha corretos
      Então o login é recusado com uma mensagem de erro
      E a pessoa continua na tela de login

  Regra: A tela de login ajuda a digitar a senha corretamente

    @regression @ux
    Cenário: Exibir e ocultar a senha digitada
      Dado que estou na tela de login
      Quando digito a senha "UmaSenhaQualquer1"
      E peço para ver a senha
      Então a senha fica visível
      Quando peço para ocultar a senha
      Então a senha fica oculta

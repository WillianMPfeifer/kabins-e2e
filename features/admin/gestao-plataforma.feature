# language: pt
@admin
Funcionalidade: Gestão da plataforma pelo administrador
  Como administrador master
  Quero acessar a gestão de anfitriões, cabanas e usuários
  Para operar a curadoria da plataforma

  @smoke
  Cenário: Administrador acessa a gestão da plataforma
    Dado que estou conectado como "administrador"
    Quando abro a gestão da plataforma
    Então vejo a lista de anfitriões cadastrados

  @regression
  Cenário: Anfitrião criado aparece na gestão da plataforma
    Dado que existe uma conta de "anfitrião"
    E que estou conectado como "administrador"
    Quando abro a gestão da plataforma
    Então vejo o e-mail desse anfitrião na gestão

  @security @critical
  Esquema do Cenário: <perfil> não acessa a gestão da plataforma
    Dado que estou conectado como "<perfil>"
    Quando acesso "/admin"
    Então não vejo a gestão da plataforma

    Exemplos:
      | perfil    |
      | hóspede   |
      | anfitrião |

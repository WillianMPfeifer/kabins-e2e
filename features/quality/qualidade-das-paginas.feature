# language: pt
@qualidade
Funcionalidade: Qualidade mínima das telas principais
  Como pessoa usando o Kabins no celular
  Quero telas que caibam na tela e não quebrem ao carregar
  Para conseguir reservar e acompanhar a estadia sem atrito

  Contexto:
    Dado que existe uma cabana ativa com calendário aberto
    E que tenho uma reserva confirmada de 2 noites com chegada daqui a 7 dias

  @regression @layout-celular
  Esquema do Cenário: "<tela>" cabe na largura de um celular pequeno
    Dado que estou conectado como <perfil> para ver as telas
    Quando abro a tela "<tela>" num celular pequeno
    Então a tela não tem rolagem horizontal

    Exemplos:
      | tela                  | perfil                 |
      | home                  | hóspede                |
      | página da cabana      | hóspede                |
      | formulário de reserva | hóspede                |
      | comprovante           | hóspede                |
      | minhas reservas       | hóspede                |
      | painel do anfitrião   | anfitrião da cabana    |

    # Regressão do BUG-E2E-020 (corrigido em 10/10/2026): e-mail longo no cabeçalho do perfil.
    Exemplos: E-mail longo no cabeçalho do perfil
      | tela                  | perfil                 |
      | perfil                | hóspede                |

  @regression
  Esquema do Cenário: "<tela>" carrega sem erro de hidratação nem exceção
    Dado que estou conectado como <perfil> para ver as telas
    Quando abro a tela "<tela>"
    Então o navegador não registra erro de hidratação nem exceção

    Exemplos:
      | tela                  | perfil              |
      | home                  | hóspede             |
      | página da cabana      | hóspede             |
      | formulário de reserva | hóspede             |
      | comprovante           | hóspede             |
      | minhas reservas       | hóspede             |
      | perfil                | hóspede             |
      | painel do anfitrião   | anfitrião da cabana |

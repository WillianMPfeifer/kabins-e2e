# language: pt
@anfitriao @cabanas
Funcionalidade: Cadastro e edição de cabana pelo anfitrião
  Como anfitrião
  Quero cadastrar e editar minhas cabanas pelo painel
  Para manter o anúncio correto sem mexer no que é de outros anfitriões

  Regra: Cabana nova passa pela curadoria antes de ficar pública

    @critical
    Cenário: Cabana cadastrada pelo painel nasce em análise e não fica pública antes da aprovação
      Dado que estou conectado como "anfitrião"
      Quando cadastro pelo painel uma cabana nova
      Então volto ao painel com a cabana nova selecionada
      E a cabana nova aparece no painel com o selo "Em análise"
      E um visitante não encontra a página pública da cabana nova
      Quando a equipe aprova a cabana nova na curadoria
      Então um visitante encontra a página pública da cabana nova

  Regra: A diária digitada é a diária salva

    # BUG-E2E-009 — NewCabinPageContent.tsx / EditCabinPageContent.tsx (handlePriceChange)
    # descarta a vírgula: "380,50" vira 38050. O DTO aceita até R$ 100.000.
    @regression @dinheiro
    Esquema do Cenário: Diária digitada como "<digitado>" não é multiplicada
      Dado que existe uma cabana ativa com calendário aberto
      E que estou conectado como o anfitrião da cabana
      Quando digito a diária "<digitado>" na edição da cabana
      Então o campo de diária representa R$ <valor>

      Exemplos:
        | digitado | valor  |
        | 380,50   | 380.50 |
        | 1.250,00 | 1250   |

  Regra: Cada anfitrião só edita as próprias cabanas

    # Regressão do BUG-E2E-015 (corrigido em 10/10/2026): painel/cabanas/[id]/editar carrega qualquer cabana ativa, de qualquer dono
    @security
    Cenário: Anfitrião não abre a edição da cabana de outro anfitrião
      Dado que existe uma cabana ativa com calendário aberto
      E que estou conectado como outro anfitrião
      Quando abro a edição dessa cabana pelo endereço
      Então vejo a página não encontrada

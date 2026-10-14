# language: pt
@guia
Funcionalidade: Acesso ao guia digital da cabana
  Como anfitrião
  Quero que a senha do Wi-Fi e o código da fechadura só cheguem a quem vai se hospedar
  Para que estranhos não consigam entrar na cabana

  Contexto:
    Dado que existe uma cabana ativa com calendário aberto
    E o anfitrião configurou o guia da cabana com Wi-Fi "Kabins_5G", senha "segredo123" e fechadura "4821#"

  Regra: Só o hóspede com reserva confirmada desta cabana tem o guia liberado

    @smoke @critical
    Cenário: Hóspede com reserva confirmada vê a contagem regressiva antes do check-in
      Dado que estou conectado como "hóspede"
      E que tenho uma reserva confirmada de 2 noites com chegada daqui a 3 dias
      Quando abro o guia da cabana
      Então vejo que o guia será liberado no dia do check-in
      E não vejo a senha do Wi-Fi do guia

    # Regressão do BUG-E2E-005 (corrigido em 10/10/2026): cabanas-web/src/app/guia/[slug]/page.tsx (matchingBooking ignora o status)
    @security @critical
    Cenário: Solicitação ainda não aprovada não é tratada como estadia confirmada
      Dado que estou conectado como "hóspede"
      E que tenho uma solicitação de 2 noites com chegada daqui a 3 dias
      Quando abro o guia da cabana
      Então o guia não afirma que a estadia está confirmada

    @security
    Esquema do Cenário: Reserva <situação> não dá acesso ao guia
      Dado que estou conectado como "hóspede"
      E que tive uma reserva <situação> nesta cabana
      Quando abro o guia da cabana
      Então vejo que não tenho reserva ativa nesta cabana

      Exemplos:
        | situação                 |
        | recusada pelo anfitrião  |
        | cancelada por mim        |

    # Regressão do BUG-E2E-005 (corrigido em 10/10/2026): o vínculo também casa pelo nome da cabana, que não é único
    @security
    Cenário: Reserva em cabana de mesmo nome não abre o guia de outra cabana
      Dado que existe outra cabana, de outro anfitrião, com o mesmo nome e guia configurado
      E que estou conectado como "hóspede"
      E que tenho uma reserva confirmada de 2 noites com chegada daqui a 3 dias
      Quando abro o guia da outra cabana
      Então vejo que não tenho reserva ativa nesta cabana

  Regra: Anfitriões só visualizam o guia das próprias cabanas

    @regression
    Cenário: Anfitrião da cabana vê o guia completo em modo de visualização
      Dado que estou conectado como o anfitrião da cabana
      Quando abro o guia da cabana
      Então vejo o aviso de visualização do anfitrião
      E vejo a senha do Wi-Fi do guia

    # Regressão do BUG-E2E-004 (corrigido em 10/10/2026): page.tsx libera a visualização para qualquer conta com papel de anfitrião
    @security @critical
    Cenário: Anfitrião de outra cabana não vê a senha da fechadura nem a do Wi-Fi
      Dado que estou conectado como outro anfitrião
      Quando abro o guia da cabana
      Então não vejo a senha da fechadura do guia
      E não vejo a senha do Wi-Fi do guia

    # Regressão do BUG-E2E-006 (corrigido em 10/10/2026): guide-actions.ts confere só o papel, não a posse da cabana
    @security @critical
    Cenário: Anfitrião não altera o guia de cabana alheia adulterando o formulário
      Dado que outro anfitrião está editando o guia da própria cabana
      Quando ele envia o formulário do guia com a rede "RedeInvasora" apontando para a cabana do primeiro anfitrião
      Então o guia da cabana continua com a rede Wi-Fi configurada pelo anfitrião

  Regra: Quem não pode ver o guia recebe orientação clara

    @regression
    Cenário: Visitante sem login é convidado a entrar e volta ao guia
      Dado que tenho uma reserva confirmada de 2 noites com chegada daqui a 3 dias
      E que não estou conectado
      Quando abro o guia da cabana
      Então vejo que o guia é exclusivo para hóspedes
      Quando sigo para entrar e entro com a minha conta de hóspede
      Então volto para o guia da cabana

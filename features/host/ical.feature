# language: pt
@anfitriao @ical
Funcionalidade: Sincronização de calendário por iCal
  Como anfitrião que também anuncia no Airbnb e no Booking
  Quero trocar calendários por link iCal
  Para não vender a mesma noite em dois lugares

  Regra: O feed exportado reflete as reservas confirmadas

    @regression
    Cenário: Feed traz a reserva confirmada e omite a cancelada
      Dado que existe uma cabana ativa com calendário aberto
      E existe uma reserva confirmada de 2 noites com chegada daqui a 7 dias
      E outra reserva da cabana foi cancelada
      Quando alguém sem login baixa o feed iCal da cabana
      Então o feed traz a reserva confirmada
      E o feed não traz a reserva cancelada

    # Regressão do BUG-E2E-016 (corrigido em 10/10/2026): IcalSyncModal.tsx monta o link com a origem do site (/api/v1/... no :3000),
    # mas o feed é servido pela API. O link copiado devolve 404.
    @critical
    Cenário: Link de exportação mostrado no painel entrega o calendário
      Dado que existe uma cabana ativa com calendário aberto
      E que estou conectado como o anfitrião da cabana
      Quando copio o link de exportação iCal no painel
      Então o link entrega um calendário válido

  Regra: A importação só aceita endereços públicos e seguros

    @security
    Esquema do Cenário: Importação recusa o endereço interno "<endereço>"
      Dado que existe uma cabana ativa com calendário aberto
      E que estou conectado como o anfitrião da cabana
      Quando importo o calendário do endereço "<endereço>" pelo painel
      Então vejo que o endereço foi recusado, sem detalhes técnicos

      Exemplos:
        | endereço                                     |
        | http://127.0.0.1:3333/api/v1/health           |
        | https://127.0.0.1/calendario.ics              |
        | https://localhost:3333/api/v1/health          |
        | https://169.254.169.254/latest/meta-data/     |
        | https://10.0.0.5/calendario.ics               |

    @regression @usabilidade
    Cenário: Link que não existe mostra mensagem sem detalhes técnicos
      Dado que existe uma cabana ativa com calendário aberto
      E que estou conectado como o anfitrião da cabana
      Quando importo o calendário do endereço "https://calendario-inexistente.invalid/feed.ics" pelo painel
      Então vejo que o endereço foi recusado, sem detalhes técnicos

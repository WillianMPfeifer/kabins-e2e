# language: pt
@avaliacoes
Funcionalidade: Avaliação da estadia
  Como hóspede que se hospedou
  Quero avaliar a cabana e ver minha avaliação publicada
  Para ajudar outros casais e valorizar o anfitrião

  Regra: Só o titular de uma estadia concluída avalia, e uma única vez

    @smoke @critical
    Cenário: Hóspede avalia a estadia concluída e a nota aparece na página da cabana
      Dado que existe uma cabana ativa aberta desde hoje
      E que estou conectado como "hóspede"
      E que tenho uma estadia concluída nessa cabana
      Quando avalio a estadia com 4 estrelas e o comentário "Lugar incrível, voltaremos"
      Então vejo que a avaliação foi enviada
      E a página da cabana mostra a nota "4,0" com 1 avaliação
      E a página da cabana mostra minha avaliação só com o primeiro nome

    @regression
    Cenário: Estadia já avaliada não aceita uma segunda avaliação
      Dado que existe uma cabana ativa aberta desde hoje
      E que estou conectado como "hóspede"
      E que tenho uma estadia concluída e já avaliada nessa cabana
      Quando avalio a estadia com 5 estrelas e o comentário "Tentando avaliar de novo"
      Então vejo a mensagem "Esta reserva já foi avaliada"

    @regression
    Cenário: Reserva ainda não concluída não pode ser avaliada
      Dado que existe uma cabana ativa com calendário aberto
      E que estou conectado como "hóspede"
      E que tenho uma reserva confirmada de 2 noites com chegada daqui a 7 dias
      Quando avalio a estadia com 5 estrelas e o comentário "Ainda nem fui"
      Então vejo a mensagem "A avaliação fica disponível após a conclusão da estadia."

    @security
    Cenário: Hóspede não abre a avaliação da reserva de outro hóspede
      Dado que existe uma cabana ativa com calendário aberto
      E existe uma reserva confirmada de 2 noites com chegada daqui a 7 dias
      E que estou conectado como "hóspede"
      Quando abro a avaliação da reserva do outro hóspede
      Então vejo a página não encontrada

    @regression @validacao
    Cenário: Comentário é limitado a 500 caracteres
      Dado que existe uma cabana ativa aberta desde hoje
      E que estou conectado como "hóspede"
      E que tenho uma estadia concluída nessa cabana
      Quando abro a avaliação da minha estadia
      E escrevo um comentário de 600 caracteres
      Então o comentário fica com no máximo 500 caracteres

  Regra: A estadia só termina depois do check-out

    # Regressão do BUG-E2E-010 (corrigido em 11/10/2026): concluir compara o check-out; após o check-out a conclusão é automática
    @regression
    Cenário: Anfitrião não conclui a estadia antes do check-out
      Dado que existe uma cabana ativa aberta desde hoje
      E que tenho uma reserva confirmada de 2 noites com chegada hoje
      E que estou conectado como o anfitrião da cabana
      Quando concluo pelo painel a estadia que começou hoje
      Então o hóspede vê a reserva em "Minhas reservas" como "confirmada"

  Regra: A resposta do anfitrião é pública

    # Regressão do BUG-E2E-017 (corrigido em 10/10/2026): a página pública não recebe nem exibe a resposta
    # (AvaliacaoResumoDto sem "resposta"; CabinReviews.tsx não a renderiza)
    @regression
    Cenário: Resposta do anfitrião aparece na página da cabana
      Dado que existe uma cabana ativa aberta desde hoje
      E a cabana recebeu a avaliação "Cabana linda, faltou lenha"
      E que estou conectado como o anfitrião da cabana
      Quando respondo a avaliação com "Obrigado! Já reforçamos o estoque de lenha."
      Então a página da cabana mostra a resposta "Obrigado! Já reforçamos o estoque de lenha."

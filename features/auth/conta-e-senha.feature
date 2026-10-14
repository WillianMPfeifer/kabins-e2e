# language: pt
@auth @conta
Funcionalidade: Dados da conta e troca de senha
  Como pessoa cadastrada
  Quero manter meus dados e minha senha sob controle
  Para que só eu acesse a conta e o anfitrião consiga falar comigo

  Regra: A troca de senha vale na hora e exige a senha atual

    @regression
    Cenário: Nova senha passa a valer no próximo login e a antiga deixa de funcionar
      Dado que estou conectado como "hóspede"
      Quando troco minha senha no perfil para "KabinsNova2027"
      Então vejo a confirmação de que a senha foi alterada
      E depois de sair não consigo entrar com a senha antiga
      E consigo entrar com a nova senha

    @regression @validacao
    Esquema do Cenário: Troca de senha recusada quando <situação>
      Dado que estou conectado como "hóspede"
      Quando tento trocar a senha informando <senha atual> como senha atual e <nova senha> como nova
      Então vejo no perfil a mensagem "<mensagem>"

      Exemplos:
        | situação                     | senha atual       | nova senha        | mensagem                                     |
        | a senha atual está errada    | "SenhaErrada2026" | "KabinsNova2027"  | A senha atual informada está incorreta.       |
        | a nova senha é igual à atual | "KabinsE2e2026"   | "KabinsE2e2026"   | A nova senha deve ser diferente da senha atual. |

    # Regressão do BUG-E2E-011 (corrigido em 10/10/2026): auth.service.ts (alterarSenha) não revoga as outras sessões.
    # "Sair de todos os dispositivos" (logout-todos) revoga na hora, então a correção é viável.
    @security @critical
    Cenário: Trocar a senha encerra a sessão aberta em outro dispositivo
      Dado que estou conectado como "hóspede" também em outro dispositivo
      Quando troco minha senha no perfil para "KabinsNova2027"
      Então o outro dispositivo é levado ao login ao abrir "Minhas reservas"

  Regra: Conta desativada perde o acesso imediatamente

    @security
    Cenário: Anfitrião desativado perde o acesso mesmo com a sessão aberta
      Dado que estou conectado como "anfitrião"
      E o administrador desativou essa conta
      Então ao acessar "/painel" sou redirecionado para o login guardando o destino "/painel"

  Regra: O telefone cadastrado é o que o anfitrião recebe

    # Regressão do BUG-E2E-018 (corrigido em 10/10/2026): phone.util.ts (formatPhoneMask) ignora o +55: "+55 54 99999-0000" vira
    # "(55) 54999-9900", sem os 2 últimos dígitos. Salvar o perfil grava o número errado.
    @regression
    Cenário: Perfil mostra o telefone cadastrado com o DDD correto
      Dado que estou conectado como "hóspede"
      Quando abro meu perfil
      Então o telefone aparece com o DDD e todos os dígitos

    @regression
    Cenário: Telefone atualizado no perfil chega ao anfitrião
      Dado que existe uma cabana ativa com calendário aberto
      E que estou conectado como "hóspede"
      Quando atualizo meu telefone no perfil para "54988887777"
      E que tenho uma solicitação de 2 noites com chegada daqui a 7 dias
      Então o anfitrião vê o telefone "54988887777" no link da solicitação

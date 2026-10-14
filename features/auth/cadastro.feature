# language: pt
@auth @cadastro
Funcionalidade: Cadastro público de hóspede
  Como visitante maior de idade
  Quero criar minha conta com e-mail e senha
  Para poder solicitar reservas de cabanas

  Contexto:
    Dado que estou na tela de cadastro

  @smoke @critical
  Cenário: Cadastro com dados válidos já deixa o hóspede conectado
    Quando preencho o cadastro com dados válidos
    E envio o cadastro
    Então minha conta é criada e já estou conectado
    E consigo acessar "Minhas reservas" sem reservas ainda

  @regression
  Cenário: CPF é formatado enquanto é digitado
    Quando preencho o cadastro com dados válidos
    Então o CPF aparece formatado no campo

  @regression @validacao
  Esquema do Cenário: Cadastro recusado quando <situação>
    Quando preencho o cadastro com dados válidos, exceto <situação>
    E envio o cadastro
    Então vejo a mensagem de erro "<mensagem>"
    E continuo na tela de cadastro

    Exemplos:
      | situação                            | mensagem                                                               |
      | o CPF com dígito verificador errado | Por favor, corrija os campos destacados.                               |
      | a idade de 17 anos                  | Por favor, corrija os campos destacados.                               |
      | a senha com menos de 8 caracteres   | Mínimo de 8 caracteres, com letra maiúscula, letra minúscula e número. |
      | a senha sem números                 | Mínimo de 8 caracteres, com letra maiúscula, letra minúscula e número. |
      | a confirmação de senha diferente    | As senhas não conferem.                                                |

  @regression @validacao
  Esquema do Cenário: Campo inválido é destacado com orientação: <situação>
    Quando preencho o cadastro com dados válidos, exceto <situação>
    E envio o cadastro
    Então o campo mostra a orientação "<orientação>"

    Exemplos:
      | situação                            | orientação                       |
      | o CPF com dígito verificador errado | Informe um CPF ou CNPJ válido.   |
      | a idade de 17 anos                  | Você deve ter no mínimo 18 anos. |

  @regression @security
  Cenário: E-mail já cadastrado não cria uma segunda conta
    Dado que existe uma conta de "hóspede"
    Quando preencho o cadastro usando o e-mail dessa conta
    E envio o cadastro
    Então vejo um alerta de erro no cadastro
    E continuo na tela de cadastro

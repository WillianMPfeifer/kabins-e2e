# language: pt
@security
Funcionalidade: O servidor do site não busca endereços arbitrários
  Como plataforma hospedada na nuvem
  Quero que links informados por usuários não façam o servidor acessar a rede interna
  Para que ninguém use o site para alcançar serviços privados

  # Regressão do BUG-E2E-014 (corrigido em 10/10/2026): dashboard-actions.ts (extractMapsAddressAction) busca qualquer URL a partir
  # do servidor, seguindo redirecionamentos, sem checar sessão nem domínio.
  @critical
  Cenário: Extrair endereço do Google Maps não acessa endereço interno
    Dado um servidor-canário escutando na rede interna
    E que estou conectado como "anfitrião"
    Quando colo o endereço do canário como link do Google Maps no cadastro de cabana
    Então o canário não recebe nenhuma requisição

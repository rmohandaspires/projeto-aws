Autenticação com Amazon Cognito (JWT) – Mini Curso AWS
Visão geral

Este projeto utiliza Amazon Cognito User Pool para autenticação e API Gateway (HTTP API) com JWT Authorizer para proteção das rotas.
O fluxo é:

O usuário autentica no Cognito e recebe um JWT (AccessToken/IdToken).

O cliente chama a API passando Authorization: Bearer <AccessToken>.

O API Gateway valida o JWT (assinatura, expiração, issuer e audience).

A Lambda recebe a requisição já autenticada e pode (opcionalmente) validar grupos/roles.

Infraestrutura implantada (CDK)

As stacks implantadas seguem o padrão do projeto:

MiniCurso-Networking-<env>: VPC simplificada (sem NAT para reduzir custos).

MiniCurso-Security-<env>: Segurança base (Security Groups, etc.).

MiniCurso-Database-<env>: DynamoDB (on-demand).

MiniCurso-Authorization-<env>: Cognito User Pool + App Client.

MiniCurso-Compute-<env>: HTTP API + Lambdas + Rotas (com JWT Authorizer).

Configuração do Cognito (AuthorizationStack)
Componentes criados

User Pool (Ex.: mini-curso-userpool)

App Client (User Pool Client) sem secret (generateSecret: false)

Fluxos de autenticação habilitados (para uso via CLI e testes)

Fluxos de autenticação (Auth Flows)

Para permitir geração de token via AWS CLI usando admin-initiate-auth, o App Client deve ter habilitado:

ALLOW_ADMIN_USER_PASSWORD_AUTH (essencial para ADMIN_NO_SRP_AUTH)

(opcional) ALLOW_USER_PASSWORD_AUTH

(opcional) ALLOW_USER_SRP_AUTH

Se ALLOW_ADMIN_USER_PASSWORD_AUTH não estiver habilitado, o CLI retorna:
Auth flow not enabled for this client

Proteção das rotas (JWT Authorizer no API Gateway)

A API usa HTTP API com JWT Authorizer configurado com:

Issuer (iss) do Cognito:
https://cognito-idp.<REGION>.amazonaws.com/<USER_POOL_ID>

Audience (aud):
<USER_POOL_CLIENT_ID>

Exemplo (valores reais do projeto):

Region: us-east-2

User Pool ID: us-east-2_DFNYWDF8M

Client ID: 14scmi5516auet2jsgndofo2aj

Issuer:
https://cognito-idp.us-east-2.amazonaws.com/us-east-2_DFNYWDF8M

Rotas

GET /health → pública (sem autenticação)

GET /hello → protegida (JWT obrigatório)

POST /hello → protegida e (opcional) restrita por grupo (ADMIN)

Como criar usuário e gerar token (JWT)
1) Obter valores necessários no Console

No Console AWS → Cognito → User pools → seu pool:

User pool ID (formato REGIAO_xxxxx), ex: us-east-2_DFNYWDF8M

App client ID, ex: 14scmi5516auet2jsgndofo2aj

2) Criar usuário (Console)

Cognito → Users → Create user

Defina email e atributos necessários.

Garanta que o usuário esteja Confirmed (não pode ficar em “FORCE_CHANGE_PASSWORD”).

Se o usuário estiver em “Alterar senha à força (FORCE_CHANGE_PASSWORD)”, é necessário definir uma senha permanente.

Definir senha permanente (PowerShell)

No PowerShell, não use \ para quebrar linha. Use crase ` ou coloque tudo em uma linha.

Comando (1 linha)
aws cognito-idp admin-set-user-password --user-pool-id us-east-2_DFNYWDF8M --username "rmcsistemas4@gmail.com" --password "SuaSenhaForte@123" --permanent

Gerar token (JWT) via AWS CLI
Comando (PowerShell)
aws cognito-idp admin-initiate-auth `
  --user-pool-id us-east-2_DFNYWDF8M `
  --client-id 14scmi5516auet2jsgndofo2aj `
  --auth-flow ADMIN_NO_SRP_AUTH `
  --auth-parameters USERNAME="rmcsistemas4@gmail.com",PASSWORD="SuaSenhaForte@123"

Resposta esperada

O Cognito retorna:

AuthenticationResult.AccessToken ✅ use este para chamar a API

AuthenticationResult.IdToken

AuthenticationResult.RefreshToken

ExpiresIn

Para chamadas HTTP protegidas, use o AccessToken no header Authorization.

Como chamar a API com o token
1) Armazenar o AccessToken em variável
$accessToken = "COLE_AQUI_O_ACCESS_TOKEN"

2) Chamar rota pública
curl "SUA_API_URL/health"

3) Chamar rota protegida (JWT)
curl "SUA_API_URL/hello" -H "Authorization: Bearer $accessToken"

4) POST protegido (exemplo)
curl -X POST "SUA_API_URL/hello" `
  -H "Authorization: Bearer $accessToken" `
  -H "Content-Type: application/json" `
  -d '{"name":"Mohandas"}'

(Opcional) Autorização por grupos (ADMIN/USER)
Criar grupos (Console)

Cognito → Groups → Create group:

ADMIN

USER

Adicionar usuário ao grupo

Cognito → Users → selecione o usuário → Add to group → ADMIN ou USER

Importante: após adicionar em grupo, gere um token novo para que o claim cognito:groups venha no JWT.

Regra do projeto (RBAC)

GET /hello: permitido para autenticados

POST /hello: permitido somente para ADMIN

A validação ocorre na Lambda lendo o claim cognito:groups do JWT (quando necessário).

Troubleshooting rápido
1) Auth flow not enabled for this client

➡ Habilite ALLOW_ADMIN_USER_PASSWORD_AUTH no App Client.

2) 401 Unauthorized na API

➡ Verifique:

Você está usando AccessToken

O Authorizer está configurado com issuer/audience corretos:

issuer = https://cognito-idp.<region>.amazonaws.com/<userPoolId>

audience = <clientId>

3) groups vazio

➡ Você precisa:

adicionar usuário ao grupo

gerar token novamente (token antigo não traz o claim)

Checklist final

 User Pool criado (AuthorizationStack)

 App Client criado com flows corretos

 Usuário confirmado com senha permanente

 Token gerado via admin-initiate-auth

 /health público

 /hello protegido com JWT

 (Opcional) RBAC por grupo funcionando
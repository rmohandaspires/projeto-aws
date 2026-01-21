# Autenticação com Amazon Cognito (JWT) – Mini Curso AWS

## Visão geral

Este projeto utiliza **Amazon Cognito User Pool** para autenticação e **API Gateway (HTTP API)** com **JWT Authorizer** para proteção das rotas.

### Fluxo de autenticação

1. O usuário autentica no Cognito e recebe um **JWT** (`AccessToken` / `IdToken`)
2. O cliente chama a API passando o header  
   `Authorization: Bearer <AccessToken>`
3. O **API Gateway** valida o JWT (assinatura, expiração, issuer e audience)
4. A **Lambda** recebe a requisição já autenticada e pode (opcionalmente) validar **grupos/roles**

---

## Infraestrutura implantada (CDK)

As stacks seguem o padrão do projeto:

- **MiniCurso-Networking-<env>**  
  VPC simplificada (sem NAT para reduzir custos)

- **MiniCurso-Security-<env>**  
  Segurança base (Security Groups, etc.)

- **MiniCurso-Database-<env>**  
  DynamoDB (on-demand)

- **MiniCurso-Authorization-<env>**  
  Cognito User Pool + App Client

- **MiniCurso-Compute-<env>**  
  HTTP API + Lambdas + Rotas com JWT Authorizer

---

## Configuração do Cognito (AuthorizationStack)

### Componentes criados

- **User Pool**  
  Exemplo: `mini-curso-userpool`

- **App Client (User Pool Client)**
  - `generateSecret: false`
  - Sem client secret (obrigatório para HTTP API + JWT)

---

## Fluxos de autenticação (Auth Flows)

Para permitir geração de token via **AWS CLI** usando `admin-initiate-auth`, o App Client deve ter habilitado:

- `ALLOW_ADMIN_USER_PASSWORD_AUTH` (**obrigatório**)
- `ALLOW_USER_PASSWORD_AUTH` (opcional)
- `ALLOW_USER_SRP_AUTH` (opcional)

Se `ALLOW_ADMIN_USER_PASSWORD_AUTH` não estiver habilitado, o CLI retorna:

```
Auth flow not enabled for this client
```

---

## Proteção das rotas (JWT Authorizer no API Gateway)

Issuer:
```
https://cognito-idp.<REGION>.amazonaws.com/<USER_POOL_ID>
```

Audience:
```
<USER_POOL_CLIENT_ID>
```

### Exemplo real

- Region: us-east-2
- User Pool ID: us-east-2_DFNYWDF8M
- Client ID: 14scmi5516auet2jsgndofo2aj

Issuer:
```
https://cognito-idp.us-east-2.amazonaws.com/us-east-2_DFNYWDF8M
```

---

## Rotas

| Método | Rota     | Proteção |
|------|----------|----------|
| GET  | /health  | Pública |
| GET  | /hello   | JWT |
| POST | /hello   | JWT + ADMIN |

---

## Criar usuário e gerar token

### Definir senha permanente

```powershell
aws cognito-idp admin-set-user-password --user-pool-id us-east-2_DFNYWDF8M --username "rmcsistemas4@gmail.com" --password "SuaSenhaForte@123" --permanent
```

### Gerar token

```powershell
aws cognito-idp admin-initiate-auth `
  --user-pool-id us-east-2_DFNYWDF8M `
  --client-id 14scmi5516auet2jsgndofo2aj `
  --auth-flow ADMIN_NO_SRP_AUTH `
  --auth-parameters USERNAME="rmcsistemas4@gmail.com",PASSWORD="SuaSenhaForte@123"
```

---

## Chamar API

```powershell
$accessToken = "COLE_AQUI_O_ACCESS_TOKEN"
```

```bash
curl "SUA_API_URL/health"
curl "SUA_API_URL/hello" -H "Authorization: Bearer $accessToken"
```

---

## RBAC por grupos

- GET /hello → autenticado
- POST /hello → ADMIN

Claim usado:
```json
cognito:groups
```

---

## Checklist

- User Pool criado
- App Client configurado
- Usuário confirmado
- Token gerado
- Rotas protegidas

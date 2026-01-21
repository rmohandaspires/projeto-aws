import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { processHello } from "./business-logic";

function getGroups(event: APIGatewayProxyEventV2): string[] {
  const claims: any = (event.requestContext as any)?.authorizer?.jwt?.claims;
  const groups = claims?.["cognito:groups"];

  if (!groups) return [];
  if (Array.isArray(groups)) return groups;
  // Cognito normalmente vem como string "ADMIN,USER" ou "ADMIN"
  return String(groups).split(",").map((g) => g.trim()).filter(Boolean);
}

function isAdmin(groups: string[]) {
  return groups.includes("ADMIN");
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const method = event.requestContext.http.method;
    const groups = getGroups(event);

    // Regra: POST só ADMIN
    if (method === "POST" && !isAdmin(groups)) {
      return {
        statusCode: 403,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Acesso negado: requer grupo ADMIN" }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const result = processHello({ name: body.name });

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...result,
        method,
        groups,
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Erro interno" }),
    };
  }
}

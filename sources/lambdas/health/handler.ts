import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const response = {
    status: "UP",
    service: "mini-curso-aws",
    timestamp: new Date().toISOString(),
    requestId: event.requestContext?.requestId,
  };

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(response),
  };
}

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpJwtAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";

export interface ComputeStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  table: dynamodb.Table;
  userPoolId: string;
  userPoolClientId: string;
  region: string;
}

export class ComputeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const healthLambda = new lambdaNode.NodejsFunction(this, "HealthLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, "../../../../sources/lambdas/health/handler.ts"),
      handler: "handler",
      vpc: props.vpc,
      allowPublicSubnet: true,
    });

    const helloLambda = new lambdaNode.NodejsFunction(this, "HelloLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, "../../../../sources/lambdas/hello/handler.ts"),
      handler: "handler",
      environment: { TABLE_NAME: props.table.tableName },
      vpc: props.vpc,
      allowPublicSubnet: true,
    });

    props.table.grantReadWriteData(helloLambda);

    // JWT Authorizer: valida issuer e audience (clientId)
    const issuer = `https://cognito-idp.${props.region}.amazonaws.com/${props.userPoolId}`;
    const jwtAuthorizer = new HttpJwtAuthorizer("JwtAuth", issuer, {
      jwtAudience: [props.userPoolClientId],
    });

    const api = new HttpApi(this, "MiniCursoHttpApi", {
      apiName: "mini-curso-api",
    });

    // Publico: /health
    api.addRoutes({
      path: "/health",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("HealthIntegration", healthLambda),
    });

    // Protegido: /hello
    api.addRoutes({
      path: "/hello",
      methods: [HttpMethod.GET, HttpMethod.POST],
      integration: new HttpLambdaIntegration("HelloIntegration", helloLambda),
      authorizer: jwtAuthorizer,
    });

    new cdk.CfnOutput(this, "ApiUrl", { value: api.url ?? "NO_URL" });
  }
}

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";

export interface AuthorizationStackProps extends cdk.StackProps {}

export class AuthorizationStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthorizationStackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, "MiniCursoUserPool", {
      userPoolName: "mini-curso-userpool",
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: true,
        requireSymbols: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.userPoolClient = new cognito.UserPoolClient(this, "MiniCursoUserPoolClient", {
      userPool: this.userPool,
      generateSecret: false,
      authFlows: {
         adminUserPassword: true,
        userPassword: true,
        userSrp: true,
      },
    });
  }
}

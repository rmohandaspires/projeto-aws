// infra/lib/app-builder.ts
import * as cdk from "aws-cdk-lib";

import { getEnvConfig, AppEnvConfig } from '../config/app-env-properties';

import { NetworkingStack } from '../infra/lib/stacks/networking/networking-stack';
import { SecurityStack } from '../infra/lib/stacks/security/security-stack';
import { DatabaseStack } from '../infra/lib/stacks/database/database-stack';
import { AuthorizationStack } from '../infra/lib/stacks/authorization/authorization-stack';
import { ComputeStack } from '../infra/lib/stacks/compute/compute-stack';

export class MyAppBuilder {
  private readonly app: cdk.App;
  private readonly envConfig: AppEnvConfig;

  private networkingStack?: NetworkingStack;
  private securityStack?: SecurityStack;
  private databaseStack?: DatabaseStack;
  private authorizationStack?: AuthorizationStack;
  private computeStack?: ComputeStack;

  constructor(app: cdk.App) {
    this.app = app;
    this.envConfig = getEnvConfig(process.env.ENV);
  }

  addNetworkingStack(): MyAppBuilder {
    this.networkingStack = new NetworkingStack(
      this.app,
      `MiniCurso-Networking-${this.envConfig.envName}`,
      {
        env: {
          account: this.envConfig.awsAccountId,
          region: this.envConfig.awsRegion,
        },
      }
    );
    return this;
  }

  addSecurityStack(): MyAppBuilder {
    if (!this.networkingStack) {
      throw new Error("NetworkingStack deve ser criada antes da SecurityStack");
    }

    this.securityStack = new SecurityStack(
      this.app,
      `MiniCurso-Security-${this.envConfig.envName}`,
      {
        env: {
          account: this.envConfig.awsAccountId,
          region: this.envConfig.awsRegion,
        },
        vpc: this.networkingStack.vpc,
      }
    );
    return this;
  }

  addDatabaseStack(): MyAppBuilder {
    if (!this.networkingStack) {
      throw new Error("NetworkingStack deve ser criada antes da DatabaseStack");
    }

    this.databaseStack = new DatabaseStack(
      this.app,
      `MiniCurso-Database-${this.envConfig.envName}`,
      {
        env: {
          account: this.envConfig.awsAccountId,
          region: this.envConfig.awsRegion,
        },
        vpc: this.networkingStack.vpc,
      }
    );
    return this;
  }

  addAuthorizationStack(): MyAppBuilder {
    this.authorizationStack = new AuthorizationStack(
      this.app,
      `MiniCurso-Authorization-${this.envConfig.envName}`,
      {
        env: {
          account: this.envConfig.awsAccountId,
          region: this.envConfig.awsRegion,
        },
      }
    );
    return this;
  }

  addComputeStack(): MyAppBuilder {
    if (!this.networkingStack || !this.databaseStack) {
      throw new Error("Networking e Database devem existir antes da ComputeStack");
    }
    if (!this.authorizationStack) {
      throw new Error("AuthorizationStack deve existir antes da ComputeStack (JWT)");
    }

    this.computeStack = new ComputeStack(
      this.app,
      `MiniCurso-Compute-${this.envConfig.envName}`,
      {
        env: {
          account: this.envConfig.awsAccountId,
          region: this.envConfig.awsRegion,
        },
        vpc: this.networkingStack.vpc,
        table: this.databaseStack.table,

        // JWT (Cognito)
        userPoolId: this.authorizationStack.userPool.userPoolId,
        userPoolClientId: this.authorizationStack.userPoolClient.userPoolClientId,
        region: this.envConfig.awsRegion,
      }
    );
    return this;
  }

  build(): cdk.App {
    return this.app;
  }
}

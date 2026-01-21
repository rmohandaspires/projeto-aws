// infra/lib/stacks/database/database-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface DatabaseStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class DatabaseStack extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    this.table = new dynamodb.Table(this, 'MiniCursoTable', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // bom pra free tier
      removalPolicy: cdk.RemovalPolicy.DESTROY, // cuidado em produção
    });
  }
}

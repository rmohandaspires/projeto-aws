// infra/lib/stacks/security/security-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface SecurityStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class SecurityStack extends cdk.Stack {
  public readonly lambdaSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: SecurityStackProps) {
    super(scope, id, props);

    this.lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
      description: 'Security group para Lambdas do mini curso',
    });
  }
}

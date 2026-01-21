// infra/lib/stacks/networking/networking-stack.ts
// infra/lib/stacks/networking/networking-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface NetworkingStackProps extends cdk.StackProps {}

export class NetworkingStack extends cdk.Stack {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props: NetworkingStackProps) {
    super(scope, id, props);

    // VPC simples (boa proFree Tier, mas cuidado com NAT Gateway se criar privada + NAT)
    const vpc = new ec2.Vpc(this, 'MiniCursoVpc', {
      maxAzs: 2,
      natGateways: 0, // pra não gerar custo alto
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    this.vpc = vpc;
  }
}


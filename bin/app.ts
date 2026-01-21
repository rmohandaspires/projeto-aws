#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MyAppBuilder } from './my-app-builder';

process.env.ENV = process.env.ENV || 'dev';

const app = new cdk.App();

new MyAppBuilder(app)
  .addNetworkingStack()
  .addSecurityStack()
  .addDatabaseStack()
  .addAuthorizationStack()
  .addComputeStack()
  .build();

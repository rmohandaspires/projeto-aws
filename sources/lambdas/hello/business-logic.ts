// sources/lambdas/hello/business-logic.ts
import { logInfo } from '../shared/logger';

export interface HelloInput {
  name?: string;
}

export function processHello(input: HelloInput) {
  const name = input.name || 'mundo';
  const message = `Olá, ${name}! Bem-vindo ao mini curso na AWS.`;
  logInfo('processHello called', { name });
  return {
    message,
    timestamp: new Date().toISOString(),
  };
}

// sources/lambdas/shared/logger.ts
export function logInfo(message: string, extra?: unknown) {
  console.log(JSON.stringify({ level: 'INFO', message, extra }));
}

export function logError(message: string, extra?: unknown) {
  console.error(JSON.stringify({ level: 'ERROR', message, extra }));
}

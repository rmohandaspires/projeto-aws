// config/app-env-properties.ts
import { devProperties } from "./dev-properties";

export type  AppEnvConfig  = typeof devProperties;

const envMap = new Map<string, AppEnvConfig >([
    ['dev', devProperties],
]);

export function getEnvConfig(env?: string): AppEnvConfig {
    const key = env || process.env.ENV || 'dev';
    const config = envMap.get(key);
    if (!config) {
        throw new Error(`Configurações de ambiente não encontrada para ENV=${key}`);
    }
    return config;
}
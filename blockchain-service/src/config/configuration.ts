/**
 * Strongly-typed application configuration, loaded once by `@nestjs/config`.
 *
 * Centralising env access here keeps `process.env` lookups out of the services
 * and gives a single, typed source of truth for required settings.
 */
export interface AppConfig {
  port: number;
  solana: {
    rpcUrl: string;
    programId: string;
    /** Optional crank-wallet secret key (base58 or JSON byte array). */
    crankSecretKey?: string;
  };
  supabase: {
    url?: string;
    serviceRoleKey?: string;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3004', 10),
  solana: {
    rpcUrl: process.env.RPC_URL ?? '',
    programId: process.env.ESCROW_PROGRAM_ID ?? '',
    crankSecretKey: process.env.CRANK_SECRET_KEY || undefined,
  },
  supabase: {
    url: process.env.SUPABASE_URL || undefined,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
  },
});

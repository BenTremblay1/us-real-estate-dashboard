/**
 * Server-side repository factory.
 * Returns MockDataRepository by default.
 * When SNOWFLAKE_ACCOUNT is set in the environment, returns SnowflakeDataRepository.
 *
 * This file runs only in server contexts (API routes, Server Components).
 * Do not import in client components.
 */
import type { DataRepository } from './repository';
import { MockDataRepository } from './mock-adapter';
// import { SnowflakeDataRepository } from './snowflake-adapter'; // Uncomment in Phase 4

let _serverRepo: DataRepository | null = null;

export function getServerRepository(): DataRepository {
  if (_serverRepo) return _serverRepo;

  if (process.env.SNOWFLAKE_ACCOUNT) {
    // TODO Phase 4: instantiate SnowflakeDataRepository
    // _serverRepo = new SnowflakeDataRepository({ ... });
    // return _serverRepo;
    console.warn('[server-repository] SNOWFLAKE_ACCOUNT is set but SnowflakeDataRepository is not yet implemented. Falling back to mock.');
  }

  _serverRepo = new MockDataRepository();
  return _serverRepo;
}

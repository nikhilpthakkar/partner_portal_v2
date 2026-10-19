import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('a production simulator requires explicit review opt-in; live builds remain live', () => {
  for (const [mode, simulator, review, enabled] of [
    ['production', 'false', 'false', false],
    ['production', 'true', 'false', false],
    ['production', 'false', 'true', false],
    ['production', 'true', 'true', true],
    ['development', 'true', 'false', true],
  ]) {
    const output = execFileSync(
      process.execPath,
      [
        '--experimental-strip-types',
        '--input-type=module',
        '-e',
        "import {FINANCIAL_SIMULATOR_ENABLED} from './src/features/financial-workspace/config.ts'; process.stdout.write(String(FINANCIAL_SIMULATOR_ENABLED));",
      ],
      {
        cwd: new URL('..', import.meta.url),
        env: {
          ...process.env,
          NODE_ENV: mode,
          NEXT_PUBLIC_FINANCIAL_SIMULATOR: simulator,
          NEXT_PUBLIC_FINANCIAL_REVIEW: review,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    assert.equal(output.toString(), String(enabled), `${mode}/${simulator}/${review}`);
  }
});

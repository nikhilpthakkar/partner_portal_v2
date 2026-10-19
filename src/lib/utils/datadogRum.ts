import type { RumGlobal } from '@datadog/browser-rum';
/**
 * Datadog Browser RUM — required client-side env (set in CI / deployment):
 * - NEXT_PUBLIC_DD_APPLICATION_ID
 * - NEXT_PUBLIC_DD_CLIENT_TOKEN (RUM-scoped only)
 * - NEXT_PUBLIC_DD_SITE (e.g. datadoghq.com, ap1.datadoghq.com)
 *
 * Optional:
 * - NEXT_PUBLIC_DD_SERVICE (default: health-buy-journey-frontend)
 * - NEXT_PUBLIC_DD_ENV (default: derived from NEXT_PUBLIC_JENKINS_ENV)
 * - NEXT_PUBLIC_DD_VERSION (release / git SHA for correlation)
 * - NEXT_PUBLIC_DD_COMPONENT_RENDER_TRACKING (set to "false" to disable component vitals)
 * - NEXT_PUBLIC_DD_SESSION_SAMPLE_RATE (0–100; default 20 prod / 100 non-prod)
 * - NEXT_PUBLIC_DD_RUM_ENABLED (set to "false" to disable RUM entirely)
 *
 * Implementation uses a single dynamic `import()` + one init promise so the SDK
 * module is not evaluated twice (avoids "SDK is loaded more than once" when
 * HMR/Strict Mode or split chunks would re-run the static entry).
 */

let rumReady = false;
let initPromise: Promise<RumGlobal | null> | null = null;

const DEFAULT_DD_APPLICATION_ID = '7fc7b504-15f8-4c71-88e0-037e2fa65950';
const DEFAULT_DD_CLIENT_TOKEN = 'pub744cc753a998e1ecaccd6daba899a4dd';

function stripEnvQuotes(value: string | undefined): string {
  return value?.trim().replace(/^["']|["']$/g, '') ?? '';
}

function resolveDatadogEnv(): string {
  const deploymentTarget = stripEnvQuotes(process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET);
  if (deploymentTarget === 'life-prod') return 'life-prod';
  if (deploymentTarget === 'uat') return 'uat';
  if (deploymentTarget === 'prod') return 'prod';

  const env = process.env.NEXT_PUBLIC_ENV;
  if (env === 'production') return 'prod';
  if (env === 'uat') return 'uat';
  return 'local';
}

function resolveSessionSampleRate(): number {
  const configured = stripEnvQuotes(process.env.NEXT_PUBLIC_DD_SESSION_SAMPLE_RATE);
  if (configured) {
    const parsed = Number(configured);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      return parsed;
    }
  }
  // Unsampled sessions send no RUM events — UAT defaults to 100%, prod defaults to 20%.
  return process.env.NEXT_PUBLIC_ENV === 'production' ? 20 : 100;
}

function isDatadogRumDisabled(): boolean {
  return stripEnvQuotes(process.env.NEXT_PUBLIC_DD_RUM_ENABLED).toLowerCase() === 'false';
}

function readDatadogCredentials(): { applicationId: string; clientToken: string } | null {
  const applicationId =
    stripEnvQuotes(process.env.NEXT_PUBLIC_DD_APPLICATION_ID) || DEFAULT_DD_APPLICATION_ID;
  const clientToken =
    stripEnvQuotes(process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN) || DEFAULT_DD_CLIENT_TOKEN;
  if (!applicationId || !clientToken) {
    return null;
  }
  return { applicationId, clientToken };
}

function getInitializedRum(): Promise<RumGlobal | null> {
  if (typeof window === 'undefined' || isDatadogRumDisabled()) {
    return Promise.resolve(null);
  }

  const credentials = readDatadogCredentials();
  if (!credentials) {
    return Promise.resolve(null);
  }

  if (initPromise) {
    return initPromise;
  }
  initPromise = (async (): Promise<RumGlobal | null> => {
    const { applicationId, clientToken } = credentials;
    const [{ datadogRum }, { reactPlugin }] = await Promise.all([
      import('@datadog/browser-rum'),
      import('@datadog/browser-rum-react'),
    ]);
    const isProd = process.env.NEXT_PUBLIC_ENV === 'production';
    const version = stripEnvQuotes(process.env.NEXT_PUBLIC_DD_VERSION);
    const site = stripEnvQuotes(process.env.NEXT_PUBLIC_DD_SITE) || 'datadoghq.com';
    try {
      datadogRum.init({
        applicationId,
        clientToken,
        site,
        service:
          stripEnvQuotes(process.env.NEXT_PUBLIC_DD_SERVICE) || 'embedded-partner-portal-frontend',
        env: resolveDatadogEnv(),
        ...(version ? { version } : {}),
        sessionSampleRate: resolveSessionSampleRate(),
        sessionReplaySampleRate: isProd ? 5 : 0,
        trackUserInteractions: false,
        trackResources: true,
        trackLongTasks: true,
        defaultPrivacyLevel: 'mask-user-input',
        silentMultipleInit: true,
        plugins: [reactPlugin()],
        beforeSend: (event) => {
          // RUM `resource.duration` and `long_task.duration` are in nanoseconds (see SDK `toServerDuration`, rumEvent.types).
          const NS_PER_MS = 1e6;
          // Drop low-signal resources: keep only HTTP errors or slow loads (default: > 2s).
          if (event.type === 'resource') {
            const status = event.resource?.status_code ?? 0;
            const durationNs = event.resource?.duration ?? 0;
            const isError = status >= 400;
            const isSlow = durationNs > 2000 * NS_PER_MS;
            if (!isError && !isSlow) {
              return false;
            }
          }
          // Drop short long tasks (default: ignore < 500ms).
          if (event.type === 'long_task') {
            const durationNs = event.long_task?.duration ?? 0;
            if (durationNs < 500 * NS_PER_MS) {
              return false;
            }
          }
          return true;
        },
      });
      rumReady = true;
      return datadogRum;
    } catch {
      rumReady = false;
      return null;
    }
  })();
  return initPromise;
}
export function initDatadogRum(): void {
  getInitializedRum().catch(() => {
    // init failures are handled inside getInitializedRum
  });
}
export function isDatadogRumReady(): boolean {
  return rumReady;
}
export function forwardExceptionToDatadog(context: Record<string, unknown>): void {
  getInitializedRum()
    .then((dd) => {
      if (!dd) return;
      try {
        dd.addAction('exception', context);
      } catch {
        // ignore SDK errors
      }
    })
    .catch(() => {
      // dynamic import / init failure
    });
}

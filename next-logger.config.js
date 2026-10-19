const pino = require('pino');

const ANSI_REGEX = /\u001B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g;

function stripAnsi(value) {
  return typeof value === 'string' ? value.replace(ANSI_REGEX, '') : value;
}

function stringifyMessage(value) {
  if (value == null) return '';
  if (typeof value === 'string') return stripAnsi(value);
  if (value instanceof Error) return String(value.message ?? '');
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function toException(err) {
  if (!err) return undefined;
  if (err instanceof Error) {
    return { type: err.name, message: stringifyMessage(err.message) };
  }
  if (typeof err === 'object') {
    return {
      type: err.type || err.name || 'Error',
      message: stringifyMessage(err.message),
    };
  }
  return { type: 'Error', message: stringifyMessage(err) };
}

function toStacktrace(err) {
  if (!err) return undefined;
  if (typeof err === 'string') return err;
  if (err.stack) return String(err.stack);
  return undefined;
}

const logger = (defaultConfig) => {
  const originalLogMethod = defaultConfig?.hooks?.logMethod;

  return pino({
    ...(defaultConfig ?? {}),
    messageKey: 'message',
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    formatters: {
      level(label) {
        return { level: String(label).toUpperCase() };
      },
      bindings(bindings) {
        const loggerName = bindings.prefix
          ? `${bindings.name || 'next.js'}.${bindings.prefix}`
          : bindings.name || 'next.js';
        return {
          thread: String(bindings.pid ?? process.pid),
          logger: loggerName,
        };
      },
      log(object) {
        const { err, error, requestId, trace_id: traceId, ...rest } = object;
        const exceptionSource = err || error;
        const formatted = { ...rest };
        const resolvedRequestId = requestId || traceId;

        if (resolvedRequestId) formatted.requestId = String(resolvedRequestId);

        if (exceptionSource) {
          formatted.exception = toException(exceptionSource);
          const stacktrace = toStacktrace(exceptionSource);
          if (stacktrace) formatted.stacktrace = stacktrace;
          const cause = exceptionSource.cause;
          if (cause) formatted.rootCause = toException(cause);
        }

        delete formatted.err;
        delete formatted.error;
        delete formatted.prefix;
        delete formatted.name;
        delete formatted.pid;
        delete formatted.hostname;
        return formatted;
      },
    },
    hooks: {
      ...(defaultConfig?.hooks ?? {}),
      logMethod(args, method, level) {
        const cleanedArgs = args.map(stripAnsi);
        if (originalLogMethod) {
          return originalLogMethod.call(this, cleanedArgs, method, level);
        }
        return method.apply(this, cleanedArgs);
      },
    },
  });
};

module.exports = { logger };

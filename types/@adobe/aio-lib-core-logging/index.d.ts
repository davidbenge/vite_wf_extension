declare module '@adobe/aio-lib-core-logging' {
  interface AioLoggerConfig {
    level?: string;
    transports?: string;
    silent?: boolean;
    provider?: string;
    logSourceAction?: boolean;
  }

  interface AioLogger {
    error(...data: (object | string)[]): void;
    warn(...data: (object | string)[]): void;
    info(...data: (object | string)[]): void;
    log(...data: (object | string)[]): void;
    verbose(...data: (object | string)[]): void;
    debug(...data: (object | string)[]): void;
    silly(...data: (object | string)[]): void;
    close(): void;
  }

  function aioLogger(moduleName: string, config?: AioLoggerConfig): AioLogger;
  export = aioLogger;
} 
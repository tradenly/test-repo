
interface LoggerConfig {
  enableConsoleInProduction: boolean;
  enableErrorReporting: boolean;
}

const config: LoggerConfig = {
  enableConsoleInProduction: import.meta.env.DEV,
  enableErrorReporting: true,
};

export const logger = {
  error: (message: string, error?: any) => {
    if (config.enableConsoleInProduction) {
      console.error(message, error);
    }
    // In production, you could send to error reporting service here
    if (config.enableErrorReporting && !import.meta.env.DEV) {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, { message });
    }
  },
  
  log: (message: string, data?: any) => {
    if (config.enableConsoleInProduction) {
      console.log(message, data);
    }
  },
  
  warn: (message: string, data?: any) => {
    if (config.enableConsoleInProduction) {
      console.warn(message, data);
    }
  }
};

import util from "util";

interface AppLoggerOptions {
  message: string;
  level?: "info" | "warn" | "error";
  showTimestamp?: boolean;
  err?: string | object | Error;
}

const appLogger = ({
  message,
  level = "info",
  showTimestamp = true,
  err,
}: AppLoggerOptions) => {
  const colors = {
    info: "\x1b[34m", // Blue
    warn: "\x1b[33m", // Yellow
    error: "\x1b[31m", // Red
  };

  const colorCode = colors[level];
  const timestamp = showTimestamp ? `(${new Date().toISOString()})` : "";
  const wrapColor = (str: string) => colorCode + str + "\x1b[0m";

  console[level](wrapColor(`[${level.toUpperCase()}]${timestamp} ${message}`));

  if (err) {
    let output = "";
    if (err instanceof Error) {
      output = err.stack || err.message;
    } else if (typeof err === "string") {
      output = err;
    } else {
      output = util.inspect(err, { depth: null });
    }
    console[level](wrapColor(output));
  }
};
export default appLogger;

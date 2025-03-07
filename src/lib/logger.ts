enum LogLevel {
	INFO = "Info",
	WARN = "Warn",
	ERROR = "Error",
	DEBUG = "Debug",
}

interface LogColors {
	reset: string;
	bright: string;
	dim: string;
	info: string;
	warn: string;
	error: string;
	debug: string;
}

const colors: LogColors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",
	info: "\x1b[36m", // Cyan
	warn: "\x1b[33m", // Amarillo
	error: "\x1b[31m", // Rojo
	debug: "\x1b[35m", // Magenta
};

export class Logger {
	private static instance: Logger;

	private readonly debugMode: boolean;
	private readonly showTimestamp: boolean;

	private constructor(debugMode = true, showTimestamp = false) {
		this.debugMode = debugMode;
		this.showTimestamp = showTimestamp;
	}

	public static getInstance(debugMode = true): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger(debugMode);
		}
		return Logger.instance;
	}

	private getTimestamp(): string {
		return new Date().toISOString();
	}

	private log(level: LogLevel, message: string, ...args: unknown[]): void {
		if (level === LogLevel.DEBUG && !this.debugMode) return;

		const timestamp = this.getTimestamp();
		const color = colors[level.toLowerCase() as keyof Omit<LogColors, "reset" | "bright" | "dim">];

		console.log(
			`${colors.dim}${this.showTimestamp ? `[${timestamp}]` : ""}${colors.reset} ${color}${colors.bright}[${level}]${colors.reset} ${message}`,
			...args,
		);
	}

	public info(message: string, ...args: unknown[]): void {
		this.log(LogLevel.INFO, message, ...args);
	}

	public warn(message: string, ...args: unknown[]): void {
		this.log(LogLevel.WARN, message, ...args);
	}

	public error(message: string, ...args: unknown[]): void {
		this.log(LogLevel.ERROR, message, ...args);
	}

	public debug(message: string, ...args: unknown[]): void {
		this.log(LogLevel.DEBUG, message, ...args);
	}
}

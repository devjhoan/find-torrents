export interface Files {
	server: string;
	files: string[];
}

export interface TorrentStats {
	found: number;
	errors: string[];
	notFound: string[];
	total: number;
	averageTimePerFile: number;
}

export interface SaveAllFilesStats {
	totalFiles: number;
	filesPerServer: Record<string, number>;
	executionTime: number;
	averageTimePerServer: number;
	errors: string[];
}

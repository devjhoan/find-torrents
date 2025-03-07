import type { Files, SaveAllFilesStats } from "@/lib/types";
import { Logger } from "@/lib/logger";
import fs from "node:fs/promises";
import { glob } from "fast-glob";
import path from "node:path";

const logger = Logger.getInstance(false);
const SERVERS = [
	"/dropbox",
	"/dropbox-2",
	"/dropbox-3",
	"/dropbox-4",
	"/dropbox-5",
	"/dropbox-6",
	"/dropbox-7",
	"/dropbox-8",
];

async function getAllFiles(): Promise<Files[]> {
	const results: Files[] = [];
	const errors: string[] = [];

	for (const server of SERVERS) {
		try {
			logger.info(`Escaneando servidor (${server || 1})`);
			const searchPattern = path.join(server, "**/*").replace(/\\/g, "/");

			const foundFiles = await glob(searchPattern, {
				absolute: true,
				onlyFiles: true,
				caseSensitiveMatch: false,
			});

			logger.info(`Encontrados ${foundFiles.length} archivos en servidor ${server || 1}`);
			results.push({
				server: server || "1",
				files: foundFiles,
			});
		} catch (error) {
			logger.error(`Error escaneando servidor ${server}: ${error}`);
			errors.push(server);
		}
	}

	return results;
}

async function saveToJson() {
	const startTime = performance.now();
	try {
		const allFiles = await getAllFiles();
		const outputPath = path.join(process.cwd(), "allFiles.json");

		await fs.writeFile(outputPath, JSON.stringify(allFiles, null, 2), "utf-8");
		logger.info(`Archivo JSON guardado exitosamente en: ${outputPath}`);

		const executionTime = (performance.now() - startTime) / 1000;
		const stats: SaveAllFilesStats = {
			totalFiles: allFiles.reduce((acc, curr) => acc + curr.files.length, 0),
			filesPerServer: Object.fromEntries(allFiles.map((result) => [result.server, result.files.length])),
			executionTime,
			averageTimePerServer: executionTime / SERVERS.length,
			errors: [],
		};

		await fs.writeFile(path.join(process.cwd(), "scanStats.json"), JSON.stringify(stats, null, 2), "utf-8");

		console.log("\n\n");
		console.log("📊 Estadísticas finales:");
		console.log(`   • Total de archivos encontrados: ${stats.totalFiles}`);
		console.log(`   • Servidores escaneados: ${SERVERS.length}`);
		console.log(`   • Tiempo de ejecución: ${stats.executionTime.toFixed(2)} segundos`);
		console.log(`   • Tiempo promedio por servidor: ${stats.averageTimePerServer.toFixed(3)} segundos`);
		console.log("\n📁 Archivos por servidor:");

		for (const [server, count] of Object.entries(stats.filesPerServer)) {
			console.log(`   • ${server}: ${count} archivos`);
		}
	} catch (error) {
		logger.error("[x] Error al guardar el archivo:", error);
	}
}

saveToJson();

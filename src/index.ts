import parseTorrent, { type Instance } from "parse-torrent";
import { readdir, readFile } from "node:fs/promises";
import type { Files, TorrentStats } from "@/lib/types";
import { Logger } from "@/lib/logger";

const logger = Logger.getInstance(false);
const torrentsFound: Record<string, string> = {};

logger.info("🔍 Iniciando búsqueda de torrents...");

const serverFiles: Files[] = await Bun.file("allFiles.json").json();
const torrents = await readdir("torrents");

const stats: TorrentStats = {
	found: 0,
	errors: [],
	notFound: [],
	total: torrents.length,
	averageTimePerFile: 0,
};

logger.info(`📁 Procesando ${torrents.length} archivos torrent...`);

for await (const filePath of torrents) {
	try {
		const displayFilePath = filePath.replace(/\[Lat-Team._Poder.Latino_\]/g, "").replace(/\.torrent$/, "");

		logger.debug(`📥 Analizando torrent: ${displayFilePath}`);
		const torrent = (await parseTorrent(await readFile(`torrents/${filePath}`))) as Instance;

		if (!torrent.files) {
			logger.error(`❌ El torrent ${filePath} no contiene archivos`);
			stats.errors.push(filePath);
			continue;
		}

		const files = torrent.files.map((file) => file.path);
		const fileToFoundPath = normalizeTorrentFilePath(files[0]);

		const torrentFoundInfo = {
			server: "",
			path: "",
		};

		for (const { files: filesServer, server } of serverFiles) {
			const foundFile = filesServer.find((file) => file.endsWith(fileToFoundPath));
			if (foundFile) {
				torrentFoundInfo.server = server;
				torrentFoundInfo.path = foundFile.replace(files[0].replace("\\", "/"), "");
			}
		}

		if (torrentFoundInfo.server && torrentFoundInfo.path) {
			logger.info(`✅ Torrent "${displayFilePath}" encontrado en servidor: ${torrentFoundInfo.server}`);
			torrentsFound[filePath] = torrentFoundInfo.path;
			stats.found++;
		} else {
			logger.error(`❌ No se encontró "${displayFilePath}" en ningún servidor`);
			stats.notFound.push(filePath);
		}
	} catch (error) {
		logger.error(`💥 Error procesando "${filePath}": ${error}`);
		stats.errors.push(filePath);
	}
}

const executionTime = process.uptime();
stats.averageTimePerFile = executionTime / stats.total;

await Bun.write("torrentsFound.json", JSON.stringify(torrentsFound, null, 2));
await Bun.write("stats.json", JSON.stringify(stats, null, 2));

console.log("\n\n");
console.log("📊 Estadísticas finales:");
console.log(`   • Total de torrents procesados: ${stats.total}`);
console.log(`   • Torrents encontrados: ${stats.found} (${((stats.found / stats.total) * 100).toFixed(2)}%)`);
console.log(`   • Errores encontrados: ${stats.errors.length}`);
console.log(`   • Tiempo de ejecución: ${executionTime.toFixed(2)} segundos`);
console.log(`   • Tiempo promedio por torrent: ${stats.averageTimePerFile.toFixed(3)} segundos`);

function normalizeTorrentFilePath(filePath: string) {
	const split = filePath.split("\\");
	return split[split.length - 1];
}

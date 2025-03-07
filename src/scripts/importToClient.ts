import { qBittorrentClient, type TorrentAddParameters } from "@robertklep/qbittorrent";
import { readFile } from "fs/promises";
import { Logger } from "@/lib/logger";

const logger = Logger.getInstance(false);
const client = new qBittorrentClient("http://localhost:8080", "admin", "adminadmin");

// Modificar solo si es necesario
const replaces: Record<string, string> = {};
const torrents: Record<string, string> = await Bun.file("torrentsFound.json").json();

for (const [torrent, path] of Object.entries(torrents)) {
	const displayFilePath = torrent.replace(/\[Lat-Team._Poder.Latino_\]/g, "").replace(/\.torrent$/, "");

	logger.info(`Importando torrent ${displayFilePath} a ${path}`);
	const file = await readFile(`torrents/${torrent}`);

	let newPath = path;
	if (Object.keys(replaces).length > 0) {
		for (const [key, value] of Object.entries(replaces)) {
			newPath = newPath.replace(key, value);
		}
	}

	await client.torrents.add({
		paused: false,
		savepath: newPath,
		tags: "follow me jhoan",
		skip_checking: true,
		torrents: [
			{
				buffer: file,
				content_type: "application/x-bittorrent",
			},
		],
	} as TorrentAddParameters);

	logger.info(`Torrent ${displayFilePath} importado con éxito`);
}

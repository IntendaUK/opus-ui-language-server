// Plugins
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node';

// Model
import type {
	Connection,
	Documents,
	LanguageServerPaths,
	OpusUiAppMap
} from '../../model';

// Helpers
import setupServerManager from './events/setup';

// Managers
import CacheManager from '../cacheManager';

// Implementation
class ServerManager {
	connection: Connection = createConnection(ProposedFeatures.all);
	queueEvents = false;
	documents: Documents = new Map();
	caches = new CacheManager();
	paths: LanguageServerPaths = null!;
	opusUiAppMap: OpusUiAppMap = new Map();

	async setup () {
		await setupServerManager(this);
	}
}

const serverManager = new ServerManager();

console.log = serverManager.connection.console.log.bind(serverManager.connection.console);

export default serverManager;

// Helpers
import { clearTimeout } from 'node:timers';

// Managers
import ServerManager from '../index';

// Events
import onInitialize from './onInitialize';
import onConnectionStopped from './onConnectionStopped';
import onFileOpened from './onFileOpened';
import onFileModified from './onFileModified';
import onFileOrFolderEvents from './onFileOrFolderEvents';
import onFileSaved from './onFileSaved';
import onProvideHover from './onProvideHover';
import onProvideSuggestions from './onProvideSuggestions';

// Local Model
type Handler = (p: unknown) => unknown | Promise<unknown>

// Local Internals
const queuedEvents: [unknown, Handler][] = [];

let timeout: NodeJS.Timeout | null = null;

// Local Helpers
const processQueuedEvents = async () => {
	if (ServerManager.queueEvents) return;

	clearTimeout(timeout!);

	for (const [params, handler] of queuedEvents)
		await handler(params);

	queuedEvents.length = 0;
	timeout = null;
};

const handleEvent = async (params: unknown, handler: Handler) => {
	if (!ServerManager.queueEvents) {
		await handler(params);

		return;
	}

	queuedEvents.push([params, handler]);

	if (!timeout)
		timeout = setInterval(processQueuedEvents, 10);
};

//Implementation
const setup = async (serverManager: typeof ServerManager) => {
	const { connection } = serverManager;

	// Requests
	connection.onInitialize(onInitialize);
	connection.onCompletion(onProvideSuggestions);
	connection.onHover(onProvideHover);
	connection.onShutdown(p => handleEvent(p, onConnectionStopped));

	// Notifications
	connection.onDidChangeWatchedFiles(p => handleEvent(p, onFileOrFolderEvents as Handler));
	connection.onDidChangeTextDocument(p => handleEvent(p, onFileModified as Handler));
	connection.onDidSaveTextDocument(p => handleEvent(p, onFileSaved as Handler));
	connection.onNotification('documentFocused', p => handleEvent(p, onFileOpened as Handler));
};

export default setup;

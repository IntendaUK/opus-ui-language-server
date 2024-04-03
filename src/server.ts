// Helpers
import waitForDuration from './utils/waitForDuration';

// Managers
import ServerManager from './managers/serverManager';

// Config
import { debugDelayStartDuration, isDebugMode } from './config';

const startServer = async () => {
	if (isDebugMode)
		await waitForDuration(debugDelayStartDuration); // Wait for the chrome debugger to attach itself.

	await ServerManager.setup();

	ServerManager.connection.listen();
};

// Start Opus UI Language Server
startServer()
	.then(() => {
		console.log('SERVER STARTED SUCCESSFULLY');
	})
	.catch(e => {
		console.log(`SERVER FAILED TO START: ${e}`);
	});

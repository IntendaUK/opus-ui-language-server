// Plugins
import { existsSync } from 'fs';
import { statSync } from 'node:fs';

// Local Helpers
export const checkIfFolderExists = (path: string): boolean => {
	try {
		const exists = existsSync(path) && statSync(path).isDirectory();

		return exists;
	} catch (err) {
		console.log(`ERROR READING DIRECTORY ${path} inside checkIfFolderExists. Returning false`);

		return false;
	}
};

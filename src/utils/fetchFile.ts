// Plugins
import { promises } from 'fs';

// Utils
import { getAbsolutePathFromUri, getPathEnding } from './pathUtils';

// Implementation
const fetchFile = async (path: string, pathIsUri = false, fnName: null | string = null): Promise<string | null> => {
	try {
		if (pathIsUri)
			path = getAbsolutePathFromUri(path);

		const fileContent = await promises.readFile(path, 'utf8');

		return fileContent;
	} catch (error) {
		console.log(`Warning ${fnName ? `in ${fnName}:` : '.'} Couldn't fetch file ${getPathEnding(path)}. Error was: ${error}.`);

		return null;
	}
};

export default fetchFile;

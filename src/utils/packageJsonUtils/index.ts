// Helpers
import { existsSync } from 'fs';
import { getAbsolutePathFromUri, getParentPathFromPath } from '../pathUtils';
import { isObjectLiteral } from '../utils';
import fetchFile from '../fetchFile';
import path from 'path';

// Model
import type { JSONObject } from '../../model';

// Managers
import ServerManager from '../../managers/serverManager';

// Internals
import { SERVER_INIT_PARAMS } from '../../managers/serverManager/events/onInitialize';

// Local Model
export type OpusPackageJsonData = { packageJsonPath: string, packageJsonValue: JSONObject };

// Local Helpers

// This will return the saved package json file. If it has been modified, the updated package.json will not be returned from this function.
const drillUpToPackageJsonFileOnDisk = async (directory: string): Promise<{ packageFilePath: string, packageFileString: string } | null> => {
	const workspacePath = getAbsolutePathFromUri(SERVER_INIT_PARAMS.rootUri!);

	let currentDirectory = directory;

	while (currentDirectory !== getParentPathFromPath(workspacePath)) {
		const packageFilePath = path.join(currentDirectory, 'package.json');

		if (existsSync(packageFilePath)) {
			const packageFileString = await fetchFile(packageFilePath);

			if (packageFileString)
				return { packageFilePath, packageFileString };
		}

		currentDirectory = path.dirname(currentDirectory);
	}

	return null;
};

export const parseOpusAppPackageJsonFile = (packagePath: string, packageFileString: string): null | JSONObject => {
	try {
		if (!packageFileString)
			return null;

		const packageJsonValue = JSON.parse(packageFileString);

		if (
			!isObjectLiteral(packageJsonValue) ||
			!packageJsonValue.dependencies ||
			!isObjectLiteral(packageJsonValue.dependencies) ||
			!(packageJsonValue.dependencies as JSONObject)['opus-ui']
		)
			return null;

		return packageJsonValue;

	} catch (e) {
		console.log(`Could not parse package.json file at path: ${packagePath}`);
		return null;
	}
};

export const getPackageJsonDataForOpusUiApp = async (fileUri: string): Promise<null | OpusPackageJsonData> => {
	const currentFilePath = getAbsolutePathFromUri(fileUri);

	const packageJsonData = await drillUpToPackageJsonFileOnDisk(currentFilePath.substring(0, currentFilePath.lastIndexOf('/')));
	if (!packageJsonData) 
		return null;

	const { packageFilePath, packageFileString: packageFileStringOnDisk } = packageJsonData;

	const matchedModifiedPackageFile = Array.from(ServerManager.documents.entries()).find(([p]) => getAbsolutePathFromUri(p) === packageFilePath);

	const packageFileString = matchedModifiedPackageFile ? matchedModifiedPackageFile[1] : packageFileStringOnDisk;

	const packageJsonValue = parseOpusAppPackageJsonFile(packageFilePath, packageFileString);
	if (!packageJsonValue)
		return null;

	return {
		packageJsonPath: packageFilePath,
		packageJsonValue
	};
};

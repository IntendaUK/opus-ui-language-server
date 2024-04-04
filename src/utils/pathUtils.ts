// Helpers
import { fileURLToPath } from 'url';
import getFixedPathForOS from './getFixedPathForOS';

// Model
import type { OpusEnsemblePaths } from '../model';

// Managers
import ServerManager from '../managers/serverManager';

// Model
type AnyObject = Record<string, unknown>;

// PathUtils
export const getAbsolutePathFromUri = (fileUri: string): string => {
	const filePath = fileURLToPath(fileUri);

	const absoluteFilePath = getFixedPathForOS(filePath);

	return absoluteFilePath;
};

export const getParentPathFromPath = (pathString: string): string => {
	const parentPath = pathString.substring(0, pathString.lastIndexOf('/'));

	return parentPath;
};

export const getRelativePathFromAbsoluteFilePath = (absoluteFilePath: string): null | string => {
	if (absoluteFilePath.includes(ServerManager.paths.opusAppMdaPath))
		return absoluteFilePath.replace(`${ServerManager.paths.opusAppMdaPath}/`, '');

	const matchedEnsemblePath = Array.from(ServerManager.paths.opusEnsemblePaths.values()).find(p => absoluteFilePath.startsWith(p));

	if (matchedEnsemblePath)
		absoluteFilePath.replace(`${getParentPathFromPath(matchedEnsemblePath)}/`, '');

	return null;
};

export const getPathEnding = (pathString: string): string => {
	const fileName = pathString.slice(pathString.lastIndexOf('/'));

	return fileName;
};

export const getObjectByPath = (object: AnyObject, objectPath: string): AnyObject | null => {
	const pathKeys = objectPath.split('/').filter(k => !!k);

	const result = pathKeys.reduce((currentObject: AnyObject | null, currentKey: string) => {
		if (currentObject && Object.prototype.hasOwnProperty.call(currentObject, currentKey))
			return currentObject[currentKey] as AnyObject;

		return null;
	}, object);

	return result;
};

export const ENSEMBLE_FOLDER_NOT_SET = '{ENSEMBLE_FOLDER_NOT_SET}';

export const matchTraitDefinitionEnsemblePathToEnsemblePath = (opusEnsemblePaths: OpusEnsemblePaths, traitDefinitionEnsemblePath: string): { matched: boolean, ensembleName: string, ensemblePath: string } => {
	const ensembleName = traitDefinitionEnsemblePath.slice(1, traitDefinitionEnsemblePath.indexOf('/'));

	const matchedEnsemblesPathEntry = Array
		.from(opusEnsemblePaths.entries())
		.find(([name]) => !!name.split('/').find(n => n === ensembleName));

	if (!matchedEnsemblesPathEntry) {
		return {
			matched: false,
			ensembleName,
			ensemblePath: ENSEMBLE_FOLDER_NOT_SET
		};
	}

	const [, ensemblePath] = matchedEnsemblesPathEntry;

	return {
		matched: true,
		ensembleName,
		ensemblePath
	};
};

const getMdaPath = (traitDefinitionPathDelta: string, filePathThatDeclaresTrait: string): string => {
	if (traitDefinitionPathDelta.startsWith('./')) {
		const mdaPathDelta = filePathThatDeclaresTrait.startsWith(ServerManager.paths.opusAppMdaPath)
			? `${ServerManager.paths.opusAppMdaPath}/dashboard`
			: Array.from(ServerManager.paths.opusEnsemblePaths.values()).find(p => filePathThatDeclaresTrait.startsWith(p))!;

		return mdaPathDelta;

	}

	return `${ServerManager.paths.opusAppMdaPath}/dashboard`;

};

export const getTraitDefinitionPathFromTraitDefinitionPathDelta = (traitDefinitionPathDelta: string, filePathThatDeclaresTrait: string): string => {

	if (traitDefinitionPathDelta.charAt(0) === '@') {
		const { matched, ensembleName, ensemblePath } = matchTraitDefinitionEnsemblePathToEnsemblePath(ServerManager.paths.opusEnsemblePaths, traitDefinitionPathDelta);

		if (!matched) 
			return `${ensemblePath}/${traitDefinitionPathDelta.slice(1)}.json`;

		return `${ensemblePath}${traitDefinitionPathDelta.slice(ensembleName.length + 1)}.json`;
	}

	const mdaPathDelta = getMdaPath(traitDefinitionPathDelta, filePathThatDeclaresTrait);

	if (traitDefinitionPathDelta.startsWith('./')) {
		const pathArray = filePathThatDeclaresTrait
			.replace(mdaPathDelta, '')
			.substring(0, filePathThatDeclaresTrait.lastIndexOf('.json') + 5)
			.split('/');

		pathArray.pop();

		const currentPath = pathArray.join('/');
		const newPathArray = currentPath.split('/');
		const levelsUp = traitDefinitionPathDelta.split('../').length - 1;

		newPathArray.splice(newPathArray.length - levelsUp, levelsUp);

		traitDefinitionPathDelta = newPathArray.join('/') + traitDefinitionPathDelta.substr(traitDefinitionPathDelta.lastIndexOf('../') + 2);
	}

	if (traitDefinitionPathDelta.startsWith('/'))
		traitDefinitionPathDelta = traitDefinitionPathDelta.slice(1);

	return `${mdaPathDelta}/${traitDefinitionPathDelta}.json`;
};

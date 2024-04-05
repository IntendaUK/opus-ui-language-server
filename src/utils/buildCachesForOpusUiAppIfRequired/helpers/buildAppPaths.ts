// Helpers
import path from 'path';

// Config
import { opusUiEngineDependencyFolderPath, opusUiEngineDependencyName } from '../../../config';

// Internals
import { SERVER_INIT_PARAMS } from '../../../managers/serverManager/events/onInitialize';

// Model
import type {
	JSONArray,
	JSONObject,
	JSONValue,
	LanguageServerPaths,
	OpusComponentPropSpecPaths,
	OpusEnsemblePaths,
	OpusLibraryPaths
} from '../../../model';

// Helpers
import { getAbsolutePathFromUri } from '../../pathUtils';
import { isArray, isObjectLiteral } from '../../utils';
import { checkIfFolderExists } from '../../fileFolderUtils';
import fetchFile from '../../fetchFile';
import getFixedPathForOS from '../../getFixedPathForOS';

// Local Helpers
const buildPropSpecPathsForPath = async (p: string): Promise<null | OpusComponentPropSpecPaths> => {
	try {
		const propSpecPaths: OpusComponentPropSpecPaths = {};

		const lspConfigString = await fetchFile(path.join(p, 'lspconfig.json'));
		if (!lspConfigString)
			return null;

		const lspConfig: JSONValue = JSON.parse(lspConfigString);
		if (!isObjectLiteral(lspConfig))
			return null;

		const componentsList = (lspConfig as JSONObject).components;
		if (!componentsList || !isArray(componentsList))
			return null;

		(componentsList as JSONArray).forEach(o => {
			if (!isObjectLiteral(o) || !(o as JSONObject).name || typeof (o as JSONObject).name !== 'string' || !(o as JSONObject).path || typeof (o as JSONObject).path !== 'string')
				return;

			const { name, path: relativePath } = o as JSONObject;

			propSpecPaths[(name as string)] = {
				libraryPath: p,
				componentPath: path.join(p, relativePath as string)
			};
		});

		return propSpecPaths;

	} catch (e) {
		return null;
	}
};

const buildComponentPropSpecPaths = async (opusPath: string, opusLibraryPaths: OpusLibraryPaths): Promise<null | OpusComponentPropSpecPaths> => {
	const allComponentPropSpecPaths: OpusComponentPropSpecPaths = {};

	const opusMainPropSpecPaths = await buildPropSpecPathsForPath(opusPath);
	if (!opusMainPropSpecPaths)
		return null;

	Object.assign(allComponentPropSpecPaths, opusMainPropSpecPaths);

	for (const opusLibraryPath of Array.from(opusLibraryPaths.values())) {
		const libraryPropSpecs = await buildPropSpecPathsForPath(opusLibraryPath);

		if (!libraryPropSpecs)
			continue;

		Object.assign(allComponentPropSpecPaths, libraryPropSpecs);
	}

	return allComponentPropSpecPaths;
};

const getOpusAppDirectory = (opusPackagerConfig: JSONValue): string | null => {
	let appDir = (opusPackagerConfig as JSONObject).appDir;

	if (appDir === undefined || appDir === null || typeof appDir !== 'string')
		return null;

	appDir = appDir.replaceAll('\\', '/');

	return appDir;
};

const buildOpusLibraryPaths = (opusAppPath: string, opusAppPackageValue: JSONObject): OpusLibraryPaths => {
	const opusLibraryPaths: OpusLibraryPaths = new Map();

	if (opusAppPackageValue.opusUiComponentLibraries && isArray(opusAppPackageValue.opusUiComponentLibraries)) {
		(opusAppPackageValue.opusUiComponentLibraries as JSONArray).forEach(k => {
			if (
				!k ||
				typeof k !== 'string' ||
				k === path.join(opusUiEngineDependencyFolderPath, opusUiEngineDependencyName) ||
				!opusAppPackageValue.dependencies ||
				!isObjectLiteral(opusAppPackageValue.dependencies) ||
				!(opusAppPackageValue.dependencies as JSONObject)[k]
			)
				return;

			const opusLibraryPath = path.join(opusAppPath, 'node_modules', k);

			if (checkIfFolderExists(opusLibraryPath))
				opusLibraryPaths.set(k, opusLibraryPath);
		});
	}

	return opusLibraryPaths;
};

const buildInternalEnsembleConfig = (internalPathVar: string, opusAppPath: string, opusAppPackageValue: JSONObject): null | { ensembleName: string, ensemblePath: string } => {
	if (!opusAppPackageValue.dependencies || !isObjectLiteral(opusAppPackageValue.dependencies) || !(opusAppPackageValue.dependencies as JSONObject)[internalPathVar])
		return null;

	const ensemblePath = path.join(opusAppPath, 'node_modules', internalPathVar);
	const ensembleName = internalPathVar;

	return {
		ensembleName,
		ensemblePath
	};
};

const buildExternalEnsembleConfig = (externalPathVar: string): { ensembleName: string, ensemblePath: string } => {
	const ensemblePath = getFixedPathForOS(externalPathVar);
	const ensembleName = ensemblePath.substring(ensemblePath.lastIndexOf('/') + 1);

	return {
		ensembleName,
		ensemblePath
	};
};

const buildOpusEnsemblePaths = (opusAppPath: string, opusAppPackageValue: JSONObject): OpusEnsemblePaths => {
	const opusEnsemblePaths: OpusEnsemblePaths = new Map();

	if (opusAppPackageValue.opusUiEnsembles && isArray(opusAppPackageValue.opusUiEnsembles)) {
		(opusAppPackageValue.opusUiEnsembles as JSONArray).forEach(v => {
			if (!v || !(typeof v === 'string' || isObjectLiteral(v)))
				return;

			let ensemblePath;
			let ensembleName;

			if (typeof v === 'string') {
				const res = buildInternalEnsembleConfig(v, opusAppPath, opusAppPackageValue);
				if (!res)
					return;

				ensemblePath = res.ensemblePath;
				ensembleName = res.ensembleName;
			} else {
				const ensembleData = (v as JSONObject);

				const pathVar = (v as JSONObject).path;
				if (!pathVar || typeof pathVar !== 'string')
					return;

				if (ensembleData.external === true) {
					const res = buildExternalEnsembleConfig(pathVar);
					ensemblePath = res.ensemblePath;
					ensembleName = res.ensembleName;
				} else {
					const res = buildInternalEnsembleConfig(pathVar, opusAppPath, opusAppPackageValue);
					if (!res)
						return;

					ensemblePath = res.ensemblePath;
					ensembleName = res.ensembleName;
				}

			}

			if (checkIfFolderExists(ensemblePath))
				opusEnsemblePaths.set(ensembleName, ensemblePath);
		});
	}

	return opusEnsemblePaths;
};

// Implementation
const buildAppPaths = async (opusAppPackagePath: string, opusAppPackageValue: JSONObject): Promise<null | LanguageServerPaths> => {
	const opusPackagerConfig = opusAppPackageValue.opusPackagerConfig;

	if (!isObjectLiteral(opusPackagerConfig))
		return null;

	const appDir = getOpusAppDirectory(opusPackagerConfig);
	if (appDir === null)
		return null;

	const workspacePath = getAbsolutePathFromUri(SERVER_INIT_PARAMS.rootUri!);
	const opusAppPath = getFixedPathForOS(opusAppPackagePath.substring(0, opusAppPackagePath.lastIndexOf('/')));
	const opusPath = path.join(opusAppPath, 'node_modules', opusUiEngineDependencyFolderPath, opusUiEngineDependencyName);
	const opusAppMdaPath = path.join(opusAppPath, ...appDir.split('/'));
	const opusLibraryPaths = buildOpusLibraryPaths(opusAppPath, opusAppPackageValue);
	const opusEnsemblePaths: OpusEnsemblePaths = buildOpusEnsemblePaths(opusAppPath, opusAppPackageValue);

	const opusComponentPropSpecPaths = await buildComponentPropSpecPaths(opusPath, opusLibraryPaths);
	if (!opusComponentPropSpecPaths)
		return null;

	const languageServerPaths: LanguageServerPaths = {
		workspacePath,
		opusAppPath,
		opusAppPackagePath,
		opusPath,
		opusLibraryPaths,
		opusComponentPropSpecPaths,
		opusAppMdaPath,
		opusEnsemblePaths
	};

	// const { opusComponentPropSpecPaths: a, ...b } = languageServerPaths;
	// console.log(JSON.stringify(b, null, 2));

	return languageServerPaths;
};

const buildAppPathsWrapper = async (opusAppPackagePath: string, opusAppPackageValue: JSONObject): Promise<null | LanguageServerPaths> => {
	const appPaths: null | LanguageServerPaths = await buildAppPaths(opusAppPackagePath, opusAppPackageValue);

	if (!appPaths)
		console.log('ERROR: Failed to build language server paths. Either package.json could not be parsed, appDir was not specified or is incorrect, or propSpecPaths could not be built.');

	return appPaths;
};

export default buildAppPathsWrapper;

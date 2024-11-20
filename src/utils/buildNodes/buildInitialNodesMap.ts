// Plugins
import { readdir } from 'fs/promises';
import { resolve } from 'path';

// External Utils
import setFileNodesInNodesMap from './setFileNodesInNodesMap';
import setFolderNodeInNodesMap from './setFolderNodeInNodesMap';
import fetchFile from '../fetchFile';
import getFixedPathForOS from '../getFixedPathForOS';

// Model
import { Nodes } from '../../model';

// Managers
import ServerManager from '../../managers/serverManager';

// Local Internals
const ignoreFolderDirents = {
	mdaRoot: ['.git', 'node_modules', 'fonts', 'packaged', 'package-lock.json'],
	mdaEnsembles: ['.git', 'node_modules', 'package.json', 'package-lock.json']
};

// Internal Utils
const setNodesInMap = async (nodesMap: Nodes, path: string, buildForKey: 'mdaRoot' | 'mdaEnsembles') => {
	const dirents = (await readdir(path, { withFileTypes: true }))
		.filter(dirent => (
			(dirent.isDirectory() || (dirent.isFile() && dirent.name.includes('.json')))
			&&
			!ignoreFolderDirents[buildForKey].includes(dirent.name)
		));

	for (const dirent of dirents) {
		const childPath = resolve(path, dirent.name);

		if (dirent.isFile()) {
			const fileString = await fetchFile(childPath, false) as string;

			setFileNodesInNodesMap(nodesMap, path, childPath, fileString);
		} else {
			setFolderNodeInNodesMap(nodesMap, path, childPath);

			await setNodesInMap(nodesMap, childPath, buildForKey);
		}

		const fixedPath = getFixedPathForOS(path);

		if (nodesMap.has(fixedPath))
			nodesMap.get(fixedPath)!.childPaths.push(getFixedPathForOS(childPath));
	}
};

// Implementation
const buildInitialNodesMap = async (buildForKey: 'mdaRoot' | 'mdaEnsembles'): Promise<null | Nodes> => {
	const nodesMap: Nodes = new Nodes();

	if (buildForKey === 'mdaRoot') {
		const path = ServerManager.paths.opusAppMdaPath;

		setFolderNodeInNodesMap(nodesMap, null, path);

		await setNodesInMap(nodesMap, path, buildForKey);
	} else if (buildForKey === 'mdaEnsembles') {
		for (const ensemblePath of Array.from(ServerManager.paths.opusEnsemblePaths.values())) {
			setFolderNodeInNodesMap(nodesMap, null, ensemblePath);

			await setNodesInMap(nodesMap, ensemblePath, buildForKey);
		}
	} else
		return null;

	return nodesMap;
};

export default buildInitialNodesMap;

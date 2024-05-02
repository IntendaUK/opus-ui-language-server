// Utils
import { nodeHasType } from './setNodeTypes/utils';
import { getAbsolutePathFromUri, getParentPathFromPath, getRelativePathFromAbsoluteFilePath } from '../pathUtils';
import fetchFile from '../fetchFile';
import getModifiedFileNodes from './buildModifiedFileNodes';
import setNodeTypes from './setNodeTypes';
import buildTraitDefinitionsMap from './buildTraitDefinitionsMap';
import addToComponentPropSpecs from '../propSpecs/addToComponentPropSpecs';
import getJsonDiagnostics from '../../validators/jsonValidator';
import getOpusDiagnostics from '../../validators/opusValidator';
import removeNodeFromNodesMap from './removeNodeFromNodesMap';
import setComponentNodeTypesAndCallees from './setComponentNodeTypesAndCallees';
import setFolderNodeInNodesMap from './setFolderNodeInNodesMap';
import switchToOpusUiAppAndReloadCachesIfRequired from '../buildCachesForOpusUiAppIfRequired';

// Model
import type { ModifiedNodes } from './buildModifiedFileNodes';
import type { Diagnostic } from 'vscode-json-languageservice';
import type { JSONObject, Node, Nodes } from '../../model';

// Managers
import ServerManager from '../../managers/serverManager';

// Config
import { NODE_TYPES } from './setNodeTypes/config';

// Local Helpers
const buildAndSendJsonDiagnostics = async (fileUri: string, fileContentString: string): Promise<Diagnostic[]> => {
	const jsonDiagnostics = await getJsonDiagnostics(fileUri, fileContentString);

	await ServerManager.connection.sendDiagnostics({
		uri: fileUri,
		diagnostics: jsonDiagnostics
	});

	return jsonDiagnostics;
};

const buildAndSendOpusDiagnostics = async (fileUri: string, newFileNode: Node) => {
	const opusDiagnostics = await getOpusDiagnostics(fileUri, newFileNode);

	await ServerManager.connection.sendDiagnostics({
		uri: fileUri,
		diagnostics: opusDiagnostics
	});

	return opusDiagnostics;
};

const buildNewFileNodesAndUpdateCaches = async (fileUri: string, filePath: string, fileContentString: string): Promise<ModifiedNodes> => {
	// Get the current nodes map.
	const nodes: Nodes = ServerManager.caches.nodes;

	// Get newly added, removed and updated nodes from all nodes in the new file string.
	const modifiedNodes: ModifiedNodes = getModifiedFileNodes(nodes, filePath, fileContentString!);

	// Update existing the nodes map with the updated nodes.
	modifiedNodes.nodesRemoved.forEach(n => nodes.delete(n.path));
	modifiedNodes.nodesAdded.forEach(n => nodes.set(n.path, n));
	modifiedNodes.nodesUpdated.forEach(n => nodes.set(n.path, n));

	// Update trait definitions
	ServerManager.caches.traitDefinitionsMap = buildTraitDefinitionsMap(nodes);

	// Set types on the file node and consequently on all child nodes within the file object.
	setNodeTypes(nodes, nodes.get(filePath)!);

	// Set component node types and caller/callee arrays
	setComponentNodeTypesAndCallees(ServerManager.caches.nodes);

	// Update prop specs with new nodes
	const newComponentNodes = modifiedNodes
		.nodesBuilt.map(n => nodes.get(n.path)!)
		.filter(n => nodeHasType(n, NODE_TYPES.COMPONENT));

	for (const newNode of newComponentNodes)
		await addToComponentPropSpecs(newNode);

	return modifiedNodes;
};

const buildNodesForModifiedFileAndSendDiagnostics = async (fileUri: string, fileContentString: string): Promise<ModifiedNodes> => {
	console.log(`handlerOnFileModified: ${getRelativePathFromAbsoluteFilePath(getAbsolutePathFromUri(fileUri))}`);

	const fileNodePath = getAbsolutePathFromUri(fileUri);

	const jsonDiagnostics = await buildAndSendJsonDiagnostics(fileUri, fileContentString);

	const modifiedNodes = await buildNewFileNodesAndUpdateCaches(fileUri, fileNodePath, fileContentString);

	if (!jsonDiagnostics.length)
		await buildAndSendOpusDiagnostics(fileUri, ServerManager.caches.nodes.get(fileNodePath)!);

	return modifiedNodes;
};

export const rebuildNodesForAffectingNodeFile = async (node: undefined | Node) => {
	if (!node)
		return;

	const filePath = node.filePath!;
	const fileUri = `file://${node.filePath!}`;

	let fileContentString: null | string = ServerManager.documents.get(fileUri) || null;

	if (!fileContentString)
		fileContentString = await fetchFile(fileUri, true);

	if (!fileContentString) {
		console.log('RETURNING FROM drill AS DOCUMENT WAS NULL FOR: ' + filePath);
		return;
	}

	await buildNodesForModifiedFileAndSendDiagnostics(fileUri, fileContentString);
};

// Handlers
export const handlerOnFileCreated = async (fileUri: string, fileContentString: string) => {
	console.log(`handlerOnFileCreated: ${getRelativePathFromAbsoluteFilePath(getAbsolutePathFromUri(fileUri))}`);

	const fileNodePath = getAbsolutePathFromUri(fileUri);

	const jsonDiagnostics = await buildAndSendJsonDiagnostics(fileUri, fileContentString);

	await buildNewFileNodesAndUpdateCaches(fileUri, fileNodePath, fileContentString);

	if (!jsonDiagnostics.length)
		await buildAndSendOpusDiagnostics(fileUri, ServerManager.caches.nodes.get(fileNodePath)!);
};

export const handlerOnFileOpened = async (fileUri: string, fileContentString: string) => {
	console.log(`handlerOnFileOpened: ${getRelativePathFromAbsoluteFilePath(getAbsolutePathFromUri(fileUri))}`);

	const fileNodePath = getAbsolutePathFromUri(fileUri);

	const jsonDiagnostics = await buildAndSendJsonDiagnostics(fileUri, fileContentString);

	await buildNewFileNodesAndUpdateCaches(fileUri, fileNodePath, fileContentString);

	if (!jsonDiagnostics.length)
		await buildAndSendOpusDiagnostics(fileUri, ServerManager.caches.nodes.get(fileNodePath)!);
};

export const handlerOnPackageJsonFileModified = async (fileUri: string, fileContentString: string) => {
	const fileNodePath = getAbsolutePathFromUri(fileUri);
	const prevPackageFile = ServerManager.caches.nodes.get(fileNodePath);
	const modifiedNodes = await buildNodesForModifiedFileAndSendDiagnostics(fileUri, fileContentString);
	const newPackageFile = modifiedNodes.nodesBuilt.find(n => n.path === fileNodePath);

	if (prevPackageFile?.value && newPackageFile?.value) {
		const { opusUiComponentLibraries: prevOpusComponentLibraries, opusUiEnsembles: prevOpusUiEnsembles, dependencies: prevDependencies } = prevPackageFile.value as JSONObject;
		const { opusUiComponentLibraries: newOpusComponentLibraries, opusUiEnsembles: newOpusUiEnsembles, dependencies: newDependencies } = newPackageFile.value as JSONObject;

		if (
			(JSON.stringify(newOpusComponentLibraries) !== JSON.stringify(prevOpusComponentLibraries))
			||
			(JSON.stringify(prevOpusUiEnsembles) !== JSON.stringify(newOpusUiEnsembles))
			||
			(JSON.stringify(prevDependencies) !== JSON.stringify(newDependencies))
		)
			await switchToOpusUiAppAndReloadCachesIfRequired(fileUri);
	}
};

export const handlerOnFileModified = async (fileUri: string, fileContentString: string) => {
	const modifiedNodes = await buildNodesForModifiedFileAndSendDiagnostics(fileUri, fileContentString);
	if (!modifiedNodes)
		return;

	const nodesThatHaveAffectees = modifiedNodes.nodesUpdated
		.map(({ path }) => ServerManager.caches.nodes.get(path)!)
		.filter(n => nodeHasType(n, NODE_TYPES.COMPONENT) && (n.calledByComponentsPaths.length || n.callsTraitDefinitionPaths.length));

	const affectingCallerNodePaths = nodesThatHaveAffectees.flatMap(n => n.calledByComponentsPaths);
	if (affectingCallerNodePaths.length && affectingCallerNodePaths.length <= 5) {
		for (const nodePath of affectingCallerNodePaths) 
			rebuildNodesForAffectingNodeFile(ServerManager.caches.nodes.get(nodePath));
	}

	const affectingCalleeNodePaths = nodesThatHaveAffectees.flatMap(n => n.callsTraitDefinitionPaths);
	if (affectingCalleeNodePaths.length && affectingCalleeNodePaths.length <= 5) {
		for (const nodePath of affectingCalleeNodePaths)
			rebuildNodesForAffectingNodeFile(ServerManager.caches.nodes.get(nodePath));
	}
};

export const handlerOnFileDeleted = (fileUri: string) => {
	console.log(`handlerOnFileDeleted: ${getRelativePathFromAbsoluteFilePath(getAbsolutePathFromUri(fileUri))}`);

	const fileNodePath = getAbsolutePathFromUri(fileUri);

	if (ServerManager.documents.get(fileUri)) // The file was opened before and is stored...
		ServerManager.documents.delete(fileUri);

	removeNodeFromNodesMap(fileNodePath);

	ServerManager.caches.traitDefinitionsMap = buildTraitDefinitionsMap(ServerManager.caches.nodes);

	setComponentNodeTypesAndCallees(ServerManager.caches.nodes);
};

export const handlerOnFolderCreated = (folderUri: string) => {
	console.log(`handlerOnFolderCreated: ${getRelativePathFromAbsoluteFilePath(getAbsolutePathFromUri(folderUri))}`);

	const folderNodePath = getAbsolutePathFromUri(folderUri);

	const nodesMap: Nodes = ServerManager.caches.nodes;

	setFolderNodeInNodesMap(nodesMap, getParentPathFromPath(folderNodePath), folderNodePath);

	nodesMap.get(folderNodePath)!.types.push(NODE_TYPES.FOLDER);
};

export const handlerOnFolderDeleted = (folderUri: string) => {
	console.log(`handlerOnFolderDeleted: ${getRelativePathFromAbsoluteFilePath(getAbsolutePathFromUri(folderUri))}`);

	const folderNodePath = getAbsolutePathFromUri(folderUri);

	Array.from(ServerManager.documents.keys())
		.filter(p => getAbsolutePathFromUri(p).includes(folderNodePath))
		.forEach(p => ServerManager.documents.delete(p));

	removeNodeFromNodesMap(folderNodePath);

	ServerManager.caches.traitDefinitionsMap = buildTraitDefinitionsMap(ServerManager.caches.nodes);

	setComponentNodeTypesAndCallees(ServerManager.caches.nodes);
};

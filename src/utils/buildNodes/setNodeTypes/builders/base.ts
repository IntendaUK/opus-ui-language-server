// Config
import { NODE_TYPES } from '../config';

// Utils
import { ancestorHasType, nodeHasType } from '../utils';
import { getNodeParent } from '../../../nodeRetrievalUtils';

// Model
import type { Nodes, Node } from '../../../../model';

// Managers
import ServerManager from '../../../../managers/serverManager';

//Helper
const setBaseTypes = (node: Node, nodes: Nodes) => {
	const result = node.types;

	const parentNode: null | Node = getNodeParent(node, nodes);

	// APP_PACKAGE_FILE
	if (node.path === ServerManager.paths.opusAppPackagePath)
		result.push(NODE_TYPES.APP_PACKAGE_FILE);

	if (ancestorHasType(node, nodes, NODE_TYPES.APP_PACKAGE_FILE))
		result.push(NODE_TYPES.APP_PACKAGE_FILE_ENTRY);

	// OPUS_UI_CONFIG_FILE
	if (node.path === ServerManager.paths.externalOpusUiConfigPath)
		result.push(NODE_TYPES.OPUS_UI_CONFIG_FILE);

	if (ancestorHasType(node, nodes, NODE_TYPES.OPUS_UI_CONFIG_FILE))
		result.push(NODE_TYPES.OPUS_UI_CONFIG_FILE_ENTRY);

	// SERVE_PACKAGE_FILE
	if (node.path === `${ServerManager.paths.opusAppMdaPath}/serve.json`)
		result.push(NODE_TYPES.APP_SERVE_MDA_FILE);

	if (ancestorHasType(node, nodes, NODE_TYPES.APP_SERVE_MDA_FILE))
		result.push(NODE_TYPES.APP_SERVE_MDA_FILE_ENTRY);

	// ENSEMBLES_FOLDER
	if (!parentNode && !!Array.from(ServerManager.paths.opusEnsemblePaths.values()).find(p => p === node.path))
		result.push(NODE_TYPES.MDA_ENSEMBLES);

	//STARTUP
	if (
		node.name === 'index.json' &&
		parentNode?.name === 'dashboard'
	)
		result.push(NODE_TYPES.STARTUP);

	//STARTUP_ENTRY
	if (ancestorHasType(parentNode, nodes, NODE_TYPES.STARTUP))
		result.push(NODE_TYPES.STARTUP_ENTRY);

	//FOLDER
	if (node.filePath === null)
		result.push(NODE_TYPES.FOLDER);

	//FILE
	if (node.name.includes('.json'))
		result.push(NODE_TYPES.FILE);

	// DATA
	if (node.name === 'data' && node.parentPath === ServerManager.paths.opusAppMdaPath && nodeHasType(node, NODE_TYPES.FOLDER))
		result.push(NODE_TYPES.APP_DATA_FOLDER);

	if (ancestorHasType(node, nodes, NODE_TYPES.APP_DATA_FOLDER))
		result.push(NODE_TYPES.APP_DATA_FILE);

	//THEME
	if (
		parentNode?.name === 'theme' &&
		nodeHasType(parentNode, NODE_TYPES.FOLDER)
	)
		result.push(NODE_TYPES.THEME);

	//THEME_ENTRY
	if (
		node.name !== 'themeConfig' &&
		nodeHasType(parentNode, NODE_TYPES.THEME)
	)
		result.push(NODE_TYPES.THEME_ENTRY);

	//THEME_SUB_ENTRY
	if (ancestorHasType(parentNode, nodes, NODE_TYPES.THEME_ENTRY))
		result.push(NODE_TYPES.THEME_SUB_ENTRY);

	//THEME_CONFIG
	if (
		node.name === 'themeConfig' &&
		nodeHasType(parentNode, NODE_TYPES.THEME)
	)
		result.push(NODE_TYPES.THEME_CONFIG);

	//THEME_CONFIG_ENTRY
	if (
		['isFunctionTheme', 'isStyleTheme'].includes(node.name) &&
		nodeHasType(parentNode, NODE_TYPES.THEME_CONFIG)
	)
		result.push(NODE_TYPES.THEME_CONFIG_ENTRY);

	// ENSEMBLES
	if (nodeHasType(parentNode, NODE_TYPES.MDA_ENSEMBLES))
		result.push(NODE_TYPES.MDA_ENSEMBLE);

	//ENSEMBLE_CONFIG
	if (parentNode && !!Array.from(ServerManager.paths.opusEnsemblePaths.values()).find(ensemblePath => node.path === `${ensemblePath}/${parentNode.name}/config.json`))
		result.push(NODE_TYPES.ENSEMBLE_CONFIG);

	//ENSEMBLE_CONFIG_ENTRY
	if (ancestorHasType(parentNode, nodes, NODE_TYPES.ENSEMBLE_CONFIG))
		result.push(NODE_TYPES.ENSEMBLE_CONFIG_ENTRY);

	//ENSEMBLE_PACKAGE
	if (parentNode && !!Array.from(ServerManager.paths.opusEnsemblePaths.values()).find(ensemblePath => node.path === `${ensemblePath}/${parentNode.name}/package.json`))
		result.push(NODE_TYPES.ENSEMBLE_PACKAGE);

	//ENSEMBLE_PACKAGE_ENTRY
	if (ancestorHasType(parentNode, nodes, NODE_TYPES.ENSEMBLE_PACKAGE))
		result.push(NODE_TYPES.ENSEMBLE_PACKAGE_ENTRY);

	//FILE_MAPPINGS
	const isFileNode = node.fileLineMapping;

	if (isFileNode) {
		const { lineStringFlags } = node.fileLineMapping!;

		if (
			lineStringFlags.valueIsObjectClose ||
			lineStringFlags.valueIsArrayClose
		)
			result.push(NODE_TYPES.BRACKET_END);

		if (lineStringFlags.keyIsEmpty && lineStringFlags.lineIsObjectEntry && !lineStringFlags.valueIsObjectClose && !lineStringFlags.valueIsArrayClose)
			result.push(NODE_TYPES.EMPTY_KEY);

		if (lineStringFlags.keyIsEmptyString)
			result.push(NODE_TYPES.EMPTY_STRING_KEY);
	}
};

export default setBaseTypes;

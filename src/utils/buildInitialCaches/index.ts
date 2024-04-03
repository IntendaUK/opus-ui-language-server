// Utils
import setComponentNodeTypesAndCallees from '../buildNodes/setComponentNodeTypesAndCallees';
import setFileNodesInNodesMap from '../buildNodes/setFileNodesInNodesMap';
import setNodeTypes from '../buildNodes/setNodeTypes';
import buildInitialNodesMap from '../buildNodes/buildInitialNodesMap';
import buildTraitDefinitionsMap from '../buildNodes/buildTraitDefinitionsMap';
import fetchFile from '../fetchFile';
import buildOpusOperators from './buildOpusOperators';
import buildOpusPropSpecs from './buildOpusPropSpecs';
import buildOpusActions from './buildOpusActions';
import buildOpusTriggers from './buildOpusTriggers';

// Model
import type { Nodes, ComponentPropSpecs, OpusTriggersMap, OpusActionsMap, OpusOperatorsMap } from '../../model';

// Managers
import ServerManager from '../../managers/serverManager';

// Local Helpers
const buildMdaNodesMap = async (caches: typeof ServerManager.caches): Promise<Nodes> => {
	caches.nodes.clear();

	const mdaNodesMap: null | Nodes = await buildInitialNodesMap('mdaRoot');
	if (!mdaNodesMap)
		throw new Error('Failed to build mdaNodesMap');

	caches.nodes.assign(mdaNodesMap);

	return mdaNodesMap;
};

const buildEnsemblesNodesMap = async (caches: typeof ServerManager.caches): Promise<null | Nodes> => {
	if (ServerManager.paths.opusEnsemblePaths.size === 0)
		return null;

	const ensembleNodesMap: null | Nodes = await buildInitialNodesMap('mdaEnsembles');
	if (!ensembleNodesMap)
		throw new Error('Failed to build ensembleNodesMap');

	caches.nodes.assign(ensembleNodesMap);

	return ensembleNodesMap;
};

const setPackageJsonNodeInNodesMap = async (caches: typeof ServerManager.caches) => {
	const fileString = await fetchFile(ServerManager.paths.opusAppPackagePath, false) as string;

	setFileNodesInNodesMap(caches.nodes, ServerManager.paths.opusAppPath, ServerManager.paths.opusAppPackagePath, fileString);
};

const setDataFromOpus = async (caches: typeof ServerManager.caches) => {
	const basePropSpecs: null | ComponentPropSpecs = await buildOpusPropSpecs('baseProps');
	if (basePropSpecs)
		caches.propSpecsMap.set('baseProps', basePropSpecs);

	const opusOperatorsMap: null | OpusOperatorsMap = await buildOpusOperators();
	if (opusOperatorsMap)
		caches.opusOperatorsMap = opusOperatorsMap;

	const opusTriggersMap: null | OpusTriggersMap = await buildOpusTriggers();
	if (opusTriggersMap)
		caches.opusTriggersMap = opusTriggersMap;

	const opusActionsMap: null | OpusActionsMap = await buildOpusActions(opusOperatorsMap);
	if (opusActionsMap)
		caches.opusActionsMap = opusActionsMap;
};

// Implementation
const buildCaches = async (caches: typeof ServerManager.caches) => {
	const mdaNodesMap: Nodes = await buildMdaNodesMap(caches);

	const ensembleNodesMap: null | Nodes = await buildEnsemblesNodesMap(caches);

	await setPackageJsonNodeInNodesMap(caches);

	caches.traitDefinitionsMap = buildTraitDefinitionsMap(caches.nodes);

	setNodeTypes(mdaNodesMap, mdaNodesMap.get(ServerManager.paths.opusAppMdaPath)!);

	if (ensembleNodesMap) {
		ServerManager.paths.opusEnsemblePaths.forEach(path => {
			setNodeTypes(ensembleNodesMap, ensembleNodesMap.get(path)!);
		});
	}

	setComponentNodeTypesAndCallees(caches.nodes);

	await setDataFromOpus(caches);
};

export default buildCaches;

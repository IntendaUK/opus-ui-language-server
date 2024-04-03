// Model
import type { Node, Nodes } from '../../model';

// Utils
import { getNodeNameValue } from '../nodeValueRetrievalUtils';
import getFixedPathForOS from '../getFixedPathForOS';

// Implementation
const setFolderNodeInNodesMap = (nodesMap: Nodes, parentPath: null | string, folderPath: string) => {
	folderPath = getFixedPathForOS(folderPath);

	if (parentPath)
		parentPath = getFixedPathForOS(parentPath);

	const folderNode: Node = {
		path: folderPath,
		parentPath,
		childPaths: [],
		rootNodeType: 'folder',
		rootNodePath: folderPath,
		filePath: null,
		fileLineMapping: null,
		name: getNodeNameValue(folderPath),
		value: null,
		valueType: 'null',
		types: [],
		componentNodeTypes: [],
		calledByComponentsPaths: [],
		callsTraitDefinitionPaths: []
	};

	nodesMap.set(folderPath, folderNode);
};

export default setFolderNodeInNodesMap;

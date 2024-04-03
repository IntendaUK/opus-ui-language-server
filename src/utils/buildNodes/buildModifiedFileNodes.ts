// Utils
import { getParentPathFromPath } from '../pathUtils';
import setFileNodesInNodesMap from './setFileNodesInNodesMap';

// Model
import type { Node } from '../../model';
import { Nodes } from '../../model';

// Internal Model
export type ModifiedNodes = {
	nodesRemoved: Node[],
	nodesAdded: Node[],
	nodesUpdated: Node[],
	nodesBuilt: Node[]
};

// Internal Utils
const getExistingFileNodes = (nodes: Nodes, fileNodePath: string): Nodes => {
	const existingFileNodesMap = new Nodes(nodes);

	Array.from(existingFileNodesMap.keys()).forEach(nodePath => {
		if (!nodePath.includes(fileNodePath)) 
			existingFileNodesMap.delete(nodePath);
	});

	return existingFileNodesMap;
};

const nodeValueHasChanged = (existingNode: Node, newNode: Node): boolean => {
	const {
		lineStringValue: existingLineStringValue,
		lineIndex: existingLineIndex,
		lineValues: existingLineValues
	} = existingNode.fileLineMapping!;
	const {
		lineStringValue: newLineStringValue,
		lineIndex: newLineIndex,
		lineValues: newLineValues
	} = newNode.fileLineMapping!;

	if (existingLineIndex !== newLineIndex) 
		return true;

	if (JSON.stringify(existingNode.value) !== JSON.stringify(newNode.value)) 
		return true;

	if (JSON.stringify(existingLineValues) !== JSON.stringify(newLineValues))
		return true;

	if (existingNode.valueType !== newNode.valueType)
		return true;

	return existingLineStringValue !== newLineStringValue;
};

const getModifiedFileNodes = (existingNodes: Nodes, filePath: string, newFileContentString: string): ModifiedNodes => {
	const fileParentPath = getParentPathFromPath(filePath);

	const existingFileNodesMap: Nodes = getExistingFileNodes(existingNodes, filePath);
	const existingFileNodePaths: string[] = Array.from(existingFileNodesMap.keys());
	const existingFileNodes: Node[] = Array.from(existingFileNodesMap.values());

	const newFileNodesMap: Nodes = new Nodes();

	setFileNodesInNodesMap(newFileNodesMap, fileParentPath, filePath, newFileContentString);

	const newFileNodePaths: string[] = Array.from(newFileNodesMap.keys());
	const newFileNodes: Node[] = Array.from(newFileNodesMap.values());

	const nodesRemoved: Node[] = existingFileNodes.filter(node => !newFileNodePaths.includes(node.path));
	const nodesAdded: Node[] = newFileNodes.filter(node => !existingFileNodePaths.includes(node.path));
	const nodesUpdated: Node[] = newFileNodes.filter(node => existingFileNodePaths.includes(node.path) && nodeValueHasChanged(existingFileNodesMap.get(node.path)!, node));

	return {
		nodesRemoved,
		nodesAdded,
		nodesUpdated,
		nodesBuilt: newFileNodes
	};
};

export default getModifiedFileNodes;

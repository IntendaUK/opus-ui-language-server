// Model
import type { ComponentPropSpecs, Node, Nodes } from '../../model';

// Utils
import addToComponentPropSpecs from './addToComponentPropSpecs';
import findNodeComponentType from '../findTypes/findNodeComponentType';

// Managers
import ServerManager from '../../managers/serverManager';

// Implementation
const getComponentNodePropSpecs = async (node: Node, nodes: Nodes): Promise<null | ComponentPropSpecs> => {
	const componentNodeTypes = findNodeComponentType(nodes, node);
	if (componentNodeTypes.length !== 1)
		return null;

	const componentNodeType = componentNodeTypes[0];

	let componentPropSpecs = ServerManager.caches.propSpecsMap.get(componentNodeType) || null;

	if (!componentPropSpecs) {
		await addToComponentPropSpecs(node);

		componentPropSpecs = ServerManager.caches.propSpecsMap.get(componentNodeType) || null;
	}

	return componentPropSpecs;
};

export default getComponentNodePropSpecs;

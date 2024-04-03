// Utils
import buildOpusPropSpecs from '../buildInitialCaches/buildOpusPropSpecs';
import findNodeComponentType from '../findTypes/findNodeComponentType';

// Model
import type { Node, ComponentPropSpecs } from '../../model';

// Managers
import ServerManager from '../../managers/serverManager';

// Implementation
const addToComponentPropSpecs = async (node: Node) => {
	const componentNodeTypes = findNodeComponentType(ServerManager.caches.nodes, node);

	if (!componentNodeTypes.length) {
		console.log('NOTE: Skipping addToComponentPropSpecs since componentNodeTypes.length was 0');

		return;
	}

	for (const componentNodeType of componentNodeTypes) {
		let newComponentPropSpecs: null | ComponentPropSpecs = await buildOpusPropSpecs(componentNodeType);
		if (!newComponentPropSpecs)
			return;

		newComponentPropSpecs = new Map([...newComponentPropSpecs, ...ServerManager.caches.propSpecsMap.get('baseProps')!]);

		ServerManager.caches.propSpecsMap.set(componentNodeType, newComponentPropSpecs);
	}
};

export default addToComponentPropSpecs;

// Model
import type { JSONArray, JSONValue, Node, Nodes } from '../../model';

// Utils
import { getTraitDataFromTraitValue, getTypeFromComponentNodeValue } from '../nodeValueRetrievalUtils';
import { nodeHasType } from './setNodeTypes/utils';
import { getTraitDefinitionPathFromTraitDefinitionPathDelta } from '../pathUtils';

// Config
import { NODE_TYPES } from './setNodeTypes/config';

// Helpers
const getTraitDefinitionPathsFromTraitsArray = (traitsArray: JSONValue, node: Node): string[] => {
	const traitDefinitionPaths: string[] = [];

	for (const traitValue of traitsArray as JSONArray) {
		const traitData = getTraitDataFromTraitValue(traitValue);
		if (!traitData)
			continue;

		traitDefinitionPaths.push(getTraitDefinitionPathFromTraitDefinitionPathDelta(traitData.trait, node.filePath!));
	}

	return traitDefinitionPaths;
};

const setComponentNodesCalleesAndCallers = (nodesMap: Nodes, componentNodesThatCallTraitDefinitions: Node[]) => {
	componentNodesThatCallTraitDefinitions.forEach(componentNodeThatCallsTraitDefinitions => {
		const componentTraitsArrayNode = nodesMap.get(`${componentNodeThatCallsTraitDefinitions.path}/traits`)!;

		const componentTraitsArrayValue = componentTraitsArrayNode.value;
		if (!componentTraitsArrayValue) {
			console.log(`WARNING: RETURNING FROM setComponentNodesCalleesAndCallers AS componentTraitsArray WAS NULL FOR NODE: ${componentTraitsArrayNode.path}.`);
			return;
		}

		const traitDefinitionPathsThatComponentCalls = getTraitDefinitionPathsFromTraitsArray(componentTraitsArrayValue, componentNodeThatCallsTraitDefinitions);

		componentNodeThatCallsTraitDefinitions.callsTraitDefinitionPaths = traitDefinitionPathsThatComponentCalls;

		traitDefinitionPathsThatComponentCalls.forEach(traitDefinitionPath => {
			const traitDefinitionNodeThatsCalled = nodesMap.get(traitDefinitionPath);
			if (!traitDefinitionNodeThatsCalled)
				return;

			traitDefinitionNodeThatsCalled.calledByComponentsPaths.push(componentNodeThatCallsTraitDefinitions.path);
		});
	});
};

const recurseComponentNodeAndGetComponentTypes = (nodesMap: Nodes, componentNodePath: string, componentNodeThatCallTraitDefinitions: Node, componentNodeTypes: string[]) => {
	for (let i = componentNodeThatCallTraitDefinitions.callsTraitDefinitionPaths.length - 1; i >= 0; i--) {
		const calleeTraitDefinitionNode = nodesMap.get(componentNodeThatCallTraitDefinitions.callsTraitDefinitionPaths[i]);

		if (!calleeTraitDefinitionNode)
			continue;

		if (calleeTraitDefinitionNode.callsTraitDefinitionPaths.length)
			recurseComponentNodeAndGetComponentTypes(nodesMap, componentNodePath, calleeTraitDefinitionNode, componentNodeTypes);

		const type = getTypeFromComponentNodeValue(calleeTraitDefinitionNode);
		if (type)
			componentNodeTypes.push(type);
	}
};

// Implementation
const setComponentNodeTypesAndCallees = (nodesMap: Nodes) => {
	const allNodes = Array.from(nodesMap.values());

	allNodes.forEach(n => {
		n.calledByComponentsPaths = [];
		n.callsTraitDefinitionPaths = [];
		n.componentNodeTypes = [];
	});

	const componentNodesThatCallTraitDefinitions = allNodes
		.filter(n => nodeHasType(n, NODE_TYPES.TRAITS_ARRAY) && n.name !== 'traitsTreeNode')
		.map(n => nodesMap.get(n.parentPath!)!);

	setComponentNodesCalleesAndCallers(nodesMap, componentNodesThatCallTraitDefinitions);

	const rootComponentNodesThatCallCallTraitDefinitions = componentNodesThatCallTraitDefinitions.filter(n => !n.calledByComponentsPaths.length);

	rootComponentNodesThatCallCallTraitDefinitions.forEach(componentNodeThatCallTraitDefinitions => {
		const componentNodeTypes: string[] = [];

		recurseComponentNodeAndGetComponentTypes(nodesMap, componentNodeThatCallTraitDefinitions.path, componentNodeThatCallTraitDefinitions, componentNodeTypes);
		
		componentNodeThatCallTraitDefinitions.componentNodeTypes = componentNodeTypes;
	});

	const componentNodesWithoutTraitDefinitions = allNodes
		.filter(n => nodeHasType(n, NODE_TYPES.COMPONENT) && !nodeHasType(n, NODE_TYPES.TRAIT_DEFINITION));

	componentNodesWithoutTraitDefinitions.forEach(n => {
		const componentType = getTypeFromComponentNodeValue(n);
		if (!componentType)
			return;

		n.componentNodeTypes.push(componentType);
	});
};

export default setComponentNodeTypesAndCallees;

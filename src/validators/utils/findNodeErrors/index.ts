// Model
import type { Nodes, Node, NodeError } from '../../../model';

//Checks
import { check as checkStartup } from './checks/startup';
import { check as checkFlows } from './checks/flows';
import { check as checkUntyped } from './checks/untyped';
import { check as checkTrait } from './checks/trait';
import { check as checkTraitPrps } from './checks/traitPrps';
import { check as checkTraitPrp } from './checks/traitPrp';
import { check as checkUnusedTrait } from './checks/unusedTrait';
import { check as checkScripts } from './checks/scripts';
import { check as checkComponentTypes } from './checks/componentTypes';
import { check as checkComponentKeywords } from './checks/componentKeywords';
import { check as checkComponentProperties } from './checks/componentProperties';

// Internals
const checks = [
	checkStartup,
	checkFlows,
	checkScripts,
	checkUntyped,
	checkTrait,
	checkTraitPrps,
	checkTraitPrp,
	checkUnusedTrait,
	checkComponentTypes,
	checkComponentKeywords,
	checkComponentProperties
];

// Implementation
const findNodeErrors = async (nodes: Nodes, node: Node, nodeErrors: NodeError[] = []): Promise<NodeError[]> => {
	for (const check of checks) 
		await check(nodes, node, nodeErrors);

	for (const childPath of node.childPaths) {
		const childNode = nodes.get(childPath)!;

		await findNodeErrors(nodes, childNode, nodeErrors);
	}

	return nodeErrors;
};

export default findNodeErrors;

// Utils
import { getTraitDefinitionNodeFromTraitDefinitionPathDelta } from '../../../../utils/nodeRetrievalUtils';
import { getTraitDataFromTraitValue } from '../../../../utils/nodeValueRetrievalUtils';
import { ENSEMBLE_FOLDER_NOT_SET, getTraitDefinitionPathFromTraitDefinitionPathDelta } from '../../../../utils/pathUtils';
import { nodeHasType } from '../../../../utils/buildNodes/setNodeTypes/utils';
import getAcceptPrpsFromTraitDefinitionValue from '../../../../utils/nodeValueRetrievalUtils/getAcceptPrpsFromTraitDefinitionValue';

// Model
import type { TraitDefinitionAcceptPrpsData, TraitPrps, Nodes, Node, NodeError } from '../../../../model';
import type { TraitData } from '../../../../utils/nodeValueRetrievalUtils';

// Config
import { NODE_TYPES } from '../../../../utils/buildNodes/setNodeTypes/config';

//Internals
const errorType = 'Trait';

// Implementation
const trait = (nodes: Nodes, node: Node, errors: NodeError[]) => {
	if (!nodeHasType(node, NODE_TYPES.TRAIT) || nodeHasType(node, NODE_TYPES.BRACKET_END))
		return;

	const traitData: TraitData = getTraitDataFromTraitValue(node.value);

	if (!traitData) {
		errors.push({
			errorType,
			message: 'Invalid trait value',
			erroredIn: 'VALUE',
			errorSolution: 'UNKNOWN',
			severity: 1,
			node
		});

		return;
	}

	const { trait, traitPrps, traitType } = traitData;

	const traitDefinitionNode: null | Node = getTraitDefinitionNodeFromTraitDefinitionPathDelta(trait, node.filePath!);

	const traitNode = traitType === 'string'
		? node
		: nodes.get(`${node.path}/trait`)!;

	if (!traitDefinitionNode) {
		const traitDefinitionPath = getTraitDefinitionPathFromTraitDefinitionPathDelta(trait, node.filePath!);

		const message = traitDefinitionPath.includes(ENSEMBLE_FOLDER_NOT_SET)
			? `An ensemble could not be found for "${trait}". Ensure this path is spelt correctly, the associated ensemble name is added to dependencies inside package.json (and is installed using "npm install") and the path is supplied in the opusUiEnsembles list.`
			: `No trait exists under path: ${traitDefinitionPath}`;

		errors.push({
			errorType,
			message,
			erroredIn: 'VALUE',
			errorSolution: 'UNKNOWN',
			severity: 1,
			node: traitNode
		});

		return;
	}
	
	if (traitDefinitionNode.fileLineMapping!.lineStringFlags.valueIsFalsy) {
		errors.push({
			errorType,
			message: 'This trait file is empty. Please add JSON to it.',
			erroredIn: 'VALUE',
			errorSolution: 'UNKNOWN',
			severity: 2,
			node: traitNode
		});

		return;
	}

	if (!traitDefinitionNode.value) {
		errors.push({
			errorType,
			message: 'This trait contains invalid JSON. Please ensure it is valid.',
			erroredIn: 'VALUE',
			errorSolution: 'UNKNOWN',
			severity: 1,
			node: traitNode
		});

		return;
	}

	if (traitType === 'string' || !traitPrps) {
		const traitDefinitionAcceptPrps: TraitDefinitionAcceptPrpsData = getAcceptPrpsFromTraitDefinitionValue(traitDefinitionNode.value);
		if (!traitDefinitionAcceptPrps)
			return;

		// For situations when only a traitPath is used for a trait.
		const _traitPrps = traitPrps || {} as TraitPrps;

		const unimplementedTraitPrpKeys = Object
			.keys(traitDefinitionAcceptPrps)
			.filter(acceptPrpKey => _traitPrps[acceptPrpKey] === undefined && traitDefinitionAcceptPrps[acceptPrpKey].dft === undefined);

		unimplementedTraitPrpKeys.forEach(unimplementedTraitPrpKey => {
			errors.push({
				errorType,
				message: `Required traitPrp: "${unimplementedTraitPrpKey}" is unimplemented. To supply it, use the trait object syntax with traitPrps`,
				erroredIn: 'VALUE',
				errorSolution: 'UNKNOWN',
				severity: 1,
				node: node
			});
		});
	}
};

export const check = trait;

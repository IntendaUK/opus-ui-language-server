// Plugins
// @ts-ignore
import FuzzyMatcher from 'fuzzy-matching';

// Utils
import { getTraitDefinitionNodeFromTraitDefinitionPathDelta, getNodeParent } from '../../../../utils/nodeRetrievalUtils';
import { nodeHasType } from '../../../../utils/buildNodes/setNodeTypes/utils';
import getAcceptPrpsFromTraitDefinitionValue from '../../../../utils/nodeValueRetrievalUtils/getAcceptPrpsFromTraitDefinitionValue';
import { getTraitDataFromTraitValue } from '../../../../utils/nodeValueRetrievalUtils';
import { getValueTypeAsString } from '../../../../utils/utils';

// Model
import type { Nodes, Node, NodeError, TraitDefinitionAcceptPrpsData, AcceptPrpConfig, JSONValue, JSONObject, TraitPath } from '../../../../model';

// Config
import { NODE_TYPES } from '../../../../utils/buildNodes/setNodeTypes/config';

//Internals
const errorType = 'Trait Prps';

// Implementation
const hasTypeMismatch = (traitPrpValue: JSONValue, traitPrpValueType: string, acceptPrpType: string): boolean => {
	if (
		traitPrpValueType === acceptPrpType
		||
		['null', 'mixed'].includes(acceptPrpType)
	)
		return false;

	if (
		traitPrpValueType === 'number' &&
		acceptPrpType === 'integer' &&
		~~traitPrpValue! === traitPrpValue
	)
		return false;

	if (traitPrpValueType === 'string') {
		const _traitPrpValue = traitPrpValue as string;

		if (
			_traitPrpValue.indexOf('%') === 0
			||
			_traitPrpValue.indexOf('$') === 0
			||
			_traitPrpValue.indexOf('((') > -1
			|| _traitPrpValue.indexOf('{{') > -1
		)
			return false;
	}

	return traitPrpValueType !== acceptPrpType;
};

const traitPrp = (nodes: Nodes, node: Node, errors: NodeError[]) => {
	if (!nodeHasType(node, NODE_TYPES.TRAIT_PRP) || nodeHasType(node, NODE_TYPES.BRACKET_END) || nodeHasType(node, NODE_TYPES.EMPTY_KEY))
		return;

	const traitData = getTraitDataFromTraitValue(getNodeParent(getNodeParent(node, nodes)!, nodes)!.value as JSONObject);
	if (!traitData)
		return;

	const { trait } = traitData;

	const traitDefinitionNode: null | Node = getTraitDefinitionNodeFromTraitDefinitionPathDelta(trait, node.filePath!);
	if (!traitDefinitionNode)
		return;

	const traitDefinitionAcceptPrps: TraitDefinitionAcceptPrpsData = getAcceptPrpsFromTraitDefinitionValue(traitDefinitionNode.value);
	if (!traitDefinitionAcceptPrps)
		return;

	const traitPrpKey = node.name;
	const traitPrpValue = node.value;

	const fm = new FuzzyMatcher(Object.keys(traitDefinitionAcceptPrps));
	const match = fm.get(traitPrpKey);

	if (match.distance === 1) {
		const traitPrpValueType = getValueTypeAsString(traitPrpValue);

		const acceptPrpConfig: AcceptPrpConfig = traitDefinitionAcceptPrps[traitPrpKey];
		const acceptPrpType = acceptPrpConfig.type;

		if (hasTypeMismatch(traitPrpValue, traitPrpValueType, acceptPrpType)) {
			errors.push({
				errorType,
				message: `The traitPrp "${traitPrpKey}" is of type ${traitPrpValueType}, it should be "${acceptPrpType}"`,
				erroredIn: 'VALUE',
				errorSolution: 'UNKNOWN',
				severity: 1,
				node
			});
		}

		return;
	}

	if (match.distance > 0) {
		errors.push({
			errorType,
			message: `The traitPrp "${traitPrpKey}" is not allowed, did you mean "${match.value}"?`,
			erroredIn: 'KEY',
			errorSolution: match.value,
			severity: 1,
			node
		});

		return;
	}

	errors.push({
		errorType,
		message: `The traitPrp "${traitPrpKey}" is not allowed for trait "${trait}"`,
		erroredIn: 'KEY',
		errorSolution: 'UNKNOWN',
		severity: 1,
		node
	});
};

export const check = traitPrp;

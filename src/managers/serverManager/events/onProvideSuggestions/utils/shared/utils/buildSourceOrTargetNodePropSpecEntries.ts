// Helpers
import getAllPrpNodesForComponentNodeAndCallees from '../../../../../../../utils/nodeRetrievalUtils/getAllPrpNodesForComponentNodeAndCallees';
import getComponentNodePropSpecs from '../../../../../../../utils/propSpecs/getComponentNodePropSpecs';

// Model
import type { ComponentPropSpecs, JSONValue, Node, Nodes } from '../../../../../../../model';

// Local Model
export type PropSpecEntryType = 'string' | 'integer' | 'decimal' | 'boolean' | 'array' | 'object'

export type PropSpecEntry = {
	key: string,
	value: unknown,
	type: PropSpecEntryType | PropSpecEntryType[],
	desc: string,
	options?: string[],
	spec?: JSONValue
}

// Implementation
const buildSourceOrTargetNodePropSpecEntries = async (sourceOrTargetNode: Node, nodes: Nodes): Promise<PropSpecEntry[]> => {
	const propSpecEntries: PropSpecEntry[] = [];

	const allPropSpecsForComponent: null | ComponentPropSpecs = await getComponentNodePropSpecs(sourceOrTargetNode, nodes);
	const allNestedPrpNodesForComponentNode = getAllPrpNodesForComponentNodeAndCallees(sourceOrTargetNode, nodes);

	const seenPrps: string[] = [];
	allNestedPrpNodesForComponentNode.forEach(prpNode => {
		const prpEntry: PropSpecEntry = {
			key: prpNode.name,
			value: prpNode.value,
			type: prpNode.valueType as PropSpecEntryType | PropSpecEntryType[],
			desc: 'Custom property.'
		};

		if (allPropSpecsForComponent?.has(prpNode.name)) {
			prpEntry.desc = allPropSpecsForComponent?.get(prpNode.name)!.desc;

			seenPrps.push(prpNode.name);
		}

		propSpecEntries.push(prpEntry);
	});

	if (allPropSpecsForComponent) {
		Array.from(allPropSpecsForComponent.entries()).forEach(([propKey, propSpec]) => {
			if (seenPrps.includes(propKey)) 
				return;

			const propSpecEntry: PropSpecEntry = {
				key: propKey,
				value: propSpec.dft !== undefined ? propSpec.dft : undefined,
				type: propSpec.type as PropSpecEntryType | PropSpecEntryType[],
				desc: propSpec.desc
			};

			if (propSpec.options)
				propSpecEntry.options = propSpec.options;

			if (propSpec.spec)
				propSpecEntry.spec = propSpec.spec as JSONValue;

			propSpecEntries.push(propSpecEntry);
		});
	}

	return propSpecEntries;
};

export default buildSourceOrTargetNodePropSpecEntries;

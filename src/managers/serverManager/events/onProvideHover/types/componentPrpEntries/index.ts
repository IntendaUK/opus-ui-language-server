// Model
import type { Nodes, PropSpec } from '../../../../../../model';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';

// Helpers
import getComponentNodePropSpecs from '../../../../../../utils/propSpecs/getComponentNodePropSpecs';

// Implementation
const buildComponentPrpHover = async (nodeMatchData: NodeMatchData, nodes: Nodes): Promise<null | string> => {
	const { node, matchedOn } = nodeMatchData;

	if (matchedOn !== 'KEY')
		return null;

	const componentPropSpecs = await getComponentNodePropSpecs(nodeMatchData.node, nodes);
	if (!componentPropSpecs)
		return null;

	const propSpec: null | PropSpec = componentPropSpecs.get(node.name) || null;
	if (!propSpec)
		return null;

	const key = `### ${node.name}\n---`;
	const type = `#### Type\n${propSpec.type}`;
	const desc = `#### Description\n${propSpec.desc}`;
	const spec = propSpec.spec ? '#### Spec\n' + '```json\n' + JSON.stringify(propSpec.spec, null, 2) + '\n```' : null;
	const options = propSpec.options ? '#### Options\n' + '```json\n' + JSON.stringify(propSpec.options, null, 2) + '\n```' : null;
	const dft = propSpec.dft ? `#### Default Value\n${propSpec.dft}` : null;

	const mdString = [key, type, desc, spec, options, dft].filter(x => !!x).join('\n');

	return mdString;
};

export default buildComponentPrpHover;

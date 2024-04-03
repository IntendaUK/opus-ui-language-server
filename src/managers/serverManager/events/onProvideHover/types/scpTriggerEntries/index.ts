// Model
import type { Nodes } from '../../../../../../model';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';

// Helpers
import { isArray } from '../../../../../../utils/utils';
import getScpEntryConfig from '../../../onProvideSuggestions/utils/shared/utils/getScpEntryConfig';

// Implementation
const buildScpTriggerEntriesHover = async (nodeMatchData: NodeMatchData, nodes: Nodes): Promise<null | string> => {
	const { node, matchedOn } = nodeMatchData;

	if (matchedOn !== 'KEY')
		return null;

	const eventTriggerConfig = getScpEntryConfig(node, nodes, 'opusTriggersMap');
	if (!eventTriggerConfig)
		return null;

	const scpEntryItemConfig = eventTriggerConfig.keys.find(k => k.key === node.name);
	if (!scpEntryItemConfig)
		return null;

	const types = isArray(scpEntryItemConfig.type) ? scpEntryItemConfig.type as string[] : [scpEntryItemConfig.type as string];

	const key = `### ${node.name}\n---`;
	const type = `#### Type\n${types.length > 1 ? `(${types.join(', ')})` : scpEntryItemConfig.type as string}`;
	const desc = `#### Description\n${scpEntryItemConfig.desc}`;
	const mandatory = scpEntryItemConfig.mandatory ? `#### Mandatory\n${scpEntryItemConfig.mandatory}` : null;
	const spec = scpEntryItemConfig.spec ? '#### Spec\n' + '```json\n' + JSON.stringify(scpEntryItemConfig.spec, null, 2) + '\n```' : null;
	const options = scpEntryItemConfig.options ? '#### Options\n' + '```json\n' + JSON.stringify(scpEntryItemConfig.options, null, 2) + '\n```' : null;

	const mdString = [key, type, desc, mandatory, spec, options].filter(x => !!x).join('\n');
	
	return mdString;
};

export default buildScpTriggerEntriesHover;

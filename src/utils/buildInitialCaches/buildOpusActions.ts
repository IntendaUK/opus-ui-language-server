/* eslint-disable no-eval */

// Utils
import fetchFile from '../fetchFile';

// Model
import type { ScpEntryConfig, ScpEntryItemConfig, OpusActionsMap, OpusOperatorsMap } from '../../model';

// Managers
import ServerManager from '../../managers/serverManager';

// Local Internals
export const extraActionKeys: ScpEntryItemConfig[] = [
	{
		key: 'type',
		desc: 'The name of the action to be executed',
		type: 'string',
		mandatory: true
	},
	{
		key: 'actionCondition',
		desc: 'An object defining whether this action can be run',
		type: 'object'
	},
	{
		key: 'comment',
		desc: 'A custom comment for this action',
		type: 'string'
	},
	{
		key: 'comments',
		desc: 'A list of custom comments for this action',
		type: 'array'
	},
	{
		key: 'inlineKeys',
		desc: 'A list of keys for this action that will be taken and joined together. Useful for adding multiline values',
		type: 'array'
	}
];

// Implementation
const buildOpusActions = async (opusOperatorsMap: null | OpusOperatorsMap): Promise<null | OpusActionsMap> => {
	const actionsPath = `${ServerManager.paths.opusPath}/src/components/scriptRunner/config/configActions.js`;

	let actionsString = await fetchFile(actionsPath);
	if (!actionsString)
		return null;

	try {
		actionsString = actionsString
			.replace('/* eslint-disable max-lines, max-len */', '')
			.replace('import operators from \'./configOperators\';', '')
			.replace('const actions = ', '')
			.replace('export default actions;', '')
			.replace(';', '');

		actionsString = actionsString.replaceAll('options: operators', opusOperatorsMap ? `options: ${JSON.stringify(Array.from(opusOperatorsMap.values()))}` : 'options: []');

		const actions: ScpEntryConfig[] = eval(actionsString);

		const opusActionsMap: OpusActionsMap = new Map();

		actions.forEach(entry => {
			entry.keys.push(...extraActionKeys);
			opusActionsMap.set(entry.key, entry);
		});

		return opusActionsMap;
	} catch (e) {
		return null;
	}
};

export default buildOpusActions;

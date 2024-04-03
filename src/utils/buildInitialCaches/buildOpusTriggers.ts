/* eslint-disable no-eval */

// Utils
import fetchFile from '../fetchFile';

// Model
import type { ScpEntryConfig, OpusTriggersMap, ScpEntryItemConfig } from '../../model';

// Managers
import ServerManager from '../../managers/serverManager';

// Local Internals
export const extraTriggerKeys: ScpEntryItemConfig[] = [
	{
		key: 'event',
		desc: 'The type of event to listen on',
		type: 'string',
		mandatory: true
	}
];

// Implementation
const buildOpusTriggers = async (): Promise<null | OpusTriggersMap> => {
	const triggersPath = `${ServerManager.paths.opusPath}/src/components/scriptRunner/config/configTriggers.js`;

	let triggersString = await fetchFile(triggersPath);

	if (!triggersString)
		return null;

	try {
		triggersString = triggersString
			.replace('/* eslint-disable max-lines, max-len */', '')
			.replace('const triggers = ', '')
			.replace('export default triggers;', '')
			.replace(';', '');

		const triggers: ScpEntryConfig[] = eval(triggersString);
		
		const opusTriggersMap: OpusTriggersMap = new Map();

		triggers.forEach(entry => {
			entry.keys.push(...extraTriggerKeys);
			opusTriggersMap.set(entry.key, entry);
		});

		return opusTriggersMap;
	} catch (e) {
		return null;
	}
};

export default buildOpusTriggers;

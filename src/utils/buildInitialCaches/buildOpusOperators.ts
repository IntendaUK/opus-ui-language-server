/* eslint-disable no-eval */

// Utils
import fetchFile from '../fetchFile';

// Model
import type { OpusOperatorsMap, ScpEntryConfig, ScpEntryItemConfig } from '../../model';

// Managers
import ServerManager from '../../managers/serverManager';

// Local Internals
export const extraOperatorKeys: ScpEntryItemConfig[] = [
	{
		key: 'operator',
		desc: 'The comparison operator to evaluate against',
		type: 'string',
		mandatory: true
	}
];

// Implementation
const buildOpusOperators = async (): Promise<null | OpusOperatorsMap> => {
	const operatorsPath = `${ServerManager.paths.opusPath}/dist/components/scriptRunner/config/configOperators.js`;

	let operatorsString = await fetchFile(operatorsPath);
	if (!operatorsString)
		return null;

	try {
		operatorsString = operatorsString
			.replace('/* eslint-disable max-lines, max-len */', '')
			.replace('const operators = ', '')
			.replace('export default operators;', '')
			.replace(';', '');

		const operators: ScpEntryConfig[] = eval(operatorsString);

		const opusOperatorsMap: OpusOperatorsMap = new Map();

		operators.forEach(entry => {
			entry.keys.push(...extraOperatorKeys);
			opusOperatorsMap.set(entry.key, entry);
		});

		return opusOperatorsMap;
	} catch (e) {
		return null;
	}
};

export default buildOpusOperators;

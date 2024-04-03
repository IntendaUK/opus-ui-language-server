// Utils
import { isArray, isObjectLiteral } from '../utils';

// Model
import type {
	AcceptPrpConfig,
	JSONObject,
	JSONValue,
	SanitisedTraitDefinitionAcceptPrps,
	SuppliedAcceptPrpsObjectLiteral,
	SuppliedAcceptPrpValue,
	TraitDefinitionAcceptPrpsData
} from '../../model';

// Implementation
const buildTraitPrpData = (
	type: unknown,
	desc: unknown = undefined,
	dft: unknown = undefined,
	morph: unknown = undefined,
	morphActions: unknown = undefined,
	morphId: unknown = undefined,
	morphVariable: unknown = undefined
): AcceptPrpConfig => {
	if (typeof type !== 'string' || !['string', 'boolean', 'number', 'array', 'object', 'mixed'].includes(type))
		type = 'null';

	if (typeof desc !== 'string')
		desc = 'This traitPrp does not supply a description.';

	if (typeof morph !== 'boolean')
		morph = false;

	if (!isArray(morphActions))
		morphActions = undefined;

	if (typeof morphId !== 'string')
		morphId = undefined;

	if (typeof morphVariable !== 'string')
		morphVariable = undefined;

	return {
		type,
		desc,
		dft,
		morph,
		morphActions,
		morphId,
		morphVariable
	} as AcceptPrpConfig;
};

const sanitizeAcceptPrpEntryValue = (traitPrpValueDelta: SuppliedAcceptPrpValue): AcceptPrpConfig => {
	if (typeof traitPrpValueDelta === 'string' || !isObjectLiteral(traitPrpValueDelta))
		return buildTraitPrpData(traitPrpValueDelta);

	const { type, desc, dft, morph, morphActions, morphId, morphVariable } = traitPrpValueDelta;

	return buildTraitPrpData(type, desc, dft, morph, morphActions, morphId, morphVariable);
};

const getAcceptPrpsFromTraitDefinitionValue = (traitDefinitionValueDelta: JSONValue): TraitDefinitionAcceptPrpsData => {
	if (!traitDefinitionValueDelta || !isObjectLiteral(traitDefinitionValueDelta))
		return null;

	const traitDefinitionValueObject: JSONObject = traitDefinitionValueDelta as JSONObject;

	if (!traitDefinitionValueObject.acceptPrps || !isObjectLiteral(traitDefinitionValueObject.acceptPrps))
		return null;

	const suppliedAcceptPrpsObjectLiteral: SuppliedAcceptPrpsObjectLiteral = traitDefinitionValueObject.acceptPrps as SuppliedAcceptPrpsObjectLiteral;

	const suppliedAcceptPrpEntries: [string, SuppliedAcceptPrpValue][] = Object.entries(suppliedAcceptPrpsObjectLiteral);

	const sanitisedAcceptPrpEntries: [string, AcceptPrpConfig][] = suppliedAcceptPrpEntries.map(([ traitPrpKey, traitPrpValue ]): [string, AcceptPrpConfig] => {
		const sanitisedAcceptPrpValue: AcceptPrpConfig = sanitizeAcceptPrpEntryValue(traitPrpValue);

		return [traitPrpKey, sanitisedAcceptPrpValue];
	});

	const sanitisedAcceptPrpsObjectLiteral: SanitisedTraitDefinitionAcceptPrps = Object.fromEntries(sanitisedAcceptPrpEntries);

	return sanitisedAcceptPrpsObjectLiteral;
};

export default getAcceptPrpsFromTraitDefinitionValue;

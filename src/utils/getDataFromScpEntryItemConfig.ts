// Helpers
import { isArray } from './utils';
import buildSuggestionDocumentationWithSpec from '../managers/serverManager/events/onProvideSuggestions/utils/shared/utils/buildSuggestionDocumentationWithSpec';

// Model
import type { ScpEntryItemConfig, ScpEntryType } from '../model';

// Local Model
export type ScpEntryItemData = {
	suggestion: string,
	suggestionType: ScpEntryType | ScpEntryType[],
	suggestionDetail: string,
	suggestionDescription: null | string,
	suggestionDocumentation: string
}

// Implementation
const getDataFromScpEntryItemConfig = (scpEntryItemConfig: ScpEntryItemConfig): ScpEntryItemData => {
	const types = isArray(scpEntryItemConfig.type) ? scpEntryItemConfig.type as string[] : [scpEntryItemConfig.type as string];

	const suggestion = scpEntryItemConfig.key;
	const suggestionType = scpEntryItemConfig.type;
	const suggestionDetail = types.length > 1 ? `(${types.join(', ')})` : scpEntryItemConfig.type as string;
	const suggestionDescription = scpEntryItemConfig.mandatory ? 'MANDATORY' : null;
	const suggestionDocumentation = buildSuggestionDocumentationWithSpec(scpEntryItemConfig.desc, scpEntryItemConfig.spec);

	return {
		suggestion,
		suggestionType,
		suggestionDetail,
		suggestionDescription,
		suggestionDocumentation
	};
};

export default getDataFromScpEntryItemConfig;

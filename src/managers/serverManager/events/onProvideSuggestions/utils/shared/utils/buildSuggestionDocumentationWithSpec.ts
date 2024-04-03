// Model
import type { JSONValue } from '../../../../../../../model';

// Implementation
const buildSuggestionDocumentationWithSpec = (suggestionDescription: string, suggestionSpec: undefined | JSONValue) => {
	let suggestionDocumentation = '';

	if (suggestionSpec)
		suggestionDocumentation = `### Description\n\`${suggestionDescription}\`\n### Spec\n\`\`\`json\n${JSON.stringify(suggestionSpec, null, 2)}\n\`\`\``;
	else
		suggestionDocumentation = suggestionDescription;

	return suggestionDocumentation;

};

export default buildSuggestionDocumentationWithSpec;

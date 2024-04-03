// Plugins
import type { Diagnostic, DiagnosticRelatedInformation, Range } from 'vscode-languageserver/node';

// Model
import type { NodeError } from '../../model';

// Internals
const unknownSuggestionDelimiter = 'UNKNOWN';

// Implementation
const buildDiagnosticRelatedInfo = (nodeError: NodeError, textRange: Range, nodeFileUri: string): DiagnosticRelatedInformation[] => {
	const diagnosticRelatedInformation: DiagnosticRelatedInformation[] = [];

	if (nodeError.errorSolution !== unknownSuggestionDelimiter) {
		diagnosticRelatedInformation.push({
			location: {
				uri: nodeFileUri,
				range: textRange
			},
			message: `Suggested solution: ${nodeError.errorSolution}`
		});
	}

	return diagnosticRelatedInformation;
};

const getTextRangeFromPosition = (nodeError: NodeError): Range => {
	const { node: { fileLineMapping }, erroredIn, displayOnFirstLine, displayOnNodeStart } = nodeError;

	if (displayOnFirstLine) {
		return {
			start: {
				line: 0,
				character: 0
			},
			end: {
				line: 0,
				character: 0
			}
		};
	}

	if (erroredIn === 'KEY') {
		return {
			start: {
				line: fileLineMapping!.lineKeyPosition.lineIndex,
				character: fileLineMapping!.lineKeyPosition.characterStartIndex
			},
			end: {
				line: fileLineMapping!.lineKeyPosition.lineIndex,
				character: fileLineMapping!.lineKeyPosition.characterEndIndex
			}
		};
	}

	if (displayOnNodeStart) {
		return {
			start: {
				line: fileLineMapping!.lineValuePosition.lineStartIndex,
				character: fileLineMapping!.lineValuePosition.characterStartIndex
			},
			end: {
				line: fileLineMapping!.lineValuePosition.lineStartIndex,
				character: fileLineMapping!.lineValuePosition.characterStartIndex + 1
			}
		};
	}

	return {
		start: {
			line: fileLineMapping!.lineValuePosition.lineStartIndex,
			character: fileLineMapping!.lineValuePosition.characterStartIndex
		},
		end: {
			line: fileLineMapping!.lineValuePosition.lineEndIndex,
			character: fileLineMapping!.lineValuePosition.characterEndIndex
		}
	};
};

const buildDiagnostics = (fileUri: string, nodeErrors: NodeError[]): Diagnostic[] => {
	const nodeDiagnostics: Diagnostic[] = [];

	nodeErrors.forEach(nodeError => {
		const textRange: Range = getTextRangeFromPosition(nodeError);

		if ([textRange.start.character, textRange.end.character].includes(-1)) {
			console.log(`ERROR: Character wasn't found for node: ${nodeError.node.path}`);

			if (textRange.start.character === -1)
				textRange.start.character = 0;

			if (textRange.end.character === -1)
				textRange.end.character = 0;
		}

		nodeDiagnostics.push({
			severity: nodeError.severity,
			range: textRange,
			message: nodeError.message,
			source: `Opus Validation: ${nodeError.errorType}`,
			relatedInformation: buildDiagnosticRelatedInfo(nodeError, textRange, fileUri)
		});
	});

	return nodeDiagnostics;
};

export default buildDiagnostics;

// Model
import type { Diagnostic } from 'vscode-languageserver/node';
import type { Node } from '../model';

// Utils
import findNodeErrors from './utils/findNodeErrors';
import buildDiagnostics from './utils/buildDiagnostics';

// Managers
import ServerManager from '../managers/serverManager';

// Implementation
const opusValidator = async (fileUri: string, node: Node): Promise<Diagnostic[]> => {
	const nodeErrors = await findNodeErrors(ServerManager.caches.nodes, node);

	const opusDiagnostics = buildDiagnostics(fileUri, nodeErrors);

	return opusDiagnostics;
};

export default opusValidator;

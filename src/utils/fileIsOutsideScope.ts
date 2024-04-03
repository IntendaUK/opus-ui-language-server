// Utils
import { getAbsolutePathFromUri } from './pathUtils';

// Managers
import ServerManager from '../managers/serverManager';

// Implementation
const fileIsOutsideScope = (fileUri: string): boolean => {
	const absolutePath = getAbsolutePathFromUri(fileUri);

	if (!ServerManager.paths) 
		return true;
	
	const isInsideScope = (
		(absolutePath.startsWith(ServerManager.paths.opusAppPackagePath))
		||
		(absolutePath.startsWith(ServerManager.paths.opusAppMdaPath))
		||
		(Array.from(ServerManager.paths.opusEnsemblePaths.values()).some(ensemblePath => absolutePath.startsWith(ensemblePath)))
	);

	return !isInsideScope;
};

export default fileIsOutsideScope;

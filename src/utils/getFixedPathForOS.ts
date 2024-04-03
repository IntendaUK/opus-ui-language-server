// PathUtils
import path from 'path';

// Implementation
const getFixedPathForOS = (pathString: string): string => {
	const driveLetterRegex = /^[A-Z]:[/\\]/;

	let resolvedPath = path.resolve(pathString).split(path.sep).join('/');

	if (driveLetterRegex.test(resolvedPath)) 
		resolvedPath = resolvedPath.replace(driveLetterRegex, match => match.toLowerCase());

	return resolvedPath;
};

export default getFixedPathForOS;

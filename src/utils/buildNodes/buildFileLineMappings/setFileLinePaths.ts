// Model
import type { FileLineMapping } from '../../../model';

// Internal Utils
const buildLinePathDelta = (fileLineMapping: FileLineMapping, arrayIndexes: number[]): null | string => {
	const { lineStringKey, lineStringFlags, lineIndex } = fileLineMapping;
	const { keyIsFalsy, valueIsObjectOpen, valueIsObjectClose, valueIsArrayOpen, valueIsArrayClose, lineIsArrayEntry, keyIsEmptyString, valueIsFileStart, valueIsFalsy } = lineStringFlags;

	if (valueIsFileStart)
		return null;

	if (keyIsFalsy) {
		if (valueIsObjectClose || valueIsArrayClose)
			return `{line_${lineIndex}-closing_bracket}`;

		if (lineIsArrayEntry) {
			arrayIndexes[arrayIndexes.length - 1]++;

			return arrayIndexes.slice(-1)[0].toString();
		}

		if (valueIsObjectOpen || valueIsArrayOpen)
			return null;

		if (keyIsEmptyString)
			return `{line_${lineIndex}-empty_string_key}`;

		// Is empty at this point
		return `{line_${lineIndex}-empty_key}`;
	}

	return lineStringKey.replaceAll('"', '');
};

const buildLinePath = (paths: string[], linePathDelta: null | string): string => {
	const delta = linePathDelta
		? [...paths, linePathDelta]
		: paths;

	return '/' + delta.join('/');
};

const pathIncludesLineNumber = (path: string): boolean => {
	const regex = /\/\{([^}]+)\}/g;

	const doesInclude = regex.test(path);

	return doesInclude;
};

const stripLineNumberOutOfPath = (pathWithLineNumber: string): string => {
	const regex = /\/\{([^}]+)\}/g;

	const stringToRemove = regex.exec(pathWithLineNumber)![0];

	const pathWithoutLineNumber = pathWithLineNumber.replace(stringToRemove, '');

	return pathWithoutLineNumber;
};

const buildLineParentPath = (path: string): null | string => {
	if (path === '/')
		return null;

	if (pathIncludesLineNumber(path) && path.includes('-closing_bracket'))
		path = stripLineNumberOutOfPath(path);

	if (path === '')
		return null;

	const delta = path.substring(1, path.lastIndexOf('/'));

	if (delta === '/')
		return delta;

	return `/${delta}`;
};

// Implementation
const setFileLinePaths = (fileLineMappings: FileLineMapping[]) => {
	const paths: string[] = [];
	const arrayIndexes: number[] = [];

	fileLineMappings.forEach(fileLineMapping => {
		const { lineStringFlags: { valueIsObjectOpen, valueIsObjectClose, valueIsArrayOpen, valueIsArrayClose } } = fileLineMapping;

		const linePathDelta: null | string = buildLinePathDelta(fileLineMapping, arrayIndexes);

		fileLineMapping.linePath = buildLinePath(paths, linePathDelta);

		fileLineMapping.lineParentPath = buildLineParentPath(fileLineMapping.linePath);

		if (linePathDelta && (valueIsObjectOpen || valueIsArrayOpen))
			paths.push(linePathDelta);

		if (valueIsArrayOpen)
			arrayIndexes.push(-1);

		if (valueIsArrayClose || valueIsObjectClose) {
			if (valueIsArrayClose)
				arrayIndexes.pop();

			paths.pop();
		}
	});
};

export default setFileLinePaths;

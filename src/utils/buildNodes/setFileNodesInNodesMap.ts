// Model
import type { FileLineMapping } from '../../model';
import type { Node, Nodes } from '../../model';

// External Utils
import buildFileLineMappings from './buildFileLineMappings';
import { getNodeNameValue } from '../nodeValueRetrievalUtils';
import { isArray, isObjectLiteral } from '../utils';
import getFixedPathForOS from '../getFixedPathForOS';

// Internal Utils
const getValueType = (value: unknown): string => {
	if (value === null)
		return 'null';
	else if (isArray(value))
		return 'array';
	else if (isObjectLiteral(value))
		return 'object';

	return typeof (value);
};

const getLineChildPaths = (fileLineMappings: FileLineMapping[], fileLineMapping: FileLineMapping): string[] => {
	const childPaths = fileLineMappings
		.filter(lm => {
			return lm.lineParentPath === fileLineMapping.linePath;
		})
		.map(fileLineMapping => fileLineMapping.lineFile + fileLineMapping.linePath);

	return childPaths;
};

// Implementation
const setFileNodesInNodesMap = (nodesMap: Nodes, parentPath: string, filePath: string, fileString: string) => {
	filePath = getFixedPathForOS(filePath);
	parentPath = getFixedPathForOS(parentPath);

	const fileLineMappings = buildFileLineMappings(filePath, fileString);

	fileLineMappings.forEach(fileLineMapping => {
		const fileLineMappingPath = fileLineMapping.linePath === '/'
			? filePath
			: filePath + fileLineMapping.linePath;

		const fileLineMappingParentPath = fileLineMapping.lineIndex === 0
			? parentPath
			: fileLineMapping.lineParentPath === '/'
				? fileLineMapping.lineFile
				: fileLineMapping.lineFile + fileLineMapping.lineParentPath;

		const fileNode: Node = {
			path: fileLineMappingPath,
			parentPath: fileLineMappingParentPath,
			childPaths: getLineChildPaths(fileLineMappings, fileLineMapping),
			rootNodeType: 'file',
			rootNodePath: filePath,
			filePath,
			fileLineMapping,
			name: getNodeNameValue(fileLineMappingPath),
			value: fileLineMapping.lineStringValueParsed,
			valueType: getValueType(fileLineMapping.lineStringValueParsed),
			types: [],
			componentNodeTypes: [],
			calledByComponentsPaths: [],
			callsTraitDefinitionPaths: []
		};

		nodesMap.set(fileLineMappingPath, fileNode);
	});
};

export default setFileNodesInNodesMap;

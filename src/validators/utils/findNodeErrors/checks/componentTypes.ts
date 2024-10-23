//Plugins
// @ts-ignore
import FuzzyMatcher from 'fuzzy-matching';

// Config
import { NODE_TYPES } from '../../../../utils/buildNodes/setNodeTypes/config';

// Utils
import { nodeHasType } from '../../../../utils/buildNodes/setNodeTypes/utils';
import findNodeComponentType from '../../../../utils/findTypes/findNodeComponentType';

// Model
import type { Nodes, Node, NodeError } from '../../../../model';

// Managers
import ServerManager from '../../../../managers/serverManager';

//Internals
const errorType = 'Component Types';

//Checks
const componentTypes = (nodes: Nodes, node: Node, errors: NodeError[]) => {
	const componentNodeTypes = findNodeComponentType(nodes, node);

	const componentTypes = Object.keys(ServerManager.paths.opusComponentPropSpecPaths).filter(t => t !== 'baseProps');

	if (nodeHasType(node, NODE_TYPES.COMPONENT)) {
		if (componentNodeTypes.length > 1) {
			const isTraitDefinition = nodeHasType(node, NODE_TYPES.TRAIT_DEFINITION);

			const messagePrefix = `Component type could not be determined as multiple types were found: (${componentNodeTypes.map(t => `"${t}"`).join(', ')}).`;
			const messageSuffix = isTraitDefinition
				? 'Please check for any places where this trait definition is called and amend accordingly.'
				: 'Please check this components trait definitions (including nested) to ensure this component only inherits one type.';

			errors.push({
				errorType,
				message: `${messagePrefix} ${messageSuffix}`,
				erroredIn: 'VALUE',
				errorSolution: 'UNKNOWN',
				severity: isTraitDefinition ? 2 : 1,
				node
			});

			return;
		}

		if (!componentNodeTypes.length) {
			errors.push({
				errorType,
				message: 'Component type could not be determined.',
				erroredIn: 'VALUE',
				errorSolution: 'UNKNOWN',
				severity: 1,
				node,
				displayOnNodeStart: true
			});

			return;
		}

		if (!componentTypes.includes(componentNodeTypes[0])) {
			errors.push({
				errorType,
				message: `Component type "${componentNodeTypes[0]}" could not be determined. Language server features will not be provided for this node. If this is a custom component registered with "registerComponentTypes", this warning can be ignored. Otherwise, ensure the associated opus-ui component library which includes this component type is added to dependencies (or peerDependencies) and opusUiComponentLibraries inside package.json and is installed with "npm install".`,
				erroredIn: 'VALUE',
				errorSolution: 'UNKNOWN',
				severity: 2,
				node,
				displayOnNodeStart: true
			});
		}
	}

	if (!nodeHasType(node, NODE_TYPES.COMPONENT_TYPE))
		return;

	if (!node.value || typeof node.value !== 'string')
		return;

	if (!componentTypes.includes(node.value)) {
		errors.push({
			errorType,
			message: `Component type "${node.value}" could not be determined. Language server features will not be provided for this node. If this is a custom component registered with "registerComponentTypes", this warning can be ignored. Otherwise, ensure the associated opus-ui component library which includes this component type is added to dependencies (or peerDependencies) and opusUiComponentLibraries inside package.json and is installed with "npm install".`,
			erroredIn: 'VALUE',
			errorSolution: 'UNKNOWN',
			severity: 2,
			node
		});

		return;
	}

	const fm = new FuzzyMatcher(componentTypes);
	const match = fm.get(node.value);

	if (match.distance === 1)
		return;

	const newError: NodeError = match.distance < 0.75
		? ({
			errorType,
			message: `Component type "${node.value}" could not be determined. Language server features will not be provided for this node. If this is a custom component registered with "registerComponentTypes", this warning can be ignored. Otherwise, ensure the associated opus-ui component library which includes this component type is added to dependencies (or peerDependencies) and opusUiComponentLibraries inside package.json and is installed with "npm install".`,
			erroredIn: 'VALUE',
			errorSolution: match.value,
			severity: 2,
			node
		})
		: ({
			errorType,
			message: `Component type "${node.value}" could not be determined. Did you mean "${match.value}"? Language server features will not be provided for this node. If this is a custom component registered with "registerComponentTypes", this warning can be ignored. Otherwise, ensure the associated opus-ui component library which includes this component type is added to dependencies (or peerDependencies) and opusUiComponentLibraries inside package.json and is installed with "npm install".`,
			erroredIn: 'VALUE',
			errorSolution: match.value,
			severity: 1,
			node,
			displayOnNodeStart: true
		});

	errors.push(<NodeError>newError);
};

export const check = componentTypes;


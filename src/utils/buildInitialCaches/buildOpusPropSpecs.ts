/* eslint-disable no-eval, no-use-before-define */

// Plugins
import path from 'path';

// Managers
import ServerManager from '../../managers/serverManager';

// Model
import type { ComponentPropSpecsConfig, ComponentPropSpecs, PropSpec } from '../../model';

// Utils
import fetchFile from '../fetchFile';
import getFixedPathForOS from '../getFixedPathForOS';

// Internals
import { opusUiComponentConfigFileName } from '../../config';

// Internal Utils
const fetchPropSpecsConfig = async (componentType: string): Promise<null | ComponentPropSpecsConfig> => {
	const componentPropSpecPaths = ServerManager.paths.opusComponentPropSpecPaths[componentType];
	if (!componentPropSpecPaths)
		return null;

	const componentConfigPath = getFixedPathForOS(path.join(componentPropSpecPaths.componentPath, opusUiComponentConfigFileName));

	const componentConfigString = await fetchFile(componentConfigPath);

	if (!componentConfigString)
		return null;

	const propSpecConfig: ComponentPropSpecsConfig = JSON.parse(componentConfigString).propSpecConfig;

	return propSpecConfig;
};

const fetchComponentPropSpecs = async (componentType: string, propSpecConfig: ComponentPropSpecsConfig): Promise<null | ComponentPropSpecs> => {
	const { opusComponentPropSpecPaths, opusPath } = ServerManager.paths;

	const componentPropSpecPaths = opusComponentPropSpecPaths[componentType];
	if (!componentPropSpecPaths)
		return null;

	const basePath = propSpecConfig.fileExistsInOpusUiFolder
		? opusPath
		: componentPropSpecPaths.libraryPath;

	let propSpecString: null | string = await fetchFile(path.join(basePath, propSpecConfig.path));
	if (!propSpecString)
		return null;

	const dummyFunctions: string = propSpecConfig.functions.map(({ key }) => `const ${key} = () => {};`).join('\n');
	const props: string = propSpecString.substring(propSpecString.indexOf('const props ='), propSpecString.indexOf('export default'));

	propSpecString = `
		${dummyFunctions}
		${props}
		props;
	`;

	const componentPropSpecs: ComponentPropSpecs = new Map();

	(Object.entries(eval(propSpecString) as Record<string, PropSpec>).forEach(([propKey, propSpec]) => {
		propSpec.component = componentType === 'baseProps' ? 'base' : componentType;
		componentPropSpecs.set(propKey, propSpec);
	}));

	return componentPropSpecs;
};

const fetchPropSpecDependents = async (componentType: string, propSpecConfig: ComponentPropSpecsConfig): Promise<ComponentPropSpecs[]> => {
	const dependentPropSpecsList: ComponentPropSpecs[] = [];

	for (const dependentPropSpecConfig of propSpecConfig.dependents) {
		const dependentPropSpecs: null | ComponentPropSpecs = await buildOpusPropSpecs(componentType, dependentPropSpecConfig);

		if (!dependentPropSpecs)
			continue;

		dependentPropSpecsList.push(dependentPropSpecs);
	}

	return dependentPropSpecsList;
};

// Implementation
const buildOpusPropSpecs = async (componentType: string, propSpecsConfig: null | ComponentPropSpecsConfig = null): Promise<null | ComponentPropSpecs> => {
	try {
		if (!propSpecsConfig)
			propSpecsConfig = await fetchPropSpecsConfig(componentType);

		if (!propSpecsConfig)
			return null;

		let componentPropSpecs: null | ComponentPropSpecs = await fetchComponentPropSpecs(componentType, propSpecsConfig);
		if (!componentPropSpecs)
			return null;

		const dependentPropSpecsList: ComponentPropSpecs[] = await fetchPropSpecDependents(componentType, propSpecsConfig);

		dependentPropSpecsList.forEach(propSpecDependent => {
			componentPropSpecs = new Map([...componentPropSpecs!, ...propSpecDependent]);
		});

		return componentPropSpecs;
	} catch (e: any) {
		throw new Error(`Failed to build PropSpec data for: ${componentType} due to the following error: ${e.message}`);
	}
};

export default buildOpusPropSpecs;

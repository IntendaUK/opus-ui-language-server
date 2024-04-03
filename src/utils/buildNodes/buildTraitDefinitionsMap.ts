// Utils
import { getTraitDataFromTraitValue } from '../nodeValueRetrievalUtils';
import { getTraitDefinitionPathFromTraitDefinitionPathDelta } from '../pathUtils';

// Model
import type { Nodes, TraitDefinitionsMap, TraitDefinitionMap } from '../../model';

// Implementation
const buildTraitDefinitionsMap = (nodesMap: Nodes): TraitDefinitionsMap => {
	const traitDefinitionsMap: TraitDefinitionsMap = new Map<string, TraitDefinitionMap>();

	const allNodes = Array.from(nodesMap.values());

	allNodes.forEach(node => {
		if (node.rootNodeType !== 'file' || node.name !== 'traits' || node.valueType !== 'array')
			return;
		
		(node.value as unknown[]).forEach((trait, i) => {
			const traitData = getTraitDataFromTraitValue(trait);
			if (!traitData)
				return;

			const traitDefinitionPath = getTraitDefinitionPathFromTraitDefinitionPathDelta(traitData.trait, node.filePath!);

			if (!traitDefinitionsMap.has(traitDefinitionPath)) {
				traitDefinitionsMap.set(traitDefinitionPath, {
					traitDefinitionPath,
					usedBy: []
				});
			}

			const traitNodePath = `${node.path}/${i}`;

			traitDefinitionsMap.get(traitDefinitionPath)!.usedBy.push({
				filePath: node.filePath!,
				traitNodePath
			});
		});
	});

	return traitDefinitionsMap;
};

export default buildTraitDefinitionsMap;

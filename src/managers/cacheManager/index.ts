// Utils
import buildCaches from '../../utils/buildInitialCaches/index';

// Model
import { Nodes } from '../../model';
import type { TraitDefinitionsMap, ComponentPropSpecsMap, OpusTriggersMap, OpusActionsMap, OpusOperatorsMap } from '../../model';

// Implementation
class CacheManager {
	nodes: Nodes = new Nodes();
	traitDefinitionsMap: TraitDefinitionsMap = new Map();
	propSpecsMap: ComponentPropSpecsMap = new Map();
	opusTriggersMap: OpusTriggersMap = new Map();
	opusActionsMap: OpusActionsMap = new Map();
	opusOperatorsMap: OpusOperatorsMap = new Map();

	async setup () {
		await buildCaches(this);
	}
}

export default CacheManager;

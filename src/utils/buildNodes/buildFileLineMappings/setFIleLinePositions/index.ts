// Utils
import getValuePosition from './utils/getValuePosition';
import getKeyPosition from './utils/setKeyPosition';

// Model
import type { FileLineMapping } from '../../../../model';

// Implementation
const setFileLinePositions = (fileLineMappings: FileLineMapping[]) => {
	fileLineMappings.forEach(fileLineMapping => {
		fileLineMapping.lineKeyPosition = getKeyPosition(fileLineMapping);
		fileLineMapping.lineValuePosition = getValuePosition(fileLineMapping);
	});
};

export default setFileLinePositions;

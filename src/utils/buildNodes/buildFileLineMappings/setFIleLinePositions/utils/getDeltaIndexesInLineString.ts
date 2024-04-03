// Implementation
const getDeltaIndexesInLineString = (lineString: string, delta: string, isValue = false): { characterStartIndex: number, characterEndIndex: number } => {
	const characterStartIndex = !isValue
		? lineString.indexOf(delta)
		: lineString.lastIndexOf(delta);

	const characterEndIndex = characterStartIndex + delta.length;

	return {
		characterStartIndex,
		characterEndIndex
	};
};

export default getDeltaIndexesInLineString;

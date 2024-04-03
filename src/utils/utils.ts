// Local Helpers
export const isArray = (value: unknown): boolean => {
	const res = Array.isArray(value);

	return res;
};

export const isObjectLiteral = (value: unknown) => {
	const res = typeof value === 'object' && value !== null && !Array.isArray(value);

	return res;
};

export type ValueType = 'undefined' | 'null' | 'array' | 'object' | 'string' | 'boolean' | 'number' | 'function' | 'symbol' | 'bigint';

export const getValueTypeAsString = (value: unknown): ValueType => {
	if (value === null) 
		return 'null';

	if (isArray(value)) 
		return 'array';

	if (isObjectLiteral(value)) 
		return 'object';

	return typeof value;
};

export const stringifyObjectWithMaps = (obj: Record<string, unknown>) => {
	const stringifiableObject: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(obj)) {
		if (value instanceof Map) {
			const mapArray = Array.from(value.entries());
			stringifiableObject[key] = mapArray;
		} else 
			stringifiableObject[key] = value;
	}

	const stringifiedObject = JSON.stringify(stringifiableObject);

	return stringifiedObject;
};

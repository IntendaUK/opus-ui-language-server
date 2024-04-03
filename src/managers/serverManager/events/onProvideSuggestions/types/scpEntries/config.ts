export const scpEntries = [
	{ key: 'id', desc: 'The id of this script.', type: 'string' },
	{ key: 'concurrency', desc: 'A configuration object defining modes in which this scp should run.', type: 'object' },
	{ key: 'triggers', desc: 'A list of triggers which determine when this script should run.', type: 'array' },
	{ key: 'actions', desc: 'A list of actions that run when this script is triggered.', type: 'array' },
	{ key: 'comment', desc: 'A custom comment for this script.', type: 'string' },
	{ key: 'comments', desc: 'A list of custom comments for this script.', type: 'array' }
];

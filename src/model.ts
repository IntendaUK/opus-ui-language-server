/* eslint-disable no-use-before-define */

// EXTERNAL
import type { createConnection, DiagnosticSeverity } from 'vscode-languageserver/node';
import type { LineStringFlags } from './utils/buildNodes/buildFileLineMappings/buildLineStringFlags';
import type { LineStringKey, LineStringValue } from './utils/buildNodes/buildFileLineMappings/getLineStringDeltas';
import type ServerManager from './managers/serverManager';

// SERVER CONNECTION
export type Connection = ReturnType<typeof createConnection>;

// LANGUAGE SERVER PATHS
export type OpusComponentPropSpecPaths = Record<string, {
	libraryPath: string,
	componentPath: string
}>

export type OpusEnsemblePaths = Map<string, string>;

export type OpusLibraryPaths = Map<string, string>;

export type LanguageServerPaths = {
	workspacePath: string,
	opusAppPath: string,
	opusAppPackagePath: string,
	opusPath: string,
	opusLibraryPaths: OpusLibraryPaths,
	opusEnsemblePaths: OpusEnsemblePaths,
	opusComponentPropSpecPaths: OpusComponentPropSpecPaths,
	opusAppMdaPath: string
}

export type OpusUiAppMap = Map<string, {
	languageServerPaths: LanguageServerPaths,
	caches: typeof ServerManager.caches
}>

// DOCUMENT STRINGS
export type Documents = Map<string, string>;

// TRAITS
export type TraitCondition = {
	operator: unknown
}

export type TraitPrps = Record<string, unknown>;

export type TraitPath = string;

export type TraitAuth = string[];

export type TraitObject = {
	condition: TraitCondition
	auth: TraitAuth
	trait: TraitPath;
	traitPrps: TraitPrps;
}

export type Trait = TraitPath | TraitObject;

// TRAIT DEFINITION
export type AcceptPrpConfig = {
	morph: boolean,
	morphId: undefined | string,
	morphVariable: undefined | string,
	morphActions: undefined | unknown[]
	type: string;
	desc: string;
	dft: undefined | unknown;
};

export type SuppliedAcceptPrpValue = string | {
	morph: unknown,
	morphId: unknown,
	morphVariable: unknown,
	morphActions: unknown,
	type: unknown,
	desc: unknown,
	dft: unknown,
}

export type SuppliedAcceptPrpsObjectLiteral = Record<string, SuppliedAcceptPrpValue>;

export type SanitisedTraitDefinitionAcceptPrps = Record<string, AcceptPrpConfig>;

export type TraitDefinitionAcceptPrpsData = null | SanitisedTraitDefinitionAcceptPrps;

// TRAIT DEFINITION MAP
export type TraitDefinitionMap = {
	traitDefinitionPath: string,
	usedBy: Array<{
		filePath: string,
		traitNodePath: string
	}>
}

export type TraitDefinitionsMap = Map<string, TraitDefinitionMap>

// FILES
export type KeyPosition = {
	lineIndex: number,
	characterStartIndex: number,
	characterEndIndex: number
}

export type ValuePosition = {
	lineStartIndex: number,
	characterStartIndex: number,
	lineEndIndex: number,
	characterEndIndex: number
}

export type FileLineMapping = {
	linePath: string,
	lineParentPath: null | string,
	lineIndex: number,
	lineString: string,
	lineStringKey: LineStringKey,
	lineStringValue: LineStringValue,
	lineValues: null | string[],
	lineKeyPosition: KeyPosition,
	lineValuePosition: ValuePosition,
	lineStringFlags: LineStringFlags,
	lineStringValueParsed: JSONValue
	lineFile: string,
	lineFileStrings: string[]
}

// MDA PACKAGE
export type MdaPackage = {
	[key: string]: {
		[key: string]: null | object | MdaPackage;
	};
}

// NODE VALUES
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

// NODES
export type Node = {
	path: string,
	parentPath: null | string,
	childPaths: string[],
	rootNodePath: string,
	rootNodeType: 'file' | 'folder',
	componentNodeTypes: string[],
	filePath: null | string,
	fileLineMapping: null | FileLineMapping,
	name: string,
	value: JSONValue,
	valueType: string,
	types: symbol[],
	callsTraitDefinitionPaths: string[],
	calledByComponentsPaths: string[]
}

export type NodeError = {
	errorType: string;
	erroredIn: 'KEY' | 'VALUE';
	message: string;
	errorSolution: never | 'UNKNOWN';
	severity: DiagnosticSeverity;
	node: Node;
	displayOnFirstLine?: boolean;
	displayOnNodeStart?: boolean
}

export class Nodes extends Map<string, Node> {
	set (key: string, node: Node): this {
		const existingNode: Node | undefined = this.get(key);

		if (existingNode) {
			// @ts-ignore
			Object.keys(existingNode).forEach(k => delete existingNode[k]);

			Object.assign(existingNode, node);
		} else
			super.set(key, node);

		return this;
	}

	setUnmerge (key: string, node: Node): this {
		super.set(key, node);

		return this;
	}

	assign (mapToMerge: Nodes): this {
		Array.from(mapToMerge.entries()).forEach(([path, node]) => {
			this.set(path, node);
		});

		return this;
	}
}

// PROP SPECS
export type PropSpec = {
	component: string,
	type: string,
	desc: string,
	spec?: unknown
	options?: string[],
	dft?: unknown,
	internal?: boolean,
	classMap?: unknown,
	cssAttr?: unknown,
	cssAttrVal?: unknown,
	cssVar?: unknown,
	cssVarVal?: unknown
};

export type ComponentPropSpecs = Map<string, PropSpec>;

export type ComponentPropSpecsConfig = {
	fileExistsInOpusUiFolder?: boolean,
	path: string,
	dependents: ComponentPropSpecsConfig[],
	functions: {
		key: string,
		path: string
	}[]
}

export type ComponentPropSpecsMap = Map<string, ComponentPropSpecs>

// SCP ENTRY CONFIG
export type ScpEntryType = 'string' | 'integer' | 'decimal' | 'boolean' | 'array' | 'object'

export type ScpEntryItemOptionConfig = {
	key: string,
	desc: string,
	type: ScpEntryType,
	spec?: JSONValue
}

export type ScpEntryItemConfig = {
	key: string,
	desc: string,
	type: ScpEntryType | ScpEntryType[],
	mandatory?: true,
	options?: ScpEntryItemOptionConfig[]
	spec?: JSONValue
};

export type ScpEntryConfig = {
	key: string,
	desc: string,
	type: 'string',
	keys: ScpEntryItemConfig[]
}

export type OpusTriggersMap = Map<string, ScpEntryConfig>;
export type OpusActionsMap = Map<string, ScpEntryConfig>;
export type OpusOperatorsMap = Map<string, ScpEntryConfig>;

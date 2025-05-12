export interface MutationKeys {
	all: Array<string>;
	filters?: () => Array<string>;
	filter?: (props: Record<string, unknown>) => Array<string>;
	byIds?: () => Array<string>;
	byId?: (id: string) => Array<string>;
}

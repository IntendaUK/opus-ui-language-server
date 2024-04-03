// Model
type DebounceReturnType<T extends (...args: any[]) => any> = {
	(...args: Parameters<T>): Promise<ReturnType<T>>;
	cancel: () => void;
};

// Implementation
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): DebounceReturnType<T> => {
	let timeout: ReturnType<typeof setTimeout> | undefined;

	const debouncedFunc = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
		clearTimeout(timeout);

		return new Promise(resolve => {
			timeout = setTimeout(async () => {
				const result = await func(...args);
				resolve(result);
			}, wait);
		});
	};

	const cancel = () => {
		clearTimeout(timeout);
	};

	const combinedFunc: DebounceReturnType<T> = Object.assign(debouncedFunc, { cancel });

	return combinedFunc;
};

export default debounce;

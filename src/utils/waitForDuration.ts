const waitForDuration = (delay: number) => new Promise<void>(res => setTimeout(res, delay));

export default waitForDuration;

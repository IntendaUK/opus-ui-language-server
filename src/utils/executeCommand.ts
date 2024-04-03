// Plugins
import { exec } from 'child_process';

// Implementation
const executeCommand = (command: string): Promise<void | Error> => {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.log(error.message);

				reject(error);
			}
			if (stderr) {
				console.log(stderr);

				reject(new Error(stderr));
			}

			console.log(stdout);

			resolve();
		});
	});
};

export default executeCommand;

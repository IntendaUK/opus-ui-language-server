// Managers
import ServerManager from '../../managers/serverManager';

// Implementation
const removeNodeFromNodesMap = (nodePath: string) => {
	Array.from(ServerManager.caches.nodes.keys()).forEach(path => {
		if (path.startsWith(nodePath))
			ServerManager.caches.nodes.delete(path);
	});
};

export default removeNodeFromNodesMap;

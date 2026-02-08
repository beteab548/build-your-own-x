import { WebContainer } from '@webcontainer/api';

let webContainerInstance: Promise<WebContainer> | null = null;

export async function getWebContainer() {
    if (!webContainerInstance) {
        webContainerInstance = WebContainer.boot();
    }
    return webContainerInstance;
}

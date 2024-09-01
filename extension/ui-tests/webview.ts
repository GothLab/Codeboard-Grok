import { Workbench, EditorView, WebView, By, WebDriver, VSBrowser } from 'vscode-extension-tester';
import { expect } from 'chai';

describe('Grok Tests', () => {
    let driver: WebDriver;
    let view: WebView | undefined;

    before(async function() {
        driver = VSBrowser.instance.driver;
        this.timeout(40000);

        // Wait long enough for Grok to load
        //TODO find a better way to wait for Grok webview loaded
        await new Promise((res) => { setTimeout(res, 20000); });

        // Retry until Grok webview is returned or timeout
        view = await driver.wait(async () => { return await getGrokTab(); }, 20000);
        // Switch to inside the webview iframe
        // This isn't working in VS Code > 1.56
        // TODO follow up with vscode-extension-tester maintainers
        await view?.switchToFrame();
    });

    // Clean up after tests
    after(async () => {
        await view?.switchBack();
        await new EditorView().closeAllEditors();
    });

    it('Grok Navigation Tabs Rendered', async () => {
        await assertGrokTab('activity-tab', 'Saved Flows');
        await assertGrokTab('current-flow-tab', 'Current Flow');
    });

    // Given an id and value, assert navigation tab title is correct
    async function assertGrokTab(id: string, value: string) {
        const element = await view?.findWebElement(By.id(id));
        expect(await element?.getText()).has.string(value);
    }
});

// Get the grok WebView
async function getGrokTab(): Promise<WebView | undefined>{
    const editorView = new EditorView();
    try {
        // This depends on Grok opening in the right tab group (group 1)
        // TODO find a better way to get the Grok webview
        const webview = await editorView.openEditor('Grok', 1);
        return webview as WebView;
    } catch(e) {
        return undefined;
    }
}
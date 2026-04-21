import { Plugin } from "obsidian";
import { resetModel } from "./src/inference";
import { DEFAULT_SETTINGS, type MathConvertSettings } from "./src/settings";
import { MathConvertSettingTab } from "./src/settingsTab";
import { MathConvertView, VIEW_TYPE } from "./src/view";

export default class MathConvertPlugin extends Plugin {
	settings: MathConvertSettings;

	async onload() {
		await this.loadSettings();
		this.registerView(VIEW_TYPE, (leaf) => new MathConvertView(leaf, this.settings));
		this.addRibbonIcon("sigma", "Open math-convert", () => this.activateView());
		this.addCommand({
			id: "open",
			name: "Open math-convert sidebar",
			callback: () => this.activateView(),
		});
		this.addSettingTab(new MathConvertSettingTab(this.app, this));
	}

	onunload() {
		resetModel();
	}

	async activateView() {
		const { workspace } = this.app;
		let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
		if (!leaf) {
			const rightLeaf = workspace.getRightLeaf(false);
			if (!rightLeaf) {
				throw new Error("Could not open the Math-Convert sidebar.");
			}
			leaf = rightLeaf;
			await leaf.setViewState({ type: VIEW_TYPE, active: true });
		}
		void workspace.revealLeaf(leaf);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<MathConvertSettings>,
		);
	}
	async saveSettings() {
		await this.saveData(this.settings);
	}
}

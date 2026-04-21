import { type App, type Plugin, PluginSettingTab, Setting } from "obsidian";
import { resetModel } from "./inference";
import { type MathConvertSettings, MODEL_ID } from "./settings";

export class MathConvertSettingTab extends PluginSettingTab {
	private plugin: Plugin & { settings: MathConvertSettings; saveSettings(): Promise<void> };

	constructor(
		app: App,
		plugin: Plugin & { settings: MathConvertSettings; saveSettings(): Promise<void> },
	) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		new Setting(containerEl).setName("Math-convert").setHeading();

		new Setting(containerEl)
			.setName("Model ID")
			.setDesc("Huggingface model ID used for inference.")
			.addText((t) =>
				t
					.setPlaceholder(MODEL_ID)
					.setValue(this.plugin.settings.modelId)
					.onChange(async (v) => {
						this.plugin.settings.modelId = v || MODEL_ID;
						resetModel();
						await this.plugin.saveSettings();
					}),
			);
	}
}

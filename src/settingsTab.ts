import { type App, type Plugin, PluginSettingTab, Setting } from "obsidian";
import { resetModel } from "./inference";
import { type MathConvertSettings, type PostProcessingRule, MODEL_ID } from "./settings";

type DeclarativeSettingDefinition =
	| {
			name: string;
			desc?: string;
			control: { type: "text"; key: string; placeholder: string };
			render?: never;
			action?: never;
	  }
	| {
			name: string;
			desc?: string;
			render: (setting: Setting) => void;
			control?: never;
			action?: never;
	  }
	| {
			name: string;
			action: (el: HTMLElement, index: number) => void;
			control?: never;
			render?: never;
	  };

type DeclarativeSettingsGroup = {
	type: "group";
	heading: string;
	items: DeclarativeSettingDefinition[];
};

export class MathConvertSettingTab extends PluginSettingTab {
	private plugin: Plugin & { settings: MathConvertSettings; saveSettings(): Promise<void> };

	constructor(
		app: App,
		plugin: Plugin & { settings: MathConvertSettings; saveSettings(): Promise<void> },
	) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/**
	 * Provides searchable declarative definitions on Obsidian 1.13+.
	 * `display()` remains the fallback for earlier supported app versions.
	 */
	getSettingDefinitions(): DeclarativeSettingsGroup[] {
		return [
			{
				type: "group",
				heading: "Math-convert",
				items: [
					{
						name: "Model ID",
						desc: "Huggingface model ID used for inference.",
						control: { type: "text", key: "modelId", placeholder: MODEL_ID },
					},
				],
			},
			{
				type: "group",
				heading: "Post-processing rules",
				items: [
					{
						name: "Rules",
						desc: "Define rules to automatically modify the output LaTeX before it is inserted or copied. Rules are applied in order from top to bottom.",
						render: (setting: Setting) => this.renderRules(setting.controlEl),
					},
					{
						name: "Add rule",
						action: () => {
							this.addRule();
						},
					},
				],
			},
		];
	}

	getControlValue(key: string): unknown {
		return key === "modelId" ? this.plugin.settings.modelId : undefined;
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		if (key !== "modelId" || typeof value !== "string") return;
		this.plugin.settings.modelId = value || MODEL_ID;
		resetModel();
		await this.plugin.saveSettings();
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

		new Setting(containerEl).setName("Post-processing rules").setHeading();

		containerEl.createEl("p", {
			text: "Define rules to automatically modify the output LaTeX before it is inserted or copied. Rules are applied in order from top to bottom.",
			cls: "setting-item-description",
		});

		const rulesContainer = containerEl.createDiv({ cls: "math-convert-rules-container" });
		this.renderRules(rulesContainer);

		new Setting(containerEl).addButton((btn) =>
			btn.setButtonText("Add rule").onClick(() => this.addRule()),
		);
	}

	private addRule(): void {
		this.plugin.settings.replacementRules.push({
			find: "",
			replace: "",
			isRegex: false,
			enabled: true,
		});
		void this.plugin.saveSettings().then(() => this.refresh());
	}

	private refresh(): void {
		const declarativeTab = this as unknown as { update?: () => void };
		if (declarativeTab.update) {
			declarativeTab.update();
			return;
		}
		this.display();
	}

	private renderRules(container: HTMLElement): void {
		container.empty();
		const { replacementRules } = this.plugin.settings;

		if (replacementRules.length === 0) {
			container.createEl("p", {
				text: "No rules defined. Click 'add rule' to create one.",
				cls: "math-convert-rules-empty",
			});
			return;
		}

		const table = container.createEl("table", { cls: "math-convert-rules-table" });
		const thead = table.createEl("thead");
		const headerRow = thead.createEl("tr");
		for (const label of ["Find", "Replace With", "Regex", "On", ""]) {
			headerRow.createEl("th", { text: label });
		}

		const tbody = table.createEl("tbody");
		for (let i = 0; i < replacementRules.length; i++) {
			this.renderRuleRow(tbody, replacementRules, i);
		}
	}

	private renderRuleRow(
		tbody: HTMLTableSectionElement,
		rules: PostProcessingRule[],
		index: number,
	): void {
		const rule = rules[index];
		const tr = tbody.createEl("tr");

		const findTd = tr.createEl("td");
		const findInput = findTd.createEl("input");
		findInput.type = "text";
		findInput.addClass("math-convert-rules-input");
		findInput.value = rule.find;
		findInput.placeholder = "Find…";
		findInput.addEventListener("change", () => {
			rule.find = findInput.value;
			void this.plugin.saveSettings();
		});

		const replaceTd = tr.createEl("td");
		const replaceInput = replaceTd.createEl("input");
		replaceInput.type = "text";
		replaceInput.addClass("math-convert-rules-input");
		replaceInput.value = rule.replace;
		replaceInput.placeholder = "Replace with…";
		replaceInput.addEventListener("change", () => {
			rule.replace = replaceInput.value;
			void this.plugin.saveSettings();
		});

		const regexTd = tr.createEl("td");
		regexTd.addClass("math-convert-rules-cell--center");
		const regexCb = regexTd.createEl("input");
		regexCb.type = "checkbox";
		regexCb.checked = rule.isRegex;
		regexCb.title = "Treat 'find' as a regular expression";
		regexCb.addEventListener("change", () => {
			rule.isRegex = regexCb.checked;
			void this.plugin.saveSettings();
		});

		const enabledTd = tr.createEl("td");
		enabledTd.addClass("math-convert-rules-cell--center");
		const enabledCb = enabledTd.createEl("input");
		enabledCb.type = "checkbox";
		enabledCb.checked = rule.enabled;
		enabledCb.title = "Enable this rule";
		enabledCb.addEventListener("change", () => {
			rule.enabled = enabledCb.checked;
			void this.plugin.saveSettings();
		});

		const actionsTd = tr.createEl("td");
		const deleteBtn = actionsTd.createEl("button", {
			text: "Delete",
			cls: "math-convert-btn math-convert-btn--sm",
		});
		deleteBtn.addEventListener("click", () => {
			rules.splice(index, 1);
			void this.plugin.saveSettings().then(() => this.refresh());
		});
	}
}

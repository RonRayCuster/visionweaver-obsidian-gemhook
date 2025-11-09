import { Plugin, Notice, MarkdownView } from 'obsidian';
import { GoogleAI } from '@google/generative-ai';

interface GemHookSettings {
  apiKey: string;
  defaultGem: string;
  autoBoot: boolean;
}

const DEFAULT_SETTINGS: GemHookSettings = {
  apiKey: '',
  defaultGem: 'Project God Core ⚡ (Zeus)',
  autoBoot: true
};

export default class GemHookPlugin extends Plugin {
  settings: GemHookSettings;
  genAI: any;

  async onload() {
    await this.loadSettings();

    this.addRibbonIcon('zap', 'GemHook – Zeus Boot', () => this.bootZeus());

    this.addCommand({
      id: 'gemhook-run-last',
      name: 'Run last Hyper-Command block',
      callback: () => this.executeLastBlock()
    });

    if (this.settings.autoBoot) this.bootZeus();

    this.registerMarkdownCodeBlockProcessor('gemhook', (source, el) => {
      this.processHyperCommand(source, el);
    });

    this.addSettingTab(new GemHookSettingTab(this.app, this));
  }

  async bootZeus() {
    new Notice('⚡ ZEUS ONLINE – PRE-AGENTIVE FLOW ACTIVE');
    if (this.settings.apiKey) this.genAI = new GoogleAI(this.settings.apiKey);
  }

  async processHyperCommand(source: string, el: HTMLElement) {
    const btn = el.createEl('button', { text: '▶ Run Hyper-Command' });
    const output = el.createEl('pre', { cls: 'gemhook-output' });

    btn.onclick = async () => {
      output.textContent = 'Executing ARC...';
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const zeusPrompt = await this.app.vault.getAbstractFileByPath('0_DASHBOARDS/ZEUS_CONSTITUTION.md')
          ? await this.app.vault.read(this.app.vault.getAbstractFileByPath('0_DASHBOARDS/ZEUS_CONSTITUTION.md')!)
          : 'You are Project God Core ⚡ (Zeus)';

        const result = await model.generateContent([zeusPrompt, source]);
        output.textContent = result.response.text();
        new Notice('Hyper-Command executed – Muses Voice rendered');
      } catch (err) {
        output.textContent = `VW_Warning: ${err.message}`;
      }
    };
  }

  async executeLastBlock() {
    // Bonus: Find and run last ```gemhook block
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view) {
      const content = view.getViewData();
      const match = content.match(/```gemhook\n([\s\S]*?)\n```/g);
      if (match) {
        const last = match[match.length - 1].replace(/```gemhook\n|```/g, '');
        // Trigger execution logic here
        new Notice('Running last Hyper-Command...');
      }
    }
  }
}

class GemHookSettingTab extends PluginSettingTab {
  plugin: GemHookPlugin;

  constructor(app: App, plugin: GemHookPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl)
      .setName('Gemini API Key')
      .addText(text => text
        .setPlaceholder('Enter your key')
        .setValue(this.plugin.settings.apiKey)
        .onChange(async (value) => {
          this.plugin.settings.apiKey = value;
          await this.plugin.saveSettings();
        }));
  }
}

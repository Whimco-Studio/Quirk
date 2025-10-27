import { Dumpster } from "@rbxts/dumpster";
import { Object as JSObject } from "@rbxts/jsnatives";
import { ReplicatedStorage } from "@rbxts/services";

class GuiBase<K extends string> {
	public Pane: Frame | CanvasGroup;
	private InstanceKeys: Map<K, GuiBase2d> = new Map();
	public _dumpster = new Dumpster();

	constructor({ Template, InstanceKeys }: { Template: string; InstanceKeys?: Record<K, string> }) {
		this.Pane = this._resolveTemplate(Template);
		this._resolveInstanceKeys(InstanceKeys ?? ({} as Record<K, string>));
	}

	private _resolveTemplate(Template: string): Frame | CanvasGroup {
		const Templates = ReplicatedStorage.FindFirstChild("Templates", true) as Folder;

		assert(Templates, `Templates folder not found in ReplicatedStorage`);

		const template = Templates.FindFirstChild(Template, true);
		assert(template, `Template ${Template} not found`);
		assert(
			template.IsA("Frame") || template.IsA("CanvasGroup"),
			`Template ${Template} is not a Frame or CanvasGroup`,
		);

		const clone = template.Clone() as Frame | CanvasGroup;
		this._dumpster.dump(clone);

		return clone;
	}

	private _resolveInstanceKeys(InstanceKeys: { [key: string]: string }) {
		for (const [key, value] of JSObject.entries(InstanceKeys)) {
			const instance = this.Pane.FindFirstChild(value, true);
			assert(instance, `Instance ${value} not found in template ${this.Pane.Name}`);
			this.InstanceKeys.set(key as K, instance as GuiBase2d);
		}
	}

	public resolve<T extends Instance>(key: K): T;
	public resolve<I extends keyof Instances>(key: K, className: I): InstanceType<Instances[I]>;
	public resolve(key: K, className?: keyof Instances) {
		const instance = this.get(key);
		if (className !== undefined) {
			assert(instance.IsA(className), `Instance ${key} is not a ${className}`);
		}
		return instance;
	}

	public get(key: K) {
		assert(this.InstanceKeys.has(key), `Instance ${key} not found in template ${this.Pane.Name}`);
		return this.InstanceKeys.get(key) as Instance;
	}

	public Mount(parent: GuiBase2d) {
		this.Pane.Parent = parent;
	}

	public Destroy() {
		this._dumpster.destroy();
		this.Pane.Destroy();
		table.clear(this);
	}
}

export default GuiBase;

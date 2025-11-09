import { Object as JSObject } from "@rbxts/jsnatives";
import GuiController from "./gui-controller";
import { StarterGui } from "@rbxts/services";

class UiManager {
	private _openGuis: Map<string, GuiController> = new Map();
	private _registeredControllers: Map<string, GuiController> = new Map();
	private _disabledCoreGuis: Enum.CoreGuiType[] = [];
	// constructor() {}

	private _init() {
		for (const controller of JSObject.values(this._registeredControllers)) {
			controller.Init();
		}
	}

	private _start() {
		for (const controller of JSObject.values(this._registeredControllers)) {
			controller.Start();
		}
	}

	private _setDisabledCoreGuis(namespace: string) {
		const controller = this._registeredControllers.get(namespace);
		if (!controller) return error(`Controller ${namespace} not found`);

		this._disabledCoreGuis.clear();
		this._disabledCoreGuis = [...(controller._settings.DisabledCoreGuis ?? [])];

		this._hideCoreGuis();
	}

	private _hideCoreGuis() {
		for (const coreGui of this._disabledCoreGuis) {
			StarterGui.SetCoreGuiEnabled(coreGui, false);
		}
	}

	public Mount() {
		this._init();
		this._start();
	}

	public RegisterController(controller: GuiController) {
		this._registeredControllers.set(controller.namespace, controller);
		return controller;
	}

	public Show(namespace: string) {
		this._setDisabledCoreGuis(namespace);

		for (const controller of JSObject.values(this._registeredControllers)) {
			if (controller.namespace === namespace) {
				controller.Show();
			} else if (controller.namespace !== namespace && controller._settings.CanHide) {
				controller.Hide();
			}
		}
	}

	public Hide(namespace: string) {
		this._registeredControllers.get(namespace)?.Hide();
	}

	public IsVisible(namespace: string) {
		return this._registeredControllers.get(namespace)?._state.Visible() ?? false;
	}
}

export default new UiManager();

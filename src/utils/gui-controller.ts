import Make from "@rbxts/make";
import GuiBase from "./gui-base";
import { Players } from "@rbxts/services";
import { atom } from "@rbxts/charm";

const DefaultSettings = {
	CanHide: true,
	IgnoreGuiInset: false,
	PopUp: false,
	DisabledCoreGuis: [],
};

type GuiControllerSettings = {
	HideWithState?: boolean;
	CanHide?: boolean;
	Visible?: boolean;
	DisabledCoreGuis?: Enum.CoreGuiType[];
	PopUp?: boolean;
	IgnoreGuiInset?: boolean;
	DisplayOrder?: number;
};


class GuiController {
	public namespace: string;
	private _screenGui: ScreenGui | undefined;
	private _gui: GuiBase<string>;
	public _settings: GuiControllerSettings;
	public _state = {
		Visible: atom<boolean>(false),
	};

	constructor(
		Namespace: string,
		Gui: GuiBase<string>,
		CustomSettings: GuiControllerSettings,
	) {
		this.namespace = Namespace;
		this._gui = Gui;
		this._settings = {
			...DefaultSettings,
			...CustomSettings,
		};
	}

	public Init() {
		this._screenGui = Make("ScreenGui", {
			Name: this.namespace,
			Parent: Players.LocalPlayer.WaitForChild("PlayerGui"),
			IgnoreGuiInset: this._settings.IgnoreGuiInset,
			ZIndexBehavior: Enum.ZIndexBehavior.Sibling,
			DisplayOrder: this._settings.DisplayOrder,
		});

		if (this._settings.CanHide !== false) {
			this._screenGui.Enabled = false;
		}
	}

	public Start() {
		this._gui.Mount(this._screenGui as ScreenGui);
	}

	public Show() {
		this._screenGui!.Enabled = true;
	}

	public Hide() {
		this._screenGui!.Enabled = false;
	}

	public Destroy() {}
}

export default GuiController;

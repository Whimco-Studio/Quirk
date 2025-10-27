import { Dumpster } from "@rbxts/dumpster";
import { createMotion, SpringOptions } from "@rbxts/ripple";


type SoundBindType = "MouseEnter" | "MouseLeave" | "Activated";

type GuiButtonConfig = {
    SoundBinds?: Record<SoundBindType, Sound>,
    useBaseButton?: boolean,
    impulse?: {
        direction?: "up" | "down",
        amount?: number,
    }
    bounds?: {
        min: number,
        max: number,
    }
    onActivated?: () => void,
}


class GuiButton {
	private _button: ImageButton;
	private _buttonClone: ImageButton;
    private _uiscale: UIScale;
    private _dumpster: Dumpster;
    private config?: GuiButtonConfig
    private _motion = createMotion(1, {
        start: true,
    })
    private _motionOptions: SpringOptions = {
        velocity: 0.001,
        damping: 0.5,
        mass: 0.1,
        friction: 10,
    }
	constructor(button: ImageButton, dumpster: Dumpster, customMotionOptions?: SpringOptions, config?: GuiButtonConfig
    ) {
        this.config = config;
		this._button = button;
		this._buttonClone = config?.useBaseButton ? button : button.Clone();
		this._uiscale = new Instance("UIScale", this._buttonClone);
		this._dumpster = dumpster;

        this._motionOptions = {
            ...this._motionOptions,
            ...customMotionOptions,
        }


        this.init();
	}

    private init() {
        if (!this.config?.useBaseButton) {
            this._buttonClone.Parent = this._button;

            this._button.ImageTransparency = 1;
            this._button.BackgroundTransparency = 1;

            this._buttonClone.AnchorPoint = new Vector2(0.5, 0.5);
            this._buttonClone.Position = new UDim2(0.5, 0, 0.5, 0);
            this._buttonClone.Size = new UDim2(1, 0, 1, 0);
        }

        
        this._dumpster.dump(this._buttonClone.MouseEnter.Connect(() => {
            this._motion.spring(this.config?.bounds?.max ?? 1.25, this._motionOptions)
        }))

        this._dumpster.dump(this._buttonClone.MouseLeave.Connect(() => {
            this._motion.spring(this.config?.bounds?.min ?? 1, this._motionOptions)

        }))

        this._dumpster.dump(this._buttonClone.Activated.Connect(() => {
            const impulseAmount = this.config?.impulse?.amount ?? .01;
            this._motion.impulse(this.config?.impulse?.direction === "up" ? impulseAmount : -impulseAmount)
            this.config?.onActivated?.();
        }))

        this._dumpster.dump(this._motion.onStep((value, deltaTime) => {
            this._uiscale.Scale = value;
        }));
    }

    
}

export default GuiButton;
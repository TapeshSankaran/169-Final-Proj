
class InputHandler {
    constructor (config = {}) {
        this.colorBox = config.c_Box || null;
        this.colorModeSelect = config.c_ModeSelect || null;
        this.iterationInput = config.i_Input || null;
        this.tileSizeInput = config.ts_Input || null;
        this.world = config.world || null;
        this.tilingSelect = config.tiling_Select || null;
        this.bgInput = config.bgInput || null;

        if (!this.colorBox || !this.colorModeSelect || !this.iterationInput || !this.tileSizeInput || !this.world || !this.tilingSelect || !this.bgInput) {
            throw new Error("InputHandler: One or more DOM elements are missing.");
        }

        this.colorModeSelect.add(new Option('Flat', 'flat'));
        this.colorModeSelect.add(new Option('Random', 'random'));
        this.colorModeSelect.add(new Option('Noise', 'noise'));
        this.colorModeSelect.add(new Option('Filter', 'filter'));
        this.colorModeSelect.add(new Option('Glass', 'glass'));
        this.colorModeSelect.value = 'noise';
        this.colorModeSelect.addEventListener('change', () => {
            world.colorMode = this.colorModeSelect.value;
        });

        this.iterationInput.value = this.world.iterations;
        this.iterationInput.addEventListener('change', () => {
            let iters = parseInt(this.iterationInput.value);
            if (iters < 1 || iters > 4) {
                iters = iters < 1 ? 1 : 4;
                this.iterationInput = iters;
            }
            this.world.iterations = iters;
            this.world.reset();
        });

        this.tileSizeInput.value = this.world.tileSize;
        this.tileSizeInput.addEventListener('change', () => {
            let size = parseInt(this.tileSizeInput.value);
            if (size < 25 || size > 400) {
                size = size < 25 ? 25 : 400;
                this.tileSizeInput.value = size;
            }
            this.world.tileSize = size;
            this.world.reset();
        });

        this.colorBox.addBtn.addEventListener('click', () => this.addColor());
        this.colorBox.remBtn.addEventListener('click', () => this.removeColor());

        for (let color of this.world.colors) {
            let cInput = document.createElement("input");
            cInput.type = "color";
            cInput.value = '#' + hex(red(color), 2) + hex(green(color), 2) + hex(blue(color), 2);
            this.colorBox.container.appendChild(cInput);
            cInput.addEventListener('input', () => this.changeColor(cInput));
        }

        let defaultTiling = new Option('Ammann Beenker', 'ab');
        this.tilingSelect.add(defaultTiling);
        this.tilingSelect.add(new Option('Split', 'base'));
        this.tilingSelect.value = defaultTiling.value;
        this.tilingSelect.addEventListener('change', () => {
            this.world.currentTiling = this.tilingSelect.value;
            this.world.reset();
        });

        this.bgInput.addEventListener('change', () => {
            const file = this.bgInput.files[0];
            if (file.type.startsWith('image/')) {
                this.world.bg = loadImage(URL.createObjectURL(file), (img) => {
                    this.world.reset();
                });
            }
        });
    }

    addColor() {
        if (this.world.colors.length >= 29) return
        let newCInput = document.createElement("input");
        newCInput.type = "color";
        newCInput.value = '#ffffff';
        this.colorBox.container.appendChild(newCInput);
        this.world.colors.push(color(255, 255, 255));
        newCInput.addEventListener('input', () => this.changeColor(newCInput));
    }

    removeColor() {
        const inputs = this.colorBox.container.children;
        if (inputs.length > 1) {
            this.colorBox.container.removeChild(inputs[inputs.length - 1]);
            this.world.colors.pop();
        }
    }

    changeColor(cInput) {
        const idx = Array.from(this.colorBox.container.children).indexOf(cInput);
        let cV = this.hexToRgb(cInput.value);
        this.world.colors[idx] = color(cV[0], cV[1], cV[2]);
        this.world.reset();
    }

    hexToRgb(hex) {
        let bigint = parseInt(hex.slice(1), 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;
        return [r, g, b];
    }
}

class World {
    constructor( config = {} ) {
        this.tileSize = config.tileSize || 100;
        this.iterations = config.iterations || 1; // how many splits
        this.camSpeed = config.camSpeed || 20; 
        this.drawRange = config.drawRange || 2;
        this.colorMode = config.colorMode || 'noise'; // 'noise' | 'random' | 'flat'
        this.zoom = config.zoom || 1;
        this.c = config.canvas || null;
        this.colors = config.colors || [color(200, 25, 30), color(30, 25, 200)];
        this.currentTiling = config.tiling || "base";
        
        this.setTiling(config.tiling || "base");
        
        this.camera = createVector(10000, 10000);
        this.velocity = createVector(0, 0);
        
        this.bg = config.bg || null;
        
        this.time = 0;
        
        if (!this.c) {
            throw new Error("World: canvas context lost.");
        }

    }

    setTiling(type = "base") {
        if (type === "ab") {
            this.tiling = new AmmannBeenkar(this.iterations, this.tileSize, this.colors.length);
        } else {
            this.tiling = new BaseTiling(this.iterations, this.tileSize);
        }
    }

    loadBG(img) {
        this.bg = img;
    }

    update() {
        // Cam movement
        if (keyIsDown(LEFT_ARROW) || keyIsDown(65))  this.velocity.x -= 1;
        if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) this.velocity.x += 1;
        if (keyIsDown(UP_ARROW) || keyIsDown(87))    this.velocity.y -= 1;
        if (keyIsDown(DOWN_ARROW) || keyIsDown(83))  this.velocity.y += 1;

        this.camera.add(this.velocity);
        this.velocity.mult(0.9); // ease
        if (this.velocity.mag() < 0.05) this.velocity.setMag(0);

        this.time += deltaTime * 0.001;
    }

    draw() {
        if (this.bg && (this.colorMode === 'filter' || this.colorMode === 'glass')) {
            push();
            if (this.colorMode === 'glass') {
                tint(0, 0, 0, 200);
            }
            image(this.bg, 0, 0, width, height);
            pop();
        }
        push();
        this.c.translate(width / 2, height / 2);
        scale(this.zoom);
        this.drawInfiniteTiling();
        pop();
    }

    drawInfiniteTiling() {
        const step = this.tileSize * 2;
        const ox = -this.camera.x % step;
        const oy = -this.camera.y % step;

        for (let y = -this.drawRange; y <= this.drawRange; y++) {
            for (let x = -this.drawRange; x <= this.drawRange; x++) {
                const dx = x * step + ox;
                const dy = y * step + oy;
                const tx = floor((x * step + this.camera.x) / step);
                const ty = floor((y * step + this.camera.y) / step);
                const wx = tx * step;
                const wy = ty * step;
                push();
                this.c.translate(dx, dy);
                this.drawTiling(wx, wy, step, dx, dy);
                pop();
            }
        }
    }

    drawTiling(tx, ty, step, dx, dy) {
        for (let shape of this.tiling.tiles) {
            const wx = tx * step + shape.cx;
            const wy = ty * step + shape.cy;
            let c = this.getColor(wx, wy, shape, dx, dy);
            fill(c);
            beginShape();
            for (let v of shape.verts) vertex(v.x, v.y);
            endShape(CLOSE);
        }
    }

    getColor(wx, wy, shape, dx, dy) {
        let seed = floor(wx * 1000 + wy);
        randomSeed(seed);
        let c;
        if (this.currentTiling !== "base") {
            let i = shape.parent.osc*2 + (shape.type === "tri" ? 0 : 1);
            c = this.colors[i % this.colors.length];
        } else {
            c = this.colors[floor(random(0, this.colors.length))];
        }

        if (this.colorMode === 'flat') return this.colors[0]; // first color only
        if (this.colorMode === 'random') {
            c.alpha = random(50, 255);
            return c
        }; // random no noise variation
        if (this.colorMode === 'filter') {
            let x = map(dx+shape.cx, -width*.5 - this.tileSize*.5, width*.5 + this.tileSize*.5, 0, this.bg.width);
            let y = map(dy+shape.cy, -height*.5 - this.tileSize*.5, height*.5 + this.tileSize*.5, 0, this.bg.height);
            return this.bg.get(x, y);
        }
        if (this.colorMode === 'glass') {
            let x = map(dx+shape.cx, -width*.5 - this.tileSize*.5, width*.5 + this.tileSize*.5, 0, this.bg.width);
            let y = map(dy+shape.cy, -height*.5 - this.tileSize*.5, height*.5 + this.tileSize*.5, 0, this.bg.height);
            return this.colorNoise([wx, wy], this.bg.get(x, y), 15, 0.1);
        }

        // else noise
        return this.colorNoise([wx, wy], c);
    }

    colorNoise([wx, wy], baseColor, s=5, ts=0.5) {
        let c = baseColor;
        let nTx = noise(this.time * ts, wx * 0.1 + 100) * s;
        let nTy = noise(this.time * ts, wy * 0.1 + 100) * s;
        let nR = noise(wx * 0.01 + 10000 + nTx, wy * 0.01 + 10000 + nTy, red(c)   * 0.05);
        let nG = noise(wx * 0.01 + 10000 + nTx, wy * 0.01 + 10000 + nTy, green(c) * 0.05);
        let nB = noise(wx * 0.01 + 10000 + nTx, wy * 0.01 + 10000 + nTy, blue(c)  * 0.05);
        return color(
            map(nR, 0, 1,   red(c) - 30,   red(c) + 30),
            map(nG, 0, 1, green(c) - 30, green(c) + 30),
            map(nB, 0, 1,  blue(c) - 30,  blue(c) + 30),
            map(nTx+nTy, 0, 10, 40, 255),
        )
    }

    reset() {
        this.setTiling(this.currentTiling || "base");
        this.drawRange = width / (2 * this.tileSize);
    }
}
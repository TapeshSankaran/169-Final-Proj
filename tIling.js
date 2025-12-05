// Tiling logics from: https://geometricolor.wordpress.com/2012/05/16/an-efficient-iterative-method-for-the-ammann-beenker-tiling/

class BaseTiling {
    constructor(iterations = 1, tileSize = 100) {
        this.iterations = iterations;
        this.tileSize = tileSize;
        this.tiles = [];
        this.generate();
    }

    generate() {
        let root = [];
        const s = this.tileSize * 2 //I ain't typing allat
        //square
        const square = [ 
            createVector(0, 0),
            createVector(s, 0),
            createVector(s, s),
            createVector(0, s),
        ]
        root.push({ verts: square, cx: s/2, cy: s/2 });
        
        // octagon
        const r = s / (1 + Math.sqrt(2));
        const p = (s-r)/2;
        const oct = [ 
            createVector(p, 0),
            createVector(s-p, 0),
            createVector(s, p),
            createVector(s, s-p),
            createVector(s-p, s),
            createVector(p, s),
            createVector(0, s-p),
            createVector(0, p),
        ]
        root.push({ verts: oct, cx: s/2, cy: s/2 });
        this.tiles = root;
        for (let i = 0; i < this.iterations; i++) {
            this.subdivide(this.tiles);
        }
    }
    subdivide(tiles) {
        let splitTiles = [tiles[0]];
        tiles.shift(); // remove square

        for (let tile of tiles) {
            let c = createVector(tile.cx, tile.cy); //center
            let divs = 360 / tile.verts.length; //angle between vertices
            for (let v of tile.verts) {
                let rot1 = p5.Vector.sub(v, c).rotate(divs/2)    // rotate vector for rhombus
                let rot2 = p5.Vector.sub(v, c).rotate(-divs/2)    // rotate vector for rhombus
                let r1 = c.copy();
                let r2 = c.copy().add(rot2.mult(0.5));  // middle side of rhombas
                let r3 = v.copy();
                let r4 = c.copy().add(rot1.mult(0.5));  // corner of rhombus
                
                let rot3 = p5.Vector.sub(v, c).rotate(divs);
                let t1 = v.copy();
                let t2 = c.copy().add(rot3);  // corner of triangle
                let t3 = r4.copy();
                
                splitTiles.push({
                    verts: [r1, r2, r3, r4],
                    cx: (r1.x + r2.x + r3.x + r4.x) / 4, // center x
                    cy: (r1.y + r2.y + r3.y + r4.y) / 4, // center y
                });
                splitTiles.push({
                    verts: [t1, t2, t3],
                    cx: (t1.x + t2.x + t3.x) / 3,   // center x
                    cy: (t1.y + t2.y + t3.y) / 3   // center y
                });
            }
        }
        
        this.tiles = splitTiles;
    }
}

class AmmannBeenkar {
    constructor(iterations = 1, tileSize = 100, numColors = 4) {
        this.iterations = iterations;
        this.tileSize = tileSize;
        this.tiles = [];
        this.f = 1 / (1 + Math.sqrt(2));
        this.osc = -1;
        this.maxIters = Math.floor(numColors/2);
        this.generate();
    }

    generate() {
        this.tiles = [];
                                                // X────────────X────────────X
        const s = this.tileSize * 2;            // |‾-_         |         _-‾|
        let VA = createVector(0, 0);            // |   ‾-_      |      _-‾   |
        let VB = createVector(s, 0);            // |      ‾-_   |   _-‾      |
        let VC = createVector(s, s);            // |         ‾-_|_-‾         |
        let VD = createVector(0, s);            // X────────────X────────────X
        let C = createVector(s/2, s/2);         // |         _-‾|‾-_         |
        let CAB = p5.Vector.lerp(VA, VB, 0.5);  // |      _-‾   |   ‾-_      |
        let CBC = p5.Vector.lerp(VB, VC, 0.5);  // |   _-‾      |      ‾-_   |
        let CCD = p5.Vector.lerp(VC, VD, 0.5);  // |_-‾         |         ‾-_|
        let CDA = p5.Vector.lerp(VD, VA, 0.5);  // X────────────X────────────X

        this.tiles.push(this.makeTriangle(C, CAB, VA, 0));
        this.tiles.push(this.makeTriangle(C, CAB, VB, 0));
        this.tiles.push(this.makeTriangle(C, CBC, VB, 0));
        this.tiles.push(this.makeTriangle(C, CBC, VC, 0));
        this.tiles.push(this.makeTriangle(C, CCD, VC, 0));
        this.tiles.push(this.makeTriangle(C, CCD, VD, 0));
        this.tiles.push(this.makeTriangle(C, CDA, VD, 0));
        this.tiles.push(this.makeTriangle(C, CDA, VA, 0));


        for (let i = 0; i < this.iterations; i++) {
            this.tiles = this.subdivideAll(this.tiles);
        }
    }

    makeTriangle(a, b, c, gen, parent=null) {
        this.osc += 1;                                   
        if (this.osc >= this.maxIters) this.osc = 0; 
        return {                                    
            type: "tri",                             
            verts: [a.copy(), b.copy(), c.copy()],   
            cx: (a.x + b.x + c.x) / 3,
            cy: (a.y + b.y + c.y) / 3,
            gen: gen,
            osc: this.osc,
            parent: parent,
        };
    }

    makeRhomb(a, b, c, d, gen, parent=null) {
        this.osc += 1;
        if (this.osc >= this.maxIters) this.osc = 0;
        return {
            type: "rh",
            verts: [a.copy(), b.copy(), c.copy(), d.copy()],
            cx: (a.x + b.x + c.x + d.x) / 4,
            cy: (a.y + b.y + c.y + d.y) / 4,
            gen: gen,
            osc: this.osc,
            parent: parent,
        };
    }

    subdivideAll(tiles) {
        let out = [];
        for (let t of tiles) {
            if (t.type === "tri") out.push(...this.subdivideTriangle(t));
            else out.push(...this.subdivideRhombus(t));
        }
        return out;
    }

    // ------------------------------
    // Triangle Subdivision from tiling logic paper
    // ------------------------------
    subdivideTriangle(t) {
        let A = t.verts[0], B = t.verts[1], C = t.verts[2];
        let g = t.gen + 1;
        let f = this.f;

        let ABf = p5.Vector.lerp(A, B, f);
        let BCf = p5.Vector.lerp(B, C, f);
        let sRs = p5.Vector.dist(A, ABf);

        let ACM = p5.Vector.lerp(A, C, 0.5);
        let Tb = p5.Vector.dist(A, C);
        let sTb = Tb - 2*sRs;
        let Cr = sRs / ((sTb/2)+sRs);

        let sRr = sRs / Tb;
        let ACf = p5.Vector.lerp(A, C, sRr);
        let CAf = p5.Vector.lerp(C, A, sRr);

        let CT = p5.Vector.lerp(B, ACM, Cr);

        let out = [];
                                                         // X────────X────────X
        out.push(this.makeTriangle(C, CAf, BCf, g, t));  // |‾-_       ‾-_ _-‾
        out.push(this.makeTriangle(CAf, CT, ACf, g, t)); // |    X───────_X
        out.push(this.makeTriangle(B, CT, ABf, g  , t)); // | _-‾|   _-‾ 
                                                         // X    |_-‾
        out.push(this.makeRhomb(A, ACf, CT, ABf, g, t)); // |  _-X
        out.push(this.makeRhomb(B, CT, CAf, BCf, g, t)); // X-‾

        return out;
    }

    // ------------------------------
    // Rhombus Subdivision from tiling logic paper
    // ------------------------------
    subdivideRhombus(r) {
        // 4 corners
        let A = r.verts[0], B = r.verts[1], C = r.verts[2], D = r.verts[3];
        let g = r.gen + 1;             
        let f = this.f;                
                            
        let ABf = p5.Vector.lerp(A, B, f);      
        let ADf = p5.Vector.lerp(A, D, f);       
        let CBf = p5.Vector.lerp(C, B, f);                //                   _-X
        let CDf = p5.Vector.lerp(C, D, f);                //                _-‾  | 
                                                          //             X-‾     |  
        let CRA = p5.Vector.lerp(A, C, f);                //          _-‾|       |  
        let CRC = p5.Vector.lerp(C, A, f);                //       _-‾   |     _-X
                                                          //    _-‾      |  _-‾  |  
        let out = [];                                     // X-‾─────────X-‾     | 
                                                          // |‾-_          ‾-_   | 
        out.push(this.makeTriangle(ABf, CRA, B, g, r));   // |   ‾-_          ‾-_|  
        out.push(this.makeTriangle(ADf, CRA, D, g, r));   // |     _─X─────────_─X 
        out.push(this.makeTriangle(CBf, CRC, B, g, r));   // |  _-‾  |      _-‾
        out.push(this.makeTriangle(CDf, CRC, D, g, r));   // X-‾     |   _-‾
                                                          // |       |_-‾
        out.push(this.makeRhomb(A, ABf, CRA, ADf, g, r)); // |     _-X
        out.push(this.makeRhomb(C, CDf, CRC, CBf, g, r)); // |  _-‾    
        out.push(this.makeRhomb(B, CRA, D, CRC, g  , r)); // X-‾      

        return out;
    }
}

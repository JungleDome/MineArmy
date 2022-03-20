let Vec3;
let fs;
let Schematic;
let _mcVersion;

module.exports = loader

function loader(mcVersion) {
    Vec3 = require('vec3');
    fs = require('fs').promises;
    Schematic = require('prismarine-schematic').Schematic;
    _mcVersion = mcVersion;
    return Builder;
}

class BuildingSchematic {
    constructor(startingPos, blocks) {

    }
}

class Builder {
    constructor(bot, world, viewer) {
        this.bot = bot;
        this.world = world;
        this.viewer = viewer;
        this.saveDirectory = 'schematics/';
        this.displaySelection = false;
        this.startingPos = new Vec3(0, 0, 0);
        this.currentPos = new Vec3(0, 0, 0);
    }

    get buildState() {
        this._buildState = this.selectedRegion.map((block, pos) => {
            return {
                position: this.startingPos.plus(pos),
                schematicPosition: pos,
                schematicBlock: block,
                currentBlock: this.world.getBlock(this.startingPos.plus(pos)),
                //verified: await verifyBlock(pos, await this.world.getBlock(this.startingPos.plus(pos))),
            }
        });
        return this._buildState;
    }

    async setSelectionRegion(start, end) {
        this.selectedRegion = await Schematic.copy(this.world, start.min(end), start.max(end), new Vec3(0, 0, 0), _mcVersion);
    }

    async saveSelectionRegion(playerSavePosition) {
        if (this.selectedRegion == null)
            throw "No region selected to save.";
        //this.selectedRegion.offset = this.selectedRegion.start().minus(playerSavePosition);
        await fs.writeFile(this.saveDirectory + 'test.schem', await this.selectedRegion.write());
    }

    async loadSelectionRegion() {
        this.selectedRegion = await Schematic.read(await fs.readFile(this.saveDirectory + 'test.schem'));
        if (this.viewer)
            this.viewer.erase('build1');
    }

    displaySelectionGrid(originPosition) {
        if (originPosition) {
            this.startingPos = originPosition;
            if (this.selectedRegion && this.viewer) {
                this.displaySelection = true;
                this.viewer.drawBoxGrid('build1', originPosition, originPosition.plus(this.selectedRegion.size), 0xff00ff);
                return true;
            }
        }
        return false;
    }

    offsetSelectionGrid(offsetPosition) {
        this.startingPos.plus(offsetPosition);
        if (this.displaySelection) {
            this.displaySelectionGrid(this.startingPos);
        }
    }

    listMaterial() {
        if (this.selectedRegion) {
            return this.selectedRegion.blocks.reduce((a, c) => (a[c.type] = (a[c.type] || 0) + 1, a), Object.create(null));
        }
        return [];
    }

    build() {

    }

    verifyBuild() {
        let totalBlocks = this.selectedRegion.size.volume(); //including air
        let verifiedBlock = 0;
        this.selectedRegion.forEach(async (block, pos) => {
            let result = await this.verifyBlock(pos, await this.world.getBlock(this.startingPos.plus(pos)));
            if (result)
                verifiedBlock++;
        });
        return verifiedBlock / totalBlocks;
    }

    /**
     * verify a single block with schematic
     * @param {Vec3} pos Position relative to schematic
     * @param {Block} block Block to be verified
     */
    async verifyBlock(pos, block) {
        //TODO: check facing & stateId
        return await this.selectedRegion.getBlock(pos).type == block.type;
    }

    /**
     * similar to js forEach, loop over a blocks in region
     * @param {Vec3} startPos
     * @param {Vec3} endPos
     * @param {(pos: Vec3) => {}} cb
     * @returns {Promise<any>}
     */
    async forEach(startPos, endPos, cb) {
        const { x: startX, y: startY, z: startZ } = startPos
        const { x: endX, y: endY, z: endZ } = endPos
        for (let y = startY; y <= endY; y++) {
            for (let z = startZ; z <= endZ; z++) {
                for (let x = startX; x <= endX; x++) {
                    const pos = new Vec3(x, y, z)
                    await cb(pos)
                }
            }
        }
    }

    placeBlock(inventoryItem, options, position) {

    }
}

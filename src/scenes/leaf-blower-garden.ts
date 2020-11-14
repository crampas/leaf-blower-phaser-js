import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'LeafBlowerGarden',
};
  
/**
 * The initial scene that loads all necessary assets to the game and displays a loading bar.
 */
export class LeafBlowerGarden extends Phaser.Scene {

    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private player: Phaser.Physics.Arcade.Sprite;
    private obstacles: Phaser.Physics.Arcade.StaticGroup;

    private windParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private leafs: Phaser.Physics.Arcade.Sprite[] = [];
    private text: Phaser.GameObjects.Text;
    private sweeper: Phaser.Physics.Arcade.Sprite;
    private sweeperEngine: Phaser.Sound.BaseSound;
    private sweeperText: Phaser.GameObjects.Text;

    private sweeperSlurp: Phaser.Sound.BaseSound;
    private playerBlower: Phaser.Sound.BaseSound;
    private cleanerOn: boolean = false;
    private cleanerVolume: number = 0;

    private playerAh: Phaser.Sound.BaseSound;

    private collectedLeafs: number = 0;
    private energy: number = 3000;

    private readonly BLOWER_OPENING_ANGLE = 0.2;

    constructor() {
        super(sceneConfig);
    }

    public preload(): void {
        this.text = this.add.text(100, 100, 'Starting...').setFontSize(32).setDepth(100).setScrollFactor(0);
        this.sweeperText = this.add.text(0, 0, '').setFontSize(32).setDepth(100);

        this.load.image('man', 'assets/sprites/player.png');
        this.load.image('particle', 'assets/sprites/air-particle.png');
        this.load.image('leaf', 'assets/sprites/leaf-4.png');
        this.load.image('background', 'assets/tiles/garden/garden-01-background.png');
        this.load.image('foreground', 'assets/tiles/garden/garden-01-foreground.png');
        this.load.image('sweeper', 'assets/sprites/sweeper.png');
        
        this.load.spritesheet('leafs', 'assets/sprites/leaf-4.png', { frameWidth: 32, frameHeight: 32 });

        this.load.audio('slurp', 'assets/audio/squit.wav');
        this.load.audio('sweeper-engine', 'assets/audio/diesel-loop.mp3');
        this.load.audio('cleaner', 'assets/audio/leaf-blower-loop.mp3');
        this.load.audio('playerAh', 'assets/audio/player-ah.mp3');
    }

    public create(): void {

        this.cursorKeys = this.input.keyboard.createCursorKeys();

        this.sweeperSlurp = this.sound.add('slurp');
        this.sweeperEngine = this.sound.add('sweeper-engine', {loop: true});

        this.playerBlower = this.sound.add('cleaner', {loop: true});
        this.playerAh = this.sound.add('playerAh');

        this.physics.world.setBounds(0, 0, 1024, 1024);
        this.cameras.main.setBounds(0, 0, 1024, 1024);
        this.cameras.main.x = Math.max((this.game.canvas.width - 1024) / 2, 0);
        this.cameras.main.y = Math.max((this.game.canvas.height - 1024) / 2, 0);


        this.add.image(0, 0, 'background').setScale(1, 1).setOrigin(0, 0);

        for (let index = 0; index < 2000; index++) {
            const leaf = this.physics.add.sprite(Math.random() * 1024, Math.random() * 1024, "leafs", index % 4);
            leaf.setCollideWorldBounds(true);
            leaf.setDrag(100, 100);
            leaf.setFriction(1000, 1000);
            leaf.setMass(0.01);
            leaf.setBounce(0.5, 0.5);
            leaf.setRotation(Math.random() * Math.PI);
            this.leafs.push(leaf);
        }


        this.player = this.physics.add.sprite(450, 400, 'man');
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player, true);

        this.obstacles = this.physics.add.staticGroup();
        const obstacle1 = this.add.zone(432, 208, 32, 32);
        // this.add.rectangle(432, 208, 32, 32, 0x80ffffff);
        this.obstacles.add(obstacle1);

        this.sweeper = this.physics.add.sprite(370, 2000, 'sweeper');
        this.sweeper.setVelocityY(130);

        const winParticleManager = this.add.particles('particle');
        this.windParticleEmitter = winParticleManager.createEmitter({on: false});
        this.windParticleEmitter.setFrequency(0);
        this.windParticleEmitter.setBlendMode(Phaser.BlendModes.NORMAL);
        this.windParticleEmitter.acceleration = true;

        this.add.image(0, 0, 'foreground').setScale(1, 1).setOrigin(0, 0);

        this.playerBlower.play({volume: 0});

        this.sweeperText.setVisible(false);
        this.sweeperText.setText('Pass doch auf du Depp ...');
        
        this.physics.add.collider(this.player, this.obstacles);
        this.physics.add.overlap(this.player, this.sweeper, () => {
            this.player.setPosition(this.player.x + 40, this.player.y);
            this.playerAh.play();
            this.sweeperText.setPosition(this.sweeper.x, this.sweeper.y);
            this.sweeperText.setVisible(true);
            this.time.addEvent({delay: 3000}).callback = () => {
                this.sweeperText.setVisible(false);
            };
        });
    }





    public update(): void {
    
        if (this.sweeper.y > 1050) {
            this.sweeper.y = 0;
            this.sweeperEngine.play();
        }


        for (let leaf of this.leafs) {
            if (!leaf.visible) {
                continue;
            }
            const sweeperDistance = Phaser.Math.Distance.Between(this.sweeper.x, this.sweeper.y, leaf.x, leaf.y);
            if (sweeperDistance < 40) {
                leaf.setVisible(false);
                this.sweeperSlurp.play();
                this.collectedLeafs++;
            }
        }

        const manSweeperDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.sweeper.x, this.sweeper.y);
        this.sweeperEngine.setVolume(1 / manSweeperDistance * 100);


        // Phaser.Math.Angle.WrapDegrees(this.man.rotation);
        let manAngle = this.player.rotation;
        let push = new Phaser.Math.Vector2(1, 0);
        push.setAngle(manAngle);

        this.player.setVelocity(0);

        this.windParticleEmitter.on = false;
        


        if (this.cursorKeys.left.isDown) {
            if (this.cursorKeys.shift.isDown) {
                this.player.setVelocity(push.y * 100, -push.x * 100);    
            } 
            else {
                manAngle -= 0.05;            
            }
        }
        if (this.cursorKeys.right.isDown) {
            if (this.cursorKeys.shift.isDown) {
                this.player.setVelocity(-push.y * 100, push.x * 100);    
            } 
            else {
                manAngle += 0.05;
            }
        }
        if (this.cursorKeys.up.isDown) {            
            this.player.setVelocity(push.x * 100, push.y * 100);
        }
        if (this.cursorKeys.down.isDown) {
            this.player.setVelocity(-push.x * 100, -push.y * 100);
        }
        if (this.cursorKeys.space.isDown && this.energy > 0) {
            this.energy--;
            this.switchCleaner(true);
            for (let leaf of this.leafs) {
                const leafAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, leaf.x, leaf.y);
                const diffAngle = this.angleDiff(leafAngle, manAngle);
                if (diffAngle > -this.BLOWER_OPENING_ANGLE && diffAngle < this.BLOWER_OPENING_ANGLE) {
                    const leafDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, leaf.x, leaf.y);
                    const lefDistanceFactor = leafDistance / 50 + 1.0;
                    const ref = Math.random() / (lefDistanceFactor * lefDistanceFactor * leafDistance) * 2000;
                    leaf.setVelocity(ref * (leaf.x - this.player.x), ref * (leaf.y - this.player.y));
                }
            }
            
            this.windParticleEmitter.setPosition(this.player.x + push.x * 50, this.player.y + push.y * 50);
            this.windParticleEmitter.on = true;
            const particleAngleMin = manAngle - this.BLOWER_OPENING_ANGLE;
            const particleAngleMax = manAngle + this.BLOWER_OPENING_ANGLE;
            this.windParticleEmitter.setAngle({min: Phaser.Math.RadToDeg(particleAngleMin), max: Phaser.Math.RadToDeg(particleAngleMax)});
            this.windParticleEmitter.setSpeed({min: 100, max: 500});
            this.windParticleEmitter.setScale(0.5); 
        } else {
            this.switchCleaner(false);
        }

        this.player.setRotation(Phaser.Math.Angle.Wrap(manAngle));

        this.windParticleEmitter.forEachAlive((particle, particleEmitter) => {
            particle.scaleX = Math.max(particle.lifeT, 0.5);
            particle.scaleY = Math.max(particle.lifeT, 0.5);
        }, null);


        const pointerAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.worldX, this.input.activePointer.worldY);
        const pointerDiff = Phaser.Math.Angle.ShortestBetween(pointerAngle, manAngle);

        this.text.setText([
            'Leafs: ' + this.collectedLeafs.toString(),
            'Energy:' + this.energy,
            // `Angle: ${pointerAngle}`,
            // `Player: ${this.player.x}, ${this.player.y}`,
            // `Pointer: ${this.input.activePointer.worldX}, ${this.input.activePointer.worldY}`,
            // `Diff: ${pointerDiff}`,
        ]);

    }

    private angleDiff(angle1: number, angle2: number): number {
        let diff = angle2 - angle1;
        diff = diff < -Math.PI ? diff + Math.PI + Math.PI : diff;
        diff = diff > Math.PI ? diff - Math.PI - Math.PI : diff;
        return diff;
    }

    private switchCleaner(value: boolean) {
        if (value) {
            this.cleanerVolume = Math.min(this.cleanerVolume + 10, 100);
        } else {
            this.cleanerVolume = Math.max(this.cleanerVolume - 3, 0);
        }
        this.playerBlower.setVolume(this.cleanerVolume / 100.0);
        this.playerBlower.setRate(Math.max(this.cleanerVolume / 100.0, 0.1));

        this.cleanerOn = value;
    }
    
}  



import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'Boot',
};
  
/**
 * The initial scene that loads all necessary assets to the game and displays a loading bar.
 */
export class BootScene extends Phaser.Scene {

    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private man: Phaser.Physics.Arcade.Sprite;
    private windParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private leafs: Phaser.Physics.Arcade.Sprite[] = [];


    constructor() {
        super(sceneConfig);
    }

    public preload(): void {
        const loadingText = this.add.text(100, 100, 'Starting...').setFontSize(32);


        // const line = this.add.line(200, 200, 0, 0, 50, 10, 0xff0000);
        // line.rotation = 0.5;

        // this.load.image('man', 'assets/sprites/character.png');
        this.load.image('man', 'assets/sprites/arrow-block.png');
        this.load.image('particle', 'assets/sprites/air-particle.png');
        this.load.image('leaf', 'assets/sprites/leaf-4.png');
        this.load.image('background', 'assets/tiles/garden/garden-01-background.png');
        this.load.image('foreground', 'assets/tiles/garden/garden-01-foreground.png');
        
        this.load.spritesheet('leafs', 'assets/sprites/leaf-4.png', { frameWidth: 32, frameHeight: 32 });
    }

    public create(): void {
    
        this.physics.world.setBounds(0, 0, 1024, 1024);
        this.cameras.main.setBounds(0, 0, 1024, 1024);


        // this.scale.setZoom(2);
        

        // This is a nice helper Phaser provides to create listeners for some of the most common keys.
        this.cursorKeys = this.input.keyboard.createCursorKeys();

        this.add.image(0, 0, 'background').setScale(1, 1).setOrigin(0, 0);

        for (let index = 0; index < 2000; index++) {
            const leaf = this.physics.add.sprite(Math.random() * 1500, Math.random() * 700, "leafs", index % 4);
            leaf.setCollideWorldBounds(true);
            leaf.setDrag(100, 100);
            leaf.setFriction(1000, 1000);
            leaf.setMass(0.01);
            leaf.setBounce(0.5, 0.5);
            leaf.frame
            this.leafs.push(leaf);
        }


        this.man = this.physics.add.sprite(200, 200, 'man');
        this.cameras.main.startFollow(this.man, true);

        const winParticleManager = this.add.particles('particle');
        this.windParticleEmitter = winParticleManager.createEmitter({
            x: 200,
            y: 200,
        });
        this.windParticleEmitter.setFrequency(0);
        this.windParticleEmitter.setBlendMode(Phaser.BlendModes.NORMAL);
        this.windParticleEmitter.acceleration = true;

        this.add.image(0, 0, 'foreground').setScale(1, 1).setOrigin(0, 0);
    }

    public update(): void {
        // Every frame, we create a new velocity for the sprite based on what keys the player is holding down.
    


        // Phaser.Math.Angle.WrapDegrees(this.man.rotation);
        let manAngle = this.man.rotation;
        let push = new Phaser.Math.Vector2(100, 0);
        push.setAngle(manAngle);
        
        // this.windParticleEmitter.active = false;
        this.windParticleEmitter.on = false;

        this.man.setVelocity(0);
        // this.windParticleEmitter.setSpeedY(0);
        this.windParticleEmitter.setPosition(this.man.x, this.man.y);


        for (let leaf of this.leafs) {
            leaf.setAcceleration(0, 0);
        }

        if (this.cursorKeys.left.isDown) {
            if (this.cursorKeys.shift.isDown) {

            } 
            else {
                manAngle -= 0.05;            
            }
        }
        if (this.cursorKeys.right.isDown) {
            if (this.cursorKeys.shift.isDown) {

            } 
            else {
                manAngle += 0.05;
            }
        }
        if (this.cursorKeys.up.isDown) {            
            this.man.setVelocity(push.x, push.y);
        }
        if (this.cursorKeys.down.isDown) {
            this.man.setVelocity(-push.x, -push.y);
        }
        if (this.cursorKeys.space.isDown) {
            for (let leaf of this.leafs) {
                const leafAngle = Phaser.Math.Angle.Between(this.man.x, this.man.y, leaf.x, leaf.y);
                if (leafAngle > manAngle - 0.4 && leafAngle < manAngle + 0.4) {
                    const leafDistance = Phaser.Math.Distance.Between(this.man.x, this.man.y, leaf.x, leaf.y);
                    const lefDistanceFactor = leafDistance / 50 + 1.0;
                    const ref = Math.random() / (lefDistanceFactor * lefDistanceFactor * leafDistance) * 2000;
                    // leaf.setAcceleration(ref * push.x, ref * push.y);
                    // leaf.setAcceleration(ref * (leaf.x - this.man.x), ref * (leaf.y - this.man.y));
                    leaf.setVelocity(ref * (leaf.x - this.man.x), ref * (leaf.y - this.man.y));
                }
            }

            this.windParticleEmitter.on = true;
            const particleAngle = manAngle / Math.PI * 180.0;
            this.windParticleEmitter.setAngle({min: particleAngle - 10, max: particleAngle + 10});
            this.windParticleEmitter.setSpeed({min: 100, max: 500});
        }

        this.man.setRotation(Phaser.Math.Angle.Wrap(manAngle));
        // this.man.rotation = Phaser.Math.Angle.Wrap(manAngle);

        this.windParticleEmitter.forEachAlive((particle, particleEmitter) => {
            if (particle.x < 0) {
                particle.velocityX = -particle.velocityX;
            }
            if (particle.y < 0) {
                particle.velocityY = -particle.velocityY;
            }
        }, null);

    }
    

    
}  



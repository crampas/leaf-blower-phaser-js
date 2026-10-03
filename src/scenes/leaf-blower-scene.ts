import * as Phaser from 'phaser';
import { RoadSweeper } from './road-sweeper';
import { LeafBlower } from './leaf-blower';
import { Weather } from './weather';


const leafCount = 5000;


const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'LeafBlowerScene',
};

export class LeafBlowerScene extends Phaser.Scene {

    private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
    private obstacles: Phaser.Physics.Arcade.StaticGroup;

    private leafs: Phaser.Physics.Arcade.Sprite[] = [];
    private text: Phaser.GameObjects.Text;
    private sweeperText: Phaser.GameObjects.Text;

    private playerAh: Phaser.Sound.BaseSound;

    private energy: number = 300;

    private sweeper: RoadSweeper;
    private leafBlower: LeafBlower;
    private weather: Weather;


    constructor() {
        super(sceneConfig);
    }

    public init(): void {
        this.energy = 300;
        this.leafs = [];
        this.sweeper = new RoadSweeper(this, this.leafs);
        this.leafBlower = new LeafBlower(this, this.leafs);
        this.weather = new Weather(this, this.leafs);
    }

    public preload(): void {
        const fontSize = Math.min(this.game.canvas.width, 1024) / 32;
        this.text = this.add.text(fontSize, fontSize, 'Starting...')
                .setFontSize(fontSize).setDepth(100).setScrollFactor(0);
        
        this.load.image('background', 'assets/tiles/garden/garden-01-background.png');
        this.load.image('foreground', 'assets/tiles/garden/garden-01-foreground.png');
        this.load.spritesheet('leafs', 'assets/sprites/leaf-4.png', { frameWidth: 32, frameHeight: 32 });

        this.sweeper.preload();
        this.leafBlower.preload();
        this.weather.preload();
    }

    public create(): void {
        console.log('LeafBlowerScene create');

        this.cursorKeys = this.input.keyboard.createCursorKeys();

        this.playerAh = this.sound.add('playerAh');

        this.scale.on('resize', () => {
            this.cameras.main.x = Math.max((this.game.canvas.width - 1024) / 2, 0);
            this.cameras.main.y = Math.max((this.game.canvas.height - 1024) / 2, 0);
            this.cameras.main.setSize(this.game.canvas.width, this.game.canvas.height);
            this.cameras.main.scrollX = this.leafBlower.sprite.x - 1024 / 2;
            this.cameras.main.scrollY = this.leafBlower.sprite.y - 1024 / 2;
        });

        this.physics.world.setBounds(0, 0, 1024, 1024);
        this.cameras.main.setBounds(0, 0, 1024, 1024);
        this.cameras.main.x = Math.max((this.game.canvas.width - 1024) / 2, 0);
        this.cameras.main.y = Math.max((this.game.canvas.height - 1024) / 2, 0);

        this.add.image(0, 0, 'background').setScale(1, 1).setOrigin(0, 0);

        for (let index = 0; index < leafCount; index++) {
            const leaf = this.physics.add.sprite(Math.random() * 1024, Math.random() * 1024, "leafs", index % 4);
            leaf.setCollideWorldBounds(false);
            leaf.setDrag(100, 100);
            leaf.setFriction(1000, 1000);
            leaf.setMass(0.01);
            leaf.setBounce(0.5, 0.5);
            leaf.setRotation(Math.random() * Math.PI);
            this.leafs.push(leaf);
        }

        this.leafBlower.create();
        this.leafBlower.setVisible(true);
        this.cameras.main.startFollow(this.leafBlower.sprite, true);

        this.obstacles = this.physics.add.staticGroup();
        const obstacle1 = this.add.zone(432, 208, 32, 32);
        // this.add.rectangle(432, 208, 32, 32, 0x80ffffff);
        this.obstacles.add(obstacle1);        
        this.physics.add.collider(this.leafBlower.sprite, this.obstacles);

        this.sweeper.player = this.leafBlower.sprite;
        this.sweeper.create();

        this.leafBlower.onCollideWith(this.sweeper.sprite, () => {
            this.leafBlower.sprite.setPosition(this.leafBlower.sprite.x + 40, this.leafBlower.sprite.y);
            this.playerAh.play();
            this.sweeperText.setPosition(this.sweeper.sprite.x, this.sweeper.sprite.y);
            this.sweeperText.setVisible(true);
            this.time.addEvent({delay: 3000}).callback = () => {
                this.sweeperText.setVisible(false);
            };
        });

        this.add.image(0, 0, 'foreground').setScale(1, 1).setOrigin(0, 0);

        const fontSize = Math.min(this.game.canvas.width, 1024) / 32;
        this.sweeperText = this.add.text(0, 0, '').setFontSize(fontSize)
                .setFontSize(fontSize).setFontStyle('bold').setDepth(100);
        this.sweeperText.setVisible(false);
        this.sweeperText.setText('Pass doch auf ...');

        this.weather.create();
    }

    public update(): void {
        let playerNewRotation = 0;
        let playerNewVelocity = new Phaser.Math.Vector2(0, 0);

        if (this.cursorKeys.left.isDown) {
            if (this.cursorKeys.shift.isDown) {
                playerNewVelocity.y = -100;
            }
            else {
                playerNewRotation = -0.05;
            }
        }
        if (this.cursorKeys.right.isDown) {
            if (this.cursorKeys.shift.isDown) {
                playerNewVelocity.y = 100;
            }
            else {
                playerNewRotation = 0.05;
            }
        }
        if (this.cursorKeys.up.isDown) {
            playerNewVelocity.x = 100;
        } 
        if (this.cursorKeys.down.isDown) {
            playerNewVelocity.x = -100;
        }

        this.leafBlower.move(playerNewVelocity, playerNewRotation);

        this.leafBlower.isBlowing = false;
        if (this.cursorKeys.space.isDown && this.energy > 0) {
            this.energy--;
            this.leafBlower.isBlowing = true;
        }


        this.leafBlower.update();
        this.sweeper.update();
        this.weather.update();

        this.text.setText([
            'Leafs: ' + this.sweeper.collectedLeafs.toString(),
            'Energy:' + this.energy,
            // `Angle: ${pointerAngle}`,
            // `Player: ${playerNewVelocity.x}, ${playerNewVelocity.y}`,
            // `Pointer: ${this.input.activePointer.worldX}, ${this.input.activePointer.worldY}`,
            // `Diff: ${pointerDiff}`,
            // `Camera: ${this.cameras.main.scrollX}, ${this.cameras.main.scrollY}`,
        ]);

        const lakePosition = new Phaser.Math.Vector2(200, 200);
        this.leafs.forEach(leaf => {
            if (leaf.scale > 1.0) {
                leaf.setScale((leaf.scale - 1.0) * 0.99 + 1.0);
            }
            leaf.x = leaf.x > 1024 ? 0 : leaf.x;
            leaf.x = leaf.x < 0 ? 1024 : leaf.x;
            leaf.y = leaf.y > 1024 ? 0 : leaf.y;
            leaf.y = leaf.y < 0 ? 1024 : leaf.y;

            const leafPosition = new Phaser.Math.Vector2(leaf.x, leaf.y);
            if (Phaser.Math.Distance.BetweenPoints(leafPosition, lakePosition) < 100) {
                leaf.setVisible(false);
            }
        });

        if (this.energy <= 0) {
            this.sweeperText.setText('Strom ist aus ...  Feierabend!');
            this.sweeperText.setPosition(this.leafBlower.sprite.x - this.sweeperText.width / 2, 
                    this.leafBlower.sprite.y - (this.sweeperText.height * 2));
            this.sweeperText.setVisible(true);
            
            this.time.delayedCall(5000, () => {
                this.game.sound.stopAll();
                this.scene.start('Intro');
            });
        }
    }

}



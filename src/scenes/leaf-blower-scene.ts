import * as Phaser from 'phaser';
import { LeafBlower } from './leaf-blower';
import { RoadSweeper } from './road-sweeper';
import { Vector } from 'matter';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'LeafBlowerScene',
};

export class LeafBlowerScene extends Phaser.Scene {

    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private player: Phaser.Physics.Arcade.Sprite;
    private obstacles: Phaser.Physics.Arcade.StaticGroup;

    private leafs: Phaser.Physics.Arcade.Sprite[] = [];
    private text: Phaser.GameObjects.Text;
    private sweeperText: Phaser.GameObjects.Text;

    private playerAh: Phaser.Sound.BaseSound;

    private energy: number = 3000;

    private blower: LeafBlower;
    private sweeper: RoadSweeper;


    constructor() {
        super(sceneConfig);

        this.blower = new LeafBlower(this, this.leafs);
        this.sweeper = new RoadSweeper(this, this.leafs);
    }

    public preload(): void {
        const fontSize = Math.min(this.game.canvas.width, 1024) / 32;
        this.text = this.add.text(fontSize, fontSize, 'Starting...').setFontSize(fontSize).setDepth(100).setScrollFactor(0);
        this.sweeperText = this.add.text(0, 0, '').setFontSize(fontSize).setDepth(100);

        this.load.image('player', 'assets/sprites/player.png');
        this.load.image('leaf', 'assets/sprites/leaf-4.png');
        this.load.image('background', 'assets/tiles/garden/garden-01-background.png');
        this.load.image('foreground', 'assets/tiles/garden/garden-01-foreground.png');

        this.load.spritesheet('leafs', 'assets/sprites/leaf-4.png', { frameWidth: 32, frameHeight: 32 });

        this.load.audio('playerAh', 'assets/audio/player-ah.mp3');

        this.blower.preload();
        this.sweeper.preload();
    }

    public create(): void {

        this.cursorKeys = this.input.keyboard.createCursorKeys();

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


        this.player = this.physics.add.sprite(450, 400, 'player');
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player, true);

        this.obstacles = this.physics.add.staticGroup();
        const obstacle1 = this.add.zone(432, 208, 32, 32);
        // this.add.rectangle(432, 208, 32, 32, 0x80ffffff);
        this.obstacles.add(obstacle1);
        this.physics.add.collider(this.player, this.obstacles);

        this.blower.player = this.player;
        this.blower.create();

        this.sweeper.player = this.player;
        this.sweeper.create();
        this.sweeper.onCollidePlayer = () => {
            this.player.setPosition(this.player.x + 40, this.player.y);
            this.playerAh.play();
            this.sweeperText.setPosition(this.sweeper.sweeper.x, this.sweeper.sweeper.y);
            this.sweeperText.setVisible(true);
            this.time.addEvent({delay: 3000}).callback = () => {
                this.sweeperText.setVisible(false);
            };
        }

        this.add.image(0, 0, 'foreground').setScale(1, 1).setOrigin(0, 0);

        this.sweeperText.setVisible(false);
        this.sweeperText.setText('Pass doch auf du Depp ...');

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

        playerNewVelocity.rotate(this.player.rotation);
        this.player.setVelocity(playerNewVelocity.x, playerNewVelocity.y);    
        this.player.setRotation(Phaser.Math.Angle.Wrap(this.player.rotation + playerNewRotation));

        this.blower.isBlowing = false;
        if (this.cursorKeys.space.isDown && this.energy > 0) {
            this.energy--;
            this.blower.isBlowing = true;
        }



        this.blower.update();
        this.sweeper.update();

        this.text.setText([
            'Leafs: ' + this.sweeper.collectedLeafs.toString(),
            'Energy:' + this.energy,
            // `Angle: ${pointerAngle}`,
            // `Player: ${playerNewVelocity.x}, ${playerNewVelocity.y}`,
            // `Pointer: ${this.input.activePointer.worldX}, ${this.input.activePointer.worldY}`,
            // `Diff: ${pointerDiff}`,
            // `Camera: ${this.cameras.main.scrollX}, ${this.cameras.main.scrollY}`,
        ]);

    }


}



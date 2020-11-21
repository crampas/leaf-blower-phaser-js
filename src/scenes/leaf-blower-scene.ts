import * as Phaser from 'phaser';
import { RoadSweeper } from './road-sweeper';
import { LeafBlower } from './leaf-blower';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'LeafBlowerScene',
};

export class LeafBlowerScene extends Phaser.Scene {

    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private obstacles: Phaser.Physics.Arcade.StaticGroup;

    private leafs: Phaser.Physics.Arcade.Sprite[] = [];
    private text: Phaser.GameObjects.Text;
    private sweeperText: Phaser.GameObjects.Text;

    private playerAh: Phaser.Sound.BaseSound;

    private energy: number = 3000;

    private sweeper: RoadSweeper;
    private leafBlower: LeafBlower;


    constructor() {
        super(sceneConfig);

        this.sweeper = new RoadSweeper(this, this.leafs);
        this.leafBlower = new LeafBlower(this, this.leafs);
    }

    public preload(): void {
        const fontSize = Math.min(this.game.canvas.width, 1024) / 32;
        this.text = this.add.text(fontSize, fontSize, 'Starting...').setFontSize(fontSize).setDepth(100).setScrollFactor(0);
        this.sweeperText = this.add.text(0, 0, '').setFontSize(fontSize).setDepth(100);

        this.load.image('leaf', 'assets/sprites/leaf-4.png');
        this.load.image('background', 'assets/tiles/garden/garden-01-background.png');
        this.load.image('foreground', 'assets/tiles/garden/garden-01-foreground.png');

        this.load.spritesheet('leafs', 'assets/sprites/leaf-4.png', { frameWidth: 32, frameHeight: 32 });


        this.sweeper.preload();
        this.leafBlower.preload();
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

        this.leafBlower.create();
        this.cameras.main.startFollow(this.leafBlower.player, true);

        this.obstacles = this.physics.add.staticGroup();
        const obstacle1 = this.add.zone(432, 208, 32, 32);
        // this.add.rectangle(432, 208, 32, 32, 0x80ffffff);
        this.obstacles.add(obstacle1);
        this.physics.add.collider(this.leafBlower.player, this.obstacles);


        this.sweeper.player = this.leafBlower.player;
        this.sweeper.create();
        this.sweeper.onCollidePlayer = () => {
            this.leafBlower.player.setPosition(this.leafBlower.player.x + 40, this.leafBlower.player.y);
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

        this.leafBlower.move(playerNewVelocity, playerNewRotation);

        this.leafBlower.isBlowing = false;
        if (this.cursorKeys.space.isDown && this.energy > 0) {
            this.energy--;
            this.leafBlower.isBlowing = true;
        }


        this.leafBlower.update();
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



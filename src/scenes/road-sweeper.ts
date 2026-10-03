


export class RoadSweeper {
    private sweeperSlurp!: Phaser.Sound.WebAudioSound;
    private sweeperEngine!: Phaser.Sound.WebAudioSound;

    public collectedLeafs: number = 0;

    public sprite!: Phaser.Physics.Arcade.Sprite;
    public player!: Phaser.Physics.Arcade.Sprite;

    public constructor(public scene: Phaser.Scene, public leafs: Phaser.Physics.Arcade.Sprite[]) {
    }

    public preload(): void {
        this.scene.load.image('sweeper', 'assets/sprites/sweeper.png');
        this.scene.load.audio('slurp', 'assets/audio/squit.wav');
        this.scene.load.audio('sweeper-engine', 'assets/audio/diesel-loop.mp3');
    }

    public create(): void {
        this.sprite = this.scene.physics.add.sprite(370, 0, 'sweeper');

        this.sweeperSlurp = this.scene.sound.add('slurp', {volume: 0.5}) as Phaser.Sound.WebAudioSound;
        this.sweeperEngine = this.scene.sound.add('sweeper-engine', {loop: true}) as Phaser.Sound.WebAudioSound;

        this.stop();
    }

    private start() {
        console.log('RoadSweeper start');
        this.sprite.setVisible(true);
        this.sprite.y = 0;
        this.sweeperEngine.play();
        this.sprite.setVelocityY(130);
    }

    private stop() {
        this.sprite.setVisible(false);
        this.sprite.y = -500;
        this.sprite.setVelocityY(0);
        this.sweeperEngine.stop();
        this.scene.time.delayedCall(Phaser.Math.Between(5000, 15000), () => this.start());
    }


    public update(): void {
        if (this.sprite.y > 2000) {
            this.stop()
        }

        const playerSweeperDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.sprite.x, this.sprite.y);
        this.sweeperEngine.setVolume(1 / playerSweeperDistance * 100);

        for (let leaf of this.leafs) {
            if (!leaf.visible) {
                continue;
            }
            const sweeperDistance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, leaf.x, leaf.y);
            if (sweeperDistance < 40) {
                this.grapLeaf(leaf);
            }
        }
    }

    private grapLeaf(leaf: Phaser.Physics.Arcade.Sprite) {
        leaf.setVisible(false);
        this.sweeperSlurp.play();
        this.collectedLeafs++;
        if (Phaser.Math.FloatBetween(0, 1) > 0.8) {
            this.ejectLeaf(leaf);
        }
    }

    private ejectLeaf(leaf: Phaser.Physics.Arcade.Sprite) {
        leaf.setPosition(this.sprite.x, this.sprite.y - 50);
        const angle = Phaser.Math.FloatBetween(20, 150);
        const velocity = this.scene.physics.velocityFromAngle(angle, Phaser.Math.Between(100, 300));
        leaf.setVelocity(velocity.x, velocity.y);
        // leaf.setPosition(Math.random() * this.scene.game.canvas.width, 
        //         Math.random() * this.scene.game.canvas.height);           
        leaf.setScale(Phaser.Math.FloatBetween(1, 1.5));
        leaf.setVisible(true);
    }
}




export class RoadSweeper {

    private sweeperSlurp: Phaser.Sound.WebAudioSound;
    private sweeperEngine: Phaser.Sound.WebAudioSound;

    public collectedLeafs: number = 0;

    public sprite: Phaser.Physics.Arcade.Sprite;
    public player: Phaser.Physics.Arcade.Sprite;

    public constructor(public scene: Phaser.Scene, public leafs: Phaser.Physics.Arcade.Sprite[]) {
    }

    public preload(): void {
        this.scene.load.image('sweeper', 'assets/sprites/sweeper.png');
        this.scene.load.audio('slurp', 'assets/audio/squit.wav');
        this.scene.load.audio('sweeper-engine', 'assets/audio/diesel-loop.mp3');
    }

    public create(): void {
        this.sprite = this.scene.physics.add.sprite(370, 2000, 'sweeper');
        this.sprite.setVelocityY(130);

        this.sweeperSlurp = this.scene.sound.add('slurp') as Phaser.Sound.WebAudioSound;
        this.sweeperEngine = this.scene.sound.add('sweeper-engine', {loop: true}) as Phaser.Sound.WebAudioSound;
    }

    public update(): void {

        if (this.sprite.y > 1050) {
            this.sprite.y = 0;
            this.sweeperEngine.play();
        }
        const playerSweeperDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.sprite.x, this.sprite.y);
        this.sweeperEngine.setVolume(1 / playerSweeperDistance * 100);

        for (let leaf of this.leafs) {
            if (!leaf.visible) {
                continue;
            }
            const sweeperDistance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, leaf.x, leaf.y);
            if (sweeperDistance < 40) {
                leaf.setVisible(false);
                this.sweeperSlurp.play();
                this.collectedLeafs++;
            }
        }

    }

}

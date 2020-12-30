import { LeafBlowerJet } from "./leaf-blower-jet";



export class LeafBlower {

    public sprite: Phaser.Physics.Arcade.Sprite;
    private leafBlowerJet: LeafBlowerJet;
    public isBlowing: boolean = false;

    public constructor(public scene: Phaser.Scene, public leafs: Phaser.Physics.Arcade.Sprite[]) {
        this.leafBlowerJet = new LeafBlowerJet(scene, this.leafs);
    }

    public preload(): void {
        this.scene.load.image('player', 'assets/sprites/player.png');
        this.scene.load.audio('playerAh', 'assets/audio/player-ah.mp3');
        this.leafBlowerJet.preload();
    }

    public create(): void {
        this.sprite = this.scene.physics.add.sprite(450, 400, 'player');
        this.sprite.setCollideWorldBounds(true);

        this.leafBlowerJet.player = this.sprite;
        this.leafBlowerJet.create();
    }

    public update(): void {
        this.leafBlowerJet.isBlowing = this.isBlowing;
        this.leafBlowerJet.update();        
    }

    public move(playerNewVelocity: Phaser.Math.Vector2, playerNewRotation: number) {
        playerNewVelocity.rotate(this.sprite.rotation);
        this.sprite.setVelocity(playerNewVelocity.x, playerNewVelocity.y);    
        this.sprite.setRotation(Phaser.Math.Angle.Wrap(this.sprite.rotation + playerNewRotation));
    }

    public onCollideWith(sprite: Phaser.Physics.Arcade.Sprite, handler: () => void) {
        this.scene.physics.add.overlap(this.sprite, sprite,  handler);
    }

}


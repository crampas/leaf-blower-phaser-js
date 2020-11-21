import { LeafBlowerJet } from "./leaf-blower-jet";



export class LeafBlower {

    public player: Phaser.Physics.Arcade.Sprite;
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
        this.player = this.scene.physics.add.sprite(450, 400, 'player');
        this.player.setCollideWorldBounds(true);

        this.leafBlowerJet.player = this.player;
        this.leafBlowerJet.create();
    }

    public update(): void {
        this.leafBlowerJet.isBlowing = this.isBlowing;
        this.leafBlowerJet.update();        
    }

    public move(playerNewVelocity: Phaser.Math.Vector2, playerNewRotation: number) {
        playerNewVelocity.rotate(this.player.rotation);
        this.player.setVelocity(playerNewVelocity.x, playerNewVelocity.y);    
        this.player.setRotation(Phaser.Math.Angle.Wrap(this.player.rotation + playerNewRotation));
    }

}


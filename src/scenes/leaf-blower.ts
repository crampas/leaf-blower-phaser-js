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
        this.sprite = this.scene.physics.add.sprite(450, 100, 'player');
        this.sprite.setVisible(false);
        this.sprite.setCollideWorldBounds(true);

        this.leafBlowerJet.player = this.sprite;
        this.leafBlowerJet.create();
    }

    public setVisibility(visible: boolean) {
        this.sprite.setVisible(visible);
    }

    public update(): void {
        this.leafBlowerJet.isBlowing = this.isBlowing;
        this.leafBlowerJet.update();        
    }

    public move(playerNewVelocity: Phaser.Math.Vector2, playerNewRotation: number) {
        const lakePosition = new Phaser.Math.Vector2(200, 200);
        let handicap = 1;
        if (Phaser.Math.Distance.BetweenPoints(this.sprite, lakePosition) < 100) {
            handicap = 0.3;
        }

        playerNewVelocity.rotate(this.sprite.rotation);
        this.sprite.setVelocity(playerNewVelocity.x * handicap, playerNewVelocity.y * handicap);    
        this.sprite.setRotation(Phaser.Math.Angle.Wrap(this.sprite.rotation + playerNewRotation));
    }

    public onCollideWith(sprite: Phaser.Physics.Arcade.Sprite, handler: () => void) {
        this.scene.physics.add.overlap(this.sprite, sprite,  handler);
    }

}


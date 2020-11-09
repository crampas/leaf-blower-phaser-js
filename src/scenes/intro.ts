import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'Intro',
};
  
export class Intro extends Phaser.Scene {

    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private leafs: Phaser.Physics.Arcade.Sprite[] = [];
    private text: Phaser.GameObjects.Text;

    constructor() {
        super(sceneConfig);
    }

    public preload(): void {

        this.load.image('intro-image', 'assets/leaf-blower-into.jpg');
        this.load.spritesheet('intro-leafs', 'assets/sprites/leaf-4.png', { frameWidth: 32, frameHeight: 32 });
    }

    public create(): void {

        this.cursorKeys = this.input.keyboard.createCursorKeys();

        const image = this.add.image(0, 0, 'intro-image').setOrigin(0, 0);
        const scaleX = Math.min(this.game.canvas.width, 1024) / image.width;
        image.setScale(scaleX);
        const offsetX = (this.game.canvas.width - image.width * scaleX) / 2;
        image.setX(offsetX);

        this.text = this.add.text(offsetX + 300, 400, '').setFontSize(48).setFontStyle('bold').setColor('#a01003').setDepth(100).setScrollFactor(0);
        this.text.setText([
            'Ich habe einen Freund',
            'der ist Laubbläser',
            '',
            'Cursor keys to move,',
            ' Space to blow',
            'Press Space to start'
        ]);

        // .setDisplaySize(1024, 1024).setOrigin(0, 0);

        this.time.addEvent({delay: 100, loop: true}).callback = () => {
            if (this.leafs.length > 5000) {
                return;
            }
            const leaf = this.physics.add.sprite(Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height, 
                "intro-leafs", Math.floor(Math.random() * 5.0));
            leaf.setCollideWorldBounds(true);
            leaf.setDrag(100, 100);
            leaf.setFriction(1000, 1000);
            leaf.setMass(0.01);
            leaf.setBounce(0.5, 0.5);
            leaf.setRotation(Math.random() * Math.PI);
            this.leafs.push(leaf);
        };

    }


    public update(): void {
        if (this.cursorKeys.space.isDown) {
            this.scene.start('LeafBlowerGarden');            
        }
    }
    
}  



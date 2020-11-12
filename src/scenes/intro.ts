import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'Intro'
};



class FlowPart {

    public repeatCallback: (time: number, index: number) => void;

    public constructor(public name: string, public duration: number, public next: string) {
        
    }

    public repeat(callback: (time: number, index: number) => void): FlowPart {
        this.repeatCallback = callback;
        return this;
    }

}

class Flow {
    private parts: FlowPart[] = [];
    private currentPart: FlowPart = null;
    private currentStart: number = 0;
    private currentIndex: number = 0;
    private currentDuration: number = 0;

    public add(part: FlowPart) {
        this.parts.push(part);
    }

    public createPart(name: string, duration: number, next: string): FlowPart {
        const part = new FlowPart(name, duration, next);
        this.parts.push(part);
        return part;
    }

    public step(time: number) {
        if (this.currentPart === null) {
            this.currentPart = this.parts[0];
            this.currentStart = time;
            this.currentIndex = 0;
        } 
        else {
            const currentDuration = time - this.currentStart;
            if (currentDuration > this.currentPart.duration) {
                this.currentPart = this.parts.find(part => part.name == this.currentPart.next);
                this.currentStart = time;
                this.currentIndex = 0;
            }
        }
        this.currentPart.repeatCallback(time - this.currentStart, this.currentIndex);
        this.currentIndex++;
    }
}

export class Intro extends Phaser.Scene {

    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private leafs: Phaser.Physics.Arcade.Sprite[] = [];
    private text: Phaser.GameObjects.Text;

    private workflow: Flow = new Flow();

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


        this.workflow.createPart('create', 10000, 'move').repeat(() => {
            const leaf = this.physics.add.sprite(Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height, 
                "intro-leafs", Math.floor(Math.random() * 5.0));
            leaf.setMass(0.01);
            leaf.setDrag(10, 10);
            leaf.setBounce(0.5, 0.5);
            leaf.setRotation(Math.random() * Math.PI);
            this.leafs.push(leaf);
        });
        this.workflow.createPart('return', 10000, 'move').repeat((time, index) => {
            if (index < this.leafs.length) {
                const leaf = this.leafs[index];
                leaf.setVelocity(0, 0);
                if (leaf.x < 0 || leaf.x > this.game.canvas.width || 
                    leaf.y < 0 || leaf.y > this.game.canvas.height) {
                    leaf.setPosition(Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height);           
                }
            }
        });        
        this.workflow.createPart('move', -1, 'wait').repeat(() => {
            this.cameras.main.shake(500);
            this.leafs.forEach(leaf => {
                leaf.setVelocity(Math.random() * 800 - 400, Math.random() * 800 - 400);
            });
        });        
        this.workflow.createPart('wait', 5000, 'return').repeat(() => {
        });        
        


    }

    public update(): void {

        this.workflow.step(this.time.now);

        if (this.cursorKeys.up.isDown) {
            this.cameras.main.shake(1000);
            const leaf = this.leafs.pop();
        }
        if (this.cursorKeys.space.isDown) {
            this.scene.start('LeafBlowerGarden');            
        }
    }
    
}  



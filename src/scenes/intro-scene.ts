import * as Phaser from 'phaser';
import { LeafBlower } from './leaf-blower';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'Intro'
};



class FlowPart {

    public startCallback: (time: number, index: number) => void;
    public repeatCallback: (time: number, index: number) => string | void;
    public endCallback: (time: number, index: number) => void;

    public constructor(public name: string, public duration: number, public next: string) {
        
    }

    public start(callback: (time: number, index: number) => void): FlowPart {
        this.startCallback = callback;
        return this;
    }
    public repeat(callback: (time: number, index: number) => string | void): FlowPart {
        this.repeatCallback = callback;
        return this;
    }
    public end(callback: (time: number, index: number) => void): FlowPart {
        this.endCallback = callback;
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
                if (!!this.currentPart.endCallback) {
                    this.currentPart.endCallback(time - this.currentStart, this.currentIndex);
                }
                this.currentPart = this.parts.find(part => part.name == this.currentPart.next);
                this.currentStart = time;
                this.currentIndex = 0;
            }
        }
        if (this.currentIndex == 0 && !!this.currentPart.startCallback) {
            this.currentPart.startCallback(time - this.currentStart, this.currentIndex);
        }
        const result = this.currentPart.repeatCallback(time - this.currentStart, this.currentIndex);
        this.currentIndex++;
        if (!!result) {
            this.currentPart.endCallback(time - this.currentStart, this.currentIndex);
            this.currentPart = this.parts.find(part => part.name == result);
            this.currentStart = time;
            this.currentIndex = 0;
        }
    }
}

export class IntroScene extends Phaser.Scene {

    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private leafs: Phaser.Physics.Arcade.Sprite[] = [];
    private text: Phaser.GameObjects.Text;
    
    private leafBlowerList: LeafBlower[] = [];

    private workflow: Flow = new Flow();

    constructor() {
        super(sceneConfig);
    }

    public preload(): void {
        this.load.image('intro-image', 'assets/leaf-blower-into.jpg');
        this.load.spritesheet('intro-leafs', 'assets/sprites/leaf-4.png', { frameWidth: 32, frameHeight: 32 });

        for (let i = 0; i < 10; i++) {
            const blower = new LeafBlower(this, this.leafs);
            blower.preload();
            this.leafBlowerList.push(blower);
        }
    }

    public create(): void {
        this.cursorKeys = this.input.keyboard.createCursorKeys();

        const image = this.add.image(0, 0, 'intro-image').setOrigin(0, 0);

        const scale = Math.max(this.game.canvas.width / image.width, this.game.canvas.height / image.height);
        image.setScale(scale);

        const fontSize = this.game.canvas.width / 32;
        this.text = this.add.text(0, 0, '').setFontSize(fontSize).setFontStyle('bold').setDepth(100).setScrollFactor(0);
        this.text.setText([
            'Ich habe einen Freund',
            'der ist Laubbläser',
            '',
            'Cursor keys to move,',
            ' Space to blow',
            'Press Space to start'
        ]);
        this.text.setFill('#a01003');
        this.text.setStroke('#ffffff', 4);
        this.text.x = this.game.canvas.width - this.text.width - fontSize; 
        this.text.y = this.game.canvas.height - this.text.height - fontSize; 
        
        this.leafBlowerList.forEach((blower, index) => {
            blower.create();
        });

        this.workflow.createPart('create', 10000, 'blow').repeat(() => {
            const leaf = this.physics.add.sprite(Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height, 
                "intro-leafs", Math.floor(Math.random() * 4));
            leaf.setMass(0.01);
            leaf.setDrag(10, 10);
            leaf.setBounce(0.5, 0.5);
            leaf.setRotation(Math.random() * Math.PI);

            leaf.setScale(Math.random() * 10.0);
            this.leafs.push(leaf);
        });
        this.workflow.createPart('return', 10000, 'blow').repeat((time, index) => {
            if (index < this.leafs.length) {
                const leaf = this.leafs[index];
                leaf.setVelocity(0, 0);
                if (leaf.x < 0 || leaf.x > this.game.canvas.width || 
                    leaf.y < 0 || leaf.y > this.game.canvas.height) {
                    leaf.setPosition(Math.random() * this.game.canvas.width, Math.random() * this.game.canvas.height);           
                    leaf.setScale(Math.random() * 10.0);
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
        this.workflow.createPart('blow', 60000, 'return').start(() => {
            this.leafBlowerList.forEach((blower, index) => {
                blower.sprite.setPosition(-150 + Math.random() * 100, 100 * index + 50);
                blower.sprite.setCollideWorldBounds(false);
                blower.sprite.setVelocityX(60);
                blower.isBlowing = true;
            });
        }).repeat((time, index) => {
            for(let blower of this.leafBlowerList) {
                blower.sprite.rotation = Math.PI / 6 * Math.sin(time / 300 + this.leafBlowerList.indexOf(blower));
                if (blower.sprite.x > this.game.canvas.width + 100) {
                    return "return";
                }
            }
        }).end(() => {
            this.leafBlowerList.forEach(blower => {
                blower.isBlowing = false;
                blower .sprite.setVelocityX(0);
            });
        });        
        


    }


    public update(): void {

        this.leafBlowerList.forEach(blower => blower.update());

        this.workflow.step(this.time.now);

        this.leafs.forEach(leaf => {
            if (leaf.scale > 1.0) {
                leaf.setScale((leaf.scale - 1.0) * 0.99 + 1.0);
            }
        })

        if (this.cursorKeys.space.isDown || this.input.activePointer.isDown) {
            this.game.sound.stopAll();
            this.scene.start('LeafBlowerScene');
        }
    }
    
}  



import * as Phaser from 'phaser';
import { LeafBlowerScene } from './leaf-blower-scene';


export class LeafBlowerJet {

    private blowerSound: Phaser.Sound.WebAudioSound;
    private windParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    public player: Phaser.Physics.Arcade.Sprite;
    public isBlowing: boolean;
    public cleanerVolume: number = 0;

    public static readonly BLOWER_OPENING_ANGLE = 0.2;


    public constructor(public scene: Phaser.Scene, public leafs: Phaser.Physics.Arcade.Sprite[]) {
    }

    public preload(): void {
        this.scene.load.audio('cleaner', 'assets/audio/leaf-blower-loop.mp3');
        this.scene.load.image('particle', 'assets/sprites/air-particle.png');
    }

    public create(): void {
        const winParticleManager = this.scene.add.particles('particle');
        this.windParticleEmitter = winParticleManager.createEmitter({ on: false });
        this.windParticleEmitter.setFrequency(0);
        this.windParticleEmitter.setBlendMode(Phaser.BlendModes.NORMAL);
        this.windParticleEmitter.acceleration = true;

        this.blowerSound = this.scene.sound.add('cleaner', { loop: true }) as Phaser.Sound.WebAudioSound;
        this.blowerSound.play({ volume: 0 });
    }

    public blow(): void {

        // emit air particles
        let push = new Phaser.Math.Vector2(1, 0);
        push.setAngle(this.player.rotation);
        this.windParticleEmitter.setPosition(this.player.x + push.x * 50, this.player.y + push.y * 50);
        this.windParticleEmitter.on = true;
        const particleAngleMin = this.player.rotation - LeafBlowerJet.BLOWER_OPENING_ANGLE;
        const particleAngleMax = this.player.rotation + LeafBlowerJet.BLOWER_OPENING_ANGLE;
        this.windParticleEmitter.setAngle({ min: Phaser.Math.RadToDeg(particleAngleMin), max: Phaser.Math.RadToDeg(particleAngleMax) });
        this.windParticleEmitter.setSpeed({ min: 100, max: 500 });
        this.windParticleEmitter.setScale(0.5);

        // move leafs
        for (let leaf of this.leafs) {
            const leafAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, leaf.x, leaf.y);
            const diffAngle = angleDiff(leafAngle, this.player.rotation);
            if (diffAngle > -LeafBlowerJet.BLOWER_OPENING_ANGLE && diffAngle < LeafBlowerJet.BLOWER_OPENING_ANGLE) {
                const leafDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, leaf.x, leaf.y);
                const lefDistanceFactor = leafDistance / 50 + 1.0;
                const ref = Math.random() / (lefDistanceFactor * lefDistanceFactor * leafDistance) * 2000;
                leaf.setVelocity(Math.min(ref * (leaf.x - this.player.x), 500), Math.min(ref * (leaf.y - this.player.y), 500));
            }
        }
    }


    public update(): void {
        this.windParticleEmitter.on = false;
        if (this.isBlowing) {
            this.switchBlowerSound(true);
            this.blow();
        }
        else {
            this.switchBlowerSound(false);
        }

        this.windParticleEmitter.forEachAlive((particle, particleEmitter) => {
            particle.scaleX = Math.max(particle.lifeT, 0.5);
            particle.scaleY = Math.max(particle.lifeT, 0.5);
        }, null);
    }


    private switchBlowerSound(value: boolean) {
        if (value) {
            this.cleanerVolume = Math.min(this.cleanerVolume + 10, 100);
        }
        else {
            this.cleanerVolume = Math.max(this.cleanerVolume - 3, 0);
        }
        this.blowerSound.setVolume(this.cleanerVolume / 100.0);
        this.blowerSound.setRate(Math.max(this.cleanerVolume / 100.0, 0.1));
    }
}


function angleDiff(angle1: number, angle2: number): number {
    let diff = angle2 - angle1;
    diff = diff < -Math.PI ? diff + Math.PI + Math.PI : diff;
    diff = diff > Math.PI ? diff - Math.PI - Math.PI : diff;
    return diff;
}





export class Weather {
    private windParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    public constructor(public scene: Phaser.Scene, public leafs: Phaser.Physics.Arcade.Sprite[]) {
    }

    public preload(): void {
        this.scene.load.image('wind', 'assets/sprites/air-particle.png');
    }

    public create(): void {
        const particleAngleMin = 0;
        const particleAngleMax = 0;
        const particleAngle = { min: Phaser.Math.RadToDeg(particleAngleMin), max: Phaser.Math.RadToDeg(particleAngleMax) };
        const rect = new Phaser.Geom.Circle(0, 0, 512);
        this.windParticleEmitter = this.scene.add.particles(512, 512, 'wind'
            ,{
                // x: 0,
                // y: { min: 0, max: 1024 },
                lifespan: { min: 100, max: 1000 },
                speed: { min: 100, max: 500 },
                emitting: false,
                // angle: particleAngle,
                angle: 0,
                // rotate: { min: -90, max: 90 },
                scale: 0.4,
                emitZone: { type: 'random', source: rect }
            }
        );

        this.scene.time.delayedCall(2000, () => this.blow());
    }


    public update(): void {
    }

    private blow() {
        const angle = Phaser.Math.Between(0, 360);
        const velocity = this.scene.physics.velocityFromAngle(angle, 100);
        console.log('Weather update', 'blow', angle, velocity);

        this.scene.time.delayedCall(500, () => this.moveLeafs(velocity));
        this.windParticleEmitter.setAngle(angle);
        this.windParticleEmitter.start(0, 3000);
        
        this.scene.time.delayedCall(Phaser.Math.Between(5000, 20000), () => this.blow());
    }

    private moveLeafs(velocity: Phaser.Math.Vector2): void {
        const maxAcceleration = 1.5;
        const minAcceleration = 0.1;
        for (let leaf of this.leafs) {
            leaf.setAcceleration(Phaser.Math.FloatBetween(velocity.x * minAcceleration, velocity.x * maxAcceleration), 
                     Phaser.Math.FloatBetween(velocity.y * minAcceleration, velocity.y * maxAcceleration));
        }
        this.scene.time.delayedCall(Phaser.Math.Between(500, 2000), () => this.stopLeafs());
    }
         
    private stopLeafs(): void {
        for (let leaf of this.leafs) {
            leaf.setAcceleration(0, 0);
        }
    }

}

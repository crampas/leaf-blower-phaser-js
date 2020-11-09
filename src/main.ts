import * as Phaser from 'phaser';
import scenes from './scenes';

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',
 
  type: Phaser.AUTO,
 
  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
 
  scene: scenes,

  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
 
  parent: 'game',
  backgroundColor: '#000000',
};
 
export const game = new Phaser.Game(gameConfig);

window.addEventListener('resize', () => {
  game.scale.refresh();
});

import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

// Phaserのスタートシーン
class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  preload() {
    this.load.setBaseURL('https://labs.phaser.io');
    this.load.image('sky', 'assets/skies/space3.png');
  }

  create() {
    // 背景
    this.add.image(400, 300, 'sky');

    // スタートメッセージ
    this.add.text(400, 300, 'Press SPACE to Start', {
      fontSize: '32px',
      fill: '#fff',
    }).setOrigin(0.5);

    // スペースキーでゲームを開始
    const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.once('down', () => {
      this.scene.start('MainScene');
    });
  }
}

// メインシーン
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('block', 'assets/sprites/block.png');
    this.load.image('player', 'assets/sprites/platform.png');
  }

  create() {
    this.score = 0;

    // スコア表示
    this.scoreText = this.add.text(10, 10, 'Score: 0', {
      fontSize: '24px',
      fill: '#fff',
    });

    // プレイヤー設定
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setScale(1, 0.5); // 横長の形状
    this.player.setCollideWorldBounds(true);

    // ブロックのグループ
    this.blocks = this.physics.add.group();

    // プレイヤーがブロックに触れるとスコア加算
    this.physics.add.overlap(this.player, this.blocks, (player, block) => {
      block.destroy();
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);
    });

    // ブロックを一定間隔で生成
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        const x = Phaser.Math.Between(50, 750);
        const block = this.blocks.create(x, 0, 'block');
        block.setVelocityY(200);
      },
      loop: true,
    });

    // キーボード入力
    this.cursors = this.input.keyboard.createCursorKeys();

    // ゲームオーバーフラグ
    this.isGameOver = false;

    // スペースキーをリスタート用に取得
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update() {
    if (!this.isGameOver) {
      // プレイヤーの移動
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-300);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(300);
      } else {
        this.player.setVelocityX(0);
      }

      // ブロックが画面外に出た場合の処理
      this.blocks.getChildren().forEach((block) => {
        if (block.y > 600) {
          block.destroy();
          this.gameOver();
        }
      });
    } else {
      // ゲームオーバー後、スペースキーでリスタート
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.scene.restart();
      }
    }
  }

  gameOver() {
    this.isGameOver = true;
    //this.scene.pause();
    this.add.text(400, 300, 'Game Over\nPress SPACE to Restart', {
      fontSize: '32px',
      fill: '#ff0000',
      align: 'center',
    }).setOrigin(0.5);

    this.player.destroy();
  }
}

// Reactコンポーネント
const Game = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: [StartScene, MainScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} />;
};

export default Game;

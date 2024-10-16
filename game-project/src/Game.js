import React, { useEffect, useState, useCallback, useRef } from 'react';
import Phaser from 'phaser';
import { useDispatch, useSelector } from 'react-redux';
import { updateScore, resetGame } from './redux/actions';
import './Game.css';
import axios from 'axios';
import Caption from './Caption';
import CaptionSettings from './CaptionSettings';

const Game = () => {
  const dispatch = useDispatch();
  const score = useSelector((state) => state.score);
  const [caption, setCaption] = useState('');
  const [isCaptionVisible, setCaptionVisible] = useState(true);
  const [audioContext, setAudioContext] = useState(null);
  const [hitSound, setHitSound] = useState(null);
  const [warningSound, setWarningSound] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showStartButton, setShowStartButton] = useState(false);
  const gameRef = useRef(null);
  const pipeTimerRef = useRef(null);
  const [userPreferences, setUserPreferences] = useState({
    fontStyle: 'Arial',
    fontSize: '18px',
    fontColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    boxDimensions: { width: 'auto', height: 'auto' },
    position: { top: '20px', left: '50%' },
    captionsEnabled: true,
  });
  const [isSettingsVisible, setSettingsVisible] = useState(true);

  const updateHighScore = useCallback((score) => {
    axios.post('/api/highscore', { score })
      .then(response => console.log(response.data))
      .catch(error => console.error('Error saving high score:', error));
  }, []);

  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);

    const loadSound = (path, setSound) => {
      fetch(path)
        .then((response) => response.arrayBuffer())
        .then((data) => context.decodeAudioData(data))
        .then((buffer) => setSound(buffer))
        .catch((error) => console.error(`Error loading sound from ${path}:`, error));
    };

    loadSound('path/to/hit-sound.mp3', setHitSound);
    loadSound('path/to/warning-sound.mp3', setWarningSound);

    return () => {
      if (context) {
        context.close();
      }
    };
  }, []);

  const playSound = useCallback((buffer) => {
    if (audioContext && buffer) {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
      return source;
    }
  }, [audioContext]);

  const showCaptionWithTiming = useCallback((text, soundType, duration = 2000) => {
    if (gameOver) return;
    
    setCaption(text);
    setCaptionVisible(true);
    speakText(text);

    // Play sound based on the type
    if (soundType === 'hit' && hitSound) {
      playSound(hitSound);
    } else if (soundType === 'warning' && warningSound) {
      playSound(warningSound);
    }

    // Clear the caption after the specified duration
    setTimeout(() => setCaptionVisible(false), duration);
  }, [hitSound, warningSound, playSound, gameOver]);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setShowStartButton(false);

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: {
        preload,
        create,
        update,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    function preload() {
      this.load.image('bird', 'path/to/bird-image.png');
      this.load.image('pipe', 'path/to/pipe-image.png');
    }

    function create() {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x87CEEB);
      graphics.fillRect(0, 0, 800, 600);

      this.bird = this.physics.add.sprite(100, 300, 'bird').setDisplaySize(32, 32);
      this.bird.setCollideWorldBounds(true);

      this.pipes = this.physics.add.group({ immovable: true });
      this.boundaries = this.physics.add.group({ immovable: true });

      createBoundaries.call(this);

      this.score = 0;
      addPipeRow.call(this);

      pipeTimerRef.current = this.time.addEvent({
        delay: 2000,
        callback: addPipeRow,
        callbackScope: this,
        loop: true,
      });

      this.physics.add.collider(this.bird, this.pipes, () => {
        if (!gameOver) {
          endGame.call(this, 'Game Over! You hit a pipe!', 'hit');
        }
      });

      this.physics.add.collider(this.bird, this.boundaries, () => {
        if (!gameOver) {
          endGame.call(this, 'Game Over! You hit the boundary!', 'hit');
        }
      });

      this.cursors = this.input.keyboard.createCursorKeys();
    }

    function createBoundaries() {
      const boundaryThickness = 10;

      const topBoundary = this.boundaries.create(400, boundaryThickness / 2, 'pipe');
      topBoundary.setDisplaySize(800, boundaryThickness);
      topBoundary.visible = false;

      const bottomBoundary = this.boundaries.create(400, 600 - boundaryThickness / 2, 'pipe');
      bottomBoundary.setDisplaySize(800, boundaryThickness);
      bottomBoundary.visible = false;

      const leftBoundary = this.boundaries.create(boundaryThickness / 2, 300, 'pipe');
      leftBoundary.setDisplaySize(boundaryThickness, 600);
      leftBoundary.visible = false;

      const rightBoundary = this.boundaries.create(800 - boundaryThickness / 2, 300, 'pipe');
      rightBoundary.setDisplaySize(boundaryThickness, 600);
      rightBoundary.visible = false;
    }

    function addPipeRow() {
      if (gameOver) return;

      const gap = 180;
      const gapPosition = Phaser.Math.Between(150, 450);
      const topPipeHeight = gapPosition - gap / 2;
      const topPipe = this.pipes.create(800, topPipeHeight, 'pipe');
      topPipe.setDisplaySize(50, topPipeHeight - 50);
      topPipe.body.velocity.x = -200;
      topPipe.scored = false;

      const bottomPipeHeight = 600 - (gapPosition + gap / 2);
      const bottomPipe = this.pipes.create(800, gapPosition + gap / 2, 'pipe');
      bottomPipe.setDisplaySize(50, bottomPipeHeight - 50);
      bottomPipe.body.velocity.x = -200;

      // Show a warning caption as the pipe approaches
      if (!gameOver && userPreferences.captionsEnabled) {
        showCaptionWithTiming('Move up or down!', 'warning', 2000);
      }

      this.time.addEvent({
        delay: 1200,
        callback: () => {
          if (!gameOver && userPreferences.captionsEnabled) {
            showCaptionWithTiming('Escape!', 'warning', 2000);
          }
        },
        callbackScope: this,
        loop: false,
      });
    }

    function update() {
      if (gameOver) return;

      if (this.cursors.up.isDown) {
        this.bird.setVelocityY(-200);
      } else if (this.cursors.down.isDown) {
        this.bird.setVelocityY(200);
      }

      this.pipes.getChildren().forEach((pipe) => {
        if (pipe.x + pipe.width < this.bird.x && !pipe.scored) {
          this.score++;
          pipe.scored = true;
          dispatch(updateScore(this.score));
        }
      });
    }

    const endGame = function (message, soundType) {
      setGameOver(true);
      this.physics.pause();
      if (pipeTimerRef.current) {
        pipeTimerRef.current.remove();
        pipeTimerRef.current = null;
      }
      showCaptionWithTiming(message, soundType);
      updateHighScore(this.score);
    };
  };

  const resetGameHandler = () => {
    setGameOver(false);
    dispatch(resetGame());
    if (gameRef.current) {
      gameRef.current.destroy(true); // Clean up previous game instance
      setShowStartButton(true); // Show start button after resetting
      setGameStarted(false); // Reset game started state
    }
  };

  const handleUpdatePreferences = (newPreferences) => {
    setUserPreferences(newPreferences);
    setShowStartButton(true);
    setSettingsVisible(false);
  };

  return (
    <div>
      {isSettingsVisible && (
        <CaptionSettings
          userPreferences={userPreferences}
          onUpdatePreferences={handleUpdatePreferences}
        />
      )}

      {showStartButton && !gameStarted && (
        <button onClick={startGame}>Start Game</button>
      )}

      {gameOver && (
        <button onClick={resetGameHandler}>Restart Game</button>
      )}

      <div id="game-container"></div>

      {isCaptionVisible && !gameOver && (
        <Caption
          text={caption}
          isCaptionVisible={isCaptionVisible}
          userPreferences={userPreferences}
        />
      )}

      <div className="score-display">Score: {score}</div>
    </div>
  );
};

export default Game;

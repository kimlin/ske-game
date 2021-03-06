import Component from './component';

import coinOne from '../assets/img/game_three/Mynt_1_px.png';
import coinTwo from '../assets/img/game_three/Mynt_2_px.png';
import stolpeEndBunn from '../assets/img/game_three/Stolpe_end_bunn.png';
import stolpeEndTopp from '../assets/img/game_three/Stolpe_end_topp.png';
import stolpeMiddle from '../assets/img/game_three/Stolpe_m.png';

// Declare global constants

// Obstacle
const OBSTACLE_WIDTH = 10; // Default 10
const OBSTACLE_MIN_HEIGHT = 10; // Default 10
const OBSTACLE_MAX_HEIGHT = 450; // Default 450
const OBSTACLE_MIN_GAP = 50; // Default 50
const OBSTACLE_MAX_GAP = 150; // Default 150
const OBSTACLE_MIN_DISTANCE = 140; // Default 140
const OBSTACLE_DISTANCE_VARIETY_FACTOR = 30; // Default 30
const OBSTACLE_END_HEIGHT = 81; // 81
const OBSTACLE_IMG_HEIGHT = 72; // 72
const CANVAS_WIDTH = 1000; // 1000
const GUBBE_SPRITE_WIDTH = 1836; // 1836

// Player Movement
const PLAYER_MOVEMENT_AREA = (GUBBE_SPRITE_WIDTH / 4) - 40; // Default 140
const PLAYER_SPEED = 2; // Default 2

// Money
const MONEY_DROP_INTERVAL = 99; // Default 200
const MONEY_HEIGHT = 10; // Default 10
const MONEY_WIDTH = 10; // Default 10

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GameThree
function updateGameArea(myGameArea, gameElements, prng) {

  let {
    myOpponentDesiredPosition,
    score,
    myMoney,
    myObstacles,
    myBackground,
    myOpponentPiece,
    myScoreBackground,
    myScoreText,
    myGameHelpTextBackground,
    myGameHelpTextLineOne,
    myGameHelpTextLineTwo,
    myGameHelpTextLineThree,
    myGameHelpTextLineFour,
    myGameHelpTextLineFive,
    myGameHelpTextLineSix,
    myGameHelpTextLineSeven,
    myGameHelpTextBackground2,
    myGameHelpTextBackground3,
    myPlayerPiece
  } = gameElements;

  let aboutToCrashWith = null;

  if (myGameArea.frameNo === 0) {
    myGameArea.thiefScore = Math.ceil((parseInt(localStorage.getItem("reactionGameScore")) * 0.25));
    myGameArea.dropScore = Math.ceil(myGameArea.thiefScore / 100);

    if (myGameArea.firstLoop === true){
      score.update(Math.ceil((parseInt(localStorage.getItem("reactionGameScore")) * 0.75)));
      myGameArea.firstLoop = false;
    }
  }

  // Gamepad integration
  if (myGameArea.gamepadConnected === true) {
    // Gamepad støtte om den er koblet til
    let gamepad = navigator.getGamepads()[0];
    let axis1 = gamepad.axes[0];
    let axis2 = gamepad.axes[1];
    myGameArea.keys["ArrowLeft"] = axis1 === -1;
    myGameArea.keys["ArrowRight"] = axis1 === 1;
    myGameArea.keys["ArrowUp"] = axis2 === -1;
    myGameArea.keys["ArrowDown"] = axis2 === 1;
    let button1 = gamepad.buttons[0];
    let button2 = gamepad.buttons[1];
    myGameArea.keys[" "] = button1.value === 1;
    myGameArea.keys["Enter"] = button2.value === 1;

    if (button2.value === 1) {
      document.getElementById("myBtn").click();
    }
  }


  // Avoids opponent collision with obstacles
  const avoidContact = function (obstacle) {
    if (obstacle.direction === 0) {
      myOpponentPiece.speedY = 2;
      myOpponentPiece.speedX = -1;
    } else {
      myOpponentPiece.speedY = -2;
      myOpponentPiece.speedX = -1;
    }
  };
  // Returns opponent to desired position when path is clear
  const returnToDesiredPosition = function () {
    myOpponentPiece.speedY = 0;
    if (myOpponentPiece.x < myOpponentPiece.desiredPosition)
      myOpponentPiece.speedX = 1;
    else myOpponentPiece.speedX = 0;
  };

  // Object avoidance
  for (let i = 0; i < myObstacles.length; i += 1) {

    // Collision between player and obstacle
    if (myPlayerPiece.interactWith(myObstacles[i])) {
      localStorage.setItem("totalScore", score.get());
      myGameArea.options = 3;
      myGameArea.stop();
    }

    // Deletes obstacles not visible on canvas
    if (myObstacles[i].x <= -OBSTACLE_MIN_DISTANCE) {
      myObstacles.splice(i, 1);
    }

    // Opponent object avoidence
    if (myOpponentPiece.interactWith(myObstacles[i])) {
      aboutToCrashWith = myObstacles[i];
      break;
    }
  }
  // Money collection
  for (let i = 0; i < myMoney.length; i += 1) {
    // Collision between player and money
    if (myPlayerPiece.interactWith(myMoney[i])) {
      score.update(myGameArea.dropScore);
      myMoney.splice(i, 1);
      //myOpponentPiece.desiredPosition -= 100;
      break;
    }
  }
  // Player and Opponent collision

  if (myPlayerPiece.interactWith(myOpponentPiece)) {
    score.update(myGameArea.thiefScore);
    myGameArea.options = 2;
  }


  // Controlls how the opponent moves
  if (aboutToCrashWith == null) returnToDesiredPosition();
  else avoidContact(aboutToCrashWith);

  //////////////
  // Pre-game //
  //////////////
  if (myGameArea.options === 0) {
    myBackground.update(myGameArea);
    myGameHelpTextBackground2.update(myGameArea);
    myOpponentPiece.update(myGameArea);
    myPlayerPiece.update(myGameArea);
    myScoreBackground.update(myGameArea);
    myScoreText.text = score.get() + ",- Kr";
    myScoreText.update(myGameArea);
    let x = myGameArea.canvas.width;
    let height;
    let gap;
    height = 125;
    gap = 75;
    if (myGameArea.firstClick === true) {
      let objectTopCount = Math.ceil((height - OBSTACLE_END_HEIGHT) / OBSTACLE_IMG_HEIGHT);
      let firstObjectY = height - OBSTACLE_END_HEIGHT - (OBSTACLE_IMG_HEIGHT * objectTopCount);
      let i;
      for (i = 0; i < objectTopCount; i++) {
        myObstacles.push(new Component(OBSTACLE_WIDTH, OBSTACLE_IMG_HEIGHT, stolpeMiddle, x - 300, firstObjectY + (i * OBSTACLE_IMG_HEIGHT), "image", {direction: 0}));
      }
      myObstacles.push(new Component(OBSTACLE_WIDTH, OBSTACLE_END_HEIGHT, stolpeEndBunn, x - 300, height - OBSTACLE_END_HEIGHT, "image", {direction: 0}));
      myObstacles.push(new Component(OBSTACLE_WIDTH, OBSTACLE_END_HEIGHT, stolpeEndTopp, x - 300, height + gap, "image", {direction: 1}));
      let objectBotCount = Math.ceil((600 - height - gap - OBSTACLE_END_HEIGHT) / OBSTACLE_IMG_HEIGHT);
      for (i = 0; i < objectBotCount; i++) {
        myObstacles.push(new Component(OBSTACLE_WIDTH, OBSTACLE_IMG_HEIGHT, stolpeMiddle, x - 300, height + gap + OBSTACLE_END_HEIGHT + (i * OBSTACLE_IMG_HEIGHT), "image", {direction: 1}));
      }
      myGameArea.firstClick = false;
    }

    for (let i = 0; i < myObstacles.length; i += 1) {
      myObstacles[i].update(myGameArea);
    }
    myGameHelpTextBackground.update(myGameArea);
    if (myGameArea.thiefScore < 0) {
      myGameHelpTextLineOne.text = "Siste nivå: Fingerferdighet";
      myGameHelpTextLineOne.update(myGameArea);
      /*
      myGameHelpTextLineTwo.text = "Følg instruksjonene for å starte spillet";
      myGameHelpTextLineTwo.update(myGameArea);
      */
      myGameHelpTextLineThree.text = "En skattesnyter har stukket av med 25% av gjelda di";
      myGameHelpTextLineThree.update(myGameArea);
      myGameHelpTextLineFour.text = "Ta igjen tyven for å bli en gjeldsslave igjen!";
      myGameHelpTextLineFour.update(myGameArea);

      myGameHelpTextLineFive.text = "Prøv å plukke opp gjelda som tyven mister på veien";
      myGameHelpTextLineFive.update(myGameArea);

/*
      myGameHelpTextLineSeven.text = "Du kan bevege deg på venstre halvdel av spillområdet";
      myGameHelpTextLineSeven.update(myGameArea);
*/
      myGameHelpTextLineSix.text = "Trykk på venstre knapp for å fortsette..";
      myGameHelpTextLineSix.update(myGameArea);
    } else {
      myGameHelpTextLineOne.text = "Siste nivå: Fingerferdighet";
      myGameHelpTextLineOne.update(myGameArea);
      /*
      myGameHelpTextLineTwo.text = "Følg instruksjonene for å starte spillet";
      myGameHelpTextLineTwo.update(myGameArea);
      */
      myGameHelpTextLineThree.text = "En skattesnyter har stukket av med 25% av innholdet i statskassa";
      myGameHelpTextLineThree.update(myGameArea);
      myGameHelpTextLineFour.text = "Bruk joysticken til å ta igjen tyven, men se opp for hinder!";
      myGameHelpTextLineFour.update(myGameArea);

      myGameHelpTextLineFive.text = "Tyven mister deler av pengene mens han flykter,";
      myGameHelpTextLineFive.update(myGameArea);


      myGameHelpTextLineSeven.text = "plukk dem opp for å ikke miste dem for godt";
      myGameHelpTextLineSeven.update(myGameArea);

      myGameHelpTextLineSix.text = "Trykk på venstre knapp for å fortsette..";
      myGameHelpTextLineSix.update(myGameArea);
    }


    if (myGameArea.keys[" "]) {
      myGameArea.options = 1;
    }

    //////////
    // Game //
    //////////
  } else {
    // Next frame
    myGameArea.clear();
    myGameArea.frameNo += 1;

    // Background
    myBackground.speedX = -1;
    myBackground.newPos();
    myBackground.update(myGameArea);
    myGameHelpTextBackground2.update(myGameArea);

    // Spawns obstacles
    if (myGameArea.frameNo === 1 || objectInterval(myGameArea)) {
      let x = myGameArea.canvas.width;
      let height = Math.floor(prng.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT) + OBSTACLE_MIN_HEIGHT);
      let gap = Math.floor(prng.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP + 1) + OBSTACLE_MIN_GAP);
      if (height <= 82) {
        let i;
        myObstacles.push(new Component(OBSTACLE_WIDTH, OBSTACLE_END_HEIGHT, stolpeEndBunn, x, height - OBSTACLE_END_HEIGHT, "image", {direction: 0}));
        myObstacles.push(new Component(OBSTACLE_WIDTH, OBSTACLE_END_HEIGHT, stolpeEndTopp, x, height + gap, "image", {direction: 1}));
        let objectBotCount = Math.ceil((600 - height - gap - OBSTACLE_END_HEIGHT) / OBSTACLE_IMG_HEIGHT);
        for (i = 0; i < objectBotCount; i++) {
          myObstacles.push(new Component(OBSTACLE_WIDTH, OBSTACLE_IMG_HEIGHT, stolpeMiddle, x, height + gap + OBSTACLE_END_HEIGHT + (i * OBSTACLE_IMG_HEIGHT), "image", {direction: 1}));
        }
      } else if ((height + gap) >= 519) {
        let objectCount = Math.ceil((height - OBSTACLE_END_HEIGHT) / OBSTACLE_IMG_HEIGHT);
        let firstObjectY = height - OBSTACLE_END_HEIGHT - (OBSTACLE_IMG_HEIGHT * objectCount);
        let i;
        for (i = 0; i < objectCount; i++) {
          myObstacles.push(new Component(OBSTACLE_WIDTH, OBSTACLE_IMG_HEIGHT, stolpeMiddle, x, firstObjectY + (i * OBSTACLE_IMG_HEIGHT), "image", {direction: 0}));
        }
        myObstacles.push(new Component(OBSTACLE_WIDTH, OBSTACLE_END_HEIGHT, stolpeEndBunn, x, height - OBSTACLE_END_HEIGHT, "image", {direction: 0}));
        myObstacles.push(new Component(OBSTACLE_WIDTH, OBSTACLE_END_HEIGHT, stolpeEndTopp, x, height + gap, "image"));

      } else {

        let objectTopCount = Math.ceil((height - OBSTACLE_END_HEIGHT) / OBSTACLE_IMG_HEIGHT);
        let firstObjectY = height - OBSTACLE_END_HEIGHT - (OBSTACLE_IMG_HEIGHT * objectTopCount);
        let i;
        for (i = 0; i < objectTopCount; i++) {
          myObstacles.push(new Component(OBSTACLE_WIDTH, OBSTACLE_IMG_HEIGHT, stolpeMiddle, x, firstObjectY + (i * OBSTACLE_IMG_HEIGHT), "image", {direction: 0}));
        }
        myObstacles.push(new Component(OBSTACLE_WIDTH, OBSTACLE_END_HEIGHT, stolpeEndBunn, x, height - OBSTACLE_END_HEIGHT, "image", {direction: 0}));
        myObstacles.push(new Component(OBSTACLE_WIDTH, OBSTACLE_END_HEIGHT, stolpeEndTopp, x, height + gap, "image", {direction: 1}));
        let objectBotCount = Math.ceil((600 - height - gap - OBSTACLE_END_HEIGHT) / OBSTACLE_IMG_HEIGHT);
        for (i = 0; i < objectBotCount; i++) {
          myObstacles.push(new Component(OBSTACLE_WIDTH, OBSTACLE_IMG_HEIGHT, stolpeMiddle, x, height + gap + OBSTACLE_END_HEIGHT + (i * OBSTACLE_IMG_HEIGHT), "image", {direction: 1}));
        }
      }
    }
    // Moves obstacles
    for (let i = 0; i < myObstacles.length; i += 1) {
      myObstacles[i].x += -1;
      myObstacles[i].update(myGameArea);
    }


    if (myGameArea.frameNo % 5 === 0) {
      myPlayerPiece.frame = myGameArea.frameNo % 2;
    }

    // Player
    // Movement
    myPlayerPiece.speedX = 0;
    myPlayerPiece.speedY = 0;
    if (myGameArea.keys["ArrowLeft"] && myPlayerPiece.x >= PLAYER_SPEED) {
      myPlayerPiece.speedX = -PLAYER_SPEED;
    }
    if (myGameArea.keys["ArrowRight"] && myPlayerPiece.x <= PLAYER_MOVEMENT_AREA) {
      myPlayerPiece.speedX = PLAYER_SPEED;
    }
    if (myGameArea.keys["ArrowUp"] && myPlayerPiece.y >= PLAYER_SPEED) {
      myPlayerPiece.speedY = -PLAYER_SPEED;
    }
    if (myGameArea.keys["ArrowDown"] && myPlayerPiece.y <= (myGameArea.canvas.height - myPlayerPiece.height - PLAYER_SPEED)) {
      myPlayerPiece.speedY = PLAYER_SPEED;
    }
    myPlayerPiece.newPos();
    myPlayerPiece.update(myGameArea);


    // Draw money
    for (let i = 0; i < myMoney.length; i += 1) {
      myMoney[i].x += -1;
      myMoney[i].update(myGameArea);
    }

    // Opponent
    myOpponentPiece.newPos();
    myOpponentPiece.update(myGameArea);

    // Spawn money
    if (moneyInterval(myGameArea)) {

      myGameArea.thiefScore -= myGameArea.dropScore;
      if (myGameArea.frameNo % 2 === 1) {
        myMoney.push(new Component(MONEY_WIDTH, MONEY_HEIGHT, coinOne, myOpponentPiece.x, myOpponentPiece.y + (myOpponentPiece.height / 2) - (MONEY_HEIGHT / 2), "image"));
      } else {
        myMoney.push(new Component(MONEY_WIDTH, MONEY_HEIGHT, coinTwo, myOpponentPiece.x, myOpponentPiece.y + (myOpponentPiece.height / 2) - (MONEY_HEIGHT / 2), "image"));
      }
    }

    myScoreBackground.update(myGameArea);
    // Score
    myScoreText.text = score.get() + ",- Kr";
    myScoreText.update(myGameArea);

    if (myGameArea.options === 2) {
      localStorage.setItem("totalScore", score.get());
      localStorage.setItem("fangetTyv", 1);
      myGameHelpTextBackground3.update(myGameArea);
      myGameHelpTextLineSeven.text = "Du fanget tyven!";
      myGameHelpTextLineSeven.update(myGameArea);
      myGameHelpTextLineSix.text = "Trykk på høyre knapp for å se resultatet..";
      myGameHelpTextLineSix.update(myGameArea);
      myGameArea.stop();
    }

    if (myGameArea.options === 3) {
      myGameHelpTextBackground3.update(myGameArea);
      myGameHelpTextLineSeven.text = "Du møtte veggen!";
      myGameHelpTextLineSeven.update(myGameArea);
      myGameHelpTextLineSix.text = "Trykk på høyre knapp for å se resultatet..";
      myGameHelpTextLineSix.update(myGameArea);
    }
  }
}


// Decides when a new obstacle is drawn
function objectInterval(myGameArea) {
  return (myGameArea.frameNo / OBSTACLE_MIN_DISTANCE) % 1 === 0;
}

// Decides when oponent drops money
function moneyInterval(myGameArea) {
  return (myGameArea.frameNo / MONEY_DROP_INTERVAL) % 1 === 0;
}


// Give each frame access to prng
function updateGameAreaWithRng(myGameArea, gameElements, prng, gameType) {
  if (gameType === 3) {
    return function () {
      updateGameArea(myGameArea, gameElements, prng)
    }
  } else if (gameType === 1) {
    return function () {
      gameOne(myGameArea, gameElements)
    }
  } else if (gameType === 2) {
    return function () {
      gameTwo(myGameArea, gameElements)
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GameOne
function gameOne(myGameArea, gameElements) {


  let {
    gameOneGubbeSprite,
    gameOneBackground,
    gameOneTextBubble,
    gameOneButtonText,
    gameOneScoreBackground,
    gameOneScoreText,
    gameOneHourglass,
    gameOneCountDownTimer,
    gameOneFace,
    gameOneEasterEgg,
    score,
    gameOneHelpTextBackground,
    gameOneHelpTextLineOne,
    gameOneHelpTextLineTwo,
    gameOneHelpTextLineThree,
    gameOneHelpTextLineFour,
    gameOneHelpTextLineFive,
    gameOneHelpTextLineSix,
    gameOneHelpTextBackground2
  } = gameElements;

  let countDownTimer = Math.abs((myGameArea.countDownTimer - myGameArea.frameNo * 0.015).toFixed(2));

  myGameArea.clear();


  // Gamepad integration
  if (myGameArea.gamepadConnected === true) {
    // Gamepad støtte om den er koblet til
    let gamepad = navigator.getGamepads()[0];
    let button1 = gamepad.buttons[0];
    let button2 = gamepad.buttons[1];
    myGameArea.keys[" "] = button1.value === 1;
    myGameArea.keys["Enter"] = button2.value === 1;

    if (button2.value === 1) {
      document.getElementById("myBtn").click();
    }
  }

  gameOneCountDownTimer.growthW = 0;
  gameOneHourglass.growthH = 0;
  gameOneHourglass.growthW = 0;
  gameOneHourglass.speedX = 0;
  gameOneHourglass.speedY = 0;


  if (myGameArea.keys[" "] && myGameArea.readyToFire === true) {
    if (myGameArea.options === 1) {
      myGameArea.firstClick = false;
      myGameArea.readyToFire = false;
      score.update(123214);
      gameOneGubbeSprite.frame = Math.floor(Math.random() * 2.99);
      myGameArea.counter += 1;
    } else if (myGameArea.options === 0) {
      myGameArea.readyToFire = false;
      myGameArea.options = 1;
    }

  }

  if (!myGameArea.keys[" "]) {
    myGameArea.readyToFire = true;
  }

  if (myGameArea.frameNo % 10 === 0 && myGameArea.firstClick === false) {
    gameOneHourglass.speedX = -0.7;
    gameOneHourglass.speedY = -0.7;
    gameOneHourglass.growthH = 1;
    gameOneHourglass.growthW = 1;
    gameOneCountDownTimer.growthW = 1;
  }

  if (countDownTimer <= 3.00) {
    gameOneCountDownTimer.color = "red";
  }


  // textboble
  if (countDownTimer > 0) {
    switch (myGameArea.counter) {
      case 0:
        gameOneGubbeSprite.frame = 3;
        gameOneButtonText.text = "Trykk på knappen for å starte spillet";
        break;
      case 1:
        gameOneButtonText.text = "Fortsett å trykke!";
        break;
      case 25:
        gameOneButtonText.text = "Smerte er midlertidig, ære varer evig";
        break;
      case 50:
        gameOneButtonText.text = "Sinnet bestemmer hva som er mulig";
        break;
      case 75:
        gameOneButtonText.text = "Dette kan bli rekord!";
        break;
      case 100:
        gameOneButtonText.text = "Jukser du?";
        break;
      case 125:
        gameOneButtonText.text = "MAXIMUM POWER";
        gameOneEasterEgg.speedY = 1;
        break;
    }
  } else {
    gameOneGubbeSprite.frame = 3;
    localStorage.setItem("trykk", myGameArea.counter);
    gameOneButtonText.text = "Du klarte " + myGameArea.counter + " trykk på 10 sekunder";
  }


  if (gameOneEasterEgg.y > 600) {
    gameOneEasterEgg.speedY = 0;
  }


  gameOneEasterEgg.newPos();

  gameOneBackground.update(myGameArea);
  gameOneEasterEgg.update(myGameArea);
  gameOneGubbeSprite.update(myGameArea);

  if (myGameArea.options === 1) {
    gameOneTextBubble.update(myGameArea);
    gameOneButtonText.update(myGameArea);
  }
  gameOneScoreBackground.update(myGameArea);
  gameOneScoreText.text = score.get() + ",- Kr";
  gameOneScoreText.update(myGameArea);


  if (myGameArea.frameNo % 15 === 0) {
    if (gameOneGubbeSprite.frame < 3) {
      gameOneGubbeSprite.frame += 1;
    }
  }


  if (myGameArea.firstClick === false) {
    myGameArea.frameNo += 1;
    if (countDownTimer <= 0) {
      localStorage.setItem("buttonMashScore", score.get());
      gameOneHelpTextBackground2.update(myGameArea);
      gameOneHelpTextLineSix.text = "Trykk på høyre knapp for å gå til neste spill..";
      gameOneHelpTextLineSix.update(myGameArea);
      myGameArea.stop();
    } else {
      gameOneCountDownTimer.newPos();
      gameOneCountDownTimer.text = countDownTimer + "";
      gameOneCountDownTimer.update(myGameArea);

      gameOneHourglass.newPos();
      gameOneHourglass.update(myGameArea);

      if (myGameArea.counter >= 25) {
        gameOneFace.update(myGameArea);
      }
    }
  } else if (myGameArea.options === 1) {
    gameOneCountDownTimer.text = (10).toFixed(2) + "";
    gameOneCountDownTimer.update(myGameArea);
    gameOneHourglass.update(myGameArea);
  }

  if (myGameArea.options === 0) {
    gameOneHelpTextBackground.update(myGameArea);
    gameOneHelpTextLineOne.text = "Nivå 1: Hastighet";
    gameOneHelpTextLineOne.update(myGameArea);
    /*
    gameOneHelpTextLineTwo.text = "Følg instruksjonene for å starte spillet";
    gameOneHelpTextLineTwo.update(myGameArea);
    */
    gameOneHelpTextLineThree.text = "Du må pumpe opp noen penger for å holde liv i velferdsstaten";
    gameOneHelpTextLineThree.update(myGameArea);
    gameOneHelpTextLineFour.text = "Trykk på venstre knapp så mange ganger du klarer i løpet av 10 sekunder";
    gameOneHelpTextLineFour.update(myGameArea);

    /*
    gameOneHelpTextLineFive.text = "Tiden starter fra første trykk etter at denne hjelpeteksten er borte";
    gameOneHelpTextLineFive.update(myGameArea);
    */

    gameOneHelpTextLineSix.text = "Trykk på venstre knapp for å fortsette..";
    gameOneHelpTextLineSix.update(myGameArea);
  }


}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GameTwo
function gameTwo(myGameArea, gameElements) {


  let {
    gameTwoBackground,
    gameTwoGubbeSprite,
    gameTwoTextBubble,
    gameTwoKassaSprite,
    gameTwoScoreBackground,
    gameOneScoreText,
    gameOneButtonText,
    score,
    gameTwoHelpTextBackground,
    gameTwoHelpTextLineOne,
    gameTwoHelpTextBackground2,
    gameTwoHelpTextLineTwo,
    gameTwoHelpTextLineThree,
    gameTwoHelpTextLineFour,
    gameTwoHelpTextLineFive,
    gameTwoHelpTextLineSix,

  } = gameElements;


  myGameArea.clear();

  if (myGameArea.frameNo <= 0) {
    // get score
    score.update(parseInt(localStorage.getItem("buttonMashScore")));
    gameOneButtonText.text = "Trykk på venstre knapp for å starte spillet";
    gameTwoKassaSprite.frame = 3;
    gameTwoGubbeSprite.frame = 0;
    myGameArea.reactTime = Math.round(Math.random() * (6 - 3) + 3);
  }


  // Gamepad integration
  if (myGameArea.gamepadConnected === true) {
    // Gamepad støtte om den er koblet til
    let gamepad = navigator.getGamepads()[0];
    let button1 = gamepad.buttons[0];
    let button2 = gamepad.buttons[1];
    myGameArea.keys[" "] = button1.value === 1;
    myGameArea.keys["Enter"] = button2.value === 1;
    if (button2.value === 1) {
      document.getElementById("myBtn").click();
    }
  }

  if (myGameArea.keys[" "] && myGameArea.readyToFire === true) {
    myGameArea.readyToFire = false;
    myGameArea.firstClick = false;

    if (myGameArea.options === 2) {
      myGameArea.options = 4;
      gameOneButtonText.text = "Du trykket for tidlig og mistet halvparten av pengene";
      gameTwoBackground.color = "#df4661";
      gameTwoGubbeSprite.frame = 1;
      score.update((score.get() / 2) * -1);
      gameTwoKassaSprite.frame = 3;
      localStorage.setItem("reactionGameScore", score.get());
      myGameArea.stop();
    } else if (myGameArea.options === 1) {
      gameOneButtonText.text = "Spillet er i gang, vent på signal..";
      myGameArea.options = 2;
    } else if (myGameArea.options === 0) {
      gameOneButtonText.text = "Trykk på venstre knapp for å starte spillet";
      myGameArea.options = 1;
    }


    if (myGameArea.options === 3) {
      myGameArea.options = 4;
      let reactionTime = (myGameArea.frameNo * 1000) * 0.015;
      localStorage.setItem("reaksjon", reactionTime);
      gameOneButtonText.text = "Du brukte " + reactionTime + "ms på å stoppe lekkasjen";
      gameTwoGubbeSprite.frame = 0;
      gameTwoBackground.color = "#CDB7BA";
      localStorage.setItem("reactionGameScore", score.get());
      myGameArea.stop();

    }
  }

  if (!myGameArea.keys[" "]) {
    myGameArea.readyToFire = true;
  }

  if (myGameArea.options === 2) {
    myGameArea.counter += 1;
    if (myGameArea.reactTime === myGameArea.counter * 0.01) {
      myGameArea.frameNo = 1;
      gameOneButtonText.text = "TRYKK PÅ KNAPPEN!!!";
      gameTwoBackground.color = "#df4661";
      gameTwoGubbeSprite.frame = 1;
      myGameArea.options = 3;
    }
  }

  if (myGameArea.options === 3) {
    if (myGameArea.frameNo % 4 === 1) {
      gameTwoKassaSprite.frame = Math.floor(Math.random() * 2.99);
    }
    score.update(-65425);
  }


  myGameArea.frameNo += 1;

  gameTwoBackground.update(myGameArea);
  gameTwoKassaSprite.update(myGameArea);
  gameTwoGubbeSprite.update(myGameArea);
  gameTwoScoreBackground.update(myGameArea);
  gameOneScoreText.text = score.get() + ",- Kr";
  gameOneScoreText.update(myGameArea);
  if (myGameArea.options === 4) {

    gameTwoHelpTextBackground2.update(myGameArea);
    gameTwoHelpTextLineSix.text = "Trykk på høyre knapp for å gå til neste spill..";
    gameTwoHelpTextLineSix.update(myGameArea)
  }


  if (myGameArea.options > 0) {
    gameTwoTextBubble.update(myGameArea);
    gameOneButtonText.update(myGameArea);
  }
  if (myGameArea.options === 0) {
    gameTwoHelpTextBackground.update(myGameArea);
    gameTwoHelpTextLineOne.text = "Nivå 2: Reaksjon";
    gameTwoHelpTextLineOne.update(myGameArea);
    /*
    gameTwoHelpTextLineTwo.text = "Følg instruksjonene for å starte spillet";
    gameTwoHelpTextLineTwo.update(myGameArea);
    */
    gameTwoHelpTextLineThree.text = "Staten er bekymret for lekasje i statskassa";
    gameTwoHelpTextLineThree.update(myGameArea);
    gameTwoHelpTextLineFour.text = "Trykk på venstre knapp når du får beskjed, men ikke før!";
    gameTwoHelpTextLineFour.update(myGameArea);

    gameTwoHelpTextLineFive.text = "Trykker du for tidlig vil du miste halvparten av pengene i skattekassa";
    gameTwoHelpTextLineFive.update(myGameArea);

    gameTwoHelpTextLineSix.text = "Trykk på venstre knapp for å fortsette..";
    gameTwoHelpTextLineSix.update(myGameArea);
  }



}


export {
  updateGameArea,
  updateGameAreaWithRng
};

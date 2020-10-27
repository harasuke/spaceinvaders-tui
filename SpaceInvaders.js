//'use strict';
const blessed = require('blessed');
const ENEMY = require('./class/enemy.js');
const player = require('./class/player.js');
const PLAYER = require('./class/player.js');
var GAME = new Object; // GAME Object for store all variables

var screen = blessed.screen({
  samrtCSR: true,
});


var field = blessed.box({
  width: 90,
  height: 35,
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: '#f0f0f0'
    }
  }
});
screen.append(field);



//Quit on Escape, q, or C-c
screen.key(['escape', 'q', 'C-c'], function(ch, key){
  return process.exit(0);
});

//Game costraints
const updateRate = 60;
const enemyInRows = 11;
const enemyRows = 5;
const startingEnemyAmount = enemyInRows * enemyRows;
const mywidth = field.width;
const myheight = field.height;
const innerBounds = Math.floor( (mywidth) / 10) - 3;

//VARIABLES
screen.append(GAME[`player`] = new PLAYER.Player(field)); //player object
let shooting = false;

for (let r=0; r < enemyRows; r++) {
  for (let k = 0; k < enemyInRows; k++) {
    screen.append(
      GAME[`enemy_${r}_${k}`] = new ENEMY.Enemy(10+(k * enemyRows), ((r+1) * 2), `enemy_${r}_${k}`)
    );
  }
}


//Player movement to Left
let flagActiveRightInterval = false;
let startMoveRight = setInterval(()=>{ 
  if(flagActiveRightInterval)
    if(GAME[`player`].left < (mywidth) - innerBounds)
      GAME[`player`].left += 1;
}, Math.floor(updateRate / 2));

//Player movement to Right
let flagActiveLeftInterval = false;
let startMoveLeft = setInterval(()=>{
  if(flagActiveLeftInterval)
    if (GAME[`player`].left > innerBounds)
      GAME[`player`].left -= 1;
}, Math.floor(updateRate / 2));


//Bullet Player checks
let bulletPlayerUpdate = setInterval(()=>{
  if(GAME.hasOwnProperty(`bullet`)){
    let _bullet = GAME[`bullet`];  
    _bullet.top -= 1;
    
    if(_bullet.top < 1){
      _bullet.destroy();
      _bullet.free();
      delete GAME[`bullet`];
      shooting = false;
    }
    else{
      for (let r = 0; r < enemyRows; r++) {
        for (let k = 0; k < enemyInRows; k++) {
          if(GAME.hasOwnProperty(`enemy_${r}_${k}`)) {
            const e = GAME[`enemy_${r}_${k}`];
            if( (e.left == _bullet.left || e.left == _bullet.left+1 || e.left == _bullet.left-1) && (e.top == _bullet.top-1) ) {
              GAME['player']['score'] += 100;
              e.destroy();
              e.free();
              delete GAME[`enemy_${r}_${k}`];

              _bullet.destroy();
              _bullet.free();
              delete GAME[`bullet`];
              shooting = false;
              return true;
            }
          }
        }
      }
    }
  }
}, 30);

//Enemy bullets update
let bulletEnemyUpdate = setInterval(async()=>{
  let _player = GAME[`player`];

  Object.keys(GAME).forEach(key => {
    if(key.startsWith(`bullet_`)) {
      let b = GAME[`${key}`];
      b.top += 1;

      if( (b.left == _player.left || b.left+1 == _player.left || b.left-1 == _player.left) && ( (b.top+1 == _player.top) || b.top == _player.top) ) {
        b.destroy();
        b.free();
        delete GAME[`${key}`];

        endGame();

      }else if(b.top > myheight - 2) {
        b.destroy();
        b.free();
        delete GAME[`${key}`];
      }
    }
  });
}, 60);

//Game keybindings
screen.on('keypress', function(ch, key){
  switch(key.name) {
  
    case 'h':
    case 'left':
      flagActiveLeftInterval = true;
      flagActiveRightInterval = false;break;
 
    case 'l':
    case 'right':
      flagActiveRightInterval = true;
      flagActiveLeftInterval = false;break;

    case 'space':
      if(!shooting) {
        shooting = true;
        screen.append(
          GAME[`bullet`] = new PLAYER.Bullet(GAME[`player`].left, GAME[`player`].top)
        );
      }break;
  }
});



//Enemy movement
let flag = true; //TRUE =moving enemy to right
let enemyMovement = setInterval(async()=>{
  let toShift = false;

  for (let r = 0; r < enemyRows; r++) {
    for (let k = 0; k < enemyInRows; k++) {

      if(GAME.hasOwnProperty(`enemy_${r}_${k}`)) {
        let e = GAME[`enemy_${r}_${k}`];
        if(flag && e.left < ((mywidth) - innerBounds))
          e.left += 1;
        
        else if(flag && e.left >= ( (mywidth) - innerBounds)){
          toShift = true;
          e.left += 1;
        }
        else if(!flag && e.left > innerBounds){
          e.left -= 1;
        }
        else if(!flag && e.left <= innerBounds){
          toShift = true;
          e.left -= 1;
        }
      }

    }
  }

  if(toShift){
    for (let r = 0; r < enemyRows; r++)
      for (let k = 0; k < enemyInRows; k++)
        if(GAME.hasOwnProperty(`enemy_${r}_${k}`)){
          GAME[`enemy_${r}_${k}`].top += 1;
        }
    flag = !flag
  }


}, updateRate *2);

function shiftEnemyDown(){
  for (let r = 0; r < enemyRows; r++) {
    for (let k = 0; k < enemyInRows; k++) {
      if(GAME.hasOwnProperty(`enemy_${r}_${k}`)) {
        let e = GAME[`enemy_${r}_${k}`];
        e.top += 1;
      }
    }
  }
}

function enemyShoot() {
  let counterEnemyAmount = 0;
  let minTimer = 0;
  let maxTimer = 0;
  let keys=[];
  Object.keys(GAME).forEach((key)=>{
    if(key.startsWith(`enemy_`))
      keys.push(key);
      counterEnemyAmount++;
  });
  if(counterEnemyAmount == (startingEnemyAmount / 3)){ //1/3 of the enemy have been killed. timer for bullet spawn must be faster
    minTimer = 800;
    maxTimer = 1600;
  }else{
    minTimer = 1400;
    maxTimer = 2100;
  }

  let enemyForBullet = GAME[keys[keys.length * Math.random() << 0]];
  screen.append(GAME[`bullet_${enemyForBullet[`myname`]}`] = new ENEMY.Bullet(enemyForBullet.left, enemyForBullet.top));


  clearInterval(enemyShootTimer);
  enemyShootTimer = setInterval(enemyShoot, Math.floor(minTimer + Math.random() * (maxTimer - minTimer)) );
}
let enemyShootTimer = setInterval(enemyShoot, 3500);


function endGame() {
  clearInterval(enemyShootTimer);
  clearInterval(enemyMovement);
  clearInterval(bulletEnemyUpdate);
  clearInterval(bulletPlayerUpdate);
  clearInterval(startMoveRight);
  clearInterval(startMoveLeft);

  screen.append(
    blessed.box({
      left: 'center',
      top: 'center',
      width: 40,
      height: 5,
      content: `You lose, total score: ${GAME[`player`][`score`]}`,
      border: 'line',
      style: {
        border: {
          fg: 'ff0000'
        }
      }
    })
  );
}



let draw = setInterval(async ()=>{
  screen.render();
}, updateRate);

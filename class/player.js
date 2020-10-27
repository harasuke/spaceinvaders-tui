var blessed = require('blessed');

class Player {
  constructor(scr){
    let obj = blessed.text({
      top: scr.height - 5,
      left: '25%',
      height: 1,
      width: 1,
      content: '*',
      style: {
        fg: 'green',
      }
    });
    obj['score'] = 0;
    return obj;
  }
}

class Bullet {
  constructor(x, y){
    return blessed.text({
      top: y,
      left: x,
      height: 1,
      width: 1,
      content: "|",
      style: {
        fg: 'blue'
      }
    });
  }
}

module.exports = {
  Player: Player,
  Bullet: Bullet
}

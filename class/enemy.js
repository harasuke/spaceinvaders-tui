var blessed = require('blessed');

class Enemy{
  constructor(x, y, _name){
    let obj = blessed.text({
      top: y,
      left: x,
      height: 1,
      width: 1,
      content: 'Enemy',
      style: {
        fg: 'red',
        //bg: {green}
      }
    });
    obj[`myname`] = _name;
    return obj;
  }
}

class Bullet{
  constructor(x, y){
    return blessed.text({
      top: y,
      left: x,
      height: 1,
      width: 1,
      content: "|",
      style: {
        fg: 'red'
      }
    });
  }
}

module.exports = {
  Enemy: Enemy,
  Bullet: Bullet
}

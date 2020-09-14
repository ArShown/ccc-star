/* Game.js */

/* 新增星星 */
function spawnNewStar() {
  /* cc.NodePool */
  var newStar = null;
  // 使用给定的模板在场景中生成一个新节点
  if (this.starPool.size() > 0) {
    newStar = this.starPool.get(this) /* this will be passed to Star's reuse method */ ;
  } else {
    // 使用给定的模板在场景中生成一个新节点
    newStar = cc.instantiate(this.starPrefab);
  }
  // 将新增的节点添加到 Canvas 节点下面
  this.node.addChild(newStar);
  // 为星星设置一个随机位置
  newStar.setPosition(getNewStarPosition.call(this));
  // pass Game instance to star
  newStar.getComponent('star').reuse(this);

  // 重置计时器，根据消失时间范围随机取一个值
  this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
  this.timer = 0;

  this.currentStar = newStar;
};

/* 消除星星 */
function despawnStar(star) {
  this.starPool.put(star);
  this.spawnNewStar();
}

/* 新的星星位置 */
function getNewStarPosition() {
  var randX = 0;
  // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
  var randY = this.groundY + Math.random() * this.player.getComponent('player').jumpHeight + 50;
  // 根据屏幕宽度，随机得到一个星星 x 坐标
  var maxX = this.node.width / 2;
  randX = (Math.random() - 0.5) * 2 * maxX;
  // 返回星星坐标
  return cc.v2(randX, randY);
};

/* 炸彈 */
function spawnNewBoom() {
  /* cc.NodePool */
  var newBoom = null;
  // 使用给定的模板在场景中生成一个新节点
  if (this.boomPool.size() > 0) {
    newBoom = this.boomPool.get(this) /* this will be passed to Star's reuse method */ ;
  } else {
    // 使用给定的模板在场景中生成一个新节点
    newBoom = cc.instantiate(this.boomPrefab);
  }
  // 将新增的节点添加到 Canvas 节点下面
  this.node.addChild(newBoom);
  // 为星星设置一个随机位置
  newBoom.setPosition(getNewBoomPosition.call(this));
  // pass Game instance to star
  newBoom.getComponent('boom').reuse(this);

  // 重置计时器，根据消失时间范围随机取一个值
  this.boomDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
  this.boomTimer = 0;

  this.currentBoom = newBoom;
};

/* 消除炸彈 */
function despawnBoom(boom) {
  this.boomPool.put(boom);
  this.spawnNewBoom();
}

/* 新的炸彈位置 */
function getNewBoomPosition() {
  var randX = 0;
  // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
  var randY = this.groundY + Math.random() * this.player.getComponent('player').jumpHeight + 50;
  // 根据屏幕宽度，随机得到一个星星 x 坐标
  var maxX = this.node.width / 2;
  randX = (Math.random() - 0.5) * 2 * maxX;
  // 返回星星坐标
  return cc.v2(randX, randY);
};

/* 得分動畫 */
function spawnAnimRoot() {
  var fx;
  if (this.animPool.size() > 0) {
    fx = this.animPool.get(this);
  } else {
    fx = cc.instantiate(this.animRootPrefab);
    fx.getComponent('scoreAnim').reuse(this);
  }
  return fx;
};

function despawnAnimRoot() {
  this.animPool.put(this.currentAnimRoot);
};

/* 得分 */
function gainScore(pos) {
  this.score += 1;
  this.updateScoreDisplay();

  /* 播放特效 */
  this.currentAnimRoot = this.spawnAnimRoot();
  // 将新增的节点添加到 Canvas 节点下面
  this.node.addChild(this.currentAnimRoot);
  this.currentAnimRoot.setPosition(pos);
  this.currentAnimRoot.getComponent(cc.Animation).play('score_pop');

  /* 音效 */
  cc.audioEngine.playEffect(this.scoreAudio, false);
}

// 更新 scoreDisplay Label 的文字
function updateScoreDisplay() {
  this.scoreDisplay.string = 'Score: ' + this.score;
}

function gameOver() {
  this.enabled = false;
  //停止 player 节点的跳跃动作
  this.player.getComponent('player').stopHandler();
  /* 按鈕出現 */
  this.buttonDisplay.target.active = true;
  /* 回收星星節點 */
  this.currentStar.destroy();
  /* 回收炸彈節點 */
  this.currentBoom.destroy();

}

cc.Class({
  extends: cc.Component,

  properties: {
    // 这个属性引用了星星预制资源
    starPrefab: {
      default: null,
      type: cc.Prefab
    },
    // 炸彈預制
    boomPrefab: {
      default: null,
      type: cc.Prefab
    },
    // 動畫預制
    animRootPrefab: {
      default: null,
      type: cc.Prefab
    },

    // 星星产生后消失时间的随机范围
    maxStarDuration: 0,
    minStarDuration: 0,

    // 地面节点，用于确定星星生成的高度
    ground: {
      default: null,
      type: cc.Node
    },
    // player 节点，用于获取主角弹跳的高度，和控制主角行动开关
    player: {
      default: null,
      type: cc.Node
    },
    // score label 的引用
    scoreDisplay: {
      default: null,
      type: cc.Label
    },
    // button 的引用
    buttonDisplay: {
      default: null,
      type: cc.Button
    },
    // 得分音效
    scoreAudio: {
      default: null,
      type: cc.AudioClip
    }
  },

  /* 給按鈕在屬性編輯器中選擇用 */
  onStartHandler() {
    /* 初始化 */
    this.enabled = true;
    this.score = 0;
    this.timer = 0;
    this.starDuration = 0;
    this.boomTimer = 0;
    this.boomDuration = 0;

    /* 重置分數文字 */
    this.updateScoreDisplay();
    /* 按鈕 */
    this.buttonDisplay.target.active = false;
    /* 小怪獸位置重置 */
    this.player.getComponent('player').startHandler(this.groundY);

    /* 生成一个新的星星 */
    this.spawnNewStar();
    /* 生成一個炸彈 */
    this.spawnNewBoom();
  },

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.spawnNewStar = spawnNewStar.bind(this);
    this.spawnNewBoom = spawnNewBoom.bind(this);
    this.spawnAnimRoot = spawnAnimRoot.bind(this);
    this.despawnStar = despawnStar.bind(this);
    this.despawnBoom = despawnBoom.bind(this);
    this.despawnAnimRoot = despawnAnimRoot.bind(this);
    this.gainScore = gainScore.bind(this);
    this.updateScoreDisplay = updateScoreDisplay.bind(this);
    this.gameOver = gameOver.bind(this);

    /* 遊戲運行狀態，enabled 是保留參數，可以觸發生命週期 onEnable、onDisable */
    this.enabled = false;
    // 初始化
    this.score = 0;
    this.timer = 0;
    this.starDuration = 0;
    this.boomTimer = 0;
    this.boomDuration = 0;
    // 获取地平面的 y 轴坐标
    this.groundY = this.ground.y + this.ground.height / 2 - 10;
    // store last star's x position
    this.currentStar = null;
    this.currentBoom = null;
    this.currentAnimRoot = null;
    // initialize star and score pool
    this.starPool = new cc.NodePool('star');
    this.boomPool = new cc.NodePool('boom');
    this.animPool = new cc.NodePool('anim');
  },

  update(dt) {
    if (!this.enabled) return;

    // 每帧更新计时器，超过限度还没有生成新的星星
    // 就会调用游戏失败逻辑
    if (this.timer > this.starDuration) {
      this.gameOver();
      return;
    }
    this.timer += dt;
    this.boomTimer += dt;
  }
});
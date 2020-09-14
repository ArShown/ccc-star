function setScaleAction() {
  // 形变
  var squash = cc.scaleTo(0.3, 1.1, 1.1);
  var scaleBack = cc.scaleTo(0.3, 1, 1);
  return cc.repeatForever(cc.sequence(squash, scaleBack));
};

function getPlayerDistance() {
  // 根据 player 节点位置判断距离
  var playerPos = this.game.player.getPosition();
  // 根据两点位置计算两点之间距离
  var dist = this.node.position.sub(playerPos).mag();
  return dist;
};

// 当被觸碰时
function onPicked() {
  this.game.gameOver();
};

// 重新生一個
function despawn() {
  this.game.despawnBoom(this.node);
}

cc.Class({
  extends: cc.Component,

  properties: {
    // 炸彈和主角之间的距离小于这个数值时，就会完成收集
    pickRadius: cc.Integer
  },

  reuse(game) {
    this.game = game;
    this.enabled = true;
    this.node.opacity = 255;
  },

  // unuse() {
  //   // 因为回收时不执行任何操作，所以该方法可以不写
  // },

  // LIFE-CYCLE CALLBACKS:
  onLoad() {
    this.game = {};
    this.enabled = false;
    this.setScaleAction = setScaleAction.bind(this);
    this.despawn = despawn.bind(this);
    this.getPlayerDistance = getPlayerDistance.bind(this);
    this.onPicked = onPicked.bind(this);
    /* action */
    this.node.runAction(this.setScaleAction());
  },

  update(dt) {
    // 每帧判断和主角之间的距离是否小于收集距离
    if (this.getPlayerDistance() < this.pickRadius) {
      // 调用收集行为
      this.onPicked();
      return;
    }
    // 根据 Game 脚本中的计时器更新炸彈的透明度
    if (this.game.boomTimer >= this.game.boomDuration) {
      this.despawn();
      return;
    }
  }
});
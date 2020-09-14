function setJumpAction() {
  // 跳跃上升
  var jumpUp = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
  // 下落
  var jumpDown = cc.moveBy(this.jumpDuration, cc.v2(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
  // 形变
  var squash = cc.scaleTo(this.squashDuration, 1, 0.6);
  var stretch = cc.scaleTo(this.squashDuration, 1, 1.2);
  var scaleBack = cc.scaleTo(this.squashDuration, 1, 1);
  // 添加一个回调函数，用于在动作结束时调用我们定义的其他方法
  var callback = cc.callFunc(this.playJumpSound, this);
  // 不断重复，而且每次完成落地动作后调用回调来播放声音
  return cc.repeatForever(cc.sequence(squash, stretch, jumpUp, scaleBack, jumpDown, callback));
};

function playJumpSound() {
  // 调用声音引擎播放声音
  cc.audioEngine.playEffect(this.jumpAudio, false);
}

function onKeyDown(event) {
  switch (event.keyCode) {
    case cc.macro.KEY.left:
      this.accLeft = this.isMoving = true;
      break;
    case cc.macro.KEY.right:
      this.accRight = this.isMoving = true;
      break;
  }
}

function onKeyUp(event) {
  switch (event.keyCode) {
    case cc.macro.KEY.left:
      this.accLeft = this.isMoving = false;
      break;
    case cc.macro.KEY.right:
      this.accRight = this.isMoving = false;
      break;
  }
}

function onTouchStart(event) {
  var touchLoc = event.getLocation();
  if (touchLoc.x >= cc.winSize.width / 2) {
    this.accLeft = false;
    this.accRight = true;
  } else {
    this.accLeft = true;
    this.accRight = false;
  }
}

function onTouchEnd(event) {
  this.accLeft = false;
  this.accRight = false;
}

cc.Class({
  extends: cc.Component,

  /* https://docs.cocos.com/creator/manual/zh/scripting/class.html#%E7%AE%80%E5%8D%95%E5%A3%B0%E6%98%8E */
  properties: {

    jumpHeight: {
      default: 0,
      type: cc.Integer,
      displayName: '主角跳跃高度'
    },

    jumpDuration: {
      default: 0,
      type: cc.Float,
      displayName: '主角跳跃持续时间(秒）'
    },

    squashDuration: {
      default: 0,
      type: cc.Float,
      displayName: '辅助形变动作时间(秒）'
    },

    maxMoveSpeed: {
      default: 0,
      type: cc.Integer,
      displayName: '最大移动速度'
    },

    accel: {
      default: 0,
      type: cc.Integer,
      displayName: '加速度'
    },

    /* 跳躍音效 */
    jumpAudio: {
      default: null,
      type: cc.AudioClip
    }
  },

  /* 建構子 */
  // ctor: function() {  },

  startHandler(posY) {
    this.enabled = true;
    this.accLeft = false;
    this.accRight = false;
    this.xSpeed = 0;
    this.node.x = 0;
    this.node.y = posY;

    this.node.runAction(this.jumpAction);
  },

  stopHandler() {
    this.enabled = false;
    this.node.stopAllActions();
  },

  /**
   *  LIFE-CYCLE CALLBACKS:
   */
  onLoad() {
    // 初始化跳跃动作
    this.setJumpAction = setJumpAction.bind(this);
    this.playJumpSound = playJumpSound.bind(this);
    this.onKeyDown = onKeyDown.bind(this);
    this.onKeyUp = onKeyUp.bind(this);
    this.onTouchStart = onTouchStart.bind(this);
    this.onTouchEnd = onTouchEnd.bind(this);

    /* 移動狀態 */
    this.isMoving = false;

    // 加速度方向开关
    /* {boolean} */
    this.accLeft = false;
    /* {boolean} */
    this.accRight = false;

    // 主角当前水平方向速度
    /* {number} */
    this.xSpeed = 0;

    /* 遊戲運行狀態，enabled 是保留參數，可以觸發生命週期 onEnable、onDisable */
    this.enabled = false;

    /* action */
    this.jumpAction = this.setJumpAction();

    // 初始化键盘输入监听
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

    /* 觸屏控制 */
    var touchReceiver = cc.Canvas.instance.node;
    touchReceiver.on('touchstart', this.onTouchStart, this);
    touchReceiver.on('touchend', this.onTouchEnd, this);
  },

  onDestroy() {
    // 取消键盘输入监听;
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    /* 觸屏控制 */
    var touchReceiver = cc.Canvas.instance.node;
    touchReceiver.off('touchstart', this.onTouchStart, this);
    touchReceiver.off('touchend', this.onTouchEnd, this);
  },

  // onEnable() {
  //   console.log('player onEnable')
  // },

  // onDisable() {
  //   console.log('player onDisable')
  // },

  update(dt) {
    if (!this.enabled) return;

    // 根据当前加速度方向每帧更新速度
    if (this.accLeft) {
      this.xSpeed -= this.accel * dt;
    } else if (this.accRight) {
      this.xSpeed += this.accel * dt;
    }
    // 限制主角的速度不能超过最大值
    if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
      // if speed reach limit, use max speed with current direction
      this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
    }
    // 根据当前速度更新主角的位置
    this.node.x += this.xSpeed * dt;
    // 碰到邊界穿透到對面
    if (this.node.x > this.node.parent.width / 2) {
      this.node.x = -this.node.parent.width / 2;
    } else if (this.node.x < -this.node.parent.width / 2) {
      this.node.x = this.node.parent.width / 2;
    }
  }
});
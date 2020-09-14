/**
 * 觀察者模式 類別
 */
class ObserverEvent {
  constructor() {
    this._listeners = [];
    this._index = 0;
  }

  /**
   * 新增觀察者
   * @param observer
   */
  attach(observer) {
    const listenerObject = {
      id: this._index,
      observer: observer
    };
    this._listeners.push(listenerObject);
    this._index += 1;
    return listenerObject.id;
  }

  /**
   * 移除觀察者
   * @param listenerId
   */
  detach(listenerId) {
    this._listeners = this._listeners.filter(listener => listener.id !== listenerId);
  }

  /**
   * 通知所有觀察者
   * @param message
   */
  notifyObservers(message) {
    this._listeners.forEach(listener => listener.observer(message));
  }
}
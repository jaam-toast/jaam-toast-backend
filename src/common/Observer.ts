class Observer {
  /* observer methods */
  protected static subscriber = (message: string): void => {};

  static subscribe(fn: (message: string) => void) {
    this.subscriber = fn;
  }

  static unsubscribe() {
    this.subscriber = () => {};
  }

  static send(message: string) {
    this.subscriber(message);
  }
}

export default Observer;

class AsyncChainingClass {
  protected queue = Promise.resolve();

  protected chain(callback: (value: void) => void | Promise<void>) {
    this.queue = this.queue.then(callback);
  }

  then(callback: (queue: Promise<void>) => {}) {
    callback(this.queue);
  }
}

export default AsyncChainingClass;

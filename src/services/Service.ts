type Next = Function;
type ServiceHandler<T> = (service: T, next: Next) => void | Promise<void>;

abstract class Service {
  static layers: ServiceHandler<any>[] = [];
  static layerIndex = 0;

  static async use<T>(...handlers: ServiceHandler<T>[]) {
    if (this.layerIndex !== this.layers.length) {
      throw new Error(
        "service.use cannot be called from inside a service handler.",
      );
    }

    this.layers.push(...handlers);
    await this.handle();

    return this;
  }

  static async handle() {
    const next = async (message?: string) => {
      if (message) {
        this.layerIndex >= this.layers.length;
      }
      if (this.layerIndex >= this.layers.length) {
        return;
      }

      const handler = this.layers[this.layerIndex];
      this.layerIndex += 1;
      await handler(this, next);
    };

    next();
  }
}

export default Service;

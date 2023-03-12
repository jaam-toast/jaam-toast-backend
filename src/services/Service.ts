type Next = Function;
type ServiceHandler = (service: Service, next: Next) => void | Promise<void>;

abstract class Service {
  static layers: ServiceHandler[] = [];
  static layerIndex = 0;

  static use(...handlers: ServiceHandler[]) {
    if (this.layerIndex !== this.layers.length) {
      throw new Error("service.use cannot be called from inside a service handler.");
    }

    this.layers.push(...handlers);
    this.handle();

    return this;
  };

  static handle() {
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

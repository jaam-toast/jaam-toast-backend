// import type { ServiceHandler } from "@src/types";

// abstract class Service {
//   public layers: ServiceHandler<this>[] = [];
//   public layerIndex = 0;

//   public async use(...handlers: ServiceHandler<this>[]) {
//     if (this.layerIndex !== this.layers.length) {
//       this.layerIndex = this.layers.length;
//     }

//     this.layers.push(...handlers);

//     try {
//       await this.handle();
//     } catch (error) {
//       throw error;
//     }

//     return this;
//   }

//   public async handle() {
//     const next = async (message?: string) => {
//       if (message) {
//         this.layerIndex = this.layers.length;
//       }
//       if (this.layerIndex >= this.layers.length) {
//         return;
//       }

//       const handler = this.layers[this.layerIndex];
//       this.layerIndex += 1;

//       try {
//         await handler(this, next);
//       } catch (error) {
//         throw error;
//       }
//     };

//     next();
//   }
// }

// export default Service;

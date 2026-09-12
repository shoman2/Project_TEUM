import { createServer } from "../apps/api/src/server.js";

let fastifyApp: any = null;

export default async function handler(req: any, res: any) {
  if (!fastifyApp) {
    fastifyApp = await createServer();
    await fastifyApp.ready();
  }
  fastifyApp.server.emit("request", req, res);
}

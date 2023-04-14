import { FastifyInstance } from "fastify";

export default async (app: FastifyInstance) => {
  // app.route({
  //   url: "/",
  //   method: "GET",
  //   handler: (request, reply) => {
  //     reply.send("Hello");
  //   },
  // });  
  app.get('/hello', {}, (request, reply) => {
    reply.send("Hello");
  });
};

import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifySchema,
  FastifyTypeProviderDefault,
  RawServerDefault,
  RouteHandlerMethod,
} from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import { CreateStoreByPhoneRequest } from "src/features/store/store.types";

export interface IReply {
  status: number;
  message: string;
  body?: any;
}

export interface ApiHelperHandler<Body, Querystring, Headers, Params, Reply> {
  (
    request: FastifyRequest<
      {
        Body?: Body | never;
        Querystring: Querystring;
        Headers: Headers;
        Params: Params;
        Reply: Reply;
      },
      RawServerDefault,
      IncomingMessage,
      FastifySchema
    >,
    reply: FastifyReply<
      RawServerDefault,
      IncomingMessage,
      ServerResponse<IncomingMessage>,
      {
        Body?: Body | never;
        Querystring: Querystring;
        Headers: Headers;
        Params: Params;
        Reply: Reply;
      },
      unknown,
      FastifySchema,
      FastifyTypeProviderDefault,
      Reply
    >
  ): void;
}
export class ApiHelper {
  static get<Querystring, Params, Headers>(
    app: FastifyInstance,
    url: string,
    handler: ApiHelperHandler<Body, Querystring, Headers, Params, IReply>,
    options?: any
  ) {
    app.get<{
      Querystring: Querystring;
      Headers: Headers;
      Params: Params;
      Reply: IReply;
    }>(url, {}, handler);
  }

  static post<Body, Querystring, Params, Headers>(
    app: FastifyInstance,
    url: string,
    handler: ApiHelperHandler<Body, Querystring, Headers, Params, IReply>
  ) {
    app.post<{
      Body: Body;
      Querystring: Querystring;
      Headers: Headers;
      Params: Params;
      Reply: IReply;
    }>(url, {}, handler);
  }

  static put<Body, Querystring, Params, Headers>(
    app: FastifyInstance,
    url: string,
    handler: ApiHelperHandler<Body, Querystring, Headers, Params, IReply>
  ) {
    app.put<{
      Body: Body;
      Querystring: Querystring;
      Headers: Headers;
      Params: Params;
      Reply: IReply;
    }>(url, {}, handler);
  }

  static delete<Querystring, Params, Headers>(
    app: FastifyInstance,
    url: string,
    handler: ApiHelperHandler<Body, Querystring, Headers, Params, IReply>
  ) {
    app.delete<{
      Querystring: Querystring;
      Headers: Headers;
      Params: Params;
      Reply: IReply;
    }>(url, {}, handler);
  }

  static callFailed(
    reply: FastifyReply<
      RawServerDefault,
      IncomingMessage,
      ServerResponse<IncomingMessage>,
      {
        Body?: any | undefined;
        Querystring: {};
        Headers: {};
        Params: {};
        Reply: IReply;
      },
      unknown,
      FastifySchema,
      FastifyTypeProviderDefault,
      IReply
    >,
    error?: string,
    status?: number
  ) {
    reply.status(status === undefined ? 400 : status).send({
      status: status === undefined ? 404 : status,
      message: error || "Something went wrong, Please try again",
      body: {},
    });
    return
  }

  static missingParameters(
    reply: FastifyReply<
      RawServerDefault,
      IncomingMessage,
      ServerResponse<IncomingMessage>,
      {
        Body?: any | undefined;
        Querystring: {};
        Headers: {};
        Params: {};
        Reply: IReply;
      },
      unknown,
      FastifySchema,
      FastifyTypeProviderDefault,
      IReply
    >,
    error?: string,
    status?: number
  ) {
    reply.status(status === undefined ? 400 : status).send({
      status: status === undefined ? 400 : status,
      message: error || "Required parameters are missing",
      body: {},
    });
    return
  }

  static success(
    reply: FastifyReply<
      RawServerDefault,
      IncomingMessage,
      ServerResponse<IncomingMessage>,
      {
        Body?: any | undefined;
        Querystring: {};
        Headers: {};
        Params: {};
        Reply: IReply;
      },
      unknown,
      FastifySchema,
      FastifyTypeProviderDefault,
      IReply
    >,
    payload: {} = {}
  ) {
    reply.send({
      status: 200,
      message: "Success",
      body: payload,
    });
    return
  }
}

import fetch, { Response } from 'node-fetch';
import * as https from 'https';
const FormData = require('form-data');

export enum HTTPMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export class APIRequest {
  apiPath: string;
  apiMethod: HTTPMethods;
  requestBody: any = {};
  requestHeader: { [key: string]: string } = {};
}

export interface MetaGraphApiRequest {
  url: string;
  fields?: any[];
  accessToken?: string;
}

export class RequestExecutor {
  static async executeAPIRequest(
    apiRequest: APIRequest,
    disableCertificateVerification?: boolean,
    noEncoding: boolean = false
  ): Promise<Response> {
    if (!apiRequest.requestHeader) {
      apiRequest.requestHeader = {};
    }
    if (!apiRequest.requestBody) {
      apiRequest.requestBody = {};
    }
    apiRequest.requestHeader['Content-Type'] = 'application/json';
    apiRequest.requestHeader['Content-Length'] = '' + apiRequest.requestBody.toString().length;
    let url = apiRequest.apiPath;
    let options: any = {
      method: apiRequest.apiMethod,
      headers: apiRequest.requestHeader,
      body: apiRequest.requestBody,
    };
    if (apiRequest.apiMethod === HTTPMethods.GET) {
      const requestParams =
        typeof options['body'] === 'string' ? JSON.parse(options['body']) : options['body'];
      if (!noEncoding) {
        url = url + '?' + RequestExecutor.getQueryParamsFromJsonObj(requestParams);
      }
      delete options['body'];
      delete apiRequest.requestHeader['Content-Length'];
    }
    if (disableCertificateVerification) {
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = String(0);
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
      options.agent = httpsAgent;
    }
    return await fetch(url, options);
  }

  static async executeAPIRequestWithFormData(apiRequest: APIRequest): Promise<Response> {
    if (!apiRequest.requestHeader) {
      apiRequest.requestHeader = {};
    }
    if (!apiRequest.requestBody) {
      apiRequest.requestBody = {};
    }
    apiRequest.requestHeader['Content-Type'] = 'application/json';
    apiRequest.requestHeader['Content-Length'] = '' + apiRequest.requestBody.toString().length;
    const params = new URLSearchParams();
    const requestBodyJson = JSON.parse(apiRequest.requestBody);
    Object.keys(requestBodyJson).forEach((element: any) => {
      params.append(element, requestBodyJson[element]);
    });
    const url = apiRequest.apiPath;
    const options = {
      method: HTTPMethods.POST,
      body: params,
    };
    return await fetch(url, options);
  }

//   static async executeAPIRequestWithFormDataForMetaPost(
//     apiRequest: MetaGraphApiRequest,
//     apiVersion = '14.0'
//   ): Promise<Response> {
//     const params = new FormData();
//     apiRequest.fields?.push({ access_token: apiRequest.accessToken });
//     const formFields = apiRequest.fields;
//     if (formFields && formFields.length > 0) {
//       formFields.forEach((element) => {
//         const key = Object.keys(element)[0];
//         const value = element[key];
//         params.append(this.camelCaseToSnakeCase(key), `${value}`);
//       });
//     }
//     const options = {
//       method: HTTPMethods.POST,
//       body: params,
//     };
//     const data = await fetch(apiRequest.url, options);
//     return await data.json();
//   }

//   static async executeAPIRequestWithFormDataForMetaGet(
//     apiRequest: MetaGraphApiRequest
//   ): Promise<Response> {
//     const options = {
//       method: HTTPMethods.GET,
//     };
//     const data = await fetch(apiRequest.url, options);
//     return await data.json();
//   }

  static getQueryParamsFromJsonObj(jsonObject: any) {
    return Object.keys(jsonObject)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(jsonObject[key])}`)
      .join('&');
  }

//   static camelCaseToSnakeCase(itemKey: string) {
//     return itemKey.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
//   }
}

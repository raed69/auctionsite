import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';
import { Request } from 'express';

const logger = new Logger('ProxyUtil');

export interface ProxyOptions {
  serviceUrl: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  req: Request;
  body?: any;
}

/**
 * Forwards a request to a downstream microservice.
 * Handles both application/json and multipart/form-data transparently.
 */
export async function proxyRequest(options: ProxyOptions): Promise<any> {
  const { serviceUrl, path, method, req, body } = options;

  const url = `${serviceUrl}${path}`;

  const contentType = req.headers['content-type'] || '';
  const isMultipart = contentType.includes('multipart/form-data');

  // Build forwarded headers — keep content-type and authorization as-is
  const forwardedHeaders: Record<string, string> = {};

  if (req.headers.authorization) {
    forwardedHeaders['Authorization'] = req.headers.authorization;
  }

  // For multipart, forward the original content-type header (includes boundary)
  if (isMultipart) {
    forwardedHeaders['content-type'] = contentType;
  } else {
    forwardedHeaders['content-type'] = 'application/json';
  }

  logger.debug(`→ ${method.toUpperCase()} ${url} [${isMultipart ? 'multipart' : 'json'}]`);

  const config = {
    method,
    url,
    params: req.query,
    headers: forwardedHeaders,
    // For multipart: pipe the raw request stream directly
    // For JSON: send the parsed body
    data: isMultipart ? req : body,
    // Required for streaming the raw request
    ...(isMultipart && { maxBodyLength: Infinity, maxContentLength: Infinity }),
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new HttpException(error.response.data, error.response.status);
    }
    logger.error(`Service unreachable: ${url} — ${error.message}`);
    throw new HttpException(
      { message: 'Service temporarily unavailable', service: serviceUrl },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

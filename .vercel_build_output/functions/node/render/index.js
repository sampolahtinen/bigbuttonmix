var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    if (isBlob(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error3) {
    if (error3 instanceof FetchBaseError) {
      throw error3;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error3.message}`, "system", error3);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error3) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error3.message}`, "system", error3);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url, options_) {
  return new Promise((resolve2, reject2) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error3 = new AbortError("The operation was aborted.");
      reject2(error3);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error3);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error3);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (err) => {
      reject2(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject2(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (error3) {
                reject2(error3);
              }
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject2(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject2(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
        reject2(error3);
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), (error3) => {
          reject2(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
          reject2(error3);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), (error3) => {
              reject2(error3);
            });
          } else {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), (error3) => {
              reject2(error3);
            });
          }
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), (error3) => {
          reject2(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, src, dataUriToBuffer$1, Readable, wm, Blob, fetchBlob, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ({ Readable } = import_stream.default);
    wm = new WeakMap();
    Blob = class {
      constructor(blobParts = [], options2 = {}) {
        let size = 0;
        const parts = blobParts.map((element) => {
          let buffer;
          if (element instanceof Buffer) {
            buffer = element;
          } else if (ArrayBuffer.isView(element)) {
            buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
          } else if (element instanceof ArrayBuffer) {
            buffer = Buffer.from(element);
          } else if (element instanceof Blob) {
            buffer = element;
          } else {
            buffer = Buffer.from(typeof element === "string" ? element : String(element));
          }
          size += buffer.length || buffer.size || 0;
          return buffer;
        });
        const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
        wm.set(this, {
          type: /[^\u0020-\u007E]/.test(type) ? "" : type,
          size,
          parts
        });
      }
      get size() {
        return wm.get(this).size;
      }
      get type() {
        return wm.get(this).type;
      }
      async text() {
        return Buffer.from(await this.arrayBuffer()).toString();
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of this.stream()) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        return Readable.from(read(wm.get(this).parts));
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = wm.get(this).parts.values();
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
            blobParts.push(chunk);
            added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
            relativeStart = 0;
            if (added >= span) {
              break;
            }
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        Object.assign(wm.get(blob), { size: span, parts: blobParts });
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    fetchBlob = Blob;
    Blob$1 = fetchBlob;
    FetchBaseError = class extends Error {
      constructor(message, type) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && object[NAME] === "AbortSignal";
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body === null) {
          body = null;
        } else if (isURLSearchParameters(body)) {
          body = Buffer.from(body.toString());
        } else if (isBlob(body))
          ;
        else if (Buffer.isBuffer(body))
          ;
        else if (import_util.types.isAnyArrayBuffer(body)) {
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof import_stream.default)
          ;
        else if (isFormData(body)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body = import_stream.default.Readable.from(formDataIterator(body, boundary));
        } else {
          body = Buffer.from(String(body));
        }
        this[INTERNALS$2] = {
          body,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body instanceof import_stream.default) {
          body.on("error", (err) => {
            const error3 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
            this[INTERNALS$2].error = error3;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new Blob$1([buf], {
          type: ct
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance, highWaterMark) => {
      let p1;
      let p2;
      let { body } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body = p2;
      }
      return body;
    };
    extractContentType = (body, request) => {
      if (body === null) {
        return null;
      }
      if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body)) {
        return body.type || null;
      }
      if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
      }
      if (body && typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      }
      if (isFormData(body)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body } = request;
      if (body === null) {
        return 0;
      }
      if (isBlob(body)) {
        return body.size;
      }
      if (Buffer.isBuffer(body)) {
        return body.length;
      }
      if (body && typeof body.getLengthSync === "function") {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
      }
      if (isFormData(body)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        body.stream().pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw err;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const err = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
        throw err;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name, values] of Object.entries(raw)) {
            result.push(...values.map((value) => [name, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name, value]) => {
          validateHeaderName(name);
          validateHeaderValue(name, String(value));
          return [String(name).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p, receiver) {
            switch (p) {
              case "append":
              case "set":
                return (name, value) => {
                  validateHeaderName(name);
                  validateHeaderValue(name, String(value));
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name) {
        const values = this.getAll(name);
        if (values.length === 0) {
          return null;
        }
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback) {
        for (const name of this.keys()) {
          callback(this.get(name), name);
        }
      }
      *values() {
        for (const name of this.keys()) {
          yield this.get(name);
        }
      }
      *entries() {
        for (const name of this.keys()) {
          yield [name, this.get(name)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values = this.getAll(key);
          if (key === "host") {
            result[key] = values[0];
          } else {
            result[key] = values.length > 1 ? values : values[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
      result[property] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status || 200;
        const headers = new Headers(options2.headers);
        if (body !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url).toString()
          },
          status
        });
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal !== null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers = new Headers(request[INTERNALS].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/@sveltejs/adapter-vercel/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-vercel/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/cookie/index.js
var require_cookie = __commonJS({
  "node_modules/cookie/index.js"(exports) {
    init_shims();
    "use strict";
    exports.parse = parse;
    exports.serialize = serialize;
    var decode = decodeURIComponent;
    var encode = encodeURIComponent;
    var pairSplitRegExp = /; */;
    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    function parse(str, options2) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var opt = options2 || {};
      var pairs = str.split(pairSplitRegExp);
      var dec = opt.decode || decode;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var eq_idx = pair.indexOf("=");
        if (eq_idx < 0) {
          continue;
        }
        var key = pair.substr(0, eq_idx).trim();
        var val = pair.substr(++eq_idx, pair.length).trim();
        if (val[0] == '"') {
          val = val.slice(1, -1);
        }
        if (obj[key] == void 0) {
          obj[key] = tryDecode(val, dec);
        }
      }
      return obj;
    }
    function serialize(name, val, options2) {
      var opt = options2 || {};
      var enc = opt.encode || encode;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!fieldContentRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (opt.maxAge != null) {
        var maxAge = opt.maxAge - 0;
        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + Math.floor(maxAge);
      }
      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        if (typeof opt.expires.toUTCString !== "function") {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + opt.expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});

// node_modules/ramda/src/F.js
var require_F = __commonJS({
  "node_modules/ramda/src/F.js"(exports, module2) {
    init_shims();
    var F = function() {
      return false;
    };
    module2.exports = F;
  }
});

// node_modules/ramda/src/T.js
var require_T = __commonJS({
  "node_modules/ramda/src/T.js"(exports, module2) {
    init_shims();
    var T = function() {
      return true;
    };
    module2.exports = T;
  }
});

// node_modules/ramda/src/__.js
var require__ = __commonJS({
  "node_modules/ramda/src/__.js"(exports, module2) {
    init_shims();
    module2.exports = {
      "@@functional/placeholder": true
    };
  }
});

// node_modules/ramda/src/internal/_isPlaceholder.js
var require_isPlaceholder = __commonJS({
  "node_modules/ramda/src/internal/_isPlaceholder.js"(exports, module2) {
    init_shims();
    function _isPlaceholder(a) {
      return a != null && typeof a === "object" && a["@@functional/placeholder"] === true;
    }
    module2.exports = _isPlaceholder;
  }
});

// node_modules/ramda/src/internal/_curry1.js
var require_curry1 = __commonJS({
  "node_modules/ramda/src/internal/_curry1.js"(exports, module2) {
    init_shims();
    var _isPlaceholder = require_isPlaceholder();
    function _curry1(fn) {
      return function f1(a) {
        if (arguments.length === 0 || _isPlaceholder(a)) {
          return f1;
        } else {
          return fn.apply(this, arguments);
        }
      };
    }
    module2.exports = _curry1;
  }
});

// node_modules/ramda/src/internal/_curry2.js
var require_curry2 = __commonJS({
  "node_modules/ramda/src/internal/_curry2.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var _isPlaceholder = require_isPlaceholder();
    function _curry2(fn) {
      return function f2(a, b) {
        switch (arguments.length) {
          case 0:
            return f2;
          case 1:
            return _isPlaceholder(a) ? f2 : _curry1(function(_b) {
              return fn(a, _b);
            });
          default:
            return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function(_a) {
              return fn(_a, b);
            }) : _isPlaceholder(b) ? _curry1(function(_b) {
              return fn(a, _b);
            }) : fn(a, b);
        }
      };
    }
    module2.exports = _curry2;
  }
});

// node_modules/ramda/src/add.js
var require_add = __commonJS({
  "node_modules/ramda/src/add.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var add = /* @__PURE__ */ _curry2(function add2(a, b) {
      return Number(a) + Number(b);
    });
    module2.exports = add;
  }
});

// node_modules/ramda/src/internal/_concat.js
var require_concat = __commonJS({
  "node_modules/ramda/src/internal/_concat.js"(exports, module2) {
    init_shims();
    function _concat(set1, set2) {
      set1 = set1 || [];
      set2 = set2 || [];
      var idx;
      var len1 = set1.length;
      var len2 = set2.length;
      var result = [];
      idx = 0;
      while (idx < len1) {
        result[result.length] = set1[idx];
        idx += 1;
      }
      idx = 0;
      while (idx < len2) {
        result[result.length] = set2[idx];
        idx += 1;
      }
      return result;
    }
    module2.exports = _concat;
  }
});

// node_modules/ramda/src/internal/_arity.js
var require_arity = __commonJS({
  "node_modules/ramda/src/internal/_arity.js"(exports, module2) {
    init_shims();
    function _arity(n, fn) {
      switch (n) {
        case 0:
          return function() {
            return fn.apply(this, arguments);
          };
        case 1:
          return function(a0) {
            return fn.apply(this, arguments);
          };
        case 2:
          return function(a0, a1) {
            return fn.apply(this, arguments);
          };
        case 3:
          return function(a0, a1, a2) {
            return fn.apply(this, arguments);
          };
        case 4:
          return function(a0, a1, a2, a3) {
            return fn.apply(this, arguments);
          };
        case 5:
          return function(a0, a1, a2, a3, a4) {
            return fn.apply(this, arguments);
          };
        case 6:
          return function(a0, a1, a2, a3, a4, a5) {
            return fn.apply(this, arguments);
          };
        case 7:
          return function(a0, a1, a2, a3, a4, a5, a6) {
            return fn.apply(this, arguments);
          };
        case 8:
          return function(a0, a1, a2, a3, a4, a5, a6, a7) {
            return fn.apply(this, arguments);
          };
        case 9:
          return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
            return fn.apply(this, arguments);
          };
        case 10:
          return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
            return fn.apply(this, arguments);
          };
        default:
          throw new Error("First argument to _arity must be a non-negative integer no greater than ten");
      }
    }
    module2.exports = _arity;
  }
});

// node_modules/ramda/src/internal/_curryN.js
var require_curryN = __commonJS({
  "node_modules/ramda/src/internal/_curryN.js"(exports, module2) {
    init_shims();
    var _arity = require_arity();
    var _isPlaceholder = require_isPlaceholder();
    function _curryN(length, received, fn) {
      return function() {
        var combined = [];
        var argsIdx = 0;
        var left = length;
        var combinedIdx = 0;
        while (combinedIdx < received.length || argsIdx < arguments.length) {
          var result;
          if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
            result = received[combinedIdx];
          } else {
            result = arguments[argsIdx];
            argsIdx += 1;
          }
          combined[combinedIdx] = result;
          if (!_isPlaceholder(result)) {
            left -= 1;
          }
          combinedIdx += 1;
        }
        return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));
      };
    }
    module2.exports = _curryN;
  }
});

// node_modules/ramda/src/curryN.js
var require_curryN2 = __commonJS({
  "node_modules/ramda/src/curryN.js"(exports, module2) {
    init_shims();
    var _arity = require_arity();
    var _curry1 = require_curry1();
    var _curry2 = require_curry2();
    var _curryN = require_curryN();
    var curryN = /* @__PURE__ */ _curry2(function curryN2(length, fn) {
      if (length === 1) {
        return _curry1(fn);
      }
      return _arity(length, _curryN(length, [], fn));
    });
    module2.exports = curryN;
  }
});

// node_modules/ramda/src/addIndex.js
var require_addIndex = __commonJS({
  "node_modules/ramda/src/addIndex.js"(exports, module2) {
    init_shims();
    var _concat = require_concat();
    var _curry1 = require_curry1();
    var curryN = require_curryN2();
    var addIndex = /* @__PURE__ */ _curry1(function addIndex2(fn) {
      return curryN(fn.length, function() {
        var idx = 0;
        var origFn = arguments[0];
        var list = arguments[arguments.length - 1];
        var args = Array.prototype.slice.call(arguments, 0);
        args[0] = function() {
          var result = origFn.apply(this, _concat(arguments, [idx, list]));
          idx += 1;
          return result;
        };
        return fn.apply(this, args);
      });
    });
    module2.exports = addIndex;
  }
});

// node_modules/ramda/src/internal/_curry3.js
var require_curry3 = __commonJS({
  "node_modules/ramda/src/internal/_curry3.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var _curry2 = require_curry2();
    var _isPlaceholder = require_isPlaceholder();
    function _curry3(fn) {
      return function f3(a, b, c) {
        switch (arguments.length) {
          case 0:
            return f3;
          case 1:
            return _isPlaceholder(a) ? f3 : _curry2(function(_b, _c) {
              return fn(a, _b, _c);
            });
          case 2:
            return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function(_a, _c) {
              return fn(_a, b, _c);
            }) : _isPlaceholder(b) ? _curry2(function(_b, _c) {
              return fn(a, _b, _c);
            }) : _curry1(function(_c) {
              return fn(a, b, _c);
            });
          default:
            return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function(_a, _b) {
              return fn(_a, _b, c);
            }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function(_a, _c) {
              return fn(_a, b, _c);
            }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function(_b, _c) {
              return fn(a, _b, _c);
            }) : _isPlaceholder(a) ? _curry1(function(_a) {
              return fn(_a, b, c);
            }) : _isPlaceholder(b) ? _curry1(function(_b) {
              return fn(a, _b, c);
            }) : _isPlaceholder(c) ? _curry1(function(_c) {
              return fn(a, b, _c);
            }) : fn(a, b, c);
        }
      };
    }
    module2.exports = _curry3;
  }
});

// node_modules/ramda/src/adjust.js
var require_adjust = __commonJS({
  "node_modules/ramda/src/adjust.js"(exports, module2) {
    init_shims();
    var _concat = require_concat();
    var _curry3 = require_curry3();
    var adjust = /* @__PURE__ */ _curry3(function adjust2(idx, fn, list) {
      if (idx >= list.length || idx < -list.length) {
        return list;
      }
      var start = idx < 0 ? list.length : 0;
      var _idx = start + idx;
      var _list = _concat(list);
      _list[_idx] = fn(list[_idx]);
      return _list;
    });
    module2.exports = adjust;
  }
});

// node_modules/ramda/src/internal/_isArray.js
var require_isArray = __commonJS({
  "node_modules/ramda/src/internal/_isArray.js"(exports, module2) {
    init_shims();
    module2.exports = Array.isArray || function _isArray(val) {
      return val != null && val.length >= 0 && Object.prototype.toString.call(val) === "[object Array]";
    };
  }
});

// node_modules/ramda/src/internal/_isTransformer.js
var require_isTransformer = __commonJS({
  "node_modules/ramda/src/internal/_isTransformer.js"(exports, module2) {
    init_shims();
    function _isTransformer(obj) {
      return obj != null && typeof obj["@@transducer/step"] === "function";
    }
    module2.exports = _isTransformer;
  }
});

// node_modules/ramda/src/internal/_dispatchable.js
var require_dispatchable = __commonJS({
  "node_modules/ramda/src/internal/_dispatchable.js"(exports, module2) {
    init_shims();
    var _isArray = require_isArray();
    var _isTransformer = require_isTransformer();
    function _dispatchable(methodNames, xf, fn) {
      return function() {
        if (arguments.length === 0) {
          return fn();
        }
        var args = Array.prototype.slice.call(arguments, 0);
        var obj = args.pop();
        if (!_isArray(obj)) {
          var idx = 0;
          while (idx < methodNames.length) {
            if (typeof obj[methodNames[idx]] === "function") {
              return obj[methodNames[idx]].apply(obj, args);
            }
            idx += 1;
          }
          if (_isTransformer(obj)) {
            var transducer = xf.apply(null, args);
            return transducer(obj);
          }
        }
        return fn.apply(this, arguments);
      };
    }
    module2.exports = _dispatchable;
  }
});

// node_modules/ramda/src/internal/_reduced.js
var require_reduced = __commonJS({
  "node_modules/ramda/src/internal/_reduced.js"(exports, module2) {
    init_shims();
    function _reduced(x) {
      return x && x["@@transducer/reduced"] ? x : {
        "@@transducer/value": x,
        "@@transducer/reduced": true
      };
    }
    module2.exports = _reduced;
  }
});

// node_modules/ramda/src/internal/_xfBase.js
var require_xfBase = __commonJS({
  "node_modules/ramda/src/internal/_xfBase.js"(exports, module2) {
    init_shims();
    module2.exports = {
      init: function() {
        return this.xf["@@transducer/init"]();
      },
      result: function(result) {
        return this.xf["@@transducer/result"](result);
      }
    };
  }
});

// node_modules/ramda/src/internal/_xall.js
var require_xall = __commonJS({
  "node_modules/ramda/src/internal/_xall.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _reduced = require_reduced();
    var _xfBase = require_xfBase();
    var XAll = /* @__PURE__ */ function() {
      function XAll2(f, xf) {
        this.xf = xf;
        this.f = f;
        this.all = true;
      }
      XAll2.prototype["@@transducer/init"] = _xfBase.init;
      XAll2.prototype["@@transducer/result"] = function(result) {
        if (this.all) {
          result = this.xf["@@transducer/step"](result, true);
        }
        return this.xf["@@transducer/result"](result);
      };
      XAll2.prototype["@@transducer/step"] = function(result, input) {
        if (!this.f(input)) {
          this.all = false;
          result = _reduced(this.xf["@@transducer/step"](result, false));
        }
        return result;
      };
      return XAll2;
    }();
    var _xall = /* @__PURE__ */ _curry2(function _xall2(f, xf) {
      return new XAll(f, xf);
    });
    module2.exports = _xall;
  }
});

// node_modules/ramda/src/all.js
var require_all = __commonJS({
  "node_modules/ramda/src/all.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xall = require_xall();
    var all = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["all"], _xall, function all2(fn, list) {
      var idx = 0;
      while (idx < list.length) {
        if (!fn(list[idx])) {
          return false;
        }
        idx += 1;
      }
      return true;
    }));
    module2.exports = all;
  }
});

// node_modules/ramda/src/max.js
var require_max = __commonJS({
  "node_modules/ramda/src/max.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var max = /* @__PURE__ */ _curry2(function max2(a, b) {
      return b > a ? b : a;
    });
    module2.exports = max;
  }
});

// node_modules/ramda/src/internal/_map.js
var require_map = __commonJS({
  "node_modules/ramda/src/internal/_map.js"(exports, module2) {
    init_shims();
    function _map(fn, functor) {
      var idx = 0;
      var len = functor.length;
      var result = Array(len);
      while (idx < len) {
        result[idx] = fn(functor[idx]);
        idx += 1;
      }
      return result;
    }
    module2.exports = _map;
  }
});

// node_modules/ramda/src/internal/_isString.js
var require_isString = __commonJS({
  "node_modules/ramda/src/internal/_isString.js"(exports, module2) {
    init_shims();
    function _isString(x) {
      return Object.prototype.toString.call(x) === "[object String]";
    }
    module2.exports = _isString;
  }
});

// node_modules/ramda/src/internal/_isArrayLike.js
var require_isArrayLike = __commonJS({
  "node_modules/ramda/src/internal/_isArrayLike.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var _isArray = require_isArray();
    var _isString = require_isString();
    var _isArrayLike = /* @__PURE__ */ _curry1(function isArrayLike(x) {
      if (_isArray(x)) {
        return true;
      }
      if (!x) {
        return false;
      }
      if (typeof x !== "object") {
        return false;
      }
      if (_isString(x)) {
        return false;
      }
      if (x.nodeType === 1) {
        return !!x.length;
      }
      if (x.length === 0) {
        return true;
      }
      if (x.length > 0) {
        return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
      }
      return false;
    });
    module2.exports = _isArrayLike;
  }
});

// node_modules/ramda/src/internal/_xwrap.js
var require_xwrap = __commonJS({
  "node_modules/ramda/src/internal/_xwrap.js"(exports, module2) {
    init_shims();
    var XWrap = /* @__PURE__ */ function() {
      function XWrap2(fn) {
        this.f = fn;
      }
      XWrap2.prototype["@@transducer/init"] = function() {
        throw new Error("init not implemented on XWrap");
      };
      XWrap2.prototype["@@transducer/result"] = function(acc) {
        return acc;
      };
      XWrap2.prototype["@@transducer/step"] = function(acc, x) {
        return this.f(acc, x);
      };
      return XWrap2;
    }();
    function _xwrap(fn) {
      return new XWrap(fn);
    }
    module2.exports = _xwrap;
  }
});

// node_modules/ramda/src/bind.js
var require_bind = __commonJS({
  "node_modules/ramda/src/bind.js"(exports, module2) {
    init_shims();
    var _arity = require_arity();
    var _curry2 = require_curry2();
    var bind = /* @__PURE__ */ _curry2(function bind2(fn, thisObj) {
      return _arity(fn.length, function() {
        return fn.apply(thisObj, arguments);
      });
    });
    module2.exports = bind;
  }
});

// node_modules/ramda/src/internal/_reduce.js
var require_reduce = __commonJS({
  "node_modules/ramda/src/internal/_reduce.js"(exports, module2) {
    init_shims();
    var _isArrayLike = require_isArrayLike();
    var _xwrap = require_xwrap();
    var bind = require_bind();
    function _arrayReduce(xf, acc, list) {
      var idx = 0;
      var len = list.length;
      while (idx < len) {
        acc = xf["@@transducer/step"](acc, list[idx]);
        if (acc && acc["@@transducer/reduced"]) {
          acc = acc["@@transducer/value"];
          break;
        }
        idx += 1;
      }
      return xf["@@transducer/result"](acc);
    }
    function _iterableReduce(xf, acc, iter) {
      var step = iter.next();
      while (!step.done) {
        acc = xf["@@transducer/step"](acc, step.value);
        if (acc && acc["@@transducer/reduced"]) {
          acc = acc["@@transducer/value"];
          break;
        }
        step = iter.next();
      }
      return xf["@@transducer/result"](acc);
    }
    function _methodReduce(xf, acc, obj, methodName) {
      return xf["@@transducer/result"](obj[methodName](bind(xf["@@transducer/step"], xf), acc));
    }
    var symIterator = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";
    function _reduce(fn, acc, list) {
      if (typeof fn === "function") {
        fn = _xwrap(fn);
      }
      if (_isArrayLike(list)) {
        return _arrayReduce(fn, acc, list);
      }
      if (typeof list["fantasy-land/reduce"] === "function") {
        return _methodReduce(fn, acc, list, "fantasy-land/reduce");
      }
      if (list[symIterator] != null) {
        return _iterableReduce(fn, acc, list[symIterator]());
      }
      if (typeof list.next === "function") {
        return _iterableReduce(fn, acc, list);
      }
      if (typeof list.reduce === "function") {
        return _methodReduce(fn, acc, list, "reduce");
      }
      throw new TypeError("reduce: list must be array or iterable");
    }
    module2.exports = _reduce;
  }
});

// node_modules/ramda/src/internal/_xmap.js
var require_xmap = __commonJS({
  "node_modules/ramda/src/internal/_xmap.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _xfBase = require_xfBase();
    var XMap = /* @__PURE__ */ function() {
      function XMap2(f, xf) {
        this.xf = xf;
        this.f = f;
      }
      XMap2.prototype["@@transducer/init"] = _xfBase.init;
      XMap2.prototype["@@transducer/result"] = _xfBase.result;
      XMap2.prototype["@@transducer/step"] = function(result, input) {
        return this.xf["@@transducer/step"](result, this.f(input));
      };
      return XMap2;
    }();
    var _xmap = /* @__PURE__ */ _curry2(function _xmap2(f, xf) {
      return new XMap(f, xf);
    });
    module2.exports = _xmap;
  }
});

// node_modules/ramda/src/internal/_has.js
var require_has = __commonJS({
  "node_modules/ramda/src/internal/_has.js"(exports, module2) {
    init_shims();
    function _has(prop2, obj) {
      return Object.prototype.hasOwnProperty.call(obj, prop2);
    }
    module2.exports = _has;
  }
});

// node_modules/ramda/src/internal/_isArguments.js
var require_isArguments = __commonJS({
  "node_modules/ramda/src/internal/_isArguments.js"(exports, module2) {
    init_shims();
    var _has = require_has();
    var toString = Object.prototype.toString;
    var _isArguments = /* @__PURE__ */ function() {
      return toString.call(arguments) === "[object Arguments]" ? function _isArguments2(x) {
        return toString.call(x) === "[object Arguments]";
      } : function _isArguments2(x) {
        return _has("callee", x);
      };
    }();
    module2.exports = _isArguments;
  }
});

// node_modules/ramda/src/keys.js
var require_keys = __commonJS({
  "node_modules/ramda/src/keys.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var _has = require_has();
    var _isArguments = require_isArguments();
    var hasEnumBug = !/* @__PURE__ */ {
      toString: null
    }.propertyIsEnumerable("toString");
    var nonEnumerableProps = ["constructor", "valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];
    var hasArgsEnumBug = /* @__PURE__ */ function() {
      "use strict";
      return arguments.propertyIsEnumerable("length");
    }();
    var contains = function contains2(list, item) {
      var idx = 0;
      while (idx < list.length) {
        if (list[idx] === item) {
          return true;
        }
        idx += 1;
      }
      return false;
    };
    var keys = typeof Object.keys === "function" && !hasArgsEnumBug ? /* @__PURE__ */ _curry1(function keys2(obj) {
      return Object(obj) !== obj ? [] : Object.keys(obj);
    }) : /* @__PURE__ */ _curry1(function keys2(obj) {
      if (Object(obj) !== obj) {
        return [];
      }
      var prop2, nIdx;
      var ks = [];
      var checkArgsLength = hasArgsEnumBug && _isArguments(obj);
      for (prop2 in obj) {
        if (_has(prop2, obj) && (!checkArgsLength || prop2 !== "length")) {
          ks[ks.length] = prop2;
        }
      }
      if (hasEnumBug) {
        nIdx = nonEnumerableProps.length - 1;
        while (nIdx >= 0) {
          prop2 = nonEnumerableProps[nIdx];
          if (_has(prop2, obj) && !contains(ks, prop2)) {
            ks[ks.length] = prop2;
          }
          nIdx -= 1;
        }
      }
      return ks;
    });
    module2.exports = keys;
  }
});

// node_modules/ramda/src/map.js
var require_map2 = __commonJS({
  "node_modules/ramda/src/map.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _map = require_map();
    var _reduce = require_reduce();
    var _xmap = require_xmap();
    var curryN = require_curryN2();
    var keys = require_keys();
    var map2 = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["fantasy-land/map", "map"], _xmap, function map3(fn, functor) {
      switch (Object.prototype.toString.call(functor)) {
        case "[object Function]":
          return curryN(functor.length, function() {
            return fn.call(this, functor.apply(this, arguments));
          });
        case "[object Object]":
          return _reduce(function(acc, key) {
            acc[key] = fn(functor[key]);
            return acc;
          }, {}, keys(functor));
        default:
          return _map(fn, functor);
      }
    }));
    module2.exports = map2;
  }
});

// node_modules/ramda/src/internal/_isInteger.js
var require_isInteger = __commonJS({
  "node_modules/ramda/src/internal/_isInteger.js"(exports, module2) {
    init_shims();
    module2.exports = Number.isInteger || function _isInteger(n) {
      return n << 0 === n;
    };
  }
});

// node_modules/ramda/src/nth.js
var require_nth = __commonJS({
  "node_modules/ramda/src/nth.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _isString = require_isString();
    var nth = /* @__PURE__ */ _curry2(function nth2(offset, list) {
      var idx = offset < 0 ? list.length + offset : offset;
      return _isString(list) ? list.charAt(idx) : list[idx];
    });
    module2.exports = nth;
  }
});

// node_modules/ramda/src/paths.js
var require_paths = __commonJS({
  "node_modules/ramda/src/paths.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _isInteger = require_isInteger();
    var nth = require_nth();
    var paths = /* @__PURE__ */ _curry2(function paths2(pathsArray, obj) {
      return pathsArray.map(function(paths3) {
        var val = obj;
        var idx = 0;
        var p;
        while (idx < paths3.length) {
          if (val == null) {
            return;
          }
          p = paths3[idx];
          val = _isInteger(p) ? nth(p, val) : val[p];
          idx += 1;
        }
        return val;
      });
    });
    module2.exports = paths;
  }
});

// node_modules/ramda/src/path.js
var require_path = __commonJS({
  "node_modules/ramda/src/path.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var paths = require_paths();
    var path = /* @__PURE__ */ _curry2(function path2(pathAr, obj) {
      return paths([pathAr], obj)[0];
    });
    module2.exports = path;
  }
});

// node_modules/ramda/src/prop.js
var require_prop = __commonJS({
  "node_modules/ramda/src/prop.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var path = require_path();
    var prop2 = /* @__PURE__ */ _curry2(function prop3(p, obj) {
      return path([p], obj);
    });
    module2.exports = prop2;
  }
});

// node_modules/ramda/src/pluck.js
var require_pluck = __commonJS({
  "node_modules/ramda/src/pluck.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var map2 = require_map2();
    var prop2 = require_prop();
    var pluck = /* @__PURE__ */ _curry2(function pluck2(p, list) {
      return map2(prop2(p), list);
    });
    module2.exports = pluck;
  }
});

// node_modules/ramda/src/reduce.js
var require_reduce2 = __commonJS({
  "node_modules/ramda/src/reduce.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var _reduce = require_reduce();
    var reduce2 = /* @__PURE__ */ _curry3(_reduce);
    module2.exports = reduce2;
  }
});

// node_modules/ramda/src/allPass.js
var require_allPass = __commonJS({
  "node_modules/ramda/src/allPass.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var curryN = require_curryN2();
    var max = require_max();
    var pluck = require_pluck();
    var reduce2 = require_reduce2();
    var allPass = /* @__PURE__ */ _curry1(function allPass2(preds) {
      return curryN(reduce2(max, 0, pluck("length", preds)), function() {
        var idx = 0;
        var len = preds.length;
        while (idx < len) {
          if (!preds[idx].apply(this, arguments)) {
            return false;
          }
          idx += 1;
        }
        return true;
      });
    });
    module2.exports = allPass;
  }
});

// node_modules/ramda/src/always.js
var require_always = __commonJS({
  "node_modules/ramda/src/always.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var always = /* @__PURE__ */ _curry1(function always2(val) {
      return function() {
        return val;
      };
    });
    module2.exports = always;
  }
});

// node_modules/ramda/src/and.js
var require_and = __commonJS({
  "node_modules/ramda/src/and.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var and = /* @__PURE__ */ _curry2(function and2(a, b) {
      return a && b;
    });
    module2.exports = and;
  }
});

// node_modules/ramda/src/internal/_xany.js
var require_xany = __commonJS({
  "node_modules/ramda/src/internal/_xany.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _reduced = require_reduced();
    var _xfBase = require_xfBase();
    var XAny = /* @__PURE__ */ function() {
      function XAny2(f, xf) {
        this.xf = xf;
        this.f = f;
        this.any = false;
      }
      XAny2.prototype["@@transducer/init"] = _xfBase.init;
      XAny2.prototype["@@transducer/result"] = function(result) {
        if (!this.any) {
          result = this.xf["@@transducer/step"](result, false);
        }
        return this.xf["@@transducer/result"](result);
      };
      XAny2.prototype["@@transducer/step"] = function(result, input) {
        if (this.f(input)) {
          this.any = true;
          result = _reduced(this.xf["@@transducer/step"](result, true));
        }
        return result;
      };
      return XAny2;
    }();
    var _xany = /* @__PURE__ */ _curry2(function _xany2(f, xf) {
      return new XAny(f, xf);
    });
    module2.exports = _xany;
  }
});

// node_modules/ramda/src/any.js
var require_any = __commonJS({
  "node_modules/ramda/src/any.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xany = require_xany();
    var any = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["any"], _xany, function any2(fn, list) {
      var idx = 0;
      while (idx < list.length) {
        if (fn(list[idx])) {
          return true;
        }
        idx += 1;
      }
      return false;
    }));
    module2.exports = any;
  }
});

// node_modules/ramda/src/anyPass.js
var require_anyPass = __commonJS({
  "node_modules/ramda/src/anyPass.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var curryN = require_curryN2();
    var max = require_max();
    var pluck = require_pluck();
    var reduce2 = require_reduce2();
    var anyPass = /* @__PURE__ */ _curry1(function anyPass2(preds) {
      return curryN(reduce2(max, 0, pluck("length", preds)), function() {
        var idx = 0;
        var len = preds.length;
        while (idx < len) {
          if (preds[idx].apply(this, arguments)) {
            return true;
          }
          idx += 1;
        }
        return false;
      });
    });
    module2.exports = anyPass;
  }
});

// node_modules/ramda/src/ap.js
var require_ap = __commonJS({
  "node_modules/ramda/src/ap.js"(exports, module2) {
    init_shims();
    var _concat = require_concat();
    var _curry2 = require_curry2();
    var _reduce = require_reduce();
    var map2 = require_map2();
    var ap = /* @__PURE__ */ _curry2(function ap2(applyF, applyX) {
      return typeof applyX["fantasy-land/ap"] === "function" ? applyX["fantasy-land/ap"](applyF) : typeof applyF.ap === "function" ? applyF.ap(applyX) : typeof applyF === "function" ? function(x) {
        return applyF(x)(applyX(x));
      } : _reduce(function(acc, f) {
        return _concat(acc, map2(f, applyX));
      }, [], applyF);
    });
    module2.exports = ap;
  }
});

// node_modules/ramda/src/internal/_aperture.js
var require_aperture = __commonJS({
  "node_modules/ramda/src/internal/_aperture.js"(exports, module2) {
    init_shims();
    function _aperture(n, list) {
      var idx = 0;
      var limit = list.length - (n - 1);
      var acc = new Array(limit >= 0 ? limit : 0);
      while (idx < limit) {
        acc[idx] = Array.prototype.slice.call(list, idx, idx + n);
        idx += 1;
      }
      return acc;
    }
    module2.exports = _aperture;
  }
});

// node_modules/ramda/src/internal/_xaperture.js
var require_xaperture = __commonJS({
  "node_modules/ramda/src/internal/_xaperture.js"(exports, module2) {
    init_shims();
    var _concat = require_concat();
    var _curry2 = require_curry2();
    var _xfBase = require_xfBase();
    var XAperture = /* @__PURE__ */ function() {
      function XAperture2(n, xf) {
        this.xf = xf;
        this.pos = 0;
        this.full = false;
        this.acc = new Array(n);
      }
      XAperture2.prototype["@@transducer/init"] = _xfBase.init;
      XAperture2.prototype["@@transducer/result"] = function(result) {
        this.acc = null;
        return this.xf["@@transducer/result"](result);
      };
      XAperture2.prototype["@@transducer/step"] = function(result, input) {
        this.store(input);
        return this.full ? this.xf["@@transducer/step"](result, this.getCopy()) : result;
      };
      XAperture2.prototype.store = function(input) {
        this.acc[this.pos] = input;
        this.pos += 1;
        if (this.pos === this.acc.length) {
          this.pos = 0;
          this.full = true;
        }
      };
      XAperture2.prototype.getCopy = function() {
        return _concat(Array.prototype.slice.call(this.acc, this.pos), Array.prototype.slice.call(this.acc, 0, this.pos));
      };
      return XAperture2;
    }();
    var _xaperture = /* @__PURE__ */ _curry2(function _xaperture2(n, xf) {
      return new XAperture(n, xf);
    });
    module2.exports = _xaperture;
  }
});

// node_modules/ramda/src/aperture.js
var require_aperture2 = __commonJS({
  "node_modules/ramda/src/aperture.js"(exports, module2) {
    init_shims();
    var _aperture = require_aperture();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xaperture = require_xaperture();
    var aperture = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xaperture, _aperture));
    module2.exports = aperture;
  }
});

// node_modules/ramda/src/append.js
var require_append = __commonJS({
  "node_modules/ramda/src/append.js"(exports, module2) {
    init_shims();
    var _concat = require_concat();
    var _curry2 = require_curry2();
    var append2 = /* @__PURE__ */ _curry2(function append3(el, list) {
      return _concat(list, [el]);
    });
    module2.exports = append2;
  }
});

// node_modules/ramda/src/apply.js
var require_apply = __commonJS({
  "node_modules/ramda/src/apply.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var apply = /* @__PURE__ */ _curry2(function apply2(fn, args) {
      return fn.apply(this, args);
    });
    module2.exports = apply;
  }
});

// node_modules/ramda/src/values.js
var require_values = __commonJS({
  "node_modules/ramda/src/values.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var keys = require_keys();
    var values = /* @__PURE__ */ _curry1(function values2(obj) {
      var props = keys(obj);
      var len = props.length;
      var vals = [];
      var idx = 0;
      while (idx < len) {
        vals[idx] = obj[props[idx]];
        idx += 1;
      }
      return vals;
    });
    module2.exports = values;
  }
});

// node_modules/ramda/src/applySpec.js
var require_applySpec = __commonJS({
  "node_modules/ramda/src/applySpec.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var apply = require_apply();
    var curryN = require_curryN2();
    var max = require_max();
    var pluck = require_pluck();
    var reduce2 = require_reduce2();
    var keys = require_keys();
    var values = require_values();
    function mapValues(fn, obj) {
      return keys(obj).reduce(function(acc, key) {
        acc[key] = fn(obj[key]);
        return acc;
      }, {});
    }
    var applySpec = /* @__PURE__ */ _curry1(function applySpec2(spec) {
      spec = mapValues(function(v) {
        return typeof v == "function" ? v : applySpec2(v);
      }, spec);
      return curryN(reduce2(max, 0, pluck("length", values(spec))), function() {
        var args = arguments;
        return mapValues(function(f) {
          return apply(f, args);
        }, spec);
      });
    });
    module2.exports = applySpec;
  }
});

// node_modules/ramda/src/applyTo.js
var require_applyTo = __commonJS({
  "node_modules/ramda/src/applyTo.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var applyTo = /* @__PURE__ */ _curry2(function applyTo2(x, f) {
      return f(x);
    });
    module2.exports = applyTo;
  }
});

// node_modules/ramda/src/ascend.js
var require_ascend = __commonJS({
  "node_modules/ramda/src/ascend.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var ascend = /* @__PURE__ */ _curry3(function ascend2(fn, a, b) {
      var aa = fn(a);
      var bb = fn(b);
      return aa < bb ? -1 : aa > bb ? 1 : 0;
    });
    module2.exports = ascend;
  }
});

// node_modules/ramda/src/assoc.js
var require_assoc = __commonJS({
  "node_modules/ramda/src/assoc.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var assoc = /* @__PURE__ */ _curry3(function assoc2(prop2, val, obj) {
      var result = {};
      for (var p in obj) {
        result[p] = obj[p];
      }
      result[prop2] = val;
      return result;
    });
    module2.exports = assoc;
  }
});

// node_modules/ramda/src/isNil.js
var require_isNil = __commonJS({
  "node_modules/ramda/src/isNil.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var isNil = /* @__PURE__ */ _curry1(function isNil2(x) {
      return x == null;
    });
    module2.exports = isNil;
  }
});

// node_modules/ramda/src/assocPath.js
var require_assocPath = __commonJS({
  "node_modules/ramda/src/assocPath.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var _has = require_has();
    var _isArray = require_isArray();
    var _isInteger = require_isInteger();
    var assoc = require_assoc();
    var isNil = require_isNil();
    var assocPath = /* @__PURE__ */ _curry3(function assocPath2(path, val, obj) {
      if (path.length === 0) {
        return val;
      }
      var idx = path[0];
      if (path.length > 1) {
        var nextObj = !isNil(obj) && _has(idx, obj) ? obj[idx] : _isInteger(path[1]) ? [] : {};
        val = assocPath2(Array.prototype.slice.call(path, 1), val, nextObj);
      }
      if (_isInteger(idx) && _isArray(obj)) {
        var arr = [].concat(obj);
        arr[idx] = val;
        return arr;
      } else {
        return assoc(idx, val, obj);
      }
    });
    module2.exports = assocPath;
  }
});

// node_modules/ramda/src/nAry.js
var require_nAry = __commonJS({
  "node_modules/ramda/src/nAry.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var nAry = /* @__PURE__ */ _curry2(function nAry2(n, fn) {
      switch (n) {
        case 0:
          return function() {
            return fn.call(this);
          };
        case 1:
          return function(a0) {
            return fn.call(this, a0);
          };
        case 2:
          return function(a0, a1) {
            return fn.call(this, a0, a1);
          };
        case 3:
          return function(a0, a1, a2) {
            return fn.call(this, a0, a1, a2);
          };
        case 4:
          return function(a0, a1, a2, a3) {
            return fn.call(this, a0, a1, a2, a3);
          };
        case 5:
          return function(a0, a1, a2, a3, a4) {
            return fn.call(this, a0, a1, a2, a3, a4);
          };
        case 6:
          return function(a0, a1, a2, a3, a4, a5) {
            return fn.call(this, a0, a1, a2, a3, a4, a5);
          };
        case 7:
          return function(a0, a1, a2, a3, a4, a5, a6) {
            return fn.call(this, a0, a1, a2, a3, a4, a5, a6);
          };
        case 8:
          return function(a0, a1, a2, a3, a4, a5, a6, a7) {
            return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7);
          };
        case 9:
          return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
            return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8);
          };
        case 10:
          return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
            return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
          };
        default:
          throw new Error("First argument to nAry must be a non-negative integer no greater than ten");
      }
    });
    module2.exports = nAry;
  }
});

// node_modules/ramda/src/binary.js
var require_binary = __commonJS({
  "node_modules/ramda/src/binary.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var nAry = require_nAry();
    var binary = /* @__PURE__ */ _curry1(function binary2(fn) {
      return nAry(2, fn);
    });
    module2.exports = binary;
  }
});

// node_modules/ramda/src/internal/_isFunction.js
var require_isFunction = __commonJS({
  "node_modules/ramda/src/internal/_isFunction.js"(exports, module2) {
    init_shims();
    function _isFunction(x) {
      var type = Object.prototype.toString.call(x);
      return type === "[object Function]" || type === "[object AsyncFunction]" || type === "[object GeneratorFunction]" || type === "[object AsyncGeneratorFunction]";
    }
    module2.exports = _isFunction;
  }
});

// node_modules/ramda/src/liftN.js
var require_liftN = __commonJS({
  "node_modules/ramda/src/liftN.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _reduce = require_reduce();
    var ap = require_ap();
    var curryN = require_curryN2();
    var map2 = require_map2();
    var liftN = /* @__PURE__ */ _curry2(function liftN2(arity, fn) {
      var lifted = curryN(arity, fn);
      return curryN(arity, function() {
        return _reduce(ap, map2(lifted, arguments[0]), Array.prototype.slice.call(arguments, 1));
      });
    });
    module2.exports = liftN;
  }
});

// node_modules/ramda/src/lift.js
var require_lift = __commonJS({
  "node_modules/ramda/src/lift.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var liftN = require_liftN();
    var lift = /* @__PURE__ */ _curry1(function lift2(fn) {
      return liftN(fn.length, fn);
    });
    module2.exports = lift;
  }
});

// node_modules/ramda/src/both.js
var require_both = __commonJS({
  "node_modules/ramda/src/both.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _isFunction = require_isFunction();
    var and = require_and();
    var lift = require_lift();
    var both = /* @__PURE__ */ _curry2(function both2(f, g) {
      return _isFunction(f) ? function _both() {
        return f.apply(this, arguments) && g.apply(this, arguments);
      } : lift(and)(f, g);
    });
    module2.exports = both;
  }
});

// node_modules/ramda/src/curry.js
var require_curry = __commonJS({
  "node_modules/ramda/src/curry.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var curryN = require_curryN2();
    var curry = /* @__PURE__ */ _curry1(function curry2(fn) {
      return curryN(fn.length, fn);
    });
    module2.exports = curry;
  }
});

// node_modules/ramda/src/call.js
var require_call = __commonJS({
  "node_modules/ramda/src/call.js"(exports, module2) {
    init_shims();
    var curry = require_curry();
    var call = /* @__PURE__ */ curry(function call2(fn) {
      return fn.apply(this, Array.prototype.slice.call(arguments, 1));
    });
    module2.exports = call;
  }
});

// node_modules/ramda/src/internal/_makeFlat.js
var require_makeFlat = __commonJS({
  "node_modules/ramda/src/internal/_makeFlat.js"(exports, module2) {
    init_shims();
    var _isArrayLike = require_isArrayLike();
    function _makeFlat(recursive) {
      return function flatt(list) {
        var value, jlen, j;
        var result = [];
        var idx = 0;
        var ilen = list.length;
        while (idx < ilen) {
          if (_isArrayLike(list[idx])) {
            value = recursive ? flatt(list[idx]) : list[idx];
            j = 0;
            jlen = value.length;
            while (j < jlen) {
              result[result.length] = value[j];
              j += 1;
            }
          } else {
            result[result.length] = list[idx];
          }
          idx += 1;
        }
        return result;
      };
    }
    module2.exports = _makeFlat;
  }
});

// node_modules/ramda/src/internal/_forceReduced.js
var require_forceReduced = __commonJS({
  "node_modules/ramda/src/internal/_forceReduced.js"(exports, module2) {
    init_shims();
    function _forceReduced(x) {
      return {
        "@@transducer/value": x,
        "@@transducer/reduced": true
      };
    }
    module2.exports = _forceReduced;
  }
});

// node_modules/ramda/src/internal/_flatCat.js
var require_flatCat = __commonJS({
  "node_modules/ramda/src/internal/_flatCat.js"(exports, module2) {
    init_shims();
    var _forceReduced = require_forceReduced();
    var _isArrayLike = require_isArrayLike();
    var _reduce = require_reduce();
    var _xfBase = require_xfBase();
    var preservingReduced = function(xf) {
      return {
        "@@transducer/init": _xfBase.init,
        "@@transducer/result": function(result) {
          return xf["@@transducer/result"](result);
        },
        "@@transducer/step": function(result, input) {
          var ret = xf["@@transducer/step"](result, input);
          return ret["@@transducer/reduced"] ? _forceReduced(ret) : ret;
        }
      };
    };
    var _flatCat = function _xcat(xf) {
      var rxf = preservingReduced(xf);
      return {
        "@@transducer/init": _xfBase.init,
        "@@transducer/result": function(result) {
          return rxf["@@transducer/result"](result);
        },
        "@@transducer/step": function(result, input) {
          return !_isArrayLike(input) ? _reduce(rxf, result, [input]) : _reduce(rxf, result, input);
        }
      };
    };
    module2.exports = _flatCat;
  }
});

// node_modules/ramda/src/internal/_xchain.js
var require_xchain = __commonJS({
  "node_modules/ramda/src/internal/_xchain.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _flatCat = require_flatCat();
    var map2 = require_map2();
    var _xchain = /* @__PURE__ */ _curry2(function _xchain2(f, xf) {
      return map2(f, _flatCat(xf));
    });
    module2.exports = _xchain;
  }
});

// node_modules/ramda/src/chain.js
var require_chain = __commonJS({
  "node_modules/ramda/src/chain.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _makeFlat = require_makeFlat();
    var _xchain = require_xchain();
    var map2 = require_map2();
    var chain = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["fantasy-land/chain", "chain"], _xchain, function chain2(fn, monad) {
      if (typeof monad === "function") {
        return function(x) {
          return fn(monad(x))(x);
        };
      }
      return _makeFlat(false)(map2(fn, monad));
    }));
    module2.exports = chain;
  }
});

// node_modules/ramda/src/clamp.js
var require_clamp = __commonJS({
  "node_modules/ramda/src/clamp.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var clamp = /* @__PURE__ */ _curry3(function clamp2(min, max, value) {
      if (min > max) {
        throw new Error("min must not be greater than max in clamp(min, max, value)");
      }
      return value < min ? min : value > max ? max : value;
    });
    module2.exports = clamp;
  }
});

// node_modules/ramda/src/internal/_cloneRegExp.js
var require_cloneRegExp = __commonJS({
  "node_modules/ramda/src/internal/_cloneRegExp.js"(exports, module2) {
    init_shims();
    function _cloneRegExp(pattern) {
      return new RegExp(pattern.source, (pattern.global ? "g" : "") + (pattern.ignoreCase ? "i" : "") + (pattern.multiline ? "m" : "") + (pattern.sticky ? "y" : "") + (pattern.unicode ? "u" : ""));
    }
    module2.exports = _cloneRegExp;
  }
});

// node_modules/ramda/src/type.js
var require_type = __commonJS({
  "node_modules/ramda/src/type.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var type = /* @__PURE__ */ _curry1(function type2(val) {
      return val === null ? "Null" : val === void 0 ? "Undefined" : Object.prototype.toString.call(val).slice(8, -1);
    });
    module2.exports = type;
  }
});

// node_modules/ramda/src/internal/_clone.js
var require_clone = __commonJS({
  "node_modules/ramda/src/internal/_clone.js"(exports, module2) {
    init_shims();
    var _cloneRegExp = require_cloneRegExp();
    var type = require_type();
    function _clone(value, refFrom, refTo, deep) {
      var copy = function copy2(copiedValue) {
        var len = refFrom.length;
        var idx = 0;
        while (idx < len) {
          if (value === refFrom[idx]) {
            return refTo[idx];
          }
          idx += 1;
        }
        refFrom[idx + 1] = value;
        refTo[idx + 1] = copiedValue;
        for (var key in value) {
          copiedValue[key] = deep ? _clone(value[key], refFrom, refTo, true) : value[key];
        }
        return copiedValue;
      };
      switch (type(value)) {
        case "Object":
          return copy({});
        case "Array":
          return copy([]);
        case "Date":
          return new Date(value.valueOf());
        case "RegExp":
          return _cloneRegExp(value);
        default:
          return value;
      }
    }
    module2.exports = _clone;
  }
});

// node_modules/ramda/src/clone.js
var require_clone2 = __commonJS({
  "node_modules/ramda/src/clone.js"(exports, module2) {
    init_shims();
    var _clone = require_clone();
    var _curry1 = require_curry1();
    var clone2 = /* @__PURE__ */ _curry1(function clone3(value) {
      return value != null && typeof value.clone === "function" ? value.clone() : _clone(value, [], [], true);
    });
    module2.exports = clone2;
  }
});

// node_modules/ramda/src/comparator.js
var require_comparator = __commonJS({
  "node_modules/ramda/src/comparator.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var comparator = /* @__PURE__ */ _curry1(function comparator2(pred) {
      return function(a, b) {
        return pred(a, b) ? -1 : pred(b, a) ? 1 : 0;
      };
    });
    module2.exports = comparator;
  }
});

// node_modules/ramda/src/not.js
var require_not = __commonJS({
  "node_modules/ramda/src/not.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var not = /* @__PURE__ */ _curry1(function not2(a) {
      return !a;
    });
    module2.exports = not;
  }
});

// node_modules/ramda/src/complement.js
var require_complement = __commonJS({
  "node_modules/ramda/src/complement.js"(exports, module2) {
    init_shims();
    var lift = require_lift();
    var not = require_not();
    var complement2 = /* @__PURE__ */ lift(not);
    module2.exports = complement2;
  }
});

// node_modules/ramda/src/internal/_pipe.js
var require_pipe = __commonJS({
  "node_modules/ramda/src/internal/_pipe.js"(exports, module2) {
    init_shims();
    function _pipe(f, g) {
      return function() {
        return g.call(this, f.apply(this, arguments));
      };
    }
    module2.exports = _pipe;
  }
});

// node_modules/ramda/src/internal/_checkForMethod.js
var require_checkForMethod = __commonJS({
  "node_modules/ramda/src/internal/_checkForMethod.js"(exports, module2) {
    init_shims();
    var _isArray = require_isArray();
    function _checkForMethod(methodname, fn) {
      return function() {
        var length = arguments.length;
        if (length === 0) {
          return fn();
        }
        var obj = arguments[length - 1];
        return _isArray(obj) || typeof obj[methodname] !== "function" ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length - 1));
      };
    }
    module2.exports = _checkForMethod;
  }
});

// node_modules/ramda/src/slice.js
var require_slice = __commonJS({
  "node_modules/ramda/src/slice.js"(exports, module2) {
    init_shims();
    var _checkForMethod = require_checkForMethod();
    var _curry3 = require_curry3();
    var slice = /* @__PURE__ */ _curry3(/* @__PURE__ */ _checkForMethod("slice", function slice2(fromIndex, toIndex, list) {
      return Array.prototype.slice.call(list, fromIndex, toIndex);
    }));
    module2.exports = slice;
  }
});

// node_modules/ramda/src/tail.js
var require_tail = __commonJS({
  "node_modules/ramda/src/tail.js"(exports, module2) {
    init_shims();
    var _checkForMethod = require_checkForMethod();
    var _curry1 = require_curry1();
    var slice = require_slice();
    var tail = /* @__PURE__ */ _curry1(/* @__PURE__ */ _checkForMethod("tail", /* @__PURE__ */ slice(1, Infinity)));
    module2.exports = tail;
  }
});

// node_modules/ramda/src/pipe.js
var require_pipe2 = __commonJS({
  "node_modules/ramda/src/pipe.js"(exports, module2) {
    init_shims();
    var _arity = require_arity();
    var _pipe = require_pipe();
    var reduce2 = require_reduce2();
    var tail = require_tail();
    function pipe2() {
      if (arguments.length === 0) {
        throw new Error("pipe requires at least one argument");
      }
      return _arity(arguments[0].length, reduce2(_pipe, arguments[0], tail(arguments)));
    }
    module2.exports = pipe2;
  }
});

// node_modules/ramda/src/reverse.js
var require_reverse = __commonJS({
  "node_modules/ramda/src/reverse.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var _isString = require_isString();
    var reverse = /* @__PURE__ */ _curry1(function reverse2(list) {
      return _isString(list) ? list.split("").reverse().join("") : Array.prototype.slice.call(list, 0).reverse();
    });
    module2.exports = reverse;
  }
});

// node_modules/ramda/src/compose.js
var require_compose = __commonJS({
  "node_modules/ramda/src/compose.js"(exports, module2) {
    init_shims();
    var pipe2 = require_pipe2();
    var reverse = require_reverse();
    function compose() {
      if (arguments.length === 0) {
        throw new Error("compose requires at least one argument");
      }
      return pipe2.apply(this, reverse(arguments));
    }
    module2.exports = compose;
  }
});

// node_modules/ramda/src/composeK.js
var require_composeK = __commonJS({
  "node_modules/ramda/src/composeK.js"(exports, module2) {
    init_shims();
    var chain = require_chain();
    var compose = require_compose();
    var map2 = require_map2();
    function composeK() {
      if (arguments.length === 0) {
        throw new Error("composeK requires at least one argument");
      }
      var init2 = Array.prototype.slice.call(arguments);
      var last = init2.pop();
      return compose(compose.apply(this, map2(chain, init2)), last);
    }
    module2.exports = composeK;
  }
});

// node_modules/ramda/src/internal/_pipeP.js
var require_pipeP = __commonJS({
  "node_modules/ramda/src/internal/_pipeP.js"(exports, module2) {
    init_shims();
    function _pipeP(f, g) {
      return function() {
        var ctx = this;
        return f.apply(ctx, arguments).then(function(x) {
          return g.call(ctx, x);
        });
      };
    }
    module2.exports = _pipeP;
  }
});

// node_modules/ramda/src/pipeP.js
var require_pipeP2 = __commonJS({
  "node_modules/ramda/src/pipeP.js"(exports, module2) {
    init_shims();
    var _arity = require_arity();
    var _pipeP = require_pipeP();
    var reduce2 = require_reduce2();
    var tail = require_tail();
    function pipeP() {
      if (arguments.length === 0) {
        throw new Error("pipeP requires at least one argument");
      }
      return _arity(arguments[0].length, reduce2(_pipeP, arguments[0], tail(arguments)));
    }
    module2.exports = pipeP;
  }
});

// node_modules/ramda/src/composeP.js
var require_composeP = __commonJS({
  "node_modules/ramda/src/composeP.js"(exports, module2) {
    init_shims();
    var pipeP = require_pipeP2();
    var reverse = require_reverse();
    function composeP() {
      if (arguments.length === 0) {
        throw new Error("composeP requires at least one argument");
      }
      return pipeP.apply(this, reverse(arguments));
    }
    module2.exports = composeP;
  }
});

// node_modules/ramda/src/head.js
var require_head = __commonJS({
  "node_modules/ramda/src/head.js"(exports, module2) {
    init_shims();
    var nth = require_nth();
    var head = /* @__PURE__ */ nth(0);
    module2.exports = head;
  }
});

// node_modules/ramda/src/internal/_identity.js
var require_identity = __commonJS({
  "node_modules/ramda/src/internal/_identity.js"(exports, module2) {
    init_shims();
    function _identity(x) {
      return x;
    }
    module2.exports = _identity;
  }
});

// node_modules/ramda/src/identity.js
var require_identity2 = __commonJS({
  "node_modules/ramda/src/identity.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var _identity = require_identity();
    var identity = /* @__PURE__ */ _curry1(_identity);
    module2.exports = identity;
  }
});

// node_modules/ramda/src/pipeWith.js
var require_pipeWith = __commonJS({
  "node_modules/ramda/src/pipeWith.js"(exports, module2) {
    init_shims();
    var _arity = require_arity();
    var _curry2 = require_curry2();
    var head = require_head();
    var _reduce = require_reduce();
    var tail = require_tail();
    var identity = require_identity2();
    var pipeWith = /* @__PURE__ */ _curry2(function pipeWith2(xf, list) {
      if (list.length <= 0) {
        return identity;
      }
      var headList = head(list);
      var tailList = tail(list);
      return _arity(headList.length, function() {
        return _reduce(function(result, f) {
          return xf.call(this, f, result);
        }, headList.apply(this, arguments), tailList);
      });
    });
    module2.exports = pipeWith;
  }
});

// node_modules/ramda/src/composeWith.js
var require_composeWith = __commonJS({
  "node_modules/ramda/src/composeWith.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var pipeWith = require_pipeWith();
    var reverse = require_reverse();
    var composeWith = /* @__PURE__ */ _curry2(function composeWith2(xf, list) {
      return pipeWith.apply(this, [xf, reverse(list)]);
    });
    module2.exports = composeWith;
  }
});

// node_modules/ramda/src/internal/_arrayFromIterator.js
var require_arrayFromIterator = __commonJS({
  "node_modules/ramda/src/internal/_arrayFromIterator.js"(exports, module2) {
    init_shims();
    function _arrayFromIterator(iter) {
      var list = [];
      var next;
      while (!(next = iter.next()).done) {
        list.push(next.value);
      }
      return list;
    }
    module2.exports = _arrayFromIterator;
  }
});

// node_modules/ramda/src/internal/_includesWith.js
var require_includesWith = __commonJS({
  "node_modules/ramda/src/internal/_includesWith.js"(exports, module2) {
    init_shims();
    function _includesWith(pred, x, list) {
      var idx = 0;
      var len = list.length;
      while (idx < len) {
        if (pred(x, list[idx])) {
          return true;
        }
        idx += 1;
      }
      return false;
    }
    module2.exports = _includesWith;
  }
});

// node_modules/ramda/src/internal/_functionName.js
var require_functionName = __commonJS({
  "node_modules/ramda/src/internal/_functionName.js"(exports, module2) {
    init_shims();
    function _functionName(f) {
      var match = String(f).match(/^function (\w*)/);
      return match == null ? "" : match[1];
    }
    module2.exports = _functionName;
  }
});

// node_modules/ramda/src/internal/_objectIs.js
var require_objectIs = __commonJS({
  "node_modules/ramda/src/internal/_objectIs.js"(exports, module2) {
    init_shims();
    function _objectIs(a, b) {
      if (a === b) {
        return a !== 0 || 1 / a === 1 / b;
      } else {
        return a !== a && b !== b;
      }
    }
    module2.exports = typeof Object.is === "function" ? Object.is : _objectIs;
  }
});

// node_modules/ramda/src/internal/_equals.js
var require_equals = __commonJS({
  "node_modules/ramda/src/internal/_equals.js"(exports, module2) {
    init_shims();
    var _arrayFromIterator = require_arrayFromIterator();
    var _includesWith = require_includesWith();
    var _functionName = require_functionName();
    var _has = require_has();
    var _objectIs = require_objectIs();
    var keys = require_keys();
    var type = require_type();
    function _uniqContentEquals(aIterator, bIterator, stackA, stackB) {
      var a = _arrayFromIterator(aIterator);
      var b = _arrayFromIterator(bIterator);
      function eq(_a, _b) {
        return _equals(_a, _b, stackA.slice(), stackB.slice());
      }
      return !_includesWith(function(b2, aItem) {
        return !_includesWith(eq, aItem, b2);
      }, b, a);
    }
    function _equals(a, b, stackA, stackB) {
      if (_objectIs(a, b)) {
        return true;
      }
      var typeA = type(a);
      if (typeA !== type(b)) {
        return false;
      }
      if (a == null || b == null) {
        return false;
      }
      if (typeof a["fantasy-land/equals"] === "function" || typeof b["fantasy-land/equals"] === "function") {
        return typeof a["fantasy-land/equals"] === "function" && a["fantasy-land/equals"](b) && typeof b["fantasy-land/equals"] === "function" && b["fantasy-land/equals"](a);
      }
      if (typeof a.equals === "function" || typeof b.equals === "function") {
        return typeof a.equals === "function" && a.equals(b) && typeof b.equals === "function" && b.equals(a);
      }
      switch (typeA) {
        case "Arguments":
        case "Array":
        case "Object":
          if (typeof a.constructor === "function" && _functionName(a.constructor) === "Promise") {
            return a === b;
          }
          break;
        case "Boolean":
        case "Number":
        case "String":
          if (!(typeof a === typeof b && _objectIs(a.valueOf(), b.valueOf()))) {
            return false;
          }
          break;
        case "Date":
          if (!_objectIs(a.valueOf(), b.valueOf())) {
            return false;
          }
          break;
        case "Error":
          return a.name === b.name && a.message === b.message;
        case "RegExp":
          if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
            return false;
          }
          break;
      }
      var idx = stackA.length - 1;
      while (idx >= 0) {
        if (stackA[idx] === a) {
          return stackB[idx] === b;
        }
        idx -= 1;
      }
      switch (typeA) {
        case "Map":
          if (a.size !== b.size) {
            return false;
          }
          return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]));
        case "Set":
          if (a.size !== b.size) {
            return false;
          }
          return _uniqContentEquals(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]));
        case "Arguments":
        case "Array":
        case "Object":
        case "Boolean":
        case "Number":
        case "String":
        case "Date":
        case "Error":
        case "RegExp":
        case "Int8Array":
        case "Uint8Array":
        case "Uint8ClampedArray":
        case "Int16Array":
        case "Uint16Array":
        case "Int32Array":
        case "Uint32Array":
        case "Float32Array":
        case "Float64Array":
        case "ArrayBuffer":
          break;
        default:
          return false;
      }
      var keysA = keys(a);
      if (keysA.length !== keys(b).length) {
        return false;
      }
      var extendedStackA = stackA.concat([a]);
      var extendedStackB = stackB.concat([b]);
      idx = keysA.length - 1;
      while (idx >= 0) {
        var key = keysA[idx];
        if (!(_has(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) {
          return false;
        }
        idx -= 1;
      }
      return true;
    }
    module2.exports = _equals;
  }
});

// node_modules/ramda/src/equals.js
var require_equals2 = __commonJS({
  "node_modules/ramda/src/equals.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _equals = require_equals();
    var equals = /* @__PURE__ */ _curry2(function equals2(a, b) {
      return _equals(a, b, [], []);
    });
    module2.exports = equals;
  }
});

// node_modules/ramda/src/internal/_indexOf.js
var require_indexOf = __commonJS({
  "node_modules/ramda/src/internal/_indexOf.js"(exports, module2) {
    init_shims();
    var equals = require_equals2();
    function _indexOf(list, a, idx) {
      var inf, item;
      if (typeof list.indexOf === "function") {
        switch (typeof a) {
          case "number":
            if (a === 0) {
              inf = 1 / a;
              while (idx < list.length) {
                item = list[idx];
                if (item === 0 && 1 / item === inf) {
                  return idx;
                }
                idx += 1;
              }
              return -1;
            } else if (a !== a) {
              while (idx < list.length) {
                item = list[idx];
                if (typeof item === "number" && item !== item) {
                  return idx;
                }
                idx += 1;
              }
              return -1;
            }
            return list.indexOf(a, idx);
          case "string":
          case "boolean":
          case "function":
          case "undefined":
            return list.indexOf(a, idx);
          case "object":
            if (a === null) {
              return list.indexOf(a, idx);
            }
        }
      }
      while (idx < list.length) {
        if (equals(list[idx], a)) {
          return idx;
        }
        idx += 1;
      }
      return -1;
    }
    module2.exports = _indexOf;
  }
});

// node_modules/ramda/src/internal/_includes.js
var require_includes = __commonJS({
  "node_modules/ramda/src/internal/_includes.js"(exports, module2) {
    init_shims();
    var _indexOf = require_indexOf();
    function _includes(a, list) {
      return _indexOf(list, a, 0) >= 0;
    }
    module2.exports = _includes;
  }
});

// node_modules/ramda/src/internal/_quote.js
var require_quote = __commonJS({
  "node_modules/ramda/src/internal/_quote.js"(exports, module2) {
    init_shims();
    function _quote(s2) {
      var escaped3 = s2.replace(/\\/g, "\\\\").replace(/[\b]/g, "\\b").replace(/\f/g, "\\f").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\v/g, "\\v").replace(/\0/g, "\\0");
      return '"' + escaped3.replace(/"/g, '\\"') + '"';
    }
    module2.exports = _quote;
  }
});

// node_modules/ramda/src/internal/_toISOString.js
var require_toISOString = __commonJS({
  "node_modules/ramda/src/internal/_toISOString.js"(exports, module2) {
    init_shims();
    var pad = function pad2(n) {
      return (n < 10 ? "0" : "") + n;
    };
    var _toISOString = typeof Date.prototype.toISOString === "function" ? function _toISOString2(d2) {
      return d2.toISOString();
    } : function _toISOString2(d2) {
      return d2.getUTCFullYear() + "-" + pad(d2.getUTCMonth() + 1) + "-" + pad(d2.getUTCDate()) + "T" + pad(d2.getUTCHours()) + ":" + pad(d2.getUTCMinutes()) + ":" + pad(d2.getUTCSeconds()) + "." + (d2.getUTCMilliseconds() / 1e3).toFixed(3).slice(2, 5) + "Z";
    };
    module2.exports = _toISOString;
  }
});

// node_modules/ramda/src/internal/_complement.js
var require_complement2 = __commonJS({
  "node_modules/ramda/src/internal/_complement.js"(exports, module2) {
    init_shims();
    function _complement(f) {
      return function() {
        return !f.apply(this, arguments);
      };
    }
    module2.exports = _complement;
  }
});

// node_modules/ramda/src/internal/_filter.js
var require_filter = __commonJS({
  "node_modules/ramda/src/internal/_filter.js"(exports, module2) {
    init_shims();
    function _filter(fn, list) {
      var idx = 0;
      var len = list.length;
      var result = [];
      while (idx < len) {
        if (fn(list[idx])) {
          result[result.length] = list[idx];
        }
        idx += 1;
      }
      return result;
    }
    module2.exports = _filter;
  }
});

// node_modules/ramda/src/internal/_isObject.js
var require_isObject = __commonJS({
  "node_modules/ramda/src/internal/_isObject.js"(exports, module2) {
    init_shims();
    function _isObject(x) {
      return Object.prototype.toString.call(x) === "[object Object]";
    }
    module2.exports = _isObject;
  }
});

// node_modules/ramda/src/internal/_xfilter.js
var require_xfilter = __commonJS({
  "node_modules/ramda/src/internal/_xfilter.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _xfBase = require_xfBase();
    var XFilter = /* @__PURE__ */ function() {
      function XFilter2(f, xf) {
        this.xf = xf;
        this.f = f;
      }
      XFilter2.prototype["@@transducer/init"] = _xfBase.init;
      XFilter2.prototype["@@transducer/result"] = _xfBase.result;
      XFilter2.prototype["@@transducer/step"] = function(result, input) {
        return this.f(input) ? this.xf["@@transducer/step"](result, input) : result;
      };
      return XFilter2;
    }();
    var _xfilter = /* @__PURE__ */ _curry2(function _xfilter2(f, xf) {
      return new XFilter(f, xf);
    });
    module2.exports = _xfilter;
  }
});

// node_modules/ramda/src/filter.js
var require_filter2 = __commonJS({
  "node_modules/ramda/src/filter.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _filter = require_filter();
    var _isObject = require_isObject();
    var _reduce = require_reduce();
    var _xfilter = require_xfilter();
    var keys = require_keys();
    var filter = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["filter"], _xfilter, function(pred, filterable) {
      return _isObject(filterable) ? _reduce(function(acc, key) {
        if (pred(filterable[key])) {
          acc[key] = filterable[key];
        }
        return acc;
      }, {}, keys(filterable)) : _filter(pred, filterable);
    }));
    module2.exports = filter;
  }
});

// node_modules/ramda/src/reject.js
var require_reject = __commonJS({
  "node_modules/ramda/src/reject.js"(exports, module2) {
    init_shims();
    var _complement = require_complement2();
    var _curry2 = require_curry2();
    var filter = require_filter2();
    var reject2 = /* @__PURE__ */ _curry2(function reject3(pred, filterable) {
      return filter(_complement(pred), filterable);
    });
    module2.exports = reject2;
  }
});

// node_modules/ramda/src/internal/_toString.js
var require_toString = __commonJS({
  "node_modules/ramda/src/internal/_toString.js"(exports, module2) {
    init_shims();
    var _includes = require_includes();
    var _map = require_map();
    var _quote = require_quote();
    var _toISOString = require_toISOString();
    var keys = require_keys();
    var reject2 = require_reject();
    function _toString(x, seen) {
      var recur = function recur2(y) {
        var xs = seen.concat([x]);
        return _includes(y, xs) ? "<Circular>" : _toString(y, xs);
      };
      var mapPairs = function(obj, keys2) {
        return _map(function(k) {
          return _quote(k) + ": " + recur(obj[k]);
        }, keys2.slice().sort());
      };
      switch (Object.prototype.toString.call(x)) {
        case "[object Arguments]":
          return "(function() { return arguments; }(" + _map(recur, x).join(", ") + "))";
        case "[object Array]":
          return "[" + _map(recur, x).concat(mapPairs(x, reject2(function(k) {
            return /^\d+$/.test(k);
          }, keys(x)))).join(", ") + "]";
        case "[object Boolean]":
          return typeof x === "object" ? "new Boolean(" + recur(x.valueOf()) + ")" : x.toString();
        case "[object Date]":
          return "new Date(" + (isNaN(x.valueOf()) ? recur(NaN) : _quote(_toISOString(x))) + ")";
        case "[object Null]":
          return "null";
        case "[object Number]":
          return typeof x === "object" ? "new Number(" + recur(x.valueOf()) + ")" : 1 / x === -Infinity ? "-0" : x.toString(10);
        case "[object String]":
          return typeof x === "object" ? "new String(" + recur(x.valueOf()) + ")" : _quote(x);
        case "[object Undefined]":
          return "undefined";
        default:
          if (typeof x.toString === "function") {
            var repr = x.toString();
            if (repr !== "[object Object]") {
              return repr;
            }
          }
          return "{" + mapPairs(x, keys(x)).join(", ") + "}";
      }
    }
    module2.exports = _toString;
  }
});

// node_modules/ramda/src/toString.js
var require_toString2 = __commonJS({
  "node_modules/ramda/src/toString.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var _toString = require_toString();
    var toString = /* @__PURE__ */ _curry1(function toString2(val) {
      return _toString(val, []);
    });
    module2.exports = toString;
  }
});

// node_modules/ramda/src/concat.js
var require_concat2 = __commonJS({
  "node_modules/ramda/src/concat.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _isArray = require_isArray();
    var _isFunction = require_isFunction();
    var _isString = require_isString();
    var toString = require_toString2();
    var concat = /* @__PURE__ */ _curry2(function concat2(a, b) {
      if (_isArray(a)) {
        if (_isArray(b)) {
          return a.concat(b);
        }
        throw new TypeError(toString(b) + " is not an array");
      }
      if (_isString(a)) {
        if (_isString(b)) {
          return a + b;
        }
        throw new TypeError(toString(b) + " is not a string");
      }
      if (a != null && _isFunction(a["fantasy-land/concat"])) {
        return a["fantasy-land/concat"](b);
      }
      if (a != null && _isFunction(a.concat)) {
        return a.concat(b);
      }
      throw new TypeError(toString(a) + ' does not have a method named "concat" or "fantasy-land/concat"');
    });
    module2.exports = concat;
  }
});

// node_modules/ramda/src/cond.js
var require_cond = __commonJS({
  "node_modules/ramda/src/cond.js"(exports, module2) {
    init_shims();
    var _arity = require_arity();
    var _curry1 = require_curry1();
    var map2 = require_map2();
    var max = require_max();
    var reduce2 = require_reduce2();
    var cond = /* @__PURE__ */ _curry1(function cond2(pairs) {
      var arity = reduce2(max, 0, map2(function(pair) {
        return pair[0].length;
      }, pairs));
      return _arity(arity, function() {
        var idx = 0;
        while (idx < pairs.length) {
          if (pairs[idx][0].apply(this, arguments)) {
            return pairs[idx][1].apply(this, arguments);
          }
          idx += 1;
        }
      });
    });
    module2.exports = cond;
  }
});

// node_modules/ramda/src/constructN.js
var require_constructN = __commonJS({
  "node_modules/ramda/src/constructN.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var curry = require_curry();
    var nAry = require_nAry();
    var constructN = /* @__PURE__ */ _curry2(function constructN2(n, Fn) {
      if (n > 10) {
        throw new Error("Constructor with greater than ten arguments");
      }
      if (n === 0) {
        return function() {
          return new Fn();
        };
      }
      return curry(nAry(n, function($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) {
        switch (arguments.length) {
          case 1:
            return new Fn($0);
          case 2:
            return new Fn($0, $1);
          case 3:
            return new Fn($0, $1, $2);
          case 4:
            return new Fn($0, $1, $2, $3);
          case 5:
            return new Fn($0, $1, $2, $3, $4);
          case 6:
            return new Fn($0, $1, $2, $3, $4, $5);
          case 7:
            return new Fn($0, $1, $2, $3, $4, $5, $6);
          case 8:
            return new Fn($0, $1, $2, $3, $4, $5, $6, $7);
          case 9:
            return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8);
          case 10:
            return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8, $9);
        }
      }));
    });
    module2.exports = constructN;
  }
});

// node_modules/ramda/src/construct.js
var require_construct = __commonJS({
  "node_modules/ramda/src/construct.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var constructN = require_constructN();
    var construct = /* @__PURE__ */ _curry1(function construct2(Fn) {
      return constructN(Fn.length, Fn);
    });
    module2.exports = construct;
  }
});

// node_modules/ramda/src/contains.js
var require_contains = __commonJS({
  "node_modules/ramda/src/contains.js"(exports, module2) {
    init_shims();
    var _includes = require_includes();
    var _curry2 = require_curry2();
    var contains = /* @__PURE__ */ _curry2(_includes);
    module2.exports = contains;
  }
});

// node_modules/ramda/src/converge.js
var require_converge = __commonJS({
  "node_modules/ramda/src/converge.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _map = require_map();
    var curryN = require_curryN2();
    var max = require_max();
    var pluck = require_pluck();
    var reduce2 = require_reduce2();
    var converge = /* @__PURE__ */ _curry2(function converge2(after, fns) {
      return curryN(reduce2(max, 0, pluck("length", fns)), function() {
        var args = arguments;
        var context = this;
        return after.apply(context, _map(function(fn) {
          return fn.apply(context, args);
        }, fns));
      });
    });
    module2.exports = converge;
  }
});

// node_modules/ramda/src/internal/_xreduceBy.js
var require_xreduceBy = __commonJS({
  "node_modules/ramda/src/internal/_xreduceBy.js"(exports, module2) {
    init_shims();
    var _curryN = require_curryN();
    var _has = require_has();
    var _xfBase = require_xfBase();
    var XReduceBy = /* @__PURE__ */ function() {
      function XReduceBy2(valueFn, valueAcc, keyFn, xf) {
        this.valueFn = valueFn;
        this.valueAcc = valueAcc;
        this.keyFn = keyFn;
        this.xf = xf;
        this.inputs = {};
      }
      XReduceBy2.prototype["@@transducer/init"] = _xfBase.init;
      XReduceBy2.prototype["@@transducer/result"] = function(result) {
        var key;
        for (key in this.inputs) {
          if (_has(key, this.inputs)) {
            result = this.xf["@@transducer/step"](result, this.inputs[key]);
            if (result["@@transducer/reduced"]) {
              result = result["@@transducer/value"];
              break;
            }
          }
        }
        this.inputs = null;
        return this.xf["@@transducer/result"](result);
      };
      XReduceBy2.prototype["@@transducer/step"] = function(result, input) {
        var key = this.keyFn(input);
        this.inputs[key] = this.inputs[key] || [key, this.valueAcc];
        this.inputs[key][1] = this.valueFn(this.inputs[key][1], input);
        return result;
      };
      return XReduceBy2;
    }();
    var _xreduceBy = /* @__PURE__ */ _curryN(4, [], function _xreduceBy2(valueFn, valueAcc, keyFn, xf) {
      return new XReduceBy(valueFn, valueAcc, keyFn, xf);
    });
    module2.exports = _xreduceBy;
  }
});

// node_modules/ramda/src/reduceBy.js
var require_reduceBy = __commonJS({
  "node_modules/ramda/src/reduceBy.js"(exports, module2) {
    init_shims();
    var _clone = require_clone();
    var _curryN = require_curryN();
    var _dispatchable = require_dispatchable();
    var _has = require_has();
    var _reduce = require_reduce();
    var _xreduceBy = require_xreduceBy();
    var reduceBy = /* @__PURE__ */ _curryN(4, [], /* @__PURE__ */ _dispatchable([], _xreduceBy, function reduceBy2(valueFn, valueAcc, keyFn, list) {
      return _reduce(function(acc, elt) {
        var key = keyFn(elt);
        acc[key] = valueFn(_has(key, acc) ? acc[key] : _clone(valueAcc, [], [], false), elt);
        return acc;
      }, {}, list);
    }));
    module2.exports = reduceBy;
  }
});

// node_modules/ramda/src/countBy.js
var require_countBy = __commonJS({
  "node_modules/ramda/src/countBy.js"(exports, module2) {
    init_shims();
    var reduceBy = require_reduceBy();
    var countBy = /* @__PURE__ */ reduceBy(function(acc, elem) {
      return acc + 1;
    }, 0);
    module2.exports = countBy;
  }
});

// node_modules/ramda/src/dec.js
var require_dec = __commonJS({
  "node_modules/ramda/src/dec.js"(exports, module2) {
    init_shims();
    var add = require_add();
    var dec = /* @__PURE__ */ add(-1);
    module2.exports = dec;
  }
});

// node_modules/ramda/src/defaultTo.js
var require_defaultTo = __commonJS({
  "node_modules/ramda/src/defaultTo.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var defaultTo = /* @__PURE__ */ _curry2(function defaultTo2(d2, v) {
      return v == null || v !== v ? d2 : v;
    });
    module2.exports = defaultTo;
  }
});

// node_modules/ramda/src/descend.js
var require_descend = __commonJS({
  "node_modules/ramda/src/descend.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var descend = /* @__PURE__ */ _curry3(function descend2(fn, a, b) {
      var aa = fn(a);
      var bb = fn(b);
      return aa > bb ? -1 : aa < bb ? 1 : 0;
    });
    module2.exports = descend;
  }
});

// node_modules/ramda/src/internal/_Set.js
var require_Set = __commonJS({
  "node_modules/ramda/src/internal/_Set.js"(exports, module2) {
    init_shims();
    var _includes = require_includes();
    var _Set = /* @__PURE__ */ function() {
      function _Set2() {
        this._nativeSet = typeof Set === "function" ? new Set() : null;
        this._items = {};
      }
      _Set2.prototype.add = function(item) {
        return !hasOrAdd(item, true, this);
      };
      _Set2.prototype.has = function(item) {
        return hasOrAdd(item, false, this);
      };
      return _Set2;
    }();
    function hasOrAdd(item, shouldAdd, set) {
      var type = typeof item;
      var prevSize, newSize;
      switch (type) {
        case "string":
        case "number":
          if (item === 0 && 1 / item === -Infinity) {
            if (set._items["-0"]) {
              return true;
            } else {
              if (shouldAdd) {
                set._items["-0"] = true;
              }
              return false;
            }
          }
          if (set._nativeSet !== null) {
            if (shouldAdd) {
              prevSize = set._nativeSet.size;
              set._nativeSet.add(item);
              newSize = set._nativeSet.size;
              return newSize === prevSize;
            } else {
              return set._nativeSet.has(item);
            }
          } else {
            if (!(type in set._items)) {
              if (shouldAdd) {
                set._items[type] = {};
                set._items[type][item] = true;
              }
              return false;
            } else if (item in set._items[type]) {
              return true;
            } else {
              if (shouldAdd) {
                set._items[type][item] = true;
              }
              return false;
            }
          }
        case "boolean":
          if (type in set._items) {
            var bIdx = item ? 1 : 0;
            if (set._items[type][bIdx]) {
              return true;
            } else {
              if (shouldAdd) {
                set._items[type][bIdx] = true;
              }
              return false;
            }
          } else {
            if (shouldAdd) {
              set._items[type] = item ? [false, true] : [true, false];
            }
            return false;
          }
        case "function":
          if (set._nativeSet !== null) {
            if (shouldAdd) {
              prevSize = set._nativeSet.size;
              set._nativeSet.add(item);
              newSize = set._nativeSet.size;
              return newSize === prevSize;
            } else {
              return set._nativeSet.has(item);
            }
          } else {
            if (!(type in set._items)) {
              if (shouldAdd) {
                set._items[type] = [item];
              }
              return false;
            }
            if (!_includes(item, set._items[type])) {
              if (shouldAdd) {
                set._items[type].push(item);
              }
              return false;
            }
            return true;
          }
        case "undefined":
          if (set._items[type]) {
            return true;
          } else {
            if (shouldAdd) {
              set._items[type] = true;
            }
            return false;
          }
        case "object":
          if (item === null) {
            if (!set._items["null"]) {
              if (shouldAdd) {
                set._items["null"] = true;
              }
              return false;
            }
            return true;
          }
        default:
          type = Object.prototype.toString.call(item);
          if (!(type in set._items)) {
            if (shouldAdd) {
              set._items[type] = [item];
            }
            return false;
          }
          if (!_includes(item, set._items[type])) {
            if (shouldAdd) {
              set._items[type].push(item);
            }
            return false;
          }
          return true;
      }
    }
    module2.exports = _Set;
  }
});

// node_modules/ramda/src/difference.js
var require_difference = __commonJS({
  "node_modules/ramda/src/difference.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _Set = require_Set();
    var difference = /* @__PURE__ */ _curry2(function difference2(first, second) {
      var out = [];
      var idx = 0;
      var firstLen = first.length;
      var secondLen = second.length;
      var toFilterOut = new _Set();
      for (var i = 0; i < secondLen; i += 1) {
        toFilterOut.add(second[i]);
      }
      while (idx < firstLen) {
        if (toFilterOut.add(first[idx])) {
          out[out.length] = first[idx];
        }
        idx += 1;
      }
      return out;
    });
    module2.exports = difference;
  }
});

// node_modules/ramda/src/differenceWith.js
var require_differenceWith = __commonJS({
  "node_modules/ramda/src/differenceWith.js"(exports, module2) {
    init_shims();
    var _includesWith = require_includesWith();
    var _curry3 = require_curry3();
    var differenceWith = /* @__PURE__ */ _curry3(function differenceWith2(pred, first, second) {
      var out = [];
      var idx = 0;
      var firstLen = first.length;
      while (idx < firstLen) {
        if (!_includesWith(pred, first[idx], second) && !_includesWith(pred, first[idx], out)) {
          out.push(first[idx]);
        }
        idx += 1;
      }
      return out;
    });
    module2.exports = differenceWith;
  }
});

// node_modules/ramda/src/dissoc.js
var require_dissoc = __commonJS({
  "node_modules/ramda/src/dissoc.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var dissoc = /* @__PURE__ */ _curry2(function dissoc2(prop2, obj) {
      var result = {};
      for (var p in obj) {
        result[p] = obj[p];
      }
      delete result[prop2];
      return result;
    });
    module2.exports = dissoc;
  }
});

// node_modules/ramda/src/remove.js
var require_remove = __commonJS({
  "node_modules/ramda/src/remove.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var remove = /* @__PURE__ */ _curry3(function remove2(start, count, list) {
      var result = Array.prototype.slice.call(list, 0);
      result.splice(start, count);
      return result;
    });
    module2.exports = remove;
  }
});

// node_modules/ramda/src/update.js
var require_update = __commonJS({
  "node_modules/ramda/src/update.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var adjust = require_adjust();
    var always = require_always();
    var update = /* @__PURE__ */ _curry3(function update2(idx, x, list) {
      return adjust(idx, always(x), list);
    });
    module2.exports = update;
  }
});

// node_modules/ramda/src/dissocPath.js
var require_dissocPath = __commonJS({
  "node_modules/ramda/src/dissocPath.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _isInteger = require_isInteger();
    var _isArray = require_isArray();
    var assoc = require_assoc();
    var dissoc = require_dissoc();
    var remove = require_remove();
    var update = require_update();
    var dissocPath = /* @__PURE__ */ _curry2(function dissocPath2(path, obj) {
      switch (path.length) {
        case 0:
          return obj;
        case 1:
          return _isInteger(path[0]) && _isArray(obj) ? remove(path[0], 1, obj) : dissoc(path[0], obj);
        default:
          var head = path[0];
          var tail = Array.prototype.slice.call(path, 1);
          if (obj[head] == null) {
            return obj;
          } else if (_isInteger(head) && _isArray(obj)) {
            return update(head, dissocPath2(tail, obj[head]), obj);
          } else {
            return assoc(head, dissocPath2(tail, obj[head]), obj);
          }
      }
    });
    module2.exports = dissocPath;
  }
});

// node_modules/ramda/src/divide.js
var require_divide = __commonJS({
  "node_modules/ramda/src/divide.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var divide = /* @__PURE__ */ _curry2(function divide2(a, b) {
      return a / b;
    });
    module2.exports = divide;
  }
});

// node_modules/ramda/src/internal/_xdrop.js
var require_xdrop = __commonJS({
  "node_modules/ramda/src/internal/_xdrop.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _xfBase = require_xfBase();
    var XDrop = /* @__PURE__ */ function() {
      function XDrop2(n, xf) {
        this.xf = xf;
        this.n = n;
      }
      XDrop2.prototype["@@transducer/init"] = _xfBase.init;
      XDrop2.prototype["@@transducer/result"] = _xfBase.result;
      XDrop2.prototype["@@transducer/step"] = function(result, input) {
        if (this.n > 0) {
          this.n -= 1;
          return result;
        }
        return this.xf["@@transducer/step"](result, input);
      };
      return XDrop2;
    }();
    var _xdrop = /* @__PURE__ */ _curry2(function _xdrop2(n, xf) {
      return new XDrop(n, xf);
    });
    module2.exports = _xdrop;
  }
});

// node_modules/ramda/src/drop.js
var require_drop = __commonJS({
  "node_modules/ramda/src/drop.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xdrop = require_xdrop();
    var slice = require_slice();
    var drop = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["drop"], _xdrop, function drop2(n, xs) {
      return slice(Math.max(0, n), Infinity, xs);
    }));
    module2.exports = drop;
  }
});

// node_modules/ramda/src/internal/_xtake.js
var require_xtake = __commonJS({
  "node_modules/ramda/src/internal/_xtake.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _reduced = require_reduced();
    var _xfBase = require_xfBase();
    var XTake = /* @__PURE__ */ function() {
      function XTake2(n, xf) {
        this.xf = xf;
        this.n = n;
        this.i = 0;
      }
      XTake2.prototype["@@transducer/init"] = _xfBase.init;
      XTake2.prototype["@@transducer/result"] = _xfBase.result;
      XTake2.prototype["@@transducer/step"] = function(result, input) {
        this.i += 1;
        var ret = this.n === 0 ? result : this.xf["@@transducer/step"](result, input);
        return this.n >= 0 && this.i >= this.n ? _reduced(ret) : ret;
      };
      return XTake2;
    }();
    var _xtake = /* @__PURE__ */ _curry2(function _xtake2(n, xf) {
      return new XTake(n, xf);
    });
    module2.exports = _xtake;
  }
});

// node_modules/ramda/src/take.js
var require_take = __commonJS({
  "node_modules/ramda/src/take.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xtake = require_xtake();
    var slice = require_slice();
    var take = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["take"], _xtake, function take2(n, xs) {
      return slice(0, n < 0 ? Infinity : n, xs);
    }));
    module2.exports = take;
  }
});

// node_modules/ramda/src/internal/_dropLast.js
var require_dropLast = __commonJS({
  "node_modules/ramda/src/internal/_dropLast.js"(exports, module2) {
    init_shims();
    var take = require_take();
    function dropLast(n, xs) {
      return take(n < xs.length ? xs.length - n : 0, xs);
    }
    module2.exports = dropLast;
  }
});

// node_modules/ramda/src/internal/_xdropLast.js
var require_xdropLast = __commonJS({
  "node_modules/ramda/src/internal/_xdropLast.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _xfBase = require_xfBase();
    var XDropLast = /* @__PURE__ */ function() {
      function XDropLast2(n, xf) {
        this.xf = xf;
        this.pos = 0;
        this.full = false;
        this.acc = new Array(n);
      }
      XDropLast2.prototype["@@transducer/init"] = _xfBase.init;
      XDropLast2.prototype["@@transducer/result"] = function(result) {
        this.acc = null;
        return this.xf["@@transducer/result"](result);
      };
      XDropLast2.prototype["@@transducer/step"] = function(result, input) {
        if (this.full) {
          result = this.xf["@@transducer/step"](result, this.acc[this.pos]);
        }
        this.store(input);
        return result;
      };
      XDropLast2.prototype.store = function(input) {
        this.acc[this.pos] = input;
        this.pos += 1;
        if (this.pos === this.acc.length) {
          this.pos = 0;
          this.full = true;
        }
      };
      return XDropLast2;
    }();
    var _xdropLast = /* @__PURE__ */ _curry2(function _xdropLast2(n, xf) {
      return new XDropLast(n, xf);
    });
    module2.exports = _xdropLast;
  }
});

// node_modules/ramda/src/dropLast.js
var require_dropLast2 = __commonJS({
  "node_modules/ramda/src/dropLast.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _dropLast = require_dropLast();
    var _xdropLast = require_xdropLast();
    var dropLast = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xdropLast, _dropLast));
    module2.exports = dropLast;
  }
});

// node_modules/ramda/src/internal/_dropLastWhile.js
var require_dropLastWhile = __commonJS({
  "node_modules/ramda/src/internal/_dropLastWhile.js"(exports, module2) {
    init_shims();
    var slice = require_slice();
    function dropLastWhile(pred, xs) {
      var idx = xs.length - 1;
      while (idx >= 0 && pred(xs[idx])) {
        idx -= 1;
      }
      return slice(0, idx + 1, xs);
    }
    module2.exports = dropLastWhile;
  }
});

// node_modules/ramda/src/internal/_xdropLastWhile.js
var require_xdropLastWhile = __commonJS({
  "node_modules/ramda/src/internal/_xdropLastWhile.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _reduce = require_reduce();
    var _xfBase = require_xfBase();
    var XDropLastWhile = /* @__PURE__ */ function() {
      function XDropLastWhile2(fn, xf) {
        this.f = fn;
        this.retained = [];
        this.xf = xf;
      }
      XDropLastWhile2.prototype["@@transducer/init"] = _xfBase.init;
      XDropLastWhile2.prototype["@@transducer/result"] = function(result) {
        this.retained = null;
        return this.xf["@@transducer/result"](result);
      };
      XDropLastWhile2.prototype["@@transducer/step"] = function(result, input) {
        return this.f(input) ? this.retain(result, input) : this.flush(result, input);
      };
      XDropLastWhile2.prototype.flush = function(result, input) {
        result = _reduce(this.xf["@@transducer/step"], result, this.retained);
        this.retained = [];
        return this.xf["@@transducer/step"](result, input);
      };
      XDropLastWhile2.prototype.retain = function(result, input) {
        this.retained.push(input);
        return result;
      };
      return XDropLastWhile2;
    }();
    var _xdropLastWhile = /* @__PURE__ */ _curry2(function _xdropLastWhile2(fn, xf) {
      return new XDropLastWhile(fn, xf);
    });
    module2.exports = _xdropLastWhile;
  }
});

// node_modules/ramda/src/dropLastWhile.js
var require_dropLastWhile2 = __commonJS({
  "node_modules/ramda/src/dropLastWhile.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _dropLastWhile = require_dropLastWhile();
    var _xdropLastWhile = require_xdropLastWhile();
    var dropLastWhile = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xdropLastWhile, _dropLastWhile));
    module2.exports = dropLastWhile;
  }
});

// node_modules/ramda/src/internal/_xdropRepeatsWith.js
var require_xdropRepeatsWith = __commonJS({
  "node_modules/ramda/src/internal/_xdropRepeatsWith.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _xfBase = require_xfBase();
    var XDropRepeatsWith = /* @__PURE__ */ function() {
      function XDropRepeatsWith2(pred, xf) {
        this.xf = xf;
        this.pred = pred;
        this.lastValue = void 0;
        this.seenFirstValue = false;
      }
      XDropRepeatsWith2.prototype["@@transducer/init"] = _xfBase.init;
      XDropRepeatsWith2.prototype["@@transducer/result"] = _xfBase.result;
      XDropRepeatsWith2.prototype["@@transducer/step"] = function(result, input) {
        var sameAsLast = false;
        if (!this.seenFirstValue) {
          this.seenFirstValue = true;
        } else if (this.pred(this.lastValue, input)) {
          sameAsLast = true;
        }
        this.lastValue = input;
        return sameAsLast ? result : this.xf["@@transducer/step"](result, input);
      };
      return XDropRepeatsWith2;
    }();
    var _xdropRepeatsWith = /* @__PURE__ */ _curry2(function _xdropRepeatsWith2(pred, xf) {
      return new XDropRepeatsWith(pred, xf);
    });
    module2.exports = _xdropRepeatsWith;
  }
});

// node_modules/ramda/src/last.js
var require_last = __commonJS({
  "node_modules/ramda/src/last.js"(exports, module2) {
    init_shims();
    var nth = require_nth();
    var last = /* @__PURE__ */ nth(-1);
    module2.exports = last;
  }
});

// node_modules/ramda/src/dropRepeatsWith.js
var require_dropRepeatsWith = __commonJS({
  "node_modules/ramda/src/dropRepeatsWith.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xdropRepeatsWith = require_xdropRepeatsWith();
    var last = require_last();
    var dropRepeatsWith = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xdropRepeatsWith, function dropRepeatsWith2(pred, list) {
      var result = [];
      var idx = 1;
      var len = list.length;
      if (len !== 0) {
        result[0] = list[0];
        while (idx < len) {
          if (!pred(last(result), list[idx])) {
            result[result.length] = list[idx];
          }
          idx += 1;
        }
      }
      return result;
    }));
    module2.exports = dropRepeatsWith;
  }
});

// node_modules/ramda/src/dropRepeats.js
var require_dropRepeats = __commonJS({
  "node_modules/ramda/src/dropRepeats.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var _dispatchable = require_dispatchable();
    var _xdropRepeatsWith = require_xdropRepeatsWith();
    var dropRepeatsWith = require_dropRepeatsWith();
    var equals = require_equals2();
    var dropRepeats = /* @__PURE__ */ _curry1(/* @__PURE__ */ _dispatchable([], /* @__PURE__ */ _xdropRepeatsWith(equals), /* @__PURE__ */ dropRepeatsWith(equals)));
    module2.exports = dropRepeats;
  }
});

// node_modules/ramda/src/internal/_xdropWhile.js
var require_xdropWhile = __commonJS({
  "node_modules/ramda/src/internal/_xdropWhile.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _xfBase = require_xfBase();
    var XDropWhile = /* @__PURE__ */ function() {
      function XDropWhile2(f, xf) {
        this.xf = xf;
        this.f = f;
      }
      XDropWhile2.prototype["@@transducer/init"] = _xfBase.init;
      XDropWhile2.prototype["@@transducer/result"] = _xfBase.result;
      XDropWhile2.prototype["@@transducer/step"] = function(result, input) {
        if (this.f) {
          if (this.f(input)) {
            return result;
          }
          this.f = null;
        }
        return this.xf["@@transducer/step"](result, input);
      };
      return XDropWhile2;
    }();
    var _xdropWhile = /* @__PURE__ */ _curry2(function _xdropWhile2(f, xf) {
      return new XDropWhile(f, xf);
    });
    module2.exports = _xdropWhile;
  }
});

// node_modules/ramda/src/dropWhile.js
var require_dropWhile = __commonJS({
  "node_modules/ramda/src/dropWhile.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xdropWhile = require_xdropWhile();
    var slice = require_slice();
    var dropWhile = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["dropWhile"], _xdropWhile, function dropWhile2(pred, xs) {
      var idx = 0;
      var len = xs.length;
      while (idx < len && pred(xs[idx])) {
        idx += 1;
      }
      return slice(idx, Infinity, xs);
    }));
    module2.exports = dropWhile;
  }
});

// node_modules/ramda/src/or.js
var require_or = __commonJS({
  "node_modules/ramda/src/or.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var or = /* @__PURE__ */ _curry2(function or2(a, b) {
      return a || b;
    });
    module2.exports = or;
  }
});

// node_modules/ramda/src/either.js
var require_either = __commonJS({
  "node_modules/ramda/src/either.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _isFunction = require_isFunction();
    var lift = require_lift();
    var or = require_or();
    var either = /* @__PURE__ */ _curry2(function either2(f, g) {
      return _isFunction(f) ? function _either() {
        return f.apply(this, arguments) || g.apply(this, arguments);
      } : lift(or)(f, g);
    });
    module2.exports = either;
  }
});

// node_modules/ramda/src/empty.js
var require_empty = __commonJS({
  "node_modules/ramda/src/empty.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var _isArguments = require_isArguments();
    var _isArray = require_isArray();
    var _isObject = require_isObject();
    var _isString = require_isString();
    var empty2 = /* @__PURE__ */ _curry1(function empty3(x) {
      return x != null && typeof x["fantasy-land/empty"] === "function" ? x["fantasy-land/empty"]() : x != null && x.constructor != null && typeof x.constructor["fantasy-land/empty"] === "function" ? x.constructor["fantasy-land/empty"]() : x != null && typeof x.empty === "function" ? x.empty() : x != null && x.constructor != null && typeof x.constructor.empty === "function" ? x.constructor.empty() : _isArray(x) ? [] : _isString(x) ? "" : _isObject(x) ? {} : _isArguments(x) ? function() {
        return arguments;
      }() : void 0;
    });
    module2.exports = empty2;
  }
});

// node_modules/ramda/src/takeLast.js
var require_takeLast = __commonJS({
  "node_modules/ramda/src/takeLast.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var drop = require_drop();
    var takeLast = /* @__PURE__ */ _curry2(function takeLast2(n, xs) {
      return drop(n >= 0 ? xs.length - n : 0, xs);
    });
    module2.exports = takeLast;
  }
});

// node_modules/ramda/src/endsWith.js
var require_endsWith = __commonJS({
  "node_modules/ramda/src/endsWith.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var equals = require_equals2();
    var takeLast = require_takeLast();
    var endsWith = /* @__PURE__ */ _curry2(function(suffix, list) {
      return equals(takeLast(suffix.length, list), suffix);
    });
    module2.exports = endsWith;
  }
});

// node_modules/ramda/src/eqBy.js
var require_eqBy = __commonJS({
  "node_modules/ramda/src/eqBy.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var equals = require_equals2();
    var eqBy = /* @__PURE__ */ _curry3(function eqBy2(f, x, y) {
      return equals(f(x), f(y));
    });
    module2.exports = eqBy;
  }
});

// node_modules/ramda/src/eqProps.js
var require_eqProps = __commonJS({
  "node_modules/ramda/src/eqProps.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var equals = require_equals2();
    var eqProps = /* @__PURE__ */ _curry3(function eqProps2(prop2, obj1, obj2) {
      return equals(obj1[prop2], obj2[prop2]);
    });
    module2.exports = eqProps;
  }
});

// node_modules/ramda/src/evolve.js
var require_evolve = __commonJS({
  "node_modules/ramda/src/evolve.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var evolve = /* @__PURE__ */ _curry2(function evolve2(transformations, object) {
      var result = object instanceof Array ? [] : {};
      var transformation, key, type;
      for (key in object) {
        transformation = transformations[key];
        type = typeof transformation;
        result[key] = type === "function" ? transformation(object[key]) : transformation && type === "object" ? evolve2(transformation, object[key]) : object[key];
      }
      return result;
    });
    module2.exports = evolve;
  }
});

// node_modules/ramda/src/internal/_xfind.js
var require_xfind = __commonJS({
  "node_modules/ramda/src/internal/_xfind.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _reduced = require_reduced();
    var _xfBase = require_xfBase();
    var XFind = /* @__PURE__ */ function() {
      function XFind2(f, xf) {
        this.xf = xf;
        this.f = f;
        this.found = false;
      }
      XFind2.prototype["@@transducer/init"] = _xfBase.init;
      XFind2.prototype["@@transducer/result"] = function(result) {
        if (!this.found) {
          result = this.xf["@@transducer/step"](result, void 0);
        }
        return this.xf["@@transducer/result"](result);
      };
      XFind2.prototype["@@transducer/step"] = function(result, input) {
        if (this.f(input)) {
          this.found = true;
          result = _reduced(this.xf["@@transducer/step"](result, input));
        }
        return result;
      };
      return XFind2;
    }();
    var _xfind = /* @__PURE__ */ _curry2(function _xfind2(f, xf) {
      return new XFind(f, xf);
    });
    module2.exports = _xfind;
  }
});

// node_modules/ramda/src/find.js
var require_find = __commonJS({
  "node_modules/ramda/src/find.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xfind = require_xfind();
    var find = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["find"], _xfind, function find2(fn, list) {
      var idx = 0;
      var len = list.length;
      while (idx < len) {
        if (fn(list[idx])) {
          return list[idx];
        }
        idx += 1;
      }
    }));
    module2.exports = find;
  }
});

// node_modules/ramda/src/internal/_xfindIndex.js
var require_xfindIndex = __commonJS({
  "node_modules/ramda/src/internal/_xfindIndex.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _reduced = require_reduced();
    var _xfBase = require_xfBase();
    var XFindIndex = /* @__PURE__ */ function() {
      function XFindIndex2(f, xf) {
        this.xf = xf;
        this.f = f;
        this.idx = -1;
        this.found = false;
      }
      XFindIndex2.prototype["@@transducer/init"] = _xfBase.init;
      XFindIndex2.prototype["@@transducer/result"] = function(result) {
        if (!this.found) {
          result = this.xf["@@transducer/step"](result, -1);
        }
        return this.xf["@@transducer/result"](result);
      };
      XFindIndex2.prototype["@@transducer/step"] = function(result, input) {
        this.idx += 1;
        if (this.f(input)) {
          this.found = true;
          result = _reduced(this.xf["@@transducer/step"](result, this.idx));
        }
        return result;
      };
      return XFindIndex2;
    }();
    var _xfindIndex = /* @__PURE__ */ _curry2(function _xfindIndex2(f, xf) {
      return new XFindIndex(f, xf);
    });
    module2.exports = _xfindIndex;
  }
});

// node_modules/ramda/src/findIndex.js
var require_findIndex = __commonJS({
  "node_modules/ramda/src/findIndex.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xfindIndex = require_xfindIndex();
    var findIndex = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xfindIndex, function findIndex2(fn, list) {
      var idx = 0;
      var len = list.length;
      while (idx < len) {
        if (fn(list[idx])) {
          return idx;
        }
        idx += 1;
      }
      return -1;
    }));
    module2.exports = findIndex;
  }
});

// node_modules/ramda/src/internal/_xfindLast.js
var require_xfindLast = __commonJS({
  "node_modules/ramda/src/internal/_xfindLast.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _xfBase = require_xfBase();
    var XFindLast = /* @__PURE__ */ function() {
      function XFindLast2(f, xf) {
        this.xf = xf;
        this.f = f;
      }
      XFindLast2.prototype["@@transducer/init"] = _xfBase.init;
      XFindLast2.prototype["@@transducer/result"] = function(result) {
        return this.xf["@@transducer/result"](this.xf["@@transducer/step"](result, this.last));
      };
      XFindLast2.prototype["@@transducer/step"] = function(result, input) {
        if (this.f(input)) {
          this.last = input;
        }
        return result;
      };
      return XFindLast2;
    }();
    var _xfindLast = /* @__PURE__ */ _curry2(function _xfindLast2(f, xf) {
      return new XFindLast(f, xf);
    });
    module2.exports = _xfindLast;
  }
});

// node_modules/ramda/src/findLast.js
var require_findLast = __commonJS({
  "node_modules/ramda/src/findLast.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xfindLast = require_xfindLast();
    var findLast = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xfindLast, function findLast2(fn, list) {
      var idx = list.length - 1;
      while (idx >= 0) {
        if (fn(list[idx])) {
          return list[idx];
        }
        idx -= 1;
      }
    }));
    module2.exports = findLast;
  }
});

// node_modules/ramda/src/internal/_xfindLastIndex.js
var require_xfindLastIndex = __commonJS({
  "node_modules/ramda/src/internal/_xfindLastIndex.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _xfBase = require_xfBase();
    var XFindLastIndex = /* @__PURE__ */ function() {
      function XFindLastIndex2(f, xf) {
        this.xf = xf;
        this.f = f;
        this.idx = -1;
        this.lastIdx = -1;
      }
      XFindLastIndex2.prototype["@@transducer/init"] = _xfBase.init;
      XFindLastIndex2.prototype["@@transducer/result"] = function(result) {
        return this.xf["@@transducer/result"](this.xf["@@transducer/step"](result, this.lastIdx));
      };
      XFindLastIndex2.prototype["@@transducer/step"] = function(result, input) {
        this.idx += 1;
        if (this.f(input)) {
          this.lastIdx = this.idx;
        }
        return result;
      };
      return XFindLastIndex2;
    }();
    var _xfindLastIndex = /* @__PURE__ */ _curry2(function _xfindLastIndex2(f, xf) {
      return new XFindLastIndex(f, xf);
    });
    module2.exports = _xfindLastIndex;
  }
});

// node_modules/ramda/src/findLastIndex.js
var require_findLastIndex = __commonJS({
  "node_modules/ramda/src/findLastIndex.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xfindLastIndex = require_xfindLastIndex();
    var findLastIndex = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xfindLastIndex, function findLastIndex2(fn, list) {
      var idx = list.length - 1;
      while (idx >= 0) {
        if (fn(list[idx])) {
          return idx;
        }
        idx -= 1;
      }
      return -1;
    }));
    module2.exports = findLastIndex;
  }
});

// node_modules/ramda/src/flatten.js
var require_flatten = __commonJS({
  "node_modules/ramda/src/flatten.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var _makeFlat = require_makeFlat();
    var flatten2 = /* @__PURE__ */ _curry1(/* @__PURE__ */ _makeFlat(true));
    module2.exports = flatten2;
  }
});

// node_modules/ramda/src/flip.js
var require_flip = __commonJS({
  "node_modules/ramda/src/flip.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var curryN = require_curryN2();
    var flip = /* @__PURE__ */ _curry1(function flip2(fn) {
      return curryN(fn.length, function(a, b) {
        var args = Array.prototype.slice.call(arguments, 0);
        args[0] = b;
        args[1] = a;
        return fn.apply(this, args);
      });
    });
    module2.exports = flip;
  }
});

// node_modules/ramda/src/forEach.js
var require_forEach = __commonJS({
  "node_modules/ramda/src/forEach.js"(exports, module2) {
    init_shims();
    var _checkForMethod = require_checkForMethod();
    var _curry2 = require_curry2();
    var forEach = /* @__PURE__ */ _curry2(/* @__PURE__ */ _checkForMethod("forEach", function forEach2(fn, list) {
      var len = list.length;
      var idx = 0;
      while (idx < len) {
        fn(list[idx]);
        idx += 1;
      }
      return list;
    }));
    module2.exports = forEach;
  }
});

// node_modules/ramda/src/forEachObjIndexed.js
var require_forEachObjIndexed = __commonJS({
  "node_modules/ramda/src/forEachObjIndexed.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var keys = require_keys();
    var forEachObjIndexed = /* @__PURE__ */ _curry2(function forEachObjIndexed2(fn, obj) {
      var keyList = keys(obj);
      var idx = 0;
      while (idx < keyList.length) {
        var key = keyList[idx];
        fn(obj[key], key, obj);
        idx += 1;
      }
      return obj;
    });
    module2.exports = forEachObjIndexed;
  }
});

// node_modules/ramda/src/fromPairs.js
var require_fromPairs = __commonJS({
  "node_modules/ramda/src/fromPairs.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var fromPairs = /* @__PURE__ */ _curry1(function fromPairs2(pairs) {
      var result = {};
      var idx = 0;
      while (idx < pairs.length) {
        result[pairs[idx][0]] = pairs[idx][1];
        idx += 1;
      }
      return result;
    });
    module2.exports = fromPairs;
  }
});

// node_modules/ramda/src/groupBy.js
var require_groupBy = __commonJS({
  "node_modules/ramda/src/groupBy.js"(exports, module2) {
    init_shims();
    var _checkForMethod = require_checkForMethod();
    var _curry2 = require_curry2();
    var reduceBy = require_reduceBy();
    var groupBy = /* @__PURE__ */ _curry2(/* @__PURE__ */ _checkForMethod("groupBy", /* @__PURE__ */ reduceBy(function(acc, item) {
      if (acc == null) {
        acc = [];
      }
      acc.push(item);
      return acc;
    }, null)));
    module2.exports = groupBy;
  }
});

// node_modules/ramda/src/groupWith.js
var require_groupWith = __commonJS({
  "node_modules/ramda/src/groupWith.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var groupWith = /* @__PURE__ */ _curry2(function(fn, list) {
      var res = [];
      var idx = 0;
      var len = list.length;
      while (idx < len) {
        var nextidx = idx + 1;
        while (nextidx < len && fn(list[nextidx - 1], list[nextidx])) {
          nextidx += 1;
        }
        res.push(list.slice(idx, nextidx));
        idx = nextidx;
      }
      return res;
    });
    module2.exports = groupWith;
  }
});

// node_modules/ramda/src/gt.js
var require_gt = __commonJS({
  "node_modules/ramda/src/gt.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var gt = /* @__PURE__ */ _curry2(function gt2(a, b) {
      return a > b;
    });
    module2.exports = gt;
  }
});

// node_modules/ramda/src/gte.js
var require_gte = __commonJS({
  "node_modules/ramda/src/gte.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var gte = /* @__PURE__ */ _curry2(function gte2(a, b) {
      return a >= b;
    });
    module2.exports = gte;
  }
});

// node_modules/ramda/src/hasPath.js
var require_hasPath = __commonJS({
  "node_modules/ramda/src/hasPath.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _has = require_has();
    var isNil = require_isNil();
    var hasPath = /* @__PURE__ */ _curry2(function hasPath2(_path, obj) {
      if (_path.length === 0 || isNil(obj)) {
        return false;
      }
      var val = obj;
      var idx = 0;
      while (idx < _path.length) {
        if (!isNil(val) && _has(_path[idx], val)) {
          val = val[_path[idx]];
          idx += 1;
        } else {
          return false;
        }
      }
      return true;
    });
    module2.exports = hasPath;
  }
});

// node_modules/ramda/src/has.js
var require_has2 = __commonJS({
  "node_modules/ramda/src/has.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var hasPath = require_hasPath();
    var has = /* @__PURE__ */ _curry2(function has2(prop2, obj) {
      return hasPath([prop2], obj);
    });
    module2.exports = has;
  }
});

// node_modules/ramda/src/hasIn.js
var require_hasIn = __commonJS({
  "node_modules/ramda/src/hasIn.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var hasIn = /* @__PURE__ */ _curry2(function hasIn2(prop2, obj) {
      return prop2 in obj;
    });
    module2.exports = hasIn;
  }
});

// node_modules/ramda/src/identical.js
var require_identical = __commonJS({
  "node_modules/ramda/src/identical.js"(exports, module2) {
    init_shims();
    var _objectIs = require_objectIs();
    var _curry2 = require_curry2();
    var identical = /* @__PURE__ */ _curry2(_objectIs);
    module2.exports = identical;
  }
});

// node_modules/ramda/src/ifElse.js
var require_ifElse = __commonJS({
  "node_modules/ramda/src/ifElse.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var curryN = require_curryN2();
    var ifElse = /* @__PURE__ */ _curry3(function ifElse2(condition, onTrue, onFalse) {
      return curryN(Math.max(condition.length, onTrue.length, onFalse.length), function _ifElse() {
        return condition.apply(this, arguments) ? onTrue.apply(this, arguments) : onFalse.apply(this, arguments);
      });
    });
    module2.exports = ifElse;
  }
});

// node_modules/ramda/src/inc.js
var require_inc = __commonJS({
  "node_modules/ramda/src/inc.js"(exports, module2) {
    init_shims();
    var add = require_add();
    var inc = /* @__PURE__ */ add(1);
    module2.exports = inc;
  }
});

// node_modules/ramda/src/includes.js
var require_includes2 = __commonJS({
  "node_modules/ramda/src/includes.js"(exports, module2) {
    init_shims();
    var _includes = require_includes();
    var _curry2 = require_curry2();
    var includes = /* @__PURE__ */ _curry2(_includes);
    module2.exports = includes;
  }
});

// node_modules/ramda/src/indexBy.js
var require_indexBy = __commonJS({
  "node_modules/ramda/src/indexBy.js"(exports, module2) {
    init_shims();
    var reduceBy = require_reduceBy();
    var indexBy = /* @__PURE__ */ reduceBy(function(acc, elem) {
      return elem;
    }, null);
    module2.exports = indexBy;
  }
});

// node_modules/ramda/src/indexOf.js
var require_indexOf2 = __commonJS({
  "node_modules/ramda/src/indexOf.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _indexOf = require_indexOf();
    var _isArray = require_isArray();
    var indexOf = /* @__PURE__ */ _curry2(function indexOf2(target, xs) {
      return typeof xs.indexOf === "function" && !_isArray(xs) ? xs.indexOf(target) : _indexOf(xs, target, 0);
    });
    module2.exports = indexOf;
  }
});

// node_modules/ramda/src/init.js
var require_init = __commonJS({
  "node_modules/ramda/src/init.js"(exports, module2) {
    init_shims();
    var slice = require_slice();
    var init2 = /* @__PURE__ */ slice(0, -1);
    module2.exports = init2;
  }
});

// node_modules/ramda/src/innerJoin.js
var require_innerJoin = __commonJS({
  "node_modules/ramda/src/innerJoin.js"(exports, module2) {
    init_shims();
    var _includesWith = require_includesWith();
    var _curry3 = require_curry3();
    var _filter = require_filter();
    var innerJoin = /* @__PURE__ */ _curry3(function innerJoin2(pred, xs, ys) {
      return _filter(function(x) {
        return _includesWith(pred, x, ys);
      }, xs);
    });
    module2.exports = innerJoin;
  }
});

// node_modules/ramda/src/insert.js
var require_insert = __commonJS({
  "node_modules/ramda/src/insert.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var insert = /* @__PURE__ */ _curry3(function insert2(idx, elt, list) {
      idx = idx < list.length && idx >= 0 ? idx : list.length;
      var result = Array.prototype.slice.call(list, 0);
      result.splice(idx, 0, elt);
      return result;
    });
    module2.exports = insert;
  }
});

// node_modules/ramda/src/insertAll.js
var require_insertAll = __commonJS({
  "node_modules/ramda/src/insertAll.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var insertAll = /* @__PURE__ */ _curry3(function insertAll2(idx, elts, list) {
      idx = idx < list.length && idx >= 0 ? idx : list.length;
      return [].concat(Array.prototype.slice.call(list, 0, idx), elts, Array.prototype.slice.call(list, idx));
    });
    module2.exports = insertAll;
  }
});

// node_modules/ramda/src/uniqBy.js
var require_uniqBy = __commonJS({
  "node_modules/ramda/src/uniqBy.js"(exports, module2) {
    init_shims();
    var _Set = require_Set();
    var _curry2 = require_curry2();
    var uniqBy = /* @__PURE__ */ _curry2(function uniqBy2(fn, list) {
      var set = new _Set();
      var result = [];
      var idx = 0;
      var appliedItem, item;
      while (idx < list.length) {
        item = list[idx];
        appliedItem = fn(item);
        if (set.add(appliedItem)) {
          result.push(item);
        }
        idx += 1;
      }
      return result;
    });
    module2.exports = uniqBy;
  }
});

// node_modules/ramda/src/uniq.js
var require_uniq = __commonJS({
  "node_modules/ramda/src/uniq.js"(exports, module2) {
    init_shims();
    var identity = require_identity2();
    var uniqBy = require_uniqBy();
    var uniq = /* @__PURE__ */ uniqBy(identity);
    module2.exports = uniq;
  }
});

// node_modules/ramda/src/intersection.js
var require_intersection = __commonJS({
  "node_modules/ramda/src/intersection.js"(exports, module2) {
    init_shims();
    var _includes = require_includes();
    var _curry2 = require_curry2();
    var _filter = require_filter();
    var flip = require_flip();
    var uniq = require_uniq();
    var intersection = /* @__PURE__ */ _curry2(function intersection2(list1, list2) {
      var lookupList, filteredList;
      if (list1.length > list2.length) {
        lookupList = list1;
        filteredList = list2;
      } else {
        lookupList = list2;
        filteredList = list1;
      }
      return uniq(_filter(flip(_includes)(lookupList), filteredList));
    });
    module2.exports = intersection;
  }
});

// node_modules/ramda/src/intersperse.js
var require_intersperse = __commonJS({
  "node_modules/ramda/src/intersperse.js"(exports, module2) {
    init_shims();
    var _checkForMethod = require_checkForMethod();
    var _curry2 = require_curry2();
    var intersperse = /* @__PURE__ */ _curry2(/* @__PURE__ */ _checkForMethod("intersperse", function intersperse2(separator, list) {
      var out = [];
      var idx = 0;
      var length = list.length;
      while (idx < length) {
        if (idx === length - 1) {
          out.push(list[idx]);
        } else {
          out.push(list[idx], separator);
        }
        idx += 1;
      }
      return out;
    }));
    module2.exports = intersperse;
  }
});

// node_modules/ramda/src/internal/_objectAssign.js
var require_objectAssign = __commonJS({
  "node_modules/ramda/src/internal/_objectAssign.js"(exports, module2) {
    init_shims();
    var _has = require_has();
    function _objectAssign(target) {
      if (target == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }
      var output = Object(target);
      var idx = 1;
      var length = arguments.length;
      while (idx < length) {
        var source = arguments[idx];
        if (source != null) {
          for (var nextKey in source) {
            if (_has(nextKey, source)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
        idx += 1;
      }
      return output;
    }
    module2.exports = typeof Object.assign === "function" ? Object.assign : _objectAssign;
  }
});

// node_modules/ramda/src/objOf.js
var require_objOf = __commonJS({
  "node_modules/ramda/src/objOf.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var objOf = /* @__PURE__ */ _curry2(function objOf2(key, val) {
      var obj = {};
      obj[key] = val;
      return obj;
    });
    module2.exports = objOf;
  }
});

// node_modules/ramda/src/internal/_stepCat.js
var require_stepCat = __commonJS({
  "node_modules/ramda/src/internal/_stepCat.js"(exports, module2) {
    init_shims();
    var _objectAssign = require_objectAssign();
    var _identity = require_identity();
    var _isArrayLike = require_isArrayLike();
    var _isTransformer = require_isTransformer();
    var objOf = require_objOf();
    var _stepCatArray = {
      "@@transducer/init": Array,
      "@@transducer/step": function(xs, x) {
        xs.push(x);
        return xs;
      },
      "@@transducer/result": _identity
    };
    var _stepCatString = {
      "@@transducer/init": String,
      "@@transducer/step": function(a, b) {
        return a + b;
      },
      "@@transducer/result": _identity
    };
    var _stepCatObject = {
      "@@transducer/init": Object,
      "@@transducer/step": function(result, input) {
        return _objectAssign(result, _isArrayLike(input) ? objOf(input[0], input[1]) : input);
      },
      "@@transducer/result": _identity
    };
    function _stepCat(obj) {
      if (_isTransformer(obj)) {
        return obj;
      }
      if (_isArrayLike(obj)) {
        return _stepCatArray;
      }
      if (typeof obj === "string") {
        return _stepCatString;
      }
      if (typeof obj === "object") {
        return _stepCatObject;
      }
      throw new Error("Cannot create transformer for " + obj);
    }
    module2.exports = _stepCat;
  }
});

// node_modules/ramda/src/into.js
var require_into = __commonJS({
  "node_modules/ramda/src/into.js"(exports, module2) {
    init_shims();
    var _clone = require_clone();
    var _curry3 = require_curry3();
    var _isTransformer = require_isTransformer();
    var _reduce = require_reduce();
    var _stepCat = require_stepCat();
    var into = /* @__PURE__ */ _curry3(function into2(acc, xf, list) {
      return _isTransformer(acc) ? _reduce(xf(acc), acc["@@transducer/init"](), list) : _reduce(xf(_stepCat(acc)), _clone(acc, [], [], false), list);
    });
    module2.exports = into;
  }
});

// node_modules/ramda/src/invert.js
var require_invert = __commonJS({
  "node_modules/ramda/src/invert.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var _has = require_has();
    var keys = require_keys();
    var invert = /* @__PURE__ */ _curry1(function invert2(obj) {
      var props = keys(obj);
      var len = props.length;
      var idx = 0;
      var out = {};
      while (idx < len) {
        var key = props[idx];
        var val = obj[key];
        var list = _has(val, out) ? out[val] : out[val] = [];
        list[list.length] = key;
        idx += 1;
      }
      return out;
    });
    module2.exports = invert;
  }
});

// node_modules/ramda/src/invertObj.js
var require_invertObj = __commonJS({
  "node_modules/ramda/src/invertObj.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var keys = require_keys();
    var invertObj = /* @__PURE__ */ _curry1(function invertObj2(obj) {
      var props = keys(obj);
      var len = props.length;
      var idx = 0;
      var out = {};
      while (idx < len) {
        var key = props[idx];
        out[obj[key]] = key;
        idx += 1;
      }
      return out;
    });
    module2.exports = invertObj;
  }
});

// node_modules/ramda/src/invoker.js
var require_invoker = __commonJS({
  "node_modules/ramda/src/invoker.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _isFunction = require_isFunction();
    var curryN = require_curryN2();
    var toString = require_toString2();
    var invoker = /* @__PURE__ */ _curry2(function invoker2(arity, method) {
      return curryN(arity + 1, function() {
        var target = arguments[arity];
        if (target != null && _isFunction(target[method])) {
          return target[method].apply(target, Array.prototype.slice.call(arguments, 0, arity));
        }
        throw new TypeError(toString(target) + ' does not have a method named "' + method + '"');
      });
    });
    module2.exports = invoker;
  }
});

// node_modules/ramda/src/is.js
var require_is = __commonJS({
  "node_modules/ramda/src/is.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var is = /* @__PURE__ */ _curry2(function is2(Ctor, val) {
      return val != null && val.constructor === Ctor || val instanceof Ctor;
    });
    module2.exports = is;
  }
});

// node_modules/ramda/src/isEmpty.js
var require_isEmpty = __commonJS({
  "node_modules/ramda/src/isEmpty.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var empty2 = require_empty();
    var equals = require_equals2();
    var isEmpty2 = /* @__PURE__ */ _curry1(function isEmpty3(x) {
      return x != null && equals(x, empty2(x));
    });
    module2.exports = isEmpty2;
  }
});

// node_modules/ramda/src/join.js
var require_join = __commonJS({
  "node_modules/ramda/src/join.js"(exports, module2) {
    init_shims();
    var invoker = require_invoker();
    var join = /* @__PURE__ */ invoker(1, "join");
    module2.exports = join;
  }
});

// node_modules/ramda/src/juxt.js
var require_juxt = __commonJS({
  "node_modules/ramda/src/juxt.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var converge = require_converge();
    var juxt = /* @__PURE__ */ _curry1(function juxt2(fns) {
      return converge(function() {
        return Array.prototype.slice.call(arguments, 0);
      }, fns);
    });
    module2.exports = juxt;
  }
});

// node_modules/ramda/src/keysIn.js
var require_keysIn = __commonJS({
  "node_modules/ramda/src/keysIn.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var keysIn = /* @__PURE__ */ _curry1(function keysIn2(obj) {
      var prop2;
      var ks = [];
      for (prop2 in obj) {
        ks[ks.length] = prop2;
      }
      return ks;
    });
    module2.exports = keysIn;
  }
});

// node_modules/ramda/src/lastIndexOf.js
var require_lastIndexOf = __commonJS({
  "node_modules/ramda/src/lastIndexOf.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _isArray = require_isArray();
    var equals = require_equals2();
    var lastIndexOf = /* @__PURE__ */ _curry2(function lastIndexOf2(target, xs) {
      if (typeof xs.lastIndexOf === "function" && !_isArray(xs)) {
        return xs.lastIndexOf(target);
      } else {
        var idx = xs.length - 1;
        while (idx >= 0) {
          if (equals(xs[idx], target)) {
            return idx;
          }
          idx -= 1;
        }
        return -1;
      }
    });
    module2.exports = lastIndexOf;
  }
});

// node_modules/ramda/src/internal/_isNumber.js
var require_isNumber = __commonJS({
  "node_modules/ramda/src/internal/_isNumber.js"(exports, module2) {
    init_shims();
    function _isNumber(x) {
      return Object.prototype.toString.call(x) === "[object Number]";
    }
    module2.exports = _isNumber;
  }
});

// node_modules/ramda/src/length.js
var require_length = __commonJS({
  "node_modules/ramda/src/length.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var _isNumber = require_isNumber();
    var length = /* @__PURE__ */ _curry1(function length2(list) {
      return list != null && _isNumber(list.length) ? list.length : NaN;
    });
    module2.exports = length;
  }
});

// node_modules/ramda/src/lens.js
var require_lens = __commonJS({
  "node_modules/ramda/src/lens.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var map2 = require_map2();
    var lens = /* @__PURE__ */ _curry2(function lens2(getter, setter) {
      return function(toFunctorFn) {
        return function(target) {
          return map2(function(focus) {
            return setter(focus, target);
          }, toFunctorFn(getter(target)));
        };
      };
    });
    module2.exports = lens;
  }
});

// node_modules/ramda/src/lensIndex.js
var require_lensIndex = __commonJS({
  "node_modules/ramda/src/lensIndex.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var lens = require_lens();
    var nth = require_nth();
    var update = require_update();
    var lensIndex = /* @__PURE__ */ _curry1(function lensIndex2(n) {
      return lens(nth(n), update(n));
    });
    module2.exports = lensIndex;
  }
});

// node_modules/ramda/src/lensPath.js
var require_lensPath = __commonJS({
  "node_modules/ramda/src/lensPath.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var assocPath = require_assocPath();
    var lens = require_lens();
    var path = require_path();
    var lensPath = /* @__PURE__ */ _curry1(function lensPath2(p) {
      return lens(path(p), assocPath(p));
    });
    module2.exports = lensPath;
  }
});

// node_modules/ramda/src/lensProp.js
var require_lensProp = __commonJS({
  "node_modules/ramda/src/lensProp.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var assoc = require_assoc();
    var lens = require_lens();
    var prop2 = require_prop();
    var lensProp = /* @__PURE__ */ _curry1(function lensProp2(k) {
      return lens(prop2(k), assoc(k));
    });
    module2.exports = lensProp;
  }
});

// node_modules/ramda/src/lt.js
var require_lt = __commonJS({
  "node_modules/ramda/src/lt.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var lt = /* @__PURE__ */ _curry2(function lt2(a, b) {
      return a < b;
    });
    module2.exports = lt;
  }
});

// node_modules/ramda/src/lte.js
var require_lte = __commonJS({
  "node_modules/ramda/src/lte.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var lte = /* @__PURE__ */ _curry2(function lte2(a, b) {
      return a <= b;
    });
    module2.exports = lte;
  }
});

// node_modules/ramda/src/mapAccum.js
var require_mapAccum = __commonJS({
  "node_modules/ramda/src/mapAccum.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var mapAccum = /* @__PURE__ */ _curry3(function mapAccum2(fn, acc, list) {
      var idx = 0;
      var len = list.length;
      var result = [];
      var tuple = [acc];
      while (idx < len) {
        tuple = fn(tuple[0], list[idx]);
        result[idx] = tuple[1];
        idx += 1;
      }
      return [tuple[0], result];
    });
    module2.exports = mapAccum;
  }
});

// node_modules/ramda/src/mapAccumRight.js
var require_mapAccumRight = __commonJS({
  "node_modules/ramda/src/mapAccumRight.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var mapAccumRight = /* @__PURE__ */ _curry3(function mapAccumRight2(fn, acc, list) {
      var idx = list.length - 1;
      var result = [];
      var tuple = [acc];
      while (idx >= 0) {
        tuple = fn(tuple[0], list[idx]);
        result[idx] = tuple[1];
        idx -= 1;
      }
      return [tuple[0], result];
    });
    module2.exports = mapAccumRight;
  }
});

// node_modules/ramda/src/mapObjIndexed.js
var require_mapObjIndexed = __commonJS({
  "node_modules/ramda/src/mapObjIndexed.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _reduce = require_reduce();
    var keys = require_keys();
    var mapObjIndexed = /* @__PURE__ */ _curry2(function mapObjIndexed2(fn, obj) {
      return _reduce(function(acc, key) {
        acc[key] = fn(obj[key], key, obj);
        return acc;
      }, {}, keys(obj));
    });
    module2.exports = mapObjIndexed;
  }
});

// node_modules/ramda/src/match.js
var require_match = __commonJS({
  "node_modules/ramda/src/match.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var match = /* @__PURE__ */ _curry2(function match2(rx, str) {
      return str.match(rx) || [];
    });
    module2.exports = match;
  }
});

// node_modules/ramda/src/mathMod.js
var require_mathMod = __commonJS({
  "node_modules/ramda/src/mathMod.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _isInteger = require_isInteger();
    var mathMod = /* @__PURE__ */ _curry2(function mathMod2(m, p) {
      if (!_isInteger(m)) {
        return NaN;
      }
      if (!_isInteger(p) || p < 1) {
        return NaN;
      }
      return (m % p + p) % p;
    });
    module2.exports = mathMod;
  }
});

// node_modules/ramda/src/maxBy.js
var require_maxBy = __commonJS({
  "node_modules/ramda/src/maxBy.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var maxBy = /* @__PURE__ */ _curry3(function maxBy2(f, a, b) {
      return f(b) > f(a) ? b : a;
    });
    module2.exports = maxBy;
  }
});

// node_modules/ramda/src/sum.js
var require_sum = __commonJS({
  "node_modules/ramda/src/sum.js"(exports, module2) {
    init_shims();
    var add = require_add();
    var reduce2 = require_reduce2();
    var sum = /* @__PURE__ */ reduce2(add, 0);
    module2.exports = sum;
  }
});

// node_modules/ramda/src/mean.js
var require_mean = __commonJS({
  "node_modules/ramda/src/mean.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var sum = require_sum();
    var mean = /* @__PURE__ */ _curry1(function mean2(list) {
      return sum(list) / list.length;
    });
    module2.exports = mean;
  }
});

// node_modules/ramda/src/median.js
var require_median = __commonJS({
  "node_modules/ramda/src/median.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var mean = require_mean();
    var median = /* @__PURE__ */ _curry1(function median2(list) {
      var len = list.length;
      if (len === 0) {
        return NaN;
      }
      var width = 2 - len % 2;
      var idx = (len - width) / 2;
      return mean(Array.prototype.slice.call(list, 0).sort(function(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
      }).slice(idx, idx + width));
    });
    module2.exports = median;
  }
});

// node_modules/ramda/src/memoizeWith.js
var require_memoizeWith = __commonJS({
  "node_modules/ramda/src/memoizeWith.js"(exports, module2) {
    init_shims();
    var _arity = require_arity();
    var _curry2 = require_curry2();
    var _has = require_has();
    var memoizeWith = /* @__PURE__ */ _curry2(function memoizeWith2(mFn, fn) {
      var cache = {};
      return _arity(fn.length, function() {
        var key = mFn.apply(this, arguments);
        if (!_has(key, cache)) {
          cache[key] = fn.apply(this, arguments);
        }
        return cache[key];
      });
    });
    module2.exports = memoizeWith;
  }
});

// node_modules/ramda/src/merge.js
var require_merge = __commonJS({
  "node_modules/ramda/src/merge.js"(exports, module2) {
    init_shims();
    var _objectAssign = require_objectAssign();
    var _curry2 = require_curry2();
    var merge = /* @__PURE__ */ _curry2(function merge2(l, r) {
      return _objectAssign({}, l, r);
    });
    module2.exports = merge;
  }
});

// node_modules/ramda/src/mergeAll.js
var require_mergeAll = __commonJS({
  "node_modules/ramda/src/mergeAll.js"(exports, module2) {
    init_shims();
    var _objectAssign = require_objectAssign();
    var _curry1 = require_curry1();
    var mergeAll = /* @__PURE__ */ _curry1(function mergeAll2(list) {
      return _objectAssign.apply(null, [{}].concat(list));
    });
    module2.exports = mergeAll;
  }
});

// node_modules/ramda/src/mergeWithKey.js
var require_mergeWithKey = __commonJS({
  "node_modules/ramda/src/mergeWithKey.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var _has = require_has();
    var mergeWithKey = /* @__PURE__ */ _curry3(function mergeWithKey2(fn, l, r) {
      var result = {};
      var k;
      for (k in l) {
        if (_has(k, l)) {
          result[k] = _has(k, r) ? fn(k, l[k], r[k]) : l[k];
        }
      }
      for (k in r) {
        if (_has(k, r) && !_has(k, result)) {
          result[k] = r[k];
        }
      }
      return result;
    });
    module2.exports = mergeWithKey;
  }
});

// node_modules/ramda/src/mergeDeepWithKey.js
var require_mergeDeepWithKey = __commonJS({
  "node_modules/ramda/src/mergeDeepWithKey.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var _isObject = require_isObject();
    var mergeWithKey = require_mergeWithKey();
    var mergeDeepWithKey = /* @__PURE__ */ _curry3(function mergeDeepWithKey2(fn, lObj, rObj) {
      return mergeWithKey(function(k, lVal, rVal) {
        if (_isObject(lVal) && _isObject(rVal)) {
          return mergeDeepWithKey2(fn, lVal, rVal);
        } else {
          return fn(k, lVal, rVal);
        }
      }, lObj, rObj);
    });
    module2.exports = mergeDeepWithKey;
  }
});

// node_modules/ramda/src/mergeDeepLeft.js
var require_mergeDeepLeft = __commonJS({
  "node_modules/ramda/src/mergeDeepLeft.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var mergeDeepWithKey = require_mergeDeepWithKey();
    var mergeDeepLeft = /* @__PURE__ */ _curry2(function mergeDeepLeft2(lObj, rObj) {
      return mergeDeepWithKey(function(k, lVal, rVal) {
        return lVal;
      }, lObj, rObj);
    });
    module2.exports = mergeDeepLeft;
  }
});

// node_modules/ramda/src/mergeDeepRight.js
var require_mergeDeepRight = __commonJS({
  "node_modules/ramda/src/mergeDeepRight.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var mergeDeepWithKey = require_mergeDeepWithKey();
    var mergeDeepRight = /* @__PURE__ */ _curry2(function mergeDeepRight2(lObj, rObj) {
      return mergeDeepWithKey(function(k, lVal, rVal) {
        return rVal;
      }, lObj, rObj);
    });
    module2.exports = mergeDeepRight;
  }
});

// node_modules/ramda/src/mergeDeepWith.js
var require_mergeDeepWith = __commonJS({
  "node_modules/ramda/src/mergeDeepWith.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var mergeDeepWithKey = require_mergeDeepWithKey();
    var mergeDeepWith = /* @__PURE__ */ _curry3(function mergeDeepWith2(fn, lObj, rObj) {
      return mergeDeepWithKey(function(k, lVal, rVal) {
        return fn(lVal, rVal);
      }, lObj, rObj);
    });
    module2.exports = mergeDeepWith;
  }
});

// node_modules/ramda/src/mergeLeft.js
var require_mergeLeft = __commonJS({
  "node_modules/ramda/src/mergeLeft.js"(exports, module2) {
    init_shims();
    var _objectAssign = require_objectAssign();
    var _curry2 = require_curry2();
    var mergeLeft = /* @__PURE__ */ _curry2(function mergeLeft2(l, r) {
      return _objectAssign({}, r, l);
    });
    module2.exports = mergeLeft;
  }
});

// node_modules/ramda/src/mergeRight.js
var require_mergeRight = __commonJS({
  "node_modules/ramda/src/mergeRight.js"(exports, module2) {
    init_shims();
    var _objectAssign = require_objectAssign();
    var _curry2 = require_curry2();
    var mergeRight = /* @__PURE__ */ _curry2(function mergeRight2(l, r) {
      return _objectAssign({}, l, r);
    });
    module2.exports = mergeRight;
  }
});

// node_modules/ramda/src/mergeWith.js
var require_mergeWith = __commonJS({
  "node_modules/ramda/src/mergeWith.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var mergeWithKey = require_mergeWithKey();
    var mergeWith = /* @__PURE__ */ _curry3(function mergeWith2(fn, l, r) {
      return mergeWithKey(function(_, _l, _r) {
        return fn(_l, _r);
      }, l, r);
    });
    module2.exports = mergeWith;
  }
});

// node_modules/ramda/src/min.js
var require_min = __commonJS({
  "node_modules/ramda/src/min.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var min = /* @__PURE__ */ _curry2(function min2(a, b) {
      return b < a ? b : a;
    });
    module2.exports = min;
  }
});

// node_modules/ramda/src/minBy.js
var require_minBy = __commonJS({
  "node_modules/ramda/src/minBy.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var minBy = /* @__PURE__ */ _curry3(function minBy2(f, a, b) {
      return f(b) < f(a) ? b : a;
    });
    module2.exports = minBy;
  }
});

// node_modules/ramda/src/modulo.js
var require_modulo = __commonJS({
  "node_modules/ramda/src/modulo.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var modulo = /* @__PURE__ */ _curry2(function modulo2(a, b) {
      return a % b;
    });
    module2.exports = modulo;
  }
});

// node_modules/ramda/src/move.js
var require_move = __commonJS({
  "node_modules/ramda/src/move.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var move = /* @__PURE__ */ _curry3(function(from, to, list) {
      var length = list.length;
      var result = list.slice();
      var positiveFrom = from < 0 ? length + from : from;
      var positiveTo = to < 0 ? length + to : to;
      var item = result.splice(positiveFrom, 1);
      return positiveFrom < 0 || positiveFrom >= list.length || positiveTo < 0 || positiveTo >= list.length ? list : [].concat(result.slice(0, positiveTo)).concat(item).concat(result.slice(positiveTo, list.length));
    });
    module2.exports = move;
  }
});

// node_modules/ramda/src/multiply.js
var require_multiply = __commonJS({
  "node_modules/ramda/src/multiply.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var multiply = /* @__PURE__ */ _curry2(function multiply2(a, b) {
      return a * b;
    });
    module2.exports = multiply;
  }
});

// node_modules/ramda/src/negate.js
var require_negate = __commonJS({
  "node_modules/ramda/src/negate.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var negate = /* @__PURE__ */ _curry1(function negate2(n) {
      return -n;
    });
    module2.exports = negate;
  }
});

// node_modules/ramda/src/none.js
var require_none = __commonJS({
  "node_modules/ramda/src/none.js"(exports, module2) {
    init_shims();
    var _complement = require_complement2();
    var _curry2 = require_curry2();
    var all = require_all();
    var none = /* @__PURE__ */ _curry2(function none2(fn, input) {
      return all(_complement(fn), input);
    });
    module2.exports = none;
  }
});

// node_modules/ramda/src/nthArg.js
var require_nthArg = __commonJS({
  "node_modules/ramda/src/nthArg.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var curryN = require_curryN2();
    var nth = require_nth();
    var nthArg = /* @__PURE__ */ _curry1(function nthArg2(n) {
      var arity = n < 0 ? 1 : n + 1;
      return curryN(arity, function() {
        return nth(n, arguments);
      });
    });
    module2.exports = nthArg;
  }
});

// node_modules/ramda/src/o.js
var require_o = __commonJS({
  "node_modules/ramda/src/o.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var o = /* @__PURE__ */ _curry3(function o2(f, g, x) {
      return f(g(x));
    });
    module2.exports = o;
  }
});

// node_modules/ramda/src/internal/_of.js
var require_of = __commonJS({
  "node_modules/ramda/src/internal/_of.js"(exports, module2) {
    init_shims();
    function _of(x) {
      return [x];
    }
    module2.exports = _of;
  }
});

// node_modules/ramda/src/of.js
var require_of2 = __commonJS({
  "node_modules/ramda/src/of.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var _of = require_of();
    var of = /* @__PURE__ */ _curry1(_of);
    module2.exports = of;
  }
});

// node_modules/ramda/src/omit.js
var require_omit = __commonJS({
  "node_modules/ramda/src/omit.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var omit = /* @__PURE__ */ _curry2(function omit2(names, obj) {
      var result = {};
      var index2 = {};
      var idx = 0;
      var len = names.length;
      while (idx < len) {
        index2[names[idx]] = 1;
        idx += 1;
      }
      for (var prop2 in obj) {
        if (!index2.hasOwnProperty(prop2)) {
          result[prop2] = obj[prop2];
        }
      }
      return result;
    });
    module2.exports = omit;
  }
});

// node_modules/ramda/src/once.js
var require_once = __commonJS({
  "node_modules/ramda/src/once.js"(exports, module2) {
    init_shims();
    var _arity = require_arity();
    var _curry1 = require_curry1();
    var once = /* @__PURE__ */ _curry1(function once2(fn) {
      var called = false;
      var result;
      return _arity(fn.length, function() {
        if (called) {
          return result;
        }
        called = true;
        result = fn.apply(this, arguments);
        return result;
      });
    });
    module2.exports = once;
  }
});

// node_modules/ramda/src/internal/_assertPromise.js
var require_assertPromise = __commonJS({
  "node_modules/ramda/src/internal/_assertPromise.js"(exports, module2) {
    init_shims();
    var _isFunction = require_isFunction();
    var _toString = require_toString();
    function _assertPromise(name, p) {
      if (p == null || !_isFunction(p.then)) {
        throw new TypeError("`" + name + "` expected a Promise, received " + _toString(p, []));
      }
    }
    module2.exports = _assertPromise;
  }
});

// node_modules/ramda/src/otherwise.js
var require_otherwise = __commonJS({
  "node_modules/ramda/src/otherwise.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _assertPromise = require_assertPromise();
    var otherwise = /* @__PURE__ */ _curry2(function otherwise2(f, p) {
      _assertPromise("otherwise", p);
      return p.then(null, f);
    });
    module2.exports = otherwise;
  }
});

// node_modules/ramda/src/over.js
var require_over = __commonJS({
  "node_modules/ramda/src/over.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var Identity = function(x) {
      return {
        value: x,
        map: function(f) {
          return Identity(f(x));
        }
      };
    };
    var over = /* @__PURE__ */ _curry3(function over2(lens, f, x) {
      return lens(function(y) {
        return Identity(f(y));
      })(x).value;
    });
    module2.exports = over;
  }
});

// node_modules/ramda/src/pair.js
var require_pair = __commonJS({
  "node_modules/ramda/src/pair.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var pair = /* @__PURE__ */ _curry2(function pair2(fst, snd) {
      return [fst, snd];
    });
    module2.exports = pair;
  }
});

// node_modules/ramda/src/internal/_createPartialApplicator.js
var require_createPartialApplicator = __commonJS({
  "node_modules/ramda/src/internal/_createPartialApplicator.js"(exports, module2) {
    init_shims();
    var _arity = require_arity();
    var _curry2 = require_curry2();
    function _createPartialApplicator(concat) {
      return _curry2(function(fn, args) {
        return _arity(Math.max(0, fn.length - args.length), function() {
          return fn.apply(this, concat(args, arguments));
        });
      });
    }
    module2.exports = _createPartialApplicator;
  }
});

// node_modules/ramda/src/partial.js
var require_partial = __commonJS({
  "node_modules/ramda/src/partial.js"(exports, module2) {
    init_shims();
    var _concat = require_concat();
    var _createPartialApplicator = require_createPartialApplicator();
    var partial = /* @__PURE__ */ _createPartialApplicator(_concat);
    module2.exports = partial;
  }
});

// node_modules/ramda/src/partialRight.js
var require_partialRight = __commonJS({
  "node_modules/ramda/src/partialRight.js"(exports, module2) {
    init_shims();
    var _concat = require_concat();
    var _createPartialApplicator = require_createPartialApplicator();
    var flip = require_flip();
    var partialRight = /* @__PURE__ */ _createPartialApplicator(/* @__PURE__ */ flip(_concat));
    module2.exports = partialRight;
  }
});

// node_modules/ramda/src/partition.js
var require_partition = __commonJS({
  "node_modules/ramda/src/partition.js"(exports, module2) {
    init_shims();
    var filter = require_filter2();
    var juxt = require_juxt();
    var reject2 = require_reject();
    var partition = /* @__PURE__ */ juxt([filter, reject2]);
    module2.exports = partition;
  }
});

// node_modules/ramda/src/pathEq.js
var require_pathEq = __commonJS({
  "node_modules/ramda/src/pathEq.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var equals = require_equals2();
    var path = require_path();
    var pathEq = /* @__PURE__ */ _curry3(function pathEq2(_path, val, obj) {
      return equals(path(_path, obj), val);
    });
    module2.exports = pathEq;
  }
});

// node_modules/ramda/src/pathOr.js
var require_pathOr = __commonJS({
  "node_modules/ramda/src/pathOr.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var defaultTo = require_defaultTo();
    var path = require_path();
    var pathOr = /* @__PURE__ */ _curry3(function pathOr2(d2, p, obj) {
      return defaultTo(d2, path(p, obj));
    });
    module2.exports = pathOr;
  }
});

// node_modules/ramda/src/pathSatisfies.js
var require_pathSatisfies = __commonJS({
  "node_modules/ramda/src/pathSatisfies.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var path = require_path();
    var pathSatisfies = /* @__PURE__ */ _curry3(function pathSatisfies2(pred, propPath, obj) {
      return pred(path(propPath, obj));
    });
    module2.exports = pathSatisfies;
  }
});

// node_modules/ramda/src/pick.js
var require_pick = __commonJS({
  "node_modules/ramda/src/pick.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var pick = /* @__PURE__ */ _curry2(function pick2(names, obj) {
      var result = {};
      var idx = 0;
      while (idx < names.length) {
        if (names[idx] in obj) {
          result[names[idx]] = obj[names[idx]];
        }
        idx += 1;
      }
      return result;
    });
    module2.exports = pick;
  }
});

// node_modules/ramda/src/pickAll.js
var require_pickAll = __commonJS({
  "node_modules/ramda/src/pickAll.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var pickAll = /* @__PURE__ */ _curry2(function pickAll2(names, obj) {
      var result = {};
      var idx = 0;
      var len = names.length;
      while (idx < len) {
        var name = names[idx];
        result[name] = obj[name];
        idx += 1;
      }
      return result;
    });
    module2.exports = pickAll;
  }
});

// node_modules/ramda/src/pickBy.js
var require_pickBy = __commonJS({
  "node_modules/ramda/src/pickBy.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var pickBy = /* @__PURE__ */ _curry2(function pickBy2(test, obj) {
      var result = {};
      for (var prop2 in obj) {
        if (test(obj[prop2], prop2, obj)) {
          result[prop2] = obj[prop2];
        }
      }
      return result;
    });
    module2.exports = pickBy;
  }
});

// node_modules/ramda/src/pipeK.js
var require_pipeK = __commonJS({
  "node_modules/ramda/src/pipeK.js"(exports, module2) {
    init_shims();
    var composeK = require_composeK();
    var reverse = require_reverse();
    function pipeK() {
      if (arguments.length === 0) {
        throw new Error("pipeK requires at least one argument");
      }
      return composeK.apply(this, reverse(arguments));
    }
    module2.exports = pipeK;
  }
});

// node_modules/ramda/src/prepend.js
var require_prepend = __commonJS({
  "node_modules/ramda/src/prepend.js"(exports, module2) {
    init_shims();
    var _concat = require_concat();
    var _curry2 = require_curry2();
    var prepend = /* @__PURE__ */ _curry2(function prepend2(el, list) {
      return _concat([el], list);
    });
    module2.exports = prepend;
  }
});

// node_modules/ramda/src/product.js
var require_product = __commonJS({
  "node_modules/ramda/src/product.js"(exports, module2) {
    init_shims();
    var multiply = require_multiply();
    var reduce2 = require_reduce2();
    var product = /* @__PURE__ */ reduce2(multiply, 1);
    module2.exports = product;
  }
});

// node_modules/ramda/src/useWith.js
var require_useWith = __commonJS({
  "node_modules/ramda/src/useWith.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var curryN = require_curryN2();
    var useWith = /* @__PURE__ */ _curry2(function useWith2(fn, transformers) {
      return curryN(transformers.length, function() {
        var args = [];
        var idx = 0;
        while (idx < transformers.length) {
          args.push(transformers[idx].call(this, arguments[idx]));
          idx += 1;
        }
        return fn.apply(this, args.concat(Array.prototype.slice.call(arguments, transformers.length)));
      });
    });
    module2.exports = useWith;
  }
});

// node_modules/ramda/src/project.js
var require_project = __commonJS({
  "node_modules/ramda/src/project.js"(exports, module2) {
    init_shims();
    var _map = require_map();
    var identity = require_identity2();
    var pickAll = require_pickAll();
    var useWith = require_useWith();
    var project = /* @__PURE__ */ useWith(_map, [pickAll, identity]);
    module2.exports = project;
  }
});

// node_modules/ramda/src/propEq.js
var require_propEq = __commonJS({
  "node_modules/ramda/src/propEq.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var equals = require_equals2();
    var propEq2 = /* @__PURE__ */ _curry3(function propEq3(name, val, obj) {
      return equals(val, obj[name]);
    });
    module2.exports = propEq2;
  }
});

// node_modules/ramda/src/propIs.js
var require_propIs = __commonJS({
  "node_modules/ramda/src/propIs.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var is = require_is();
    var propIs = /* @__PURE__ */ _curry3(function propIs2(type, name, obj) {
      return is(type, obj[name]);
    });
    module2.exports = propIs;
  }
});

// node_modules/ramda/src/propOr.js
var require_propOr = __commonJS({
  "node_modules/ramda/src/propOr.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var pathOr = require_pathOr();
    var propOr = /* @__PURE__ */ _curry3(function propOr2(val, p, obj) {
      return pathOr(val, [p], obj);
    });
    module2.exports = propOr;
  }
});

// node_modules/ramda/src/propSatisfies.js
var require_propSatisfies = __commonJS({
  "node_modules/ramda/src/propSatisfies.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var propSatisfies = /* @__PURE__ */ _curry3(function propSatisfies2(pred, name, obj) {
      return pred(obj[name]);
    });
    module2.exports = propSatisfies;
  }
});

// node_modules/ramda/src/props.js
var require_props = __commonJS({
  "node_modules/ramda/src/props.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var path = require_path();
    var props = /* @__PURE__ */ _curry2(function props2(ps, obj) {
      return ps.map(function(p) {
        return path([p], obj);
      });
    });
    module2.exports = props;
  }
});

// node_modules/ramda/src/range.js
var require_range = __commonJS({
  "node_modules/ramda/src/range.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _isNumber = require_isNumber();
    var range = /* @__PURE__ */ _curry2(function range2(from, to) {
      if (!(_isNumber(from) && _isNumber(to))) {
        throw new TypeError("Both arguments to range must be numbers");
      }
      var result = [];
      var n = from;
      while (n < to) {
        result.push(n);
        n += 1;
      }
      return result;
    });
    module2.exports = range;
  }
});

// node_modules/ramda/src/reduceRight.js
var require_reduceRight = __commonJS({
  "node_modules/ramda/src/reduceRight.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var reduceRight = /* @__PURE__ */ _curry3(function reduceRight2(fn, acc, list) {
      var idx = list.length - 1;
      while (idx >= 0) {
        acc = fn(list[idx], acc);
        idx -= 1;
      }
      return acc;
    });
    module2.exports = reduceRight;
  }
});

// node_modules/ramda/src/reduceWhile.js
var require_reduceWhile = __commonJS({
  "node_modules/ramda/src/reduceWhile.js"(exports, module2) {
    init_shims();
    var _curryN = require_curryN();
    var _reduce = require_reduce();
    var _reduced = require_reduced();
    var reduceWhile = /* @__PURE__ */ _curryN(4, [], function _reduceWhile(pred, fn, a, list) {
      return _reduce(function(acc, x) {
        return pred(acc, x) ? fn(acc, x) : _reduced(acc);
      }, a, list);
    });
    module2.exports = reduceWhile;
  }
});

// node_modules/ramda/src/reduced.js
var require_reduced2 = __commonJS({
  "node_modules/ramda/src/reduced.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var _reduced = require_reduced();
    var reduced = /* @__PURE__ */ _curry1(_reduced);
    module2.exports = reduced;
  }
});

// node_modules/ramda/src/times.js
var require_times = __commonJS({
  "node_modules/ramda/src/times.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var times = /* @__PURE__ */ _curry2(function times2(fn, n) {
      var len = Number(n);
      var idx = 0;
      var list;
      if (len < 0 || isNaN(len)) {
        throw new RangeError("n must be a non-negative number");
      }
      list = new Array(len);
      while (idx < len) {
        list[idx] = fn(idx);
        idx += 1;
      }
      return list;
    });
    module2.exports = times;
  }
});

// node_modules/ramda/src/repeat.js
var require_repeat = __commonJS({
  "node_modules/ramda/src/repeat.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var always = require_always();
    var times = require_times();
    var repeat = /* @__PURE__ */ _curry2(function repeat2(value, n) {
      return times(always(value), n);
    });
    module2.exports = repeat;
  }
});

// node_modules/ramda/src/replace.js
var require_replace = __commonJS({
  "node_modules/ramda/src/replace.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var replace = /* @__PURE__ */ _curry3(function replace2(regex, replacement, str) {
      return str.replace(regex, replacement);
    });
    module2.exports = replace;
  }
});

// node_modules/ramda/src/scan.js
var require_scan = __commonJS({
  "node_modules/ramda/src/scan.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var scan = /* @__PURE__ */ _curry3(function scan2(fn, acc, list) {
      var idx = 0;
      var len = list.length;
      var result = [acc];
      while (idx < len) {
        acc = fn(acc, list[idx]);
        result[idx + 1] = acc;
        idx += 1;
      }
      return result;
    });
    module2.exports = scan;
  }
});

// node_modules/ramda/src/sequence.js
var require_sequence = __commonJS({
  "node_modules/ramda/src/sequence.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var ap = require_ap();
    var map2 = require_map2();
    var prepend = require_prepend();
    var reduceRight = require_reduceRight();
    var sequence = /* @__PURE__ */ _curry2(function sequence2(of, traversable) {
      return typeof traversable.sequence === "function" ? traversable.sequence(of) : reduceRight(function(x, acc) {
        return ap(map2(prepend, x), acc);
      }, of([]), traversable);
    });
    module2.exports = sequence;
  }
});

// node_modules/ramda/src/set.js
var require_set = __commonJS({
  "node_modules/ramda/src/set.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var always = require_always();
    var over = require_over();
    var set = /* @__PURE__ */ _curry3(function set2(lens, v, x) {
      return over(lens, always(v), x);
    });
    module2.exports = set;
  }
});

// node_modules/ramda/src/sort.js
var require_sort = __commonJS({
  "node_modules/ramda/src/sort.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var sort = /* @__PURE__ */ _curry2(function sort2(comparator, list) {
      return Array.prototype.slice.call(list, 0).sort(comparator);
    });
    module2.exports = sort;
  }
});

// node_modules/ramda/src/sortBy.js
var require_sortBy = __commonJS({
  "node_modules/ramda/src/sortBy.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var sortBy = /* @__PURE__ */ _curry2(function sortBy2(fn, list) {
      return Array.prototype.slice.call(list, 0).sort(function(a, b) {
        var aa = fn(a);
        var bb = fn(b);
        return aa < bb ? -1 : aa > bb ? 1 : 0;
      });
    });
    module2.exports = sortBy;
  }
});

// node_modules/ramda/src/sortWith.js
var require_sortWith = __commonJS({
  "node_modules/ramda/src/sortWith.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var sortWith = /* @__PURE__ */ _curry2(function sortWith2(fns, list) {
      return Array.prototype.slice.call(list, 0).sort(function(a, b) {
        var result = 0;
        var i = 0;
        while (result === 0 && i < fns.length) {
          result = fns[i](a, b);
          i += 1;
        }
        return result;
      });
    });
    module2.exports = sortWith;
  }
});

// node_modules/ramda/src/split.js
var require_split = __commonJS({
  "node_modules/ramda/src/split.js"(exports, module2) {
    init_shims();
    var invoker = require_invoker();
    var split = /* @__PURE__ */ invoker(1, "split");
    module2.exports = split;
  }
});

// node_modules/ramda/src/splitAt.js
var require_splitAt = __commonJS({
  "node_modules/ramda/src/splitAt.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var length = require_length();
    var slice = require_slice();
    var splitAt = /* @__PURE__ */ _curry2(function splitAt2(index2, array) {
      return [slice(0, index2, array), slice(index2, length(array), array)];
    });
    module2.exports = splitAt;
  }
});

// node_modules/ramda/src/splitEvery.js
var require_splitEvery = __commonJS({
  "node_modules/ramda/src/splitEvery.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var slice = require_slice();
    var splitEvery = /* @__PURE__ */ _curry2(function splitEvery2(n, list) {
      if (n <= 0) {
        throw new Error("First argument to splitEvery must be a positive integer");
      }
      var result = [];
      var idx = 0;
      while (idx < list.length) {
        result.push(slice(idx, idx += n, list));
      }
      return result;
    });
    module2.exports = splitEvery;
  }
});

// node_modules/ramda/src/splitWhen.js
var require_splitWhen = __commonJS({
  "node_modules/ramda/src/splitWhen.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var splitWhen = /* @__PURE__ */ _curry2(function splitWhen2(pred, list) {
      var idx = 0;
      var len = list.length;
      var prefix = [];
      while (idx < len && !pred(list[idx])) {
        prefix.push(list[idx]);
        idx += 1;
      }
      return [prefix, Array.prototype.slice.call(list, idx)];
    });
    module2.exports = splitWhen;
  }
});

// node_modules/ramda/src/startsWith.js
var require_startsWith = __commonJS({
  "node_modules/ramda/src/startsWith.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var equals = require_equals2();
    var take = require_take();
    var startsWith = /* @__PURE__ */ _curry2(function(prefix, list) {
      return equals(take(prefix.length, list), prefix);
    });
    module2.exports = startsWith;
  }
});

// node_modules/ramda/src/subtract.js
var require_subtract = __commonJS({
  "node_modules/ramda/src/subtract.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var subtract = /* @__PURE__ */ _curry2(function subtract2(a, b) {
      return Number(a) - Number(b);
    });
    module2.exports = subtract;
  }
});

// node_modules/ramda/src/symmetricDifference.js
var require_symmetricDifference = __commonJS({
  "node_modules/ramda/src/symmetricDifference.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var concat = require_concat2();
    var difference = require_difference();
    var symmetricDifference = /* @__PURE__ */ _curry2(function symmetricDifference2(list1, list2) {
      return concat(difference(list1, list2), difference(list2, list1));
    });
    module2.exports = symmetricDifference;
  }
});

// node_modules/ramda/src/symmetricDifferenceWith.js
var require_symmetricDifferenceWith = __commonJS({
  "node_modules/ramda/src/symmetricDifferenceWith.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var concat = require_concat2();
    var differenceWith = require_differenceWith();
    var symmetricDifferenceWith = /* @__PURE__ */ _curry3(function symmetricDifferenceWith2(pred, list1, list2) {
      return concat(differenceWith(pred, list1, list2), differenceWith(pred, list2, list1));
    });
    module2.exports = symmetricDifferenceWith;
  }
});

// node_modules/ramda/src/takeLastWhile.js
var require_takeLastWhile = __commonJS({
  "node_modules/ramda/src/takeLastWhile.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var slice = require_slice();
    var takeLastWhile = /* @__PURE__ */ _curry2(function takeLastWhile2(fn, xs) {
      var idx = xs.length - 1;
      while (idx >= 0 && fn(xs[idx])) {
        idx -= 1;
      }
      return slice(idx + 1, Infinity, xs);
    });
    module2.exports = takeLastWhile;
  }
});

// node_modules/ramda/src/internal/_xtakeWhile.js
var require_xtakeWhile = __commonJS({
  "node_modules/ramda/src/internal/_xtakeWhile.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _reduced = require_reduced();
    var _xfBase = require_xfBase();
    var XTakeWhile = /* @__PURE__ */ function() {
      function XTakeWhile2(f, xf) {
        this.xf = xf;
        this.f = f;
      }
      XTakeWhile2.prototype["@@transducer/init"] = _xfBase.init;
      XTakeWhile2.prototype["@@transducer/result"] = _xfBase.result;
      XTakeWhile2.prototype["@@transducer/step"] = function(result, input) {
        return this.f(input) ? this.xf["@@transducer/step"](result, input) : _reduced(result);
      };
      return XTakeWhile2;
    }();
    var _xtakeWhile = /* @__PURE__ */ _curry2(function _xtakeWhile2(f, xf) {
      return new XTakeWhile(f, xf);
    });
    module2.exports = _xtakeWhile;
  }
});

// node_modules/ramda/src/takeWhile.js
var require_takeWhile = __commonJS({
  "node_modules/ramda/src/takeWhile.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xtakeWhile = require_xtakeWhile();
    var slice = require_slice();
    var takeWhile = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["takeWhile"], _xtakeWhile, function takeWhile2(fn, xs) {
      var idx = 0;
      var len = xs.length;
      while (idx < len && fn(xs[idx])) {
        idx += 1;
      }
      return slice(0, idx, xs);
    }));
    module2.exports = takeWhile;
  }
});

// node_modules/ramda/src/internal/_xtap.js
var require_xtap = __commonJS({
  "node_modules/ramda/src/internal/_xtap.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _xfBase = require_xfBase();
    var XTap = /* @__PURE__ */ function() {
      function XTap2(f, xf) {
        this.xf = xf;
        this.f = f;
      }
      XTap2.prototype["@@transducer/init"] = _xfBase.init;
      XTap2.prototype["@@transducer/result"] = _xfBase.result;
      XTap2.prototype["@@transducer/step"] = function(result, input) {
        this.f(input);
        return this.xf["@@transducer/step"](result, input);
      };
      return XTap2;
    }();
    var _xtap = /* @__PURE__ */ _curry2(function _xtap2(f, xf) {
      return new XTap(f, xf);
    });
    module2.exports = _xtap;
  }
});

// node_modules/ramda/src/tap.js
var require_tap = __commonJS({
  "node_modules/ramda/src/tap.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xtap = require_xtap();
    var tap = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xtap, function tap2(fn, x) {
      fn(x);
      return x;
    }));
    module2.exports = tap;
  }
});

// node_modules/ramda/src/internal/_isRegExp.js
var require_isRegExp = __commonJS({
  "node_modules/ramda/src/internal/_isRegExp.js"(exports, module2) {
    init_shims();
    function _isRegExp(x) {
      return Object.prototype.toString.call(x) === "[object RegExp]";
    }
    module2.exports = _isRegExp;
  }
});

// node_modules/ramda/src/test.js
var require_test = __commonJS({
  "node_modules/ramda/src/test.js"(exports, module2) {
    init_shims();
    var _cloneRegExp = require_cloneRegExp();
    var _curry2 = require_curry2();
    var _isRegExp = require_isRegExp();
    var toString = require_toString2();
    var test = /* @__PURE__ */ _curry2(function test2(pattern, str) {
      if (!_isRegExp(pattern)) {
        throw new TypeError("\u2018test\u2019 requires a value of type RegExp as its first argument; received " + toString(pattern));
      }
      return _cloneRegExp(pattern).test(str);
    });
    module2.exports = test;
  }
});

// node_modules/ramda/src/andThen.js
var require_andThen = __commonJS({
  "node_modules/ramda/src/andThen.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _assertPromise = require_assertPromise();
    var andThen = /* @__PURE__ */ _curry2(function andThen2(f, p) {
      _assertPromise("andThen", p);
      return p.then(f);
    });
    module2.exports = andThen;
  }
});

// node_modules/ramda/src/toLower.js
var require_toLower = __commonJS({
  "node_modules/ramda/src/toLower.js"(exports, module2) {
    init_shims();
    var invoker = require_invoker();
    var toLower = /* @__PURE__ */ invoker(0, "toLowerCase");
    module2.exports = toLower;
  }
});

// node_modules/ramda/src/toPairs.js
var require_toPairs = __commonJS({
  "node_modules/ramda/src/toPairs.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var _has = require_has();
    var toPairs = /* @__PURE__ */ _curry1(function toPairs2(obj) {
      var pairs = [];
      for (var prop2 in obj) {
        if (_has(prop2, obj)) {
          pairs[pairs.length] = [prop2, obj[prop2]];
        }
      }
      return pairs;
    });
    module2.exports = toPairs;
  }
});

// node_modules/ramda/src/toPairsIn.js
var require_toPairsIn = __commonJS({
  "node_modules/ramda/src/toPairsIn.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var toPairsIn = /* @__PURE__ */ _curry1(function toPairsIn2(obj) {
      var pairs = [];
      for (var prop2 in obj) {
        pairs[pairs.length] = [prop2, obj[prop2]];
      }
      return pairs;
    });
    module2.exports = toPairsIn;
  }
});

// node_modules/ramda/src/toUpper.js
var require_toUpper = __commonJS({
  "node_modules/ramda/src/toUpper.js"(exports, module2) {
    init_shims();
    var invoker = require_invoker();
    var toUpper = /* @__PURE__ */ invoker(0, "toUpperCase");
    module2.exports = toUpper;
  }
});

// node_modules/ramda/src/transduce.js
var require_transduce = __commonJS({
  "node_modules/ramda/src/transduce.js"(exports, module2) {
    init_shims();
    var _reduce = require_reduce();
    var _xwrap = require_xwrap();
    var curryN = require_curryN2();
    var transduce = /* @__PURE__ */ curryN(4, function transduce2(xf, fn, acc, list) {
      return _reduce(xf(typeof fn === "function" ? _xwrap(fn) : fn), acc, list);
    });
    module2.exports = transduce;
  }
});

// node_modules/ramda/src/transpose.js
var require_transpose = __commonJS({
  "node_modules/ramda/src/transpose.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var transpose = /* @__PURE__ */ _curry1(function transpose2(outerlist) {
      var i = 0;
      var result = [];
      while (i < outerlist.length) {
        var innerlist = outerlist[i];
        var j = 0;
        while (j < innerlist.length) {
          if (typeof result[j] === "undefined") {
            result[j] = [];
          }
          result[j].push(innerlist[j]);
          j += 1;
        }
        i += 1;
      }
      return result;
    });
    module2.exports = transpose;
  }
});

// node_modules/ramda/src/traverse.js
var require_traverse = __commonJS({
  "node_modules/ramda/src/traverse.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var map2 = require_map2();
    var sequence = require_sequence();
    var traverse = /* @__PURE__ */ _curry3(function traverse2(of, f, traversable) {
      return typeof traversable["fantasy-land/traverse"] === "function" ? traversable["fantasy-land/traverse"](f, of) : sequence(of, map2(f, traversable));
    });
    module2.exports = traverse;
  }
});

// node_modules/ramda/src/trim.js
var require_trim = __commonJS({
  "node_modules/ramda/src/trim.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var ws = "	\n\v\f\r \xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";
    var zeroWidth = "\u200B";
    var hasProtoTrim = typeof String.prototype.trim === "function";
    var trim = !hasProtoTrim || /* @__PURE__ */ ws.trim() || !/* @__PURE__ */ zeroWidth.trim() ? /* @__PURE__ */ _curry1(function trim2(str) {
      var beginRx = new RegExp("^[" + ws + "][" + ws + "]*");
      var endRx = new RegExp("[" + ws + "][" + ws + "]*$");
      return str.replace(beginRx, "").replace(endRx, "");
    }) : /* @__PURE__ */ _curry1(function trim2(str) {
      return str.trim();
    });
    module2.exports = trim;
  }
});

// node_modules/ramda/src/tryCatch.js
var require_tryCatch = __commonJS({
  "node_modules/ramda/src/tryCatch.js"(exports, module2) {
    init_shims();
    var _arity = require_arity();
    var _concat = require_concat();
    var _curry2 = require_curry2();
    var tryCatch = /* @__PURE__ */ _curry2(function _tryCatch(tryer, catcher) {
      return _arity(tryer.length, function() {
        try {
          return tryer.apply(this, arguments);
        } catch (e) {
          return catcher.apply(this, _concat([e], arguments));
        }
      });
    });
    module2.exports = tryCatch;
  }
});

// node_modules/ramda/src/unapply.js
var require_unapply = __commonJS({
  "node_modules/ramda/src/unapply.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var unapply = /* @__PURE__ */ _curry1(function unapply2(fn) {
      return function() {
        return fn(Array.prototype.slice.call(arguments, 0));
      };
    });
    module2.exports = unapply;
  }
});

// node_modules/ramda/src/unary.js
var require_unary = __commonJS({
  "node_modules/ramda/src/unary.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var nAry = require_nAry();
    var unary = /* @__PURE__ */ _curry1(function unary2(fn) {
      return nAry(1, fn);
    });
    module2.exports = unary;
  }
});

// node_modules/ramda/src/uncurryN.js
var require_uncurryN = __commonJS({
  "node_modules/ramda/src/uncurryN.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var curryN = require_curryN2();
    var uncurryN = /* @__PURE__ */ _curry2(function uncurryN2(depth, fn) {
      return curryN(depth, function() {
        var currentDepth = 1;
        var value = fn;
        var idx = 0;
        var endIdx;
        while (currentDepth <= depth && typeof value === "function") {
          endIdx = currentDepth === depth ? arguments.length : idx + value.length;
          value = value.apply(this, Array.prototype.slice.call(arguments, idx, endIdx));
          currentDepth += 1;
          idx = endIdx;
        }
        return value;
      });
    });
    module2.exports = uncurryN;
  }
});

// node_modules/ramda/src/unfold.js
var require_unfold = __commonJS({
  "node_modules/ramda/src/unfold.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var unfold = /* @__PURE__ */ _curry2(function unfold2(fn, seed) {
      var pair = fn(seed);
      var result = [];
      while (pair && pair.length) {
        result[result.length] = pair[0];
        pair = fn(pair[1]);
      }
      return result;
    });
    module2.exports = unfold;
  }
});

// node_modules/ramda/src/union.js
var require_union = __commonJS({
  "node_modules/ramda/src/union.js"(exports, module2) {
    init_shims();
    var _concat = require_concat();
    var _curry2 = require_curry2();
    var compose = require_compose();
    var uniq = require_uniq();
    var union = /* @__PURE__ */ _curry2(/* @__PURE__ */ compose(uniq, _concat));
    module2.exports = union;
  }
});

// node_modules/ramda/src/uniqWith.js
var require_uniqWith = __commonJS({
  "node_modules/ramda/src/uniqWith.js"(exports, module2) {
    init_shims();
    var _includesWith = require_includesWith();
    var _curry2 = require_curry2();
    var uniqWith = /* @__PURE__ */ _curry2(function uniqWith2(pred, list) {
      var idx = 0;
      var len = list.length;
      var result = [];
      var item;
      while (idx < len) {
        item = list[idx];
        if (!_includesWith(pred, item, result)) {
          result[result.length] = item;
        }
        idx += 1;
      }
      return result;
    });
    module2.exports = uniqWith;
  }
});

// node_modules/ramda/src/unionWith.js
var require_unionWith = __commonJS({
  "node_modules/ramda/src/unionWith.js"(exports, module2) {
    init_shims();
    var _concat = require_concat();
    var _curry3 = require_curry3();
    var uniqWith = require_uniqWith();
    var unionWith = /* @__PURE__ */ _curry3(function unionWith2(pred, list1, list2) {
      return uniqWith(pred, _concat(list1, list2));
    });
    module2.exports = unionWith;
  }
});

// node_modules/ramda/src/unless.js
var require_unless = __commonJS({
  "node_modules/ramda/src/unless.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var unless = /* @__PURE__ */ _curry3(function unless2(pred, whenFalseFn, x) {
      return pred(x) ? x : whenFalseFn(x);
    });
    module2.exports = unless;
  }
});

// node_modules/ramda/src/unnest.js
var require_unnest = __commonJS({
  "node_modules/ramda/src/unnest.js"(exports, module2) {
    init_shims();
    var _identity = require_identity();
    var chain = require_chain();
    var unnest = /* @__PURE__ */ chain(_identity);
    module2.exports = unnest;
  }
});

// node_modules/ramda/src/until.js
var require_until = __commonJS({
  "node_modules/ramda/src/until.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var until = /* @__PURE__ */ _curry3(function until2(pred, fn, init2) {
      var val = init2;
      while (!pred(val)) {
        val = fn(val);
      }
      return val;
    });
    module2.exports = until;
  }
});

// node_modules/ramda/src/valuesIn.js
var require_valuesIn = __commonJS({
  "node_modules/ramda/src/valuesIn.js"(exports, module2) {
    init_shims();
    var _curry1 = require_curry1();
    var valuesIn = /* @__PURE__ */ _curry1(function valuesIn2(obj) {
      var prop2;
      var vs = [];
      for (prop2 in obj) {
        vs[vs.length] = obj[prop2];
      }
      return vs;
    });
    module2.exports = valuesIn;
  }
});

// node_modules/ramda/src/view.js
var require_view = __commonJS({
  "node_modules/ramda/src/view.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var Const = function(x) {
      return {
        value: x,
        "fantasy-land/map": function() {
          return this;
        }
      };
    };
    var view = /* @__PURE__ */ _curry2(function view2(lens, x) {
      return lens(Const)(x).value;
    });
    module2.exports = view;
  }
});

// node_modules/ramda/src/when.js
var require_when = __commonJS({
  "node_modules/ramda/src/when.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var when = /* @__PURE__ */ _curry3(function when2(pred, whenTrueFn, x) {
      return pred(x) ? whenTrueFn(x) : x;
    });
    module2.exports = when;
  }
});

// node_modules/ramda/src/where.js
var require_where = __commonJS({
  "node_modules/ramda/src/where.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var _has = require_has();
    var where = /* @__PURE__ */ _curry2(function where2(spec, testObj) {
      for (var prop2 in spec) {
        if (_has(prop2, spec) && !spec[prop2](testObj[prop2])) {
          return false;
        }
      }
      return true;
    });
    module2.exports = where;
  }
});

// node_modules/ramda/src/whereEq.js
var require_whereEq = __commonJS({
  "node_modules/ramda/src/whereEq.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var equals = require_equals2();
    var map2 = require_map2();
    var where = require_where();
    var whereEq = /* @__PURE__ */ _curry2(function whereEq2(spec, testObj) {
      return where(map2(equals, spec), testObj);
    });
    module2.exports = whereEq;
  }
});

// node_modules/ramda/src/without.js
var require_without = __commonJS({
  "node_modules/ramda/src/without.js"(exports, module2) {
    init_shims();
    var _includes = require_includes();
    var _curry2 = require_curry2();
    var flip = require_flip();
    var reject2 = require_reject();
    var without = /* @__PURE__ */ _curry2(function(xs, list) {
      return reject2(flip(_includes)(xs), list);
    });
    module2.exports = without;
  }
});

// node_modules/ramda/src/xor.js
var require_xor = __commonJS({
  "node_modules/ramda/src/xor.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var xor = /* @__PURE__ */ _curry2(function xor2(a, b) {
      return Boolean(!a ^ !b);
    });
    module2.exports = xor;
  }
});

// node_modules/ramda/src/xprod.js
var require_xprod = __commonJS({
  "node_modules/ramda/src/xprod.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var xprod = /* @__PURE__ */ _curry2(function xprod2(a, b) {
      var idx = 0;
      var ilen = a.length;
      var j;
      var jlen = b.length;
      var result = [];
      while (idx < ilen) {
        j = 0;
        while (j < jlen) {
          result[result.length] = [a[idx], b[j]];
          j += 1;
        }
        idx += 1;
      }
      return result;
    });
    module2.exports = xprod;
  }
});

// node_modules/ramda/src/zip.js
var require_zip = __commonJS({
  "node_modules/ramda/src/zip.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var zip = /* @__PURE__ */ _curry2(function zip2(a, b) {
      var rv = [];
      var idx = 0;
      var len = Math.min(a.length, b.length);
      while (idx < len) {
        rv[idx] = [a[idx], b[idx]];
        idx += 1;
      }
      return rv;
    });
    module2.exports = zip;
  }
});

// node_modules/ramda/src/zipObj.js
var require_zipObj = __commonJS({
  "node_modules/ramda/src/zipObj.js"(exports, module2) {
    init_shims();
    var _curry2 = require_curry2();
    var zipObj = /* @__PURE__ */ _curry2(function zipObj2(keys, values) {
      var idx = 0;
      var len = Math.min(keys.length, values.length);
      var out = {};
      while (idx < len) {
        out[keys[idx]] = values[idx];
        idx += 1;
      }
      return out;
    });
    module2.exports = zipObj;
  }
});

// node_modules/ramda/src/zipWith.js
var require_zipWith = __commonJS({
  "node_modules/ramda/src/zipWith.js"(exports, module2) {
    init_shims();
    var _curry3 = require_curry3();
    var zipWith = /* @__PURE__ */ _curry3(function zipWith2(fn, a, b) {
      var rv = [];
      var idx = 0;
      var len = Math.min(a.length, b.length);
      while (idx < len) {
        rv[idx] = fn(a[idx], b[idx]);
        idx += 1;
      }
      return rv;
    });
    module2.exports = zipWith;
  }
});

// node_modules/ramda/src/thunkify.js
var require_thunkify = __commonJS({
  "node_modules/ramda/src/thunkify.js"(exports, module2) {
    init_shims();
    var curryN = require_curryN2();
    var _curry1 = require_curry1();
    var thunkify = /* @__PURE__ */ _curry1(function thunkify2(fn) {
      return curryN(fn.length, function createThunk() {
        var fnArgs = arguments;
        return function invokeThunk() {
          return fn.apply(this, fnArgs);
        };
      });
    });
    module2.exports = thunkify;
  }
});

// node_modules/ramda/src/index.js
var require_src = __commonJS({
  "node_modules/ramda/src/index.js"(exports, module2) {
    init_shims();
    module2.exports = {};
    module2.exports.F = require_F();
    module2.exports.T = require_T();
    module2.exports.__ = require__();
    module2.exports.add = require_add();
    module2.exports.addIndex = require_addIndex();
    module2.exports.adjust = require_adjust();
    module2.exports.all = require_all();
    module2.exports.allPass = require_allPass();
    module2.exports.always = require_always();
    module2.exports.and = require_and();
    module2.exports.any = require_any();
    module2.exports.anyPass = require_anyPass();
    module2.exports.ap = require_ap();
    module2.exports.aperture = require_aperture2();
    module2.exports.append = require_append();
    module2.exports.apply = require_apply();
    module2.exports.applySpec = require_applySpec();
    module2.exports.applyTo = require_applyTo();
    module2.exports.ascend = require_ascend();
    module2.exports.assoc = require_assoc();
    module2.exports.assocPath = require_assocPath();
    module2.exports.binary = require_binary();
    module2.exports.bind = require_bind();
    module2.exports.both = require_both();
    module2.exports.call = require_call();
    module2.exports.chain = require_chain();
    module2.exports.clamp = require_clamp();
    module2.exports.clone = require_clone2();
    module2.exports.comparator = require_comparator();
    module2.exports.complement = require_complement();
    module2.exports.compose = require_compose();
    module2.exports.composeK = require_composeK();
    module2.exports.composeP = require_composeP();
    module2.exports.composeWith = require_composeWith();
    module2.exports.concat = require_concat2();
    module2.exports.cond = require_cond();
    module2.exports.construct = require_construct();
    module2.exports.constructN = require_constructN();
    module2.exports.contains = require_contains();
    module2.exports.converge = require_converge();
    module2.exports.countBy = require_countBy();
    module2.exports.curry = require_curry();
    module2.exports.curryN = require_curryN2();
    module2.exports.dec = require_dec();
    module2.exports.defaultTo = require_defaultTo();
    module2.exports.descend = require_descend();
    module2.exports.difference = require_difference();
    module2.exports.differenceWith = require_differenceWith();
    module2.exports.dissoc = require_dissoc();
    module2.exports.dissocPath = require_dissocPath();
    module2.exports.divide = require_divide();
    module2.exports.drop = require_drop();
    module2.exports.dropLast = require_dropLast2();
    module2.exports.dropLastWhile = require_dropLastWhile2();
    module2.exports.dropRepeats = require_dropRepeats();
    module2.exports.dropRepeatsWith = require_dropRepeatsWith();
    module2.exports.dropWhile = require_dropWhile();
    module2.exports.either = require_either();
    module2.exports.empty = require_empty();
    module2.exports.endsWith = require_endsWith();
    module2.exports.eqBy = require_eqBy();
    module2.exports.eqProps = require_eqProps();
    module2.exports.equals = require_equals2();
    module2.exports.evolve = require_evolve();
    module2.exports.filter = require_filter2();
    module2.exports.find = require_find();
    module2.exports.findIndex = require_findIndex();
    module2.exports.findLast = require_findLast();
    module2.exports.findLastIndex = require_findLastIndex();
    module2.exports.flatten = require_flatten();
    module2.exports.flip = require_flip();
    module2.exports.forEach = require_forEach();
    module2.exports.forEachObjIndexed = require_forEachObjIndexed();
    module2.exports.fromPairs = require_fromPairs();
    module2.exports.groupBy = require_groupBy();
    module2.exports.groupWith = require_groupWith();
    module2.exports.gt = require_gt();
    module2.exports.gte = require_gte();
    module2.exports.has = require_has2();
    module2.exports.hasIn = require_hasIn();
    module2.exports.hasPath = require_hasPath();
    module2.exports.head = require_head();
    module2.exports.identical = require_identical();
    module2.exports.identity = require_identity2();
    module2.exports.ifElse = require_ifElse();
    module2.exports.inc = require_inc();
    module2.exports.includes = require_includes2();
    module2.exports.indexBy = require_indexBy();
    module2.exports.indexOf = require_indexOf2();
    module2.exports.init = require_init();
    module2.exports.innerJoin = require_innerJoin();
    module2.exports.insert = require_insert();
    module2.exports.insertAll = require_insertAll();
    module2.exports.intersection = require_intersection();
    module2.exports.intersperse = require_intersperse();
    module2.exports.into = require_into();
    module2.exports.invert = require_invert();
    module2.exports.invertObj = require_invertObj();
    module2.exports.invoker = require_invoker();
    module2.exports.is = require_is();
    module2.exports.isEmpty = require_isEmpty();
    module2.exports.isNil = require_isNil();
    module2.exports.join = require_join();
    module2.exports.juxt = require_juxt();
    module2.exports.keys = require_keys();
    module2.exports.keysIn = require_keysIn();
    module2.exports.last = require_last();
    module2.exports.lastIndexOf = require_lastIndexOf();
    module2.exports.length = require_length();
    module2.exports.lens = require_lens();
    module2.exports.lensIndex = require_lensIndex();
    module2.exports.lensPath = require_lensPath();
    module2.exports.lensProp = require_lensProp();
    module2.exports.lift = require_lift();
    module2.exports.liftN = require_liftN();
    module2.exports.lt = require_lt();
    module2.exports.lte = require_lte();
    module2.exports.map = require_map2();
    module2.exports.mapAccum = require_mapAccum();
    module2.exports.mapAccumRight = require_mapAccumRight();
    module2.exports.mapObjIndexed = require_mapObjIndexed();
    module2.exports.match = require_match();
    module2.exports.mathMod = require_mathMod();
    module2.exports.max = require_max();
    module2.exports.maxBy = require_maxBy();
    module2.exports.mean = require_mean();
    module2.exports.median = require_median();
    module2.exports.memoizeWith = require_memoizeWith();
    module2.exports.merge = require_merge();
    module2.exports.mergeAll = require_mergeAll();
    module2.exports.mergeDeepLeft = require_mergeDeepLeft();
    module2.exports.mergeDeepRight = require_mergeDeepRight();
    module2.exports.mergeDeepWith = require_mergeDeepWith();
    module2.exports.mergeDeepWithKey = require_mergeDeepWithKey();
    module2.exports.mergeLeft = require_mergeLeft();
    module2.exports.mergeRight = require_mergeRight();
    module2.exports.mergeWith = require_mergeWith();
    module2.exports.mergeWithKey = require_mergeWithKey();
    module2.exports.min = require_min();
    module2.exports.minBy = require_minBy();
    module2.exports.modulo = require_modulo();
    module2.exports.move = require_move();
    module2.exports.multiply = require_multiply();
    module2.exports.nAry = require_nAry();
    module2.exports.negate = require_negate();
    module2.exports.none = require_none();
    module2.exports.not = require_not();
    module2.exports.nth = require_nth();
    module2.exports.nthArg = require_nthArg();
    module2.exports.o = require_o();
    module2.exports.objOf = require_objOf();
    module2.exports.of = require_of2();
    module2.exports.omit = require_omit();
    module2.exports.once = require_once();
    module2.exports.or = require_or();
    module2.exports.otherwise = require_otherwise();
    module2.exports.over = require_over();
    module2.exports.pair = require_pair();
    module2.exports.partial = require_partial();
    module2.exports.partialRight = require_partialRight();
    module2.exports.partition = require_partition();
    module2.exports.path = require_path();
    module2.exports.paths = require_paths();
    module2.exports.pathEq = require_pathEq();
    module2.exports.pathOr = require_pathOr();
    module2.exports.pathSatisfies = require_pathSatisfies();
    module2.exports.pick = require_pick();
    module2.exports.pickAll = require_pickAll();
    module2.exports.pickBy = require_pickBy();
    module2.exports.pipe = require_pipe2();
    module2.exports.pipeK = require_pipeK();
    module2.exports.pipeP = require_pipeP2();
    module2.exports.pipeWith = require_pipeWith();
    module2.exports.pluck = require_pluck();
    module2.exports.prepend = require_prepend();
    module2.exports.product = require_product();
    module2.exports.project = require_project();
    module2.exports.prop = require_prop();
    module2.exports.propEq = require_propEq();
    module2.exports.propIs = require_propIs();
    module2.exports.propOr = require_propOr();
    module2.exports.propSatisfies = require_propSatisfies();
    module2.exports.props = require_props();
    module2.exports.range = require_range();
    module2.exports.reduce = require_reduce2();
    module2.exports.reduceBy = require_reduceBy();
    module2.exports.reduceRight = require_reduceRight();
    module2.exports.reduceWhile = require_reduceWhile();
    module2.exports.reduced = require_reduced2();
    module2.exports.reject = require_reject();
    module2.exports.remove = require_remove();
    module2.exports.repeat = require_repeat();
    module2.exports.replace = require_replace();
    module2.exports.reverse = require_reverse();
    module2.exports.scan = require_scan();
    module2.exports.sequence = require_sequence();
    module2.exports.set = require_set();
    module2.exports.slice = require_slice();
    module2.exports.sort = require_sort();
    module2.exports.sortBy = require_sortBy();
    module2.exports.sortWith = require_sortWith();
    module2.exports.split = require_split();
    module2.exports.splitAt = require_splitAt();
    module2.exports.splitEvery = require_splitEvery();
    module2.exports.splitWhen = require_splitWhen();
    module2.exports.startsWith = require_startsWith();
    module2.exports.subtract = require_subtract();
    module2.exports.sum = require_sum();
    module2.exports.symmetricDifference = require_symmetricDifference();
    module2.exports.symmetricDifferenceWith = require_symmetricDifferenceWith();
    module2.exports.tail = require_tail();
    module2.exports.take = require_take();
    module2.exports.takeLast = require_takeLast();
    module2.exports.takeLastWhile = require_takeLastWhile();
    module2.exports.takeWhile = require_takeWhile();
    module2.exports.tap = require_tap();
    module2.exports.test = require_test();
    module2.exports.andThen = require_andThen();
    module2.exports.times = require_times();
    module2.exports.toLower = require_toLower();
    module2.exports.toPairs = require_toPairs();
    module2.exports.toPairsIn = require_toPairsIn();
    module2.exports.toString = require_toString2();
    module2.exports.toUpper = require_toUpper();
    module2.exports.transduce = require_transduce();
    module2.exports.transpose = require_transpose();
    module2.exports.traverse = require_traverse();
    module2.exports.trim = require_trim();
    module2.exports.tryCatch = require_tryCatch();
    module2.exports.type = require_type();
    module2.exports.unapply = require_unapply();
    module2.exports.unary = require_unary();
    module2.exports.uncurryN = require_uncurryN();
    module2.exports.unfold = require_unfold();
    module2.exports.union = require_union();
    module2.exports.unionWith = require_unionWith();
    module2.exports.uniq = require_uniq();
    module2.exports.uniqBy = require_uniqBy();
    module2.exports.uniqWith = require_uniqWith();
    module2.exports.unless = require_unless();
    module2.exports.unnest = require_unnest();
    module2.exports.until = require_until();
    module2.exports.update = require_update();
    module2.exports.useWith = require_useWith();
    module2.exports.values = require_values();
    module2.exports.valuesIn = require_valuesIn();
    module2.exports.view = require_view();
    module2.exports.when = require_when();
    module2.exports.where = require_where();
    module2.exports.whereEq = require_whereEq();
    module2.exports.without = require_without();
    module2.exports.xor = require_xor();
    module2.exports.xprod = require_xprod();
    module2.exports.zip = require_zip();
    module2.exports.zipObj = require_zipObj();
    module2.exports.zipWith = require_zipWith();
    module2.exports.thunkify = require_thunkify();
  }
});

// .svelte-kit/vercel/entry.js
__export(exports, {
  default: () => entry_default
});
init_shims();

// node_modules/@sveltejs/kit/dist/node.js
init_shims();

// node_modules/@sveltejs/kit/dist/adapter-utils.js
init_shims();
function isContentTypeTextual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}

// node_modules/@sveltejs/kit/dist/node.js
function getRawBody(req) {
  return new Promise((fulfil, reject2) => {
    const h = req.headers;
    if (!h["content-type"]) {
      return fulfil("");
    }
    req.on("error", reject2);
    const length = Number(h["content-length"]);
    if (isNaN(length) && h["transfer-encoding"] == null) {
      return fulfil("");
    }
    let data = new Uint8Array(length || 0);
    if (length > 0) {
      let offset = 0;
      req.on("data", (chunk) => {
        const new_len = offset + Buffer.byteLength(chunk);
        if (new_len > length) {
          return reject2({
            status: 413,
            reason: 'Exceeded "Content-Length" limit'
          });
        }
        data.set(chunk, offset);
        offset = new_len;
      });
    } else {
      req.on("data", (chunk) => {
        const new_data = new Uint8Array(data.length + chunk.length);
        new_data.set(data, 0);
        new_data.set(chunk, data.length);
        data = new_data;
      });
    }
    req.on("end", () => {
      const [type] = (h["content-type"] || "").split(/;\s*/);
      if (isContentTypeTextual(type)) {
        const encoding = h["content-encoding"] || "utf-8";
        return fulfil(new TextDecoder(encoding).decode(data));
      }
      fulfil(data);
    });
  });
}

// .svelte-kit/output/server/app.js
init_shims();

// node_modules/@sveltejs/kit/dist/ssr.js
init_shims();
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
async function render_endpoint(request, route) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler) {
    return;
  }
  const match = route.pattern.exec(request.path);
  if (!match) {
    return error("could not parse parameters from request path");
  }
  const params = route.params(match);
  const response = await handler({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = headers["content-type"];
  const is_type_textual = isContentTypeTextual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = [];
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s2 = subscribers[i];
          s2[1]();
          subscriber_queue.push(s2, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      const index2 = subscribers.indexOf(subscriber);
      if (index2 !== -1) {
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var s$1 = JSON.stringify;
async function render_response({
  options: options2,
  $session,
  page_config,
  status,
  error: error3,
  branch,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error3) {
    error3.stack = options2.get_stack(error3);
  }
  if (branch) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error4) => {
      throw new Error(`Failed to serialize session data: ${error4.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error3)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page && page.path)},
						query: new URLSearchParams(${page ? s$1(page.query.toString()) : ""}),
						params: ${page && s$1(page.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url="${url}"`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n			")}
		`.replace(/^\t{2}/gm, "");
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(err);
    return null;
  }
}
function serialize_error(error3) {
  if (!error3)
    return null;
  let serialized = try_serialize(error3);
  if (!serialized) {
    const { name, message, stack } = error3;
    serialized = try_serialize({ ...error3, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error3 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error3 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error3}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error3 };
    }
    return { status, error: error3 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  context,
  is_leaf,
  is_error,
  status,
  error: error3
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  if (module2.load) {
    const load_input = {
      page,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? {
              "content-type": asset.type
            } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith(options2.paths.base || "/") && !resolved.startsWith("//")) {
          const relative = resolved.replace(options2.paths.base, "");
          const headers = { ...opts.headers };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body,
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.serverFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 !== "etag" && key2 !== "set-cookie")
                    headers[key2] = value;
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error3;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    uses_credentials
  };
}
var escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function coalesce_to_error(err) {
  return err instanceof Error ? err : new Error(JSON.stringify(err));
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error3 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    context: {},
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      context: loaded ? loaded.context : {},
      is_leaf: false,
      is_error: true,
      status,
      error: error3
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error3,
      branch,
      page
    });
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4);
    return {
      status: 500,
      headers: {},
      body: error4.stack
    };
  }
}
async function respond$1({ request, options: options2, state, $session, route }) {
  const match = route.pattern.exec(request.path);
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  const page_config = {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch;
  let status = 200;
  let error3;
  ssr:
    if (page_config.ssr) {
      let context = {};
      branch = [];
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              request,
              options: options2,
              state,
              route,
              page,
              node,
              $session,
              context,
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            if (loaded.loaded.redirect) {
              return {
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              };
            }
            if (loaded.loaded.error) {
              ({ status, error: error3 } = loaded.loaded);
            } else {
              branch.push(loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e);
            status = 500;
            error3 = e;
          }
          if (error3) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                let error_loaded;
                try {
                  error_loaded = await load_node({
                    request,
                    options: options2,
                    state,
                    route,
                    page,
                    node: error_node,
                    $session,
                    context: node_loaded.context,
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error3
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e);
                  continue;
                }
              }
            }
            return await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error3
            });
          }
        }
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return await render_response({
      options: options2,
      $session,
      page_config,
      status,
      error: error3,
      branch: branch && branch.filter(Boolean),
      page
    });
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
}
async function render_page(request, route, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map2 = new Map();
  return {
    append(key, value) {
      if (map2.has(key)) {
        (map2.get(key) || []).push(value);
      } else {
        map2.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map2)
  };
}
var ReadOnlyFormData = class {
  #map;
  constructor(map2) {
    this.#map = map2;
  }
  get(key) {
    const value = this.#map.get(key);
    return value && value[0];
  }
  getAll(key) {
    return this.#map.get(key);
  }
  has(key) {
    return this.#map.has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of this.#map)
      yield key;
  }
  *values() {
    for (const [, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
function parse_body(raw, headers) {
  if (!raw || typeof raw !== "string")
    return raw;
  const [type, ...directives] = headers["content-type"].split(/;\s*/);
  switch (type) {
    case "text/plain":
      return raw;
    case "application/json":
      return JSON.parse(raw);
    case "application/x-www-form-urlencoded":
      return get_urlencoded(raw);
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(raw, boundary.slice("boundary=".length));
    }
    default:
      throw new Error(`Invalid Content-Type ${type}`);
  }
}
function get_urlencoded(text) {
  const { data, append: append2 } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append2(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append: append2 } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append2(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: encodeURI(path + (q ? `?${q}` : ""))
        }
      };
    }
  }
  try {
    const headers = lowercase_keys(incoming.headers);
    return await options2.hooks.handle({
      request: {
        ...incoming,
        headers,
        body: parse_body(incoming.rawBody, headers),
        params: {},
        locals: {}
      },
      resolve: async (request) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        for (const route of options2.manifest.routes) {
          if (!route.pattern.test(request.path))
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request, route) : await render_page(request, route, options2, state);
          if (response) {
            if (response.status === 200) {
              if (!/(no-store|immutable)/.test(response.headers["cache-control"])) {
                const etag = `"${hash(response.body || "")}"`;
                if (request.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request);
        return await respond_with_error({
          request,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}

// .svelte-kit/output/server/app.js
var import_cookie = __toModule(require_cookie());

// node_modules/@lukeed/uuid/dist/index.mjs
init_shims();
var IDX = 256;
var HEX = [];
var BUFFER;
while (IDX--)
  HEX[IDX] = (IDX + 256).toString(16).substring(1);
function v4() {
  var i = 0, num, out = "";
  if (!BUFFER || IDX + 16 > 256) {
    BUFFER = Array(i = 256);
    while (i--)
      BUFFER[i] = 256 * Math.random() | 0;
    i = IDX = 0;
  }
  for (; i < 16; i++) {
    num = BUFFER[IDX + i];
    if (i == 6)
      out += HEX[num & 15 | 64];
    else if (i == 8)
      out += HEX[num & 63 | 128];
    else
      out += HEX[num];
    if (i & 1 && i > 1 && i < 11)
      out += "-";
  }
  IDX++;
  return out;
}

// .svelte-kit/output/server/app.js
var import_ramda = __toModule(require_src());
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
Promise.resolve();
var escaped2 = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape2(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped2[match]);
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function afterUpdate() {
}
var css$2 = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AAsDC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$2);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
function set_paths(paths) {
}
function set_prerendering(value) {
}
var handle = async ({ request, resolve: resolve2 }) => {
  const cookies = import_cookie.default.parse(request.headers.cookie || "");
  request.locals.userid = cookies.userid || v4();
  if (request.query.has("_method")) {
    request.method = request.query.get("_method").toUpperCase();
  }
  const response = await resolve2(request);
  if (!cookies.userid) {
    response.headers["set-cookie"] = `userid=${request.locals.userid}; Path=/; HttpOnly`;
  }
  return response;
};
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  handle
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="/favicon.png" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
var options = null;
var default_settings = { paths: { "base": "", "assets": "/." } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: "/./_app/start-e3a4b686.js",
      css: ["/./_app/assets/start-a8cd1609.css", "/./_app/assets/vendor-aa821b56.css"],
      js: ["/./_app/start-e3a4b686.js", "/./_app/chunks/vendor-4ea84feb.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => "/./_app/" + entry_lookup[id],
    get_stack: (error22) => String(error22),
    handle_error: (error22) => {
      if (error22.frame) {
        console.error(error22.frame);
      }
      console.error(error22.stack);
      error22.stack = options.get_stack(error22);
    },
    hooks: get_hooks(user_hooks),
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var d = decodeURIComponent;
var empty = () => ({});
var manifest = {
  assets: [{ "file": "favicon.png", "size": 1571, "type": "image/png" }, { "file": "robots.txt", "size": 67, "type": "text/plain" }, { "file": "svelte-welcome.png", "size": 360807, "type": "image/png" }, { "file": "svelte-welcome.webp", "size": 115470, "type": "image/webp" }],
  layout: ".svelte-kit/build/components/layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: [".svelte-kit/build/components/layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/todos\.json$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return index_json;
      })
    },
    {
      type: "page",
      pattern: /^\/todos\/?$/,
      params: empty,
      a: [".svelte-kit/build/components/layout.svelte", "src/routes/todos/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/todos\/([^/]+?)\.json$/,
      params: (m) => ({ uid: d(m[1]) }),
      load: () => Promise.resolve().then(function() {
        return _uid__json;
      })
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  serverFetch: hooks.serverFetch || fetch
});
var module_lookup = {
  ".svelte-kit/build/components/layout.svelte": () => Promise.resolve().then(function() {
    return layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error2;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index$1;
  }),
  "src/routes/todos/index.svelte": () => Promise.resolve().then(function() {
    return index;
  })
};
var metadata_lookup = { ".svelte-kit/build/components/layout.svelte": { "entry": "/./_app/layout.svelte-b5a72916.js", "css": ["/./_app/assets/vendor-aa821b56.css"], "js": ["/./_app/layout.svelte-b5a72916.js", "/./_app/chunks/vendor-4ea84feb.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "/./_app/error.svelte-d08150d8.js", "css": ["/./_app/assets/vendor-aa821b56.css"], "js": ["/./_app/error.svelte-d08150d8.js", "/./_app/chunks/vendor-4ea84feb.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "/./_app/pages/index.svelte-e1dc305f.js", "css": ["/./_app/assets/pages/index.svelte-539521c1.css", "/./_app/assets/vendor-aa821b56.css"], "js": ["/./_app/pages/index.svelte-e1dc305f.js", "/./_app/chunks/vendor-4ea84feb.js"], "styles": [] }, "src/routes/todos/index.svelte": { "entry": "/./_app/pages/todos/index.svelte-58f45687.js", "css": ["/./_app/assets/vendor-aa821b56.css"], "js": ["/./_app/pages/todos/index.svelte-58f45687.js", "/./_app/chunks/vendor-4ea84feb.js"], "styles": [] } };
async function load_component(file) {
  return {
    module: await module_lookup[file](),
    ...metadata_lookup[file]
  };
}
function render(request, {
  prerender: prerender2
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender: prerender2 });
}
var base = "https://api.svelte.dev";
async function api(request, resource, data) {
  if (!request.locals.userid) {
    return { status: 401 };
  }
  const res = await fetch(`${base}/${resource}`, {
    method: request.method,
    headers: {
      "content-type": "application/json"
    },
    body: data && JSON.stringify(data)
  });
  if (res.ok && request.method !== "GET" && request.headers.accept !== "application/json") {
    return {
      status: 303,
      headers: {
        location: "/todos"
      }
    };
  }
  return {
    status: res.status,
    body: await res.json()
  };
}
var get = async (request) => {
  const response = await api(request, `todos/${request.locals.userid}`);
  if (response.status === 404) {
    return { body: [] };
  }
  return response;
};
var post = async (request) => {
  const response = await api(request, `todos/${request.locals.userid}`, {
    text: request.body.get("text")
  });
  return response;
};
var index_json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get,
  post
});
var patch = async (request) => {
  return api(request, `todos/${request.locals.userid}/${request.params.uid}`, {
    text: request.body.get("text"),
    done: request.body.has("done") ? !!request.body.get("done") : void 0
  });
};
var del = async (request) => {
  return api(request, `todos/${request.locals.userid}/${request.params.uid}`);
};
var _uid__json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  patch,
  del
});
var Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${slots.default ? slots.default({}) : ``}`;
});
var layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Layout
});
function load({ error: error22, status }) {
  return { props: { error: error22, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error22 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error22 !== void 0)
    $$bindings.error(error22);
  return `<h1>${escape2(status)}</h1>

<pre>${escape2(error22.message)}</pre>



${error22.frame ? `<pre>${escape2(error22.frame)}</pre>` : ``}
${error22.stack ? `<pre>${escape2(error22.stack)}</pre>` : ``}`;
});
var error2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load
});
var css$1 = {
  code: ".big-button.svelte-100t1mz.svelte-100t1mz{width:200px;height:200px;border-radius:50%;border:none;cursor:pointer;background:unset;font-size:2.5em;color:white;text-transform:uppercase;border:2px solid rgb(255, 85, 85);transition:transform 500ms}.is-small.svelte-100t1mz.svelte-100t1mz{transform:scale(0.7)}.is-loading.svelte-100t1mz.svelte-100t1mz{animation:svelte-100t1mz-pulse 2s infinite ease-in-out}.is-small.svelte-100t1mz span.svelte-100t1mz{font-size:1rem}@keyframes svelte-100t1mz-pulse{0%{border-color:#FFF;color:#FFF}50%{border-color:#ff403670;color:#ff403670}100%{border-color:#FF4136;color:#FF4136}}",
  map: '{"version":3,"file":"BigButton.svelte","sources":["BigButton.svelte"],"sourcesContent":["<script lang=\\"ts\\">export let isSmall;\\nexport let isLoading;\\n<\/script>\\n\\n<button class=\\"big-button\\" class:is-small={isSmall} class:is-loading={isLoading} on:click>\\n  <span>GO!</span>\\n</button>\\n\\n<style>\\n  \\n  .big-button {\\n    width: 200px;\\n    height: 200px;\\n    border-radius: 50%;\\n    border: none;\\n    cursor: pointer;\\n    background: unset;\\n    font-size: 2.5em;\\n    color: white;\\n    text-transform: uppercase;\\n    border: 2px solid rgb(255, 85, 85);\\n    transition: transform 500ms;\\n  }\\n\\n  .is-small {\\n    transform: scale(0.7);\\n  }\\n\\n  .is-loading {\\n    animation: pulse 2s infinite ease-in-out;\\n  }\\n\\n  .is-small span {\\n    font-size: 1rem;\\n  }\\n\\n  @keyframes pulse {\\n  0% {\\n    border-color: #FFF;\\n    color: #FFF;\\n  }\\n  50% {\\n    border-color: #ff403670;\\n    color: #ff403670;\\n  }\\n  100% {\\n    border-color: #FF4136;\\n    color: #FF4136;\\n  }\\n}\\n</style>\\n"],"names":[],"mappings":"AAUE,WAAW,8BAAC,CAAC,AACX,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,KAAK,CACb,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,KAAK,CACjB,SAAS,CAAE,KAAK,CAChB,KAAK,CAAE,KAAK,CACZ,cAAc,CAAE,SAAS,CACzB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,EAAE,CAAC,CAClC,UAAU,CAAE,SAAS,CAAC,KAAK,AAC7B,CAAC,AAED,SAAS,8BAAC,CAAC,AACT,SAAS,CAAE,MAAM,GAAG,CAAC,AACvB,CAAC,AAED,WAAW,8BAAC,CAAC,AACX,SAAS,CAAE,oBAAK,CAAC,EAAE,CAAC,QAAQ,CAAC,WAAW,AAC1C,CAAC,AAED,wBAAS,CAAC,IAAI,eAAC,CAAC,AACd,SAAS,CAAE,IAAI,AACjB,CAAC,AAED,WAAW,oBAAM,CAAC,AAClB,EAAE,AAAC,CAAC,AACF,YAAY,CAAE,IAAI,CAClB,KAAK,CAAE,IAAI,AACb,CAAC,AACD,GAAG,AAAC,CAAC,AACH,YAAY,CAAE,SAAS,CACvB,KAAK,CAAE,SAAS,AAClB,CAAC,AACD,IAAI,AAAC,CAAC,AACJ,YAAY,CAAE,OAAO,CACrB,KAAK,CAAE,OAAO,AAChB,CAAC,AACH,CAAC"}'
};
var BigButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isSmall } = $$props;
  let { isLoading } = $$props;
  if ($$props.isSmall === void 0 && $$bindings.isSmall && isSmall !== void 0)
    $$bindings.isSmall(isSmall);
  if ($$props.isLoading === void 0 && $$bindings.isLoading && isLoading !== void 0)
    $$bindings.isLoading(isLoading);
  $$result.css.add(css$1);
  return `<button class="${[
    "big-button svelte-100t1mz",
    (isSmall ? "is-small" : "") + " " + (isLoading ? "is-loading" : "")
  ].join(" ").trim()}"><span class="${"svelte-100t1mz"}">GO!</span>
</button>`;
});
(0, import_ramda.complement)(import_ramda.isEmpty);
var locationsToCities = (acc, country) => (0, import_ramda.pipe)((0, import_ramda.prop)("areas"), (0, import_ramda.map)((area) => ({
  label: area.name,
  value: area.name,
  group: area.country.name
})), (0, import_ramda.append)(acc), import_ramda.flatten, (0, import_ramda.reject)((0, import_ramda.propEq)("label", "All")))(country);
(0, import_ramda.reduce)(locationsToCities, []);
var css = {
  code: `body{padding:0;margin:0;overflow-x:hidden;overflow-y:auto}div{padding:0;margin:0;box-sizing:border-box;position:relative}@font-face{font-family:"FR73PixelW00-Regular";src:url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.eot");src:url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.eot?#iefix") format("embedded-opentype"), url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.woff2") format("woff2"), url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.woff") format("woff"), url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.ttf") format("truetype"), url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.svg#FR73PixelW00-Regular") format("svg")}*{font-family:'FR73PixelW00-Regular'}main.svelte-166mngs{position:relative;display:block;width:100vw;height:100vh;text-align:center;margin:0;max-width:500px}.copyright.svelte-166mngs{font-size:10px;align-self:flex-end;position:absolute;bottom:0;right:50%}.full-width-container.svelte-166mngs{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100vw;height:100vh;max-width:500px;background-image:linear-gradient(to bottom, #12151f, #121521, #121524, #121526, #121528)}.soundcloud-embedded-player.svelte-166mngs{width:100%;margin-bottom:1rem}@media(min-width: 640px){main.svelte-166mngs{max-width:none}.full-width-container.svelte-166mngs{margin:auto;max-width:500px}}`,
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\" lang=\\"ts\\">export const prerender = true;\\n<\/script>\\n\\n<script lang=\\"typescript\\">var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\n    return new (P || (P = Promise))(function (resolve, reject) {\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\n    });\\n};\\nimport { onMount } from \\"svelte\\";\\nimport BigButton from \\"../components/BigButton.svelte\\";\\nimport Dropdown from \\"../components/Dropdown.svelte\\";\\nimport { generateCityOptions } from \\"../utils\\";\\nimport { api } from '../api';\\nlet name;\\nlet userCity;\\n// let cityDropdownOptions = generateCityOptions(countryOptions as any);\\nlet scEmbedCode;\\nlet isLoading = false;\\nconst getScEmbedCode = () => __awaiter(void 0, void 0, void 0, function* () {\\n    console.log(\\"fetching\\");\\n    isLoading = true;\\n    // const response = await fetch('/api/random-soundcloud-track')\\n    const response = yield api('GET', 'random-soundcloud-track');\\n    const { html } = response.body;\\n    console.log(html);\\n    isLoading = false;\\n    scEmbedCode = html;\\n});\\nconst handleCitySelection = ({ detail }) => console.log(detail);\\n<\/script>\\n\\n<main>\\n  <div class=\\"full-width-container\\">\\n    <!-- <Header /> -->\\n    {#if scEmbedCode}\\n      <div class=\\"soundcloud-embedded-player\\">\\n        {@html scEmbedCode}\\n      </div>\\n    {/if}\\n    <BigButton on:click={getScEmbedCode} isSmall={scEmbedCode} isLoading={isLoading} />\\n    <!-- <Dropdown items={cityDropdownOptions} on:select={handleCitySelection} /> -->\\n    <span class=\\"copyright\\">(c) Andrew Moore & Sampo Lahtinen</span>\\n  </div>\\n</main>\\n  \\n<style>\\n  :global(body) {\\n    padding: 0;\\n    margin: 0;\\n    overflow-x: hidden;\\n    overflow-y: auto;\\n  }\\n  :global(div) {\\n    padding: 0;\\n    margin: 0;\\n    box-sizing: border-box;\\n    position: relative;\\n  }\\n\\n  @font-face {\\n    font-family: \\"FR73PixelW00-Regular\\"; src: url(\\"//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.eot\\"); src: url(\\"//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.eot?#iefix\\") format(\\"embedded-opentype\\"), url(\\"//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.woff2\\") format(\\"woff2\\"), url(\\"//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.woff\\") format(\\"woff\\"), url(\\"//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.ttf\\") format(\\"truetype\\"), url(\\"//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.svg#FR73PixelW00-Regular\\") format(\\"svg\\");\\n  }\\n\\n  :global(*) {\\n    font-family: 'FR73PixelW00-Regular';\\n  }\\n\\n  main {\\n    position: relative;\\n    display: block;\\n    width: 100vw;\\n    height: 100vh;\\n    text-align: center;\\n    margin: 0;\\n    max-width: 500px;\\n  }\\n\\n  .copyright {\\n    font-size: 10px;\\n    align-self: flex-end;\\n    position: absolute;\\n    bottom: 0;\\n    right: 50%;\\n  }\\n\\n  .full-width-container {\\n    display: flex;\\n    flex-direction: column;\\n    align-items: center;\\n    justify-content: center;\\n    width: 100vw;\\n    height: 100vh;\\n    max-width: 500px;\\n    background-image: linear-gradient(to bottom, #12151f, #121521, #121524, #121526, #121528);\\n    /* background-image: radial-gradient(\\n      circle,\\n      #f1e2e7,\\n      #f1a9d2,\\n      #de72ce,\\n      #b43cd8,\\n      #5c12eb\\n    ); */\\n  }\\n\\n  .soundcloud-embedded-player {\\n    width: 100%;\\n    margin-bottom: 1rem;\\n  }\\n\\n  @media (min-width: 640px) {\\n    main {\\n      max-width: none;\\n    }\\n\\n    .full-width-container {\\n      margin: auto;\\n      max-width: 500px;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AAkDU,IAAI,AAAE,CAAC,AACb,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,CAAC,CACT,UAAU,CAAE,MAAM,CAClB,UAAU,CAAE,IAAI,AAClB,CAAC,AACO,GAAG,AAAE,CAAC,AACZ,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,CAAC,CACT,UAAU,CAAE,UAAU,CACtB,QAAQ,CAAE,QAAQ,AACpB,CAAC,AAED,UAAU,AAAC,CAAC,AACV,WAAW,CAAE,sBAAsB,CAAE,GAAG,CAAE,IAAI,gEAAgE,CAAC,CAAE,GAAG,CAAE,IAAI,uEAAuE,CAAC,CAAC,OAAO,mBAAmB,CAAC,CAAC,CAAC,IAAI,kEAAkE,CAAC,CAAC,OAAO,OAAO,CAAC,CAAC,CAAC,IAAI,iEAAiE,CAAC,CAAC,OAAO,MAAM,CAAC,CAAC,CAAC,IAAI,gEAAgE,CAAC,CAAC,OAAO,UAAU,CAAC,CAAC,CAAC,IAAI,qFAAqF,CAAC,CAAC,OAAO,KAAK,CAAC,AACplB,CAAC,AAEO,CAAC,AAAE,CAAC,AACV,WAAW,CAAE,sBAAsB,AACrC,CAAC,AAED,IAAI,eAAC,CAAC,AACJ,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,KAAK,CACb,UAAU,CAAE,MAAM,CAClB,MAAM,CAAE,CAAC,CACT,SAAS,CAAE,KAAK,AAClB,CAAC,AAED,UAAU,eAAC,CAAC,AACV,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,QAAQ,CACpB,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,GAAG,AACZ,CAAC,AAED,qBAAqB,eAAC,CAAC,AACrB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,KAAK,CACb,SAAS,CAAE,KAAK,CAChB,gBAAgB,CAAE,gBAAgB,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,CAAC,OAAO,CAAC,CAAC,OAAO,CAAC,CAAC,OAAO,CAAC,CAAC,OAAO,CAAC,AAS3F,CAAC,AAED,2BAA2B,eAAC,CAAC,AAC3B,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,IAAI,AACrB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,IAAI,eAAC,CAAC,AACJ,SAAS,CAAE,IAAI,AACjB,CAAC,AAED,qBAAqB,eAAC,CAAC,AACrB,MAAM,CAAE,IAAI,CACZ,SAAS,CAAE,KAAK,AAClB,CAAC,AACH,CAAC"}`
};
var prerender = true;
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve2) {
        resolve2(value);
      });
    }
    return new (P || (P = Promise))(function(resolve2, reject2) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject2(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject2(e);
        }
      }
      function step(result) {
        result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  let scEmbedCode;
  let isLoading = false;
  $$result.css.add(css);
  return `<main class="${"svelte-166mngs"}"><div class="${"full-width-container svelte-166mngs"}">
    ${``}
    ${validate_component(BigButton, "BigButton").$$render($$result, { isSmall: scEmbedCode, isLoading }, {}, {})}
    
    <span class="${"copyright svelte-166mngs"}">(c) Andrew Moore &amp; Sampo Lahtinen</span></div>
</main>`;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes,
  prerender
});
var Todos = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Todos
});

// .svelte-kit/vercel/entry.js
init();
var entry_default = async (req, res) => {
  const { pathname, searchParams } = new URL(req.url || "", "http://localhost");
  let body;
  try {
    body = await getRawBody(req);
  } catch (err) {
    res.statusCode = err.status || 400;
    return res.end(err.reason || "Invalid request body");
  }
  const rendered = await render({
    method: req.method,
    headers: req.headers,
    path: pathname,
    query: searchParams,
    rawBody: body
  });
  if (rendered) {
    const { status, headers, body: body2 } = rendered;
    return res.writeHead(status, headers).end(body2);
  }
  return res.writeHead(404).end();
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

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
async function* toIterator(parts, clone2 = true) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else if (ArrayBuffer.isView(part)) {
      if (clone2) {
        let position = part.byteOffset;
        const end = part.byteOffset + part.byteLength;
        while (position !== end) {
          const size = Math.min(end - position, POOL_SIZE);
          const chunk = part.buffer.slice(position, position + size);
          position += chunk.byteLength;
          yield new Uint8Array(chunk);
        }
      } else {
        yield part;
      }
    } else {
      let position = 0;
      while (position !== part.size) {
        const chunk = part.slice(position, Math.min(part.size, position + POOL_SIZE));
        const buffer = await chunk.arrayBuffer();
        position += buffer.byteLength;
        yield new Uint8Array(buffer);
      }
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
    length += isBlob(value) ? value.size : Buffer.byteLength(String(value));
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
  let { body: body4 } = data;
  if (body4 === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body4)) {
    body4 = import_stream.default.Readable.from(body4.stream());
  }
  if (Buffer.isBuffer(body4)) {
    return body4;
  }
  if (!(body4 instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body4) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const error2 = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body4.destroy(error2);
        throw error2;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error2) {
    const error_ = error2 instanceof FetchBaseError ? error2 : new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error2.message}`, "system", error2);
    throw error_;
  }
  if (body4.readableEnded === true || body4._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error2) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error2.message}`, "system", error2);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index, array) => {
    if (index % 2 === 0) {
      result.push(array.slice(index, index + 2));
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
  return new Promise((resolve2, reject) => {
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
      const error2 = new AbortError("The operation was aborted.");
      reject(error2);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error2);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error2);
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
    request_.on("error", (error2) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${error2.message}`, "system", error2));
      finalize();
    });
    fixResponseChunkedTransferBadEnding(request_, (error2) => {
      response.body.destroy(error2);
    });
    if (process.version < "v14") {
      request_.on("socket", (s2) => {
        let endedWithEventsCount;
        s2.prependListener("end", () => {
          endedWithEventsCount = s2._eventsCount;
        });
        s2.prependListener("close", (hadError) => {
          if (response && endedWithEventsCount < s2._eventsCount && !hadError) {
            const error2 = new Error("Premature close");
            error2.code = "ERR_STREAM_PREMATURE_CLOSE";
            response.body.emit("error", error2);
          }
        });
      });
    }
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              headers.set("Location", locationURL);
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
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
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
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
          default:
            return reject(new TypeError(`Redirect option '${request.redirect}' is not a valid value of RequestRedirect`));
        }
      }
      if (signal) {
        response_.once("end", () => {
          signal.removeEventListener("abort", abortAndFinalize);
        });
      }
      let body4 = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
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
        response = new Response(body4, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body4 = (0, import_stream.pipeline)(body4, import_zlib.default.createGunzip(zlibOptions), reject);
        response = new Response(body4, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
        raw.once("data", (chunk) => {
          body4 = (chunk[0] & 15) === 8 ? (0, import_stream.pipeline)(body4, import_zlib.default.createInflate(), reject) : (0, import_stream.pipeline)(body4, import_zlib.default.createInflateRaw(), reject);
          response = new Response(body4, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body4 = (0, import_stream.pipeline)(body4, import_zlib.default.createBrotliDecompress(), reject);
        response = new Response(body4, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body4, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
function fixResponseChunkedTransferBadEnding(request, errorCallback) {
  const LAST_CHUNK = Buffer.from("0\r\n\r\n");
  let isChunkedTransfer = false;
  let properLastChunkReceived = false;
  let previousChunk;
  request.on("response", (response) => {
    const { headers } = response;
    isChunkedTransfer = headers["transfer-encoding"] === "chunked" && !headers["content-length"];
  });
  request.on("socket", (socket) => {
    const onSocketClose = () => {
      if (isChunkedTransfer && !properLastChunkReceived) {
        const error2 = new Error("Premature close");
        error2.code = "ERR_STREAM_PREMATURE_CLOSE";
        errorCallback(error2);
      }
    };
    socket.prependListener("close", onSocketClose);
    request.on("abort", () => {
      socket.removeListener("close", onSocketClose);
    });
    socket.on("data", (buf) => {
      properLastChunkReceived = Buffer.compare(buf.slice(-5), LAST_CHUNK) === 0;
      if (!properLastChunkReceived && previousChunk) {
        properLastChunkReceived = Buffer.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 && Buffer.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0;
      }
      previousChunk = buf;
    });
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, commonjsGlobal, src, dataUriToBuffer$1, ponyfill_es2018, POOL_SIZE$1, POOL_SIZE, _Blob, Blob2, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
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
    commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ponyfill_es2018 = { exports: {} };
    (function(module2, exports) {
      (function(global2, factory) {
        factory(exports);
      })(commonjsGlobal, function(exports2) {
        const SymbolPolyfill = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol : (description) => `Symbol(${description})`;
        function noop2() {
          return void 0;
        }
        function getGlobals() {
          if (typeof self !== "undefined") {
            return self;
          } else if (typeof window !== "undefined") {
            return window;
          } else if (typeof commonjsGlobal !== "undefined") {
            return commonjsGlobal;
          }
          return void 0;
        }
        const globals = getGlobals();
        function typeIsObject(x) {
          return typeof x === "object" && x !== null || typeof x === "function";
        }
        const rethrowAssertionErrorRejection = noop2;
        const originalPromise = Promise;
        const originalPromiseThen = Promise.prototype.then;
        const originalPromiseResolve = Promise.resolve.bind(originalPromise);
        const originalPromiseReject = Promise.reject.bind(originalPromise);
        function newPromise(executor) {
          return new originalPromise(executor);
        }
        function promiseResolvedWith(value) {
          return originalPromiseResolve(value);
        }
        function promiseRejectedWith(reason) {
          return originalPromiseReject(reason);
        }
        function PerformPromiseThen(promise, onFulfilled, onRejected) {
          return originalPromiseThen.call(promise, onFulfilled, onRejected);
        }
        function uponPromise(promise, onFulfilled, onRejected) {
          PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), void 0, rethrowAssertionErrorRejection);
        }
        function uponFulfillment(promise, onFulfilled) {
          uponPromise(promise, onFulfilled);
        }
        function uponRejection(promise, onRejected) {
          uponPromise(promise, void 0, onRejected);
        }
        function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
          return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
        }
        function setPromiseIsHandledToTrue(promise) {
          PerformPromiseThen(promise, void 0, rethrowAssertionErrorRejection);
        }
        const queueMicrotask = (() => {
          const globalQueueMicrotask = globals && globals.queueMicrotask;
          if (typeof globalQueueMicrotask === "function") {
            return globalQueueMicrotask;
          }
          const resolvedPromise = promiseResolvedWith(void 0);
          return (fn) => PerformPromiseThen(resolvedPromise, fn);
        })();
        function reflectCall(F, V, args) {
          if (typeof F !== "function") {
            throw new TypeError("Argument is not a function");
          }
          return Function.prototype.apply.call(F, V, args);
        }
        function promiseCall(F, V, args) {
          try {
            return promiseResolvedWith(reflectCall(F, V, args));
          } catch (value) {
            return promiseRejectedWith(value);
          }
        }
        const QUEUE_MAX_ARRAY_SIZE = 16384;
        class SimpleQueue {
          constructor() {
            this._cursor = 0;
            this._size = 0;
            this._front = {
              _elements: [],
              _next: void 0
            };
            this._back = this._front;
            this._cursor = 0;
            this._size = 0;
          }
          get length() {
            return this._size;
          }
          push(element) {
            const oldBack = this._back;
            let newBack = oldBack;
            if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) {
              newBack = {
                _elements: [],
                _next: void 0
              };
            }
            oldBack._elements.push(element);
            if (newBack !== oldBack) {
              this._back = newBack;
              oldBack._next = newBack;
            }
            ++this._size;
          }
          shift() {
            const oldFront = this._front;
            let newFront = oldFront;
            const oldCursor = this._cursor;
            let newCursor = oldCursor + 1;
            const elements = oldFront._elements;
            const element = elements[oldCursor];
            if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
              newFront = oldFront._next;
              newCursor = 0;
            }
            --this._size;
            this._cursor = newCursor;
            if (oldFront !== newFront) {
              this._front = newFront;
            }
            elements[oldCursor] = void 0;
            return element;
          }
          forEach(callback) {
            let i = this._cursor;
            let node = this._front;
            let elements = node._elements;
            while (i !== elements.length || node._next !== void 0) {
              if (i === elements.length) {
                node = node._next;
                elements = node._elements;
                i = 0;
                if (elements.length === 0) {
                  break;
                }
              }
              callback(elements[i]);
              ++i;
            }
          }
          peek() {
            const front = this._front;
            const cursor = this._cursor;
            return front._elements[cursor];
          }
        }
        function ReadableStreamReaderGenericInitialize(reader, stream) {
          reader._ownerReadableStream = stream;
          stream._reader = reader;
          if (stream._state === "readable") {
            defaultReaderClosedPromiseInitialize(reader);
          } else if (stream._state === "closed") {
            defaultReaderClosedPromiseInitializeAsResolved(reader);
          } else {
            defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
          }
        }
        function ReadableStreamReaderGenericCancel(reader, reason) {
          const stream = reader._ownerReadableStream;
          return ReadableStreamCancel(stream, reason);
        }
        function ReadableStreamReaderGenericRelease(reader) {
          if (reader._ownerReadableStream._state === "readable") {
            defaultReaderClosedPromiseReject(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
          } else {
            defaultReaderClosedPromiseResetToRejected(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
          }
          reader._ownerReadableStream._reader = void 0;
          reader._ownerReadableStream = void 0;
        }
        function readerLockException(name) {
          return new TypeError("Cannot " + name + " a stream using a released reader");
        }
        function defaultReaderClosedPromiseInitialize(reader) {
          reader._closedPromise = newPromise((resolve2, reject) => {
            reader._closedPromise_resolve = resolve2;
            reader._closedPromise_reject = reject;
          });
        }
        function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
          defaultReaderClosedPromiseInitialize(reader);
          defaultReaderClosedPromiseReject(reader, reason);
        }
        function defaultReaderClosedPromiseInitializeAsResolved(reader) {
          defaultReaderClosedPromiseInitialize(reader);
          defaultReaderClosedPromiseResolve(reader);
        }
        function defaultReaderClosedPromiseReject(reader, reason) {
          if (reader._closedPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(reader._closedPromise);
          reader._closedPromise_reject(reason);
          reader._closedPromise_resolve = void 0;
          reader._closedPromise_reject = void 0;
        }
        function defaultReaderClosedPromiseResetToRejected(reader, reason) {
          defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
        }
        function defaultReaderClosedPromiseResolve(reader) {
          if (reader._closedPromise_resolve === void 0) {
            return;
          }
          reader._closedPromise_resolve(void 0);
          reader._closedPromise_resolve = void 0;
          reader._closedPromise_reject = void 0;
        }
        const AbortSteps = SymbolPolyfill("[[AbortSteps]]");
        const ErrorSteps = SymbolPolyfill("[[ErrorSteps]]");
        const CancelSteps = SymbolPolyfill("[[CancelSteps]]");
        const PullSteps = SymbolPolyfill("[[PullSteps]]");
        const NumberIsFinite = Number.isFinite || function(x) {
          return typeof x === "number" && isFinite(x);
        };
        const MathTrunc = Math.trunc || function(v) {
          return v < 0 ? Math.ceil(v) : Math.floor(v);
        };
        function isDictionary(x) {
          return typeof x === "object" || typeof x === "function";
        }
        function assertDictionary(obj, context) {
          if (obj !== void 0 && !isDictionary(obj)) {
            throw new TypeError(`${context} is not an object.`);
          }
        }
        function assertFunction(x, context) {
          if (typeof x !== "function") {
            throw new TypeError(`${context} is not a function.`);
          }
        }
        function isObject(x) {
          return typeof x === "object" && x !== null || typeof x === "function";
        }
        function assertObject(x, context) {
          if (!isObject(x)) {
            throw new TypeError(`${context} is not an object.`);
          }
        }
        function assertRequiredArgument(x, position, context) {
          if (x === void 0) {
            throw new TypeError(`Parameter ${position} is required in '${context}'.`);
          }
        }
        function assertRequiredField(x, field, context) {
          if (x === void 0) {
            throw new TypeError(`${field} is required in '${context}'.`);
          }
        }
        function convertUnrestrictedDouble(value) {
          return Number(value);
        }
        function censorNegativeZero(x) {
          return x === 0 ? 0 : x;
        }
        function integerPart(x) {
          return censorNegativeZero(MathTrunc(x));
        }
        function convertUnsignedLongLongWithEnforceRange(value, context) {
          const lowerBound = 0;
          const upperBound = Number.MAX_SAFE_INTEGER;
          let x = Number(value);
          x = censorNegativeZero(x);
          if (!NumberIsFinite(x)) {
            throw new TypeError(`${context} is not a finite number`);
          }
          x = integerPart(x);
          if (x < lowerBound || x > upperBound) {
            throw new TypeError(`${context} is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`);
          }
          if (!NumberIsFinite(x) || x === 0) {
            return 0;
          }
          return x;
        }
        function assertReadableStream(x, context) {
          if (!IsReadableStream(x)) {
            throw new TypeError(`${context} is not a ReadableStream.`);
          }
        }
        function AcquireReadableStreamDefaultReader(stream) {
          return new ReadableStreamDefaultReader(stream);
        }
        function ReadableStreamAddReadRequest(stream, readRequest) {
          stream._reader._readRequests.push(readRequest);
        }
        function ReadableStreamFulfillReadRequest(stream, chunk, done) {
          const reader = stream._reader;
          const readRequest = reader._readRequests.shift();
          if (done) {
            readRequest._closeSteps();
          } else {
            readRequest._chunkSteps(chunk);
          }
        }
        function ReadableStreamGetNumReadRequests(stream) {
          return stream._reader._readRequests.length;
        }
        function ReadableStreamHasDefaultReader(stream) {
          const reader = stream._reader;
          if (reader === void 0) {
            return false;
          }
          if (!IsReadableStreamDefaultReader(reader)) {
            return false;
          }
          return true;
        }
        class ReadableStreamDefaultReader {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "ReadableStreamDefaultReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readRequests = new SimpleQueue();
          }
          get closed() {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          cancel(reason = void 0) {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("cancel"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("cancel"));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
          }
          read() {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("read"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("read from"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readRequest = {
              _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
              _closeSteps: () => resolvePromise({ value: void 0, done: true }),
              _errorSteps: (e) => rejectPromise(e)
            };
            ReadableStreamDefaultReaderRead(this, readRequest);
            return promise;
          }
          releaseLock() {
            if (!IsReadableStreamDefaultReader(this)) {
              throw defaultReaderBrandCheckException("releaseLock");
            }
            if (this._ownerReadableStream === void 0) {
              return;
            }
            if (this._readRequests.length > 0) {
              throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            }
            ReadableStreamReaderGenericRelease(this);
          }
        }
        Object.defineProperties(ReadableStreamDefaultReader.prototype, {
          cancel: { enumerable: true },
          read: { enumerable: true },
          releaseLock: { enumerable: true },
          closed: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamDefaultReader.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamDefaultReader",
            configurable: true
          });
        }
        function IsReadableStreamDefaultReader(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readRequests")) {
            return false;
          }
          return x instanceof ReadableStreamDefaultReader;
        }
        function ReadableStreamDefaultReaderRead(reader, readRequest) {
          const stream = reader._ownerReadableStream;
          stream._disturbed = true;
          if (stream._state === "closed") {
            readRequest._closeSteps();
          } else if (stream._state === "errored") {
            readRequest._errorSteps(stream._storedError);
          } else {
            stream._readableStreamController[PullSteps](readRequest);
          }
        }
        function defaultReaderBrandCheckException(name) {
          return new TypeError(`ReadableStreamDefaultReader.prototype.${name} can only be used on a ReadableStreamDefaultReader`);
        }
        const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {
        }).prototype);
        class ReadableStreamAsyncIteratorImpl {
          constructor(reader, preventCancel) {
            this._ongoingPromise = void 0;
            this._isFinished = false;
            this._reader = reader;
            this._preventCancel = preventCancel;
          }
          next() {
            const nextSteps = () => this._nextSteps();
            this._ongoingPromise = this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, nextSteps, nextSteps) : nextSteps();
            return this._ongoingPromise;
          }
          return(value) {
            const returnSteps = () => this._returnSteps(value);
            return this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, returnSteps, returnSteps) : returnSteps();
          }
          _nextSteps() {
            if (this._isFinished) {
              return Promise.resolve({ value: void 0, done: true });
            }
            const reader = this._reader;
            if (reader._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("iterate"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readRequest = {
              _chunkSteps: (chunk) => {
                this._ongoingPromise = void 0;
                queueMicrotask(() => resolvePromise({ value: chunk, done: false }));
              },
              _closeSteps: () => {
                this._ongoingPromise = void 0;
                this._isFinished = true;
                ReadableStreamReaderGenericRelease(reader);
                resolvePromise({ value: void 0, done: true });
              },
              _errorSteps: (reason) => {
                this._ongoingPromise = void 0;
                this._isFinished = true;
                ReadableStreamReaderGenericRelease(reader);
                rejectPromise(reason);
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promise;
          }
          _returnSteps(value) {
            if (this._isFinished) {
              return Promise.resolve({ value, done: true });
            }
            this._isFinished = true;
            const reader = this._reader;
            if (reader._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("finish iterating"));
            }
            if (!this._preventCancel) {
              const result = ReadableStreamReaderGenericCancel(reader, value);
              ReadableStreamReaderGenericRelease(reader);
              return transformPromiseWith(result, () => ({ value, done: true }));
            }
            ReadableStreamReaderGenericRelease(reader);
            return promiseResolvedWith({ value, done: true });
          }
        }
        const ReadableStreamAsyncIteratorPrototype = {
          next() {
            if (!IsReadableStreamAsyncIterator(this)) {
              return promiseRejectedWith(streamAsyncIteratorBrandCheckException("next"));
            }
            return this._asyncIteratorImpl.next();
          },
          return(value) {
            if (!IsReadableStreamAsyncIterator(this)) {
              return promiseRejectedWith(streamAsyncIteratorBrandCheckException("return"));
            }
            return this._asyncIteratorImpl.return(value);
          }
        };
        if (AsyncIteratorPrototype !== void 0) {
          Object.setPrototypeOf(ReadableStreamAsyncIteratorPrototype, AsyncIteratorPrototype);
        }
        function AcquireReadableStreamAsyncIterator(stream, preventCancel) {
          const reader = AcquireReadableStreamDefaultReader(stream);
          const impl = new ReadableStreamAsyncIteratorImpl(reader, preventCancel);
          const iterator = Object.create(ReadableStreamAsyncIteratorPrototype);
          iterator._asyncIteratorImpl = impl;
          return iterator;
        }
        function IsReadableStreamAsyncIterator(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_asyncIteratorImpl")) {
            return false;
          }
          try {
            return x._asyncIteratorImpl instanceof ReadableStreamAsyncIteratorImpl;
          } catch (_a) {
            return false;
          }
        }
        function streamAsyncIteratorBrandCheckException(name) {
          return new TypeError(`ReadableStreamAsyncIterator.${name} can only be used on a ReadableSteamAsyncIterator`);
        }
        const NumberIsNaN = Number.isNaN || function(x) {
          return x !== x;
        };
        function CreateArrayFromList(elements) {
          return elements.slice();
        }
        function CopyDataBlockBytes(dest, destOffset, src2, srcOffset, n) {
          new Uint8Array(dest).set(new Uint8Array(src2, srcOffset, n), destOffset);
        }
        function TransferArrayBuffer(O) {
          return O;
        }
        function IsDetachedBuffer(O) {
          return false;
        }
        function ArrayBufferSlice(buffer, begin, end) {
          if (buffer.slice) {
            return buffer.slice(begin, end);
          }
          const length = end - begin;
          const slice = new ArrayBuffer(length);
          CopyDataBlockBytes(slice, 0, buffer, begin, length);
          return slice;
        }
        function IsNonNegativeNumber(v) {
          if (typeof v !== "number") {
            return false;
          }
          if (NumberIsNaN(v)) {
            return false;
          }
          if (v < 0) {
            return false;
          }
          return true;
        }
        function CloneAsUint8Array(O) {
          const buffer = ArrayBufferSlice(O.buffer, O.byteOffset, O.byteOffset + O.byteLength);
          return new Uint8Array(buffer);
        }
        function DequeueValue(container) {
          const pair = container._queue.shift();
          container._queueTotalSize -= pair.size;
          if (container._queueTotalSize < 0) {
            container._queueTotalSize = 0;
          }
          return pair.value;
        }
        function EnqueueValueWithSize(container, value, size) {
          if (!IsNonNegativeNumber(size) || size === Infinity) {
            throw new RangeError("Size must be a finite, non-NaN, non-negative number.");
          }
          container._queue.push({ value, size });
          container._queueTotalSize += size;
        }
        function PeekQueueValue(container) {
          const pair = container._queue.peek();
          return pair.value;
        }
        function ResetQueue(container) {
          container._queue = new SimpleQueue();
          container._queueTotalSize = 0;
        }
        class ReadableStreamBYOBRequest {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get view() {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("view");
            }
            return this._view;
          }
          respond(bytesWritten) {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("respond");
            }
            assertRequiredArgument(bytesWritten, 1, "respond");
            bytesWritten = convertUnsignedLongLongWithEnforceRange(bytesWritten, "First parameter");
            if (this._associatedReadableByteStreamController === void 0) {
              throw new TypeError("This BYOB request has been invalidated");
            }
            if (IsDetachedBuffer(this._view.buffer))
              ;
            ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController, bytesWritten);
          }
          respondWithNewView(view) {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("respondWithNewView");
            }
            assertRequiredArgument(view, 1, "respondWithNewView");
            if (!ArrayBuffer.isView(view)) {
              throw new TypeError("You can only respond with array buffer views");
            }
            if (this._associatedReadableByteStreamController === void 0) {
              throw new TypeError("This BYOB request has been invalidated");
            }
            if (IsDetachedBuffer(view.buffer))
              ;
            ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController, view);
          }
        }
        Object.defineProperties(ReadableStreamBYOBRequest.prototype, {
          respond: { enumerable: true },
          respondWithNewView: { enumerable: true },
          view: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamBYOBRequest.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamBYOBRequest",
            configurable: true
          });
        }
        class ReadableByteStreamController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get byobRequest() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("byobRequest");
            }
            return ReadableByteStreamControllerGetBYOBRequest(this);
          }
          get desiredSize() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("desiredSize");
            }
            return ReadableByteStreamControllerGetDesiredSize(this);
          }
          close() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("close");
            }
            if (this._closeRequested) {
              throw new TypeError("The stream has already been closed; do not close it again!");
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") {
              throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
            }
            ReadableByteStreamControllerClose(this);
          }
          enqueue(chunk) {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("enqueue");
            }
            assertRequiredArgument(chunk, 1, "enqueue");
            if (!ArrayBuffer.isView(chunk)) {
              throw new TypeError("chunk must be an array buffer view");
            }
            if (chunk.byteLength === 0) {
              throw new TypeError("chunk must have non-zero byteLength");
            }
            if (chunk.buffer.byteLength === 0) {
              throw new TypeError(`chunk's buffer must have non-zero byteLength`);
            }
            if (this._closeRequested) {
              throw new TypeError("stream is closed or draining");
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") {
              throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
            }
            ReadableByteStreamControllerEnqueue(this, chunk);
          }
          error(e = void 0) {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("error");
            }
            ReadableByteStreamControllerError(this, e);
          }
          [CancelSteps](reason) {
            ReadableByteStreamControllerClearPendingPullIntos(this);
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableByteStreamControllerClearAlgorithms(this);
            return result;
          }
          [PullSteps](readRequest) {
            const stream = this._controlledReadableByteStream;
            if (this._queueTotalSize > 0) {
              const entry = this._queue.shift();
              this._queueTotalSize -= entry.byteLength;
              ReadableByteStreamControllerHandleQueueDrain(this);
              const view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
              readRequest._chunkSteps(view);
              return;
            }
            const autoAllocateChunkSize = this._autoAllocateChunkSize;
            if (autoAllocateChunkSize !== void 0) {
              let buffer;
              try {
                buffer = new ArrayBuffer(autoAllocateChunkSize);
              } catch (bufferE) {
                readRequest._errorSteps(bufferE);
                return;
              }
              const pullIntoDescriptor = {
                buffer,
                bufferByteLength: autoAllocateChunkSize,
                byteOffset: 0,
                byteLength: autoAllocateChunkSize,
                bytesFilled: 0,
                elementSize: 1,
                viewConstructor: Uint8Array,
                readerType: "default"
              };
              this._pendingPullIntos.push(pullIntoDescriptor);
            }
            ReadableStreamAddReadRequest(stream, readRequest);
            ReadableByteStreamControllerCallPullIfNeeded(this);
          }
        }
        Object.defineProperties(ReadableByteStreamController.prototype, {
          close: { enumerable: true },
          enqueue: { enumerable: true },
          error: { enumerable: true },
          byobRequest: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableByteStreamController.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableByteStreamController",
            configurable: true
          });
        }
        function IsReadableByteStreamController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableByteStream")) {
            return false;
          }
          return x instanceof ReadableByteStreamController;
        }
        function IsReadableStreamBYOBRequest(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_associatedReadableByteStreamController")) {
            return false;
          }
          return x instanceof ReadableStreamBYOBRequest;
        }
        function ReadableByteStreamControllerCallPullIfNeeded(controller) {
          const shouldPull = ReadableByteStreamControllerShouldCallPull(controller);
          if (!shouldPull) {
            return;
          }
          if (controller._pulling) {
            controller._pullAgain = true;
            return;
          }
          controller._pulling = true;
          const pullPromise = controller._pullAlgorithm();
          uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
              controller._pullAgain = false;
              ReadableByteStreamControllerCallPullIfNeeded(controller);
            }
          }, (e) => {
            ReadableByteStreamControllerError(controller, e);
          });
        }
        function ReadableByteStreamControllerClearPendingPullIntos(controller) {
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          controller._pendingPullIntos = new SimpleQueue();
        }
        function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
          let done = false;
          if (stream._state === "closed") {
            done = true;
          }
          const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
          if (pullIntoDescriptor.readerType === "default") {
            ReadableStreamFulfillReadRequest(stream, filledView, done);
          } else {
            ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
          }
        }
        function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
          const bytesFilled = pullIntoDescriptor.bytesFilled;
          const elementSize = pullIntoDescriptor.elementSize;
          return new pullIntoDescriptor.viewConstructor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
        }
        function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
          controller._queue.push({ buffer, byteOffset, byteLength });
          controller._queueTotalSize += byteLength;
        }
        function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
          const elementSize = pullIntoDescriptor.elementSize;
          const currentAlignedBytes = pullIntoDescriptor.bytesFilled - pullIntoDescriptor.bytesFilled % elementSize;
          const maxBytesToCopy = Math.min(controller._queueTotalSize, pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled);
          const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
          const maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;
          let totalBytesToCopyRemaining = maxBytesToCopy;
          let ready = false;
          if (maxAlignedBytes > currentAlignedBytes) {
            totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
            ready = true;
          }
          const queue = controller._queue;
          while (totalBytesToCopyRemaining > 0) {
            const headOfQueue = queue.peek();
            const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);
            const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            CopyDataBlockBytes(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
            if (headOfQueue.byteLength === bytesToCopy) {
              queue.shift();
            } else {
              headOfQueue.byteOffset += bytesToCopy;
              headOfQueue.byteLength -= bytesToCopy;
            }
            controller._queueTotalSize -= bytesToCopy;
            ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);
            totalBytesToCopyRemaining -= bytesToCopy;
          }
          return ready;
        }
        function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
          pullIntoDescriptor.bytesFilled += size;
        }
        function ReadableByteStreamControllerHandleQueueDrain(controller) {
          if (controller._queueTotalSize === 0 && controller._closeRequested) {
            ReadableByteStreamControllerClearAlgorithms(controller);
            ReadableStreamClose(controller._controlledReadableByteStream);
          } else {
            ReadableByteStreamControllerCallPullIfNeeded(controller);
          }
        }
        function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
          if (controller._byobRequest === null) {
            return;
          }
          controller._byobRequest._associatedReadableByteStreamController = void 0;
          controller._byobRequest._view = null;
          controller._byobRequest = null;
        }
        function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
          while (controller._pendingPullIntos.length > 0) {
            if (controller._queueTotalSize === 0) {
              return;
            }
            const pullIntoDescriptor = controller._pendingPullIntos.peek();
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
              ReadableByteStreamControllerShiftPendingPullInto(controller);
              ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
            }
          }
        }
        function ReadableByteStreamControllerPullInto(controller, view, readIntoRequest) {
          const stream = controller._controlledReadableByteStream;
          let elementSize = 1;
          if (view.constructor !== DataView) {
            elementSize = view.constructor.BYTES_PER_ELEMENT;
          }
          const ctor = view.constructor;
          const buffer = TransferArrayBuffer(view.buffer);
          const pullIntoDescriptor = {
            buffer,
            bufferByteLength: buffer.byteLength,
            byteOffset: view.byteOffset,
            byteLength: view.byteLength,
            bytesFilled: 0,
            elementSize,
            viewConstructor: ctor,
            readerType: "byob"
          };
          if (controller._pendingPullIntos.length > 0) {
            controller._pendingPullIntos.push(pullIntoDescriptor);
            ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
            return;
          }
          if (stream._state === "closed") {
            const emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
            readIntoRequest._closeSteps(emptyView);
            return;
          }
          if (controller._queueTotalSize > 0) {
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
              const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
              ReadableByteStreamControllerHandleQueueDrain(controller);
              readIntoRequest._chunkSteps(filledView);
              return;
            }
            if (controller._closeRequested) {
              const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
              ReadableByteStreamControllerError(controller, e);
              readIntoRequest._errorSteps(e);
              return;
            }
          }
          controller._pendingPullIntos.push(pullIntoDescriptor);
          ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
          const stream = controller._controlledReadableByteStream;
          if (ReadableStreamHasBYOBReader(stream)) {
            while (ReadableStreamGetNumReadIntoRequests(stream) > 0) {
              const pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);
              ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
            }
          }
        }
        function ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
          ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);
          if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize) {
            return;
          }
          ReadableByteStreamControllerShiftPendingPullInto(controller);
          const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
          if (remainderSize > 0) {
            const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            const remainder = ArrayBufferSlice(pullIntoDescriptor.buffer, end - remainderSize, end);
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainder.byteLength);
          }
          pullIntoDescriptor.bytesFilled -= remainderSize;
          ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
          ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
        }
        function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            ReadableByteStreamControllerRespondInClosedState(controller);
          } else {
            ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
          }
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerShiftPendingPullInto(controller) {
          const descriptor = controller._pendingPullIntos.shift();
          return descriptor;
        }
        function ReadableByteStreamControllerShouldCallPull(controller) {
          const stream = controller._controlledReadableByteStream;
          if (stream._state !== "readable") {
            return false;
          }
          if (controller._closeRequested) {
            return false;
          }
          if (!controller._started) {
            return false;
          }
          if (ReadableStreamHasDefaultReader(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
          }
          if (ReadableStreamHasBYOBReader(stream) && ReadableStreamGetNumReadIntoRequests(stream) > 0) {
            return true;
          }
          const desiredSize = ReadableByteStreamControllerGetDesiredSize(controller);
          if (desiredSize > 0) {
            return true;
          }
          return false;
        }
        function ReadableByteStreamControllerClearAlgorithms(controller) {
          controller._pullAlgorithm = void 0;
          controller._cancelAlgorithm = void 0;
        }
        function ReadableByteStreamControllerClose(controller) {
          const stream = controller._controlledReadableByteStream;
          if (controller._closeRequested || stream._state !== "readable") {
            return;
          }
          if (controller._queueTotalSize > 0) {
            controller._closeRequested = true;
            return;
          }
          if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (firstPendingPullInto.bytesFilled > 0) {
              const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
              ReadableByteStreamControllerError(controller, e);
              throw e;
            }
          }
          ReadableByteStreamControllerClearAlgorithms(controller);
          ReadableStreamClose(stream);
        }
        function ReadableByteStreamControllerEnqueue(controller, chunk) {
          const stream = controller._controlledReadableByteStream;
          if (controller._closeRequested || stream._state !== "readable") {
            return;
          }
          const buffer = chunk.buffer;
          const byteOffset = chunk.byteOffset;
          const byteLength = chunk.byteLength;
          const transferredBuffer = TransferArrayBuffer(buffer);
          if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (IsDetachedBuffer(firstPendingPullInto.buffer))
              ;
            firstPendingPullInto.buffer = TransferArrayBuffer(firstPendingPullInto.buffer);
          }
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          if (ReadableStreamHasDefaultReader(stream)) {
            if (ReadableStreamGetNumReadRequests(stream) === 0) {
              ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            } else {
              const transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
              ReadableStreamFulfillReadRequest(stream, transferredView, false);
            }
          } else if (ReadableStreamHasBYOBReader(stream)) {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
          } else {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
          }
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerError(controller, e) {
          const stream = controller._controlledReadableByteStream;
          if (stream._state !== "readable") {
            return;
          }
          ReadableByteStreamControllerClearPendingPullIntos(controller);
          ResetQueue(controller);
          ReadableByteStreamControllerClearAlgorithms(controller);
          ReadableStreamError(stream, e);
        }
        function ReadableByteStreamControllerGetBYOBRequest(controller) {
          if (controller._byobRequest === null && controller._pendingPullIntos.length > 0) {
            const firstDescriptor = controller._pendingPullIntos.peek();
            const view = new Uint8Array(firstDescriptor.buffer, firstDescriptor.byteOffset + firstDescriptor.bytesFilled, firstDescriptor.byteLength - firstDescriptor.bytesFilled);
            const byobRequest = Object.create(ReadableStreamBYOBRequest.prototype);
            SetUpReadableStreamBYOBRequest(byobRequest, controller, view);
            controller._byobRequest = byobRequest;
          }
          return controller._byobRequest;
        }
        function ReadableByteStreamControllerGetDesiredSize(controller) {
          const state = controller._controlledReadableByteStream._state;
          if (state === "errored") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function ReadableByteStreamControllerRespond(controller, bytesWritten) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            if (bytesWritten !== 0) {
              throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");
            }
          } else {
            if (bytesWritten === 0) {
              throw new TypeError("bytesWritten must be greater than 0 when calling respond() on a readable stream");
            }
            if (firstDescriptor.bytesFilled + bytesWritten > firstDescriptor.byteLength) {
              throw new RangeError("bytesWritten out of range");
            }
          }
          firstDescriptor.buffer = TransferArrayBuffer(firstDescriptor.buffer);
          ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
        }
        function ReadableByteStreamControllerRespondWithNewView(controller, view) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            if (view.byteLength !== 0) {
              throw new TypeError("The view's length must be 0 when calling respondWithNewView() on a closed stream");
            }
          } else {
            if (view.byteLength === 0) {
              throw new TypeError("The view's length must be greater than 0 when calling respondWithNewView() on a readable stream");
            }
          }
          if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) {
            throw new RangeError("The region specified by view does not match byobRequest");
          }
          if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) {
            throw new RangeError("The buffer of view has different capacity than byobRequest");
          }
          if (firstDescriptor.bytesFilled + view.byteLength > firstDescriptor.byteLength) {
            throw new RangeError("The region specified by view is larger than byobRequest");
          }
          firstDescriptor.buffer = TransferArrayBuffer(view.buffer);
          ReadableByteStreamControllerRespondInternal(controller, view.byteLength);
        }
        function SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
          controller._controlledReadableByteStream = stream;
          controller._pullAgain = false;
          controller._pulling = false;
          controller._byobRequest = null;
          controller._queue = controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._closeRequested = false;
          controller._started = false;
          controller._strategyHWM = highWaterMark;
          controller._pullAlgorithm = pullAlgorithm;
          controller._cancelAlgorithm = cancelAlgorithm;
          controller._autoAllocateChunkSize = autoAllocateChunkSize;
          controller._pendingPullIntos = new SimpleQueue();
          stream._readableStreamController = controller;
          const startResult = startAlgorithm();
          uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableByteStreamControllerCallPullIfNeeded(controller);
          }, (r) => {
            ReadableByteStreamControllerError(controller, r);
          });
        }
        function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
          const controller = Object.create(ReadableByteStreamController.prototype);
          let startAlgorithm = () => void 0;
          let pullAlgorithm = () => promiseResolvedWith(void 0);
          let cancelAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingByteSource.start !== void 0) {
            startAlgorithm = () => underlyingByteSource.start(controller);
          }
          if (underlyingByteSource.pull !== void 0) {
            pullAlgorithm = () => underlyingByteSource.pull(controller);
          }
          if (underlyingByteSource.cancel !== void 0) {
            cancelAlgorithm = (reason) => underlyingByteSource.cancel(reason);
          }
          const autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;
          if (autoAllocateChunkSize === 0) {
            throw new TypeError("autoAllocateChunkSize must be greater than 0");
          }
          SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
        }
        function SetUpReadableStreamBYOBRequest(request, controller, view) {
          request._associatedReadableByteStreamController = controller;
          request._view = view;
        }
        function byobRequestBrandCheckException(name) {
          return new TypeError(`ReadableStreamBYOBRequest.prototype.${name} can only be used on a ReadableStreamBYOBRequest`);
        }
        function byteStreamControllerBrandCheckException(name) {
          return new TypeError(`ReadableByteStreamController.prototype.${name} can only be used on a ReadableByteStreamController`);
        }
        function AcquireReadableStreamBYOBReader(stream) {
          return new ReadableStreamBYOBReader(stream);
        }
        function ReadableStreamAddReadIntoRequest(stream, readIntoRequest) {
          stream._reader._readIntoRequests.push(readIntoRequest);
        }
        function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
          const reader = stream._reader;
          const readIntoRequest = reader._readIntoRequests.shift();
          if (done) {
            readIntoRequest._closeSteps(chunk);
          } else {
            readIntoRequest._chunkSteps(chunk);
          }
        }
        function ReadableStreamGetNumReadIntoRequests(stream) {
          return stream._reader._readIntoRequests.length;
        }
        function ReadableStreamHasBYOBReader(stream) {
          const reader = stream._reader;
          if (reader === void 0) {
            return false;
          }
          if (!IsReadableStreamBYOBReader(reader)) {
            return false;
          }
          return true;
        }
        class ReadableStreamBYOBReader {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "ReadableStreamBYOBReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            }
            if (!IsReadableByteStreamController(stream._readableStreamController)) {
              throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readIntoRequests = new SimpleQueue();
          }
          get closed() {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          cancel(reason = void 0) {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("cancel"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("cancel"));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
          }
          read(view) {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("read"));
            }
            if (!ArrayBuffer.isView(view)) {
              return promiseRejectedWith(new TypeError("view must be an array buffer view"));
            }
            if (view.byteLength === 0) {
              return promiseRejectedWith(new TypeError("view must have non-zero byteLength"));
            }
            if (view.buffer.byteLength === 0) {
              return promiseRejectedWith(new TypeError(`view's buffer must have non-zero byteLength`));
            }
            if (IsDetachedBuffer(view.buffer))
              ;
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("read from"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readIntoRequest = {
              _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
              _closeSteps: (chunk) => resolvePromise({ value: chunk, done: true }),
              _errorSteps: (e) => rejectPromise(e)
            };
            ReadableStreamBYOBReaderRead(this, view, readIntoRequest);
            return promise;
          }
          releaseLock() {
            if (!IsReadableStreamBYOBReader(this)) {
              throw byobReaderBrandCheckException("releaseLock");
            }
            if (this._ownerReadableStream === void 0) {
              return;
            }
            if (this._readIntoRequests.length > 0) {
              throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            }
            ReadableStreamReaderGenericRelease(this);
          }
        }
        Object.defineProperties(ReadableStreamBYOBReader.prototype, {
          cancel: { enumerable: true },
          read: { enumerable: true },
          releaseLock: { enumerable: true },
          closed: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamBYOBReader.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamBYOBReader",
            configurable: true
          });
        }
        function IsReadableStreamBYOBReader(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readIntoRequests")) {
            return false;
          }
          return x instanceof ReadableStreamBYOBReader;
        }
        function ReadableStreamBYOBReaderRead(reader, view, readIntoRequest) {
          const stream = reader._ownerReadableStream;
          stream._disturbed = true;
          if (stream._state === "errored") {
            readIntoRequest._errorSteps(stream._storedError);
          } else {
            ReadableByteStreamControllerPullInto(stream._readableStreamController, view, readIntoRequest);
          }
        }
        function byobReaderBrandCheckException(name) {
          return new TypeError(`ReadableStreamBYOBReader.prototype.${name} can only be used on a ReadableStreamBYOBReader`);
        }
        function ExtractHighWaterMark(strategy, defaultHWM) {
          const { highWaterMark } = strategy;
          if (highWaterMark === void 0) {
            return defaultHWM;
          }
          if (NumberIsNaN(highWaterMark) || highWaterMark < 0) {
            throw new RangeError("Invalid highWaterMark");
          }
          return highWaterMark;
        }
        function ExtractSizeAlgorithm(strategy) {
          const { size } = strategy;
          if (!size) {
            return () => 1;
          }
          return size;
        }
        function convertQueuingStrategy(init2, context) {
          assertDictionary(init2, context);
          const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
          const size = init2 === null || init2 === void 0 ? void 0 : init2.size;
          return {
            highWaterMark: highWaterMark === void 0 ? void 0 : convertUnrestrictedDouble(highWaterMark),
            size: size === void 0 ? void 0 : convertQueuingStrategySize(size, `${context} has member 'size' that`)
          };
        }
        function convertQueuingStrategySize(fn, context) {
          assertFunction(fn, context);
          return (chunk) => convertUnrestrictedDouble(fn(chunk));
        }
        function convertUnderlyingSink(original, context) {
          assertDictionary(original, context);
          const abort = original === null || original === void 0 ? void 0 : original.abort;
          const close = original === null || original === void 0 ? void 0 : original.close;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const type = original === null || original === void 0 ? void 0 : original.type;
          const write = original === null || original === void 0 ? void 0 : original.write;
          return {
            abort: abort === void 0 ? void 0 : convertUnderlyingSinkAbortCallback(abort, original, `${context} has member 'abort' that`),
            close: close === void 0 ? void 0 : convertUnderlyingSinkCloseCallback(close, original, `${context} has member 'close' that`),
            start: start === void 0 ? void 0 : convertUnderlyingSinkStartCallback(start, original, `${context} has member 'start' that`),
            write: write === void 0 ? void 0 : convertUnderlyingSinkWriteCallback(write, original, `${context} has member 'write' that`),
            type
          };
        }
        function convertUnderlyingSinkAbortCallback(fn, original, context) {
          assertFunction(fn, context);
          return (reason) => promiseCall(fn, original, [reason]);
        }
        function convertUnderlyingSinkCloseCallback(fn, original, context) {
          assertFunction(fn, context);
          return () => promiseCall(fn, original, []);
        }
        function convertUnderlyingSinkStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertUnderlyingSinkWriteCallback(fn, original, context) {
          assertFunction(fn, context);
          return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
        }
        function assertWritableStream(x, context) {
          if (!IsWritableStream(x)) {
            throw new TypeError(`${context} is not a WritableStream.`);
          }
        }
        function isAbortSignal2(value) {
          if (typeof value !== "object" || value === null) {
            return false;
          }
          try {
            return typeof value.aborted === "boolean";
          } catch (_a) {
            return false;
          }
        }
        const supportsAbortController = typeof AbortController === "function";
        function createAbortController() {
          if (supportsAbortController) {
            return new AbortController();
          }
          return void 0;
        }
        class WritableStream {
          constructor(rawUnderlyingSink = {}, rawStrategy = {}) {
            if (rawUnderlyingSink === void 0) {
              rawUnderlyingSink = null;
            } else {
              assertObject(rawUnderlyingSink, "First parameter");
            }
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSink = convertUnderlyingSink(rawUnderlyingSink, "First parameter");
            InitializeWritableStream(this);
            const type = underlyingSink.type;
            if (type !== void 0) {
              throw new RangeError("Invalid type is specified");
            }
            const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
            const highWaterMark = ExtractHighWaterMark(strategy, 1);
            SetUpWritableStreamDefaultControllerFromUnderlyingSink(this, underlyingSink, highWaterMark, sizeAlgorithm);
          }
          get locked() {
            if (!IsWritableStream(this)) {
              throw streamBrandCheckException$2("locked");
            }
            return IsWritableStreamLocked(this);
          }
          abort(reason = void 0) {
            if (!IsWritableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$2("abort"));
            }
            if (IsWritableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot abort a stream that already has a writer"));
            }
            return WritableStreamAbort(this, reason);
          }
          close() {
            if (!IsWritableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$2("close"));
            }
            if (IsWritableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot close a stream that already has a writer"));
            }
            if (WritableStreamCloseQueuedOrInFlight(this)) {
              return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            }
            return WritableStreamClose(this);
          }
          getWriter() {
            if (!IsWritableStream(this)) {
              throw streamBrandCheckException$2("getWriter");
            }
            return AcquireWritableStreamDefaultWriter(this);
          }
        }
        Object.defineProperties(WritableStream.prototype, {
          abort: { enumerable: true },
          close: { enumerable: true },
          getWriter: { enumerable: true },
          locked: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStream.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStream",
            configurable: true
          });
        }
        function AcquireWritableStreamDefaultWriter(stream) {
          return new WritableStreamDefaultWriter(stream);
        }
        function CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
          const stream = Object.create(WritableStream.prototype);
          InitializeWritableStream(stream);
          const controller = Object.create(WritableStreamDefaultController.prototype);
          SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
          return stream;
        }
        function InitializeWritableStream(stream) {
          stream._state = "writable";
          stream._storedError = void 0;
          stream._writer = void 0;
          stream._writableStreamController = void 0;
          stream._writeRequests = new SimpleQueue();
          stream._inFlightWriteRequest = void 0;
          stream._closeRequest = void 0;
          stream._inFlightCloseRequest = void 0;
          stream._pendingAbortRequest = void 0;
          stream._backpressure = false;
        }
        function IsWritableStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_writableStreamController")) {
            return false;
          }
          return x instanceof WritableStream;
        }
        function IsWritableStreamLocked(stream) {
          if (stream._writer === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamAbort(stream, reason) {
          var _a;
          if (stream._state === "closed" || stream._state === "errored") {
            return promiseResolvedWith(void 0);
          }
          stream._writableStreamController._abortReason = reason;
          (_a = stream._writableStreamController._abortController) === null || _a === void 0 ? void 0 : _a.abort();
          const state = stream._state;
          if (state === "closed" || state === "errored") {
            return promiseResolvedWith(void 0);
          }
          if (stream._pendingAbortRequest !== void 0) {
            return stream._pendingAbortRequest._promise;
          }
          let wasAlreadyErroring = false;
          if (state === "erroring") {
            wasAlreadyErroring = true;
            reason = void 0;
          }
          const promise = newPromise((resolve2, reject) => {
            stream._pendingAbortRequest = {
              _promise: void 0,
              _resolve: resolve2,
              _reject: reject,
              _reason: reason,
              _wasAlreadyErroring: wasAlreadyErroring
            };
          });
          stream._pendingAbortRequest._promise = promise;
          if (!wasAlreadyErroring) {
            WritableStreamStartErroring(stream, reason);
          }
          return promise;
        }
        function WritableStreamClose(stream) {
          const state = stream._state;
          if (state === "closed" || state === "errored") {
            return promiseRejectedWith(new TypeError(`The stream (in ${state} state) is not in the writable state and cannot be closed`));
          }
          const promise = newPromise((resolve2, reject) => {
            const closeRequest = {
              _resolve: resolve2,
              _reject: reject
            };
            stream._closeRequest = closeRequest;
          });
          const writer = stream._writer;
          if (writer !== void 0 && stream._backpressure && state === "writable") {
            defaultWriterReadyPromiseResolve(writer);
          }
          WritableStreamDefaultControllerClose(stream._writableStreamController);
          return promise;
        }
        function WritableStreamAddWriteRequest(stream) {
          const promise = newPromise((resolve2, reject) => {
            const writeRequest = {
              _resolve: resolve2,
              _reject: reject
            };
            stream._writeRequests.push(writeRequest);
          });
          return promise;
        }
        function WritableStreamDealWithRejection(stream, error2) {
          const state = stream._state;
          if (state === "writable") {
            WritableStreamStartErroring(stream, error2);
            return;
          }
          WritableStreamFinishErroring(stream);
        }
        function WritableStreamStartErroring(stream, reason) {
          const controller = stream._writableStreamController;
          stream._state = "erroring";
          stream._storedError = reason;
          const writer = stream._writer;
          if (writer !== void 0) {
            WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
          }
          if (!WritableStreamHasOperationMarkedInFlight(stream) && controller._started) {
            WritableStreamFinishErroring(stream);
          }
        }
        function WritableStreamFinishErroring(stream) {
          stream._state = "errored";
          stream._writableStreamController[ErrorSteps]();
          const storedError = stream._storedError;
          stream._writeRequests.forEach((writeRequest) => {
            writeRequest._reject(storedError);
          });
          stream._writeRequests = new SimpleQueue();
          if (stream._pendingAbortRequest === void 0) {
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
          }
          const abortRequest = stream._pendingAbortRequest;
          stream._pendingAbortRequest = void 0;
          if (abortRequest._wasAlreadyErroring) {
            abortRequest._reject(storedError);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
          }
          const promise = stream._writableStreamController[AbortSteps](abortRequest._reason);
          uponPromise(promise, () => {
            abortRequest._resolve();
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
          }, (reason) => {
            abortRequest._reject(reason);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
          });
        }
        function WritableStreamFinishInFlightWrite(stream) {
          stream._inFlightWriteRequest._resolve(void 0);
          stream._inFlightWriteRequest = void 0;
        }
        function WritableStreamFinishInFlightWriteWithError(stream, error2) {
          stream._inFlightWriteRequest._reject(error2);
          stream._inFlightWriteRequest = void 0;
          WritableStreamDealWithRejection(stream, error2);
        }
        function WritableStreamFinishInFlightClose(stream) {
          stream._inFlightCloseRequest._resolve(void 0);
          stream._inFlightCloseRequest = void 0;
          const state = stream._state;
          if (state === "erroring") {
            stream._storedError = void 0;
            if (stream._pendingAbortRequest !== void 0) {
              stream._pendingAbortRequest._resolve();
              stream._pendingAbortRequest = void 0;
            }
          }
          stream._state = "closed";
          const writer = stream._writer;
          if (writer !== void 0) {
            defaultWriterClosedPromiseResolve(writer);
          }
        }
        function WritableStreamFinishInFlightCloseWithError(stream, error2) {
          stream._inFlightCloseRequest._reject(error2);
          stream._inFlightCloseRequest = void 0;
          if (stream._pendingAbortRequest !== void 0) {
            stream._pendingAbortRequest._reject(error2);
            stream._pendingAbortRequest = void 0;
          }
          WritableStreamDealWithRejection(stream, error2);
        }
        function WritableStreamCloseQueuedOrInFlight(stream) {
          if (stream._closeRequest === void 0 && stream._inFlightCloseRequest === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamHasOperationMarkedInFlight(stream) {
          if (stream._inFlightWriteRequest === void 0 && stream._inFlightCloseRequest === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamMarkCloseRequestInFlight(stream) {
          stream._inFlightCloseRequest = stream._closeRequest;
          stream._closeRequest = void 0;
        }
        function WritableStreamMarkFirstWriteRequestInFlight(stream) {
          stream._inFlightWriteRequest = stream._writeRequests.shift();
        }
        function WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
          if (stream._closeRequest !== void 0) {
            stream._closeRequest._reject(stream._storedError);
            stream._closeRequest = void 0;
          }
          const writer = stream._writer;
          if (writer !== void 0) {
            defaultWriterClosedPromiseReject(writer, stream._storedError);
          }
        }
        function WritableStreamUpdateBackpressure(stream, backpressure) {
          const writer = stream._writer;
          if (writer !== void 0 && backpressure !== stream._backpressure) {
            if (backpressure) {
              defaultWriterReadyPromiseReset(writer);
            } else {
              defaultWriterReadyPromiseResolve(writer);
            }
          }
          stream._backpressure = backpressure;
        }
        class WritableStreamDefaultWriter {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "WritableStreamDefaultWriter");
            assertWritableStream(stream, "First parameter");
            if (IsWritableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive writing by another writer");
            }
            this._ownerWritableStream = stream;
            stream._writer = this;
            const state = stream._state;
            if (state === "writable") {
              if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._backpressure) {
                defaultWriterReadyPromiseInitialize(this);
              } else {
                defaultWriterReadyPromiseInitializeAsResolved(this);
              }
              defaultWriterClosedPromiseInitialize(this);
            } else if (state === "erroring") {
              defaultWriterReadyPromiseInitializeAsRejected(this, stream._storedError);
              defaultWriterClosedPromiseInitialize(this);
            } else if (state === "closed") {
              defaultWriterReadyPromiseInitializeAsResolved(this);
              defaultWriterClosedPromiseInitializeAsResolved(this);
            } else {
              const storedError = stream._storedError;
              defaultWriterReadyPromiseInitializeAsRejected(this, storedError);
              defaultWriterClosedPromiseInitializeAsRejected(this, storedError);
            }
          }
          get closed() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          get desiredSize() {
            if (!IsWritableStreamDefaultWriter(this)) {
              throw defaultWriterBrandCheckException("desiredSize");
            }
            if (this._ownerWritableStream === void 0) {
              throw defaultWriterLockException("desiredSize");
            }
            return WritableStreamDefaultWriterGetDesiredSize(this);
          }
          get ready() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("ready"));
            }
            return this._readyPromise;
          }
          abort(reason = void 0) {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("abort"));
            }
            if (this._ownerWritableStream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("abort"));
            }
            return WritableStreamDefaultWriterAbort(this, reason);
          }
          close() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("close"));
            }
            const stream = this._ownerWritableStream;
            if (stream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("close"));
            }
            if (WritableStreamCloseQueuedOrInFlight(stream)) {
              return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            }
            return WritableStreamDefaultWriterClose(this);
          }
          releaseLock() {
            if (!IsWritableStreamDefaultWriter(this)) {
              throw defaultWriterBrandCheckException("releaseLock");
            }
            const stream = this._ownerWritableStream;
            if (stream === void 0) {
              return;
            }
            WritableStreamDefaultWriterRelease(this);
          }
          write(chunk = void 0) {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("write"));
            }
            if (this._ownerWritableStream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("write to"));
            }
            return WritableStreamDefaultWriterWrite(this, chunk);
          }
        }
        Object.defineProperties(WritableStreamDefaultWriter.prototype, {
          abort: { enumerable: true },
          close: { enumerable: true },
          releaseLock: { enumerable: true },
          write: { enumerable: true },
          closed: { enumerable: true },
          desiredSize: { enumerable: true },
          ready: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStreamDefaultWriter.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStreamDefaultWriter",
            configurable: true
          });
        }
        function IsWritableStreamDefaultWriter(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_ownerWritableStream")) {
            return false;
          }
          return x instanceof WritableStreamDefaultWriter;
        }
        function WritableStreamDefaultWriterAbort(writer, reason) {
          const stream = writer._ownerWritableStream;
          return WritableStreamAbort(stream, reason);
        }
        function WritableStreamDefaultWriterClose(writer) {
          const stream = writer._ownerWritableStream;
          return WritableStreamClose(stream);
        }
        function WritableStreamDefaultWriterCloseWithErrorPropagation(writer) {
          const stream = writer._ownerWritableStream;
          const state = stream._state;
          if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
            return promiseResolvedWith(void 0);
          }
          if (state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          return WritableStreamDefaultWriterClose(writer);
        }
        function WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error2) {
          if (writer._closedPromiseState === "pending") {
            defaultWriterClosedPromiseReject(writer, error2);
          } else {
            defaultWriterClosedPromiseResetToRejected(writer, error2);
          }
        }
        function WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error2) {
          if (writer._readyPromiseState === "pending") {
            defaultWriterReadyPromiseReject(writer, error2);
          } else {
            defaultWriterReadyPromiseResetToRejected(writer, error2);
          }
        }
        function WritableStreamDefaultWriterGetDesiredSize(writer) {
          const stream = writer._ownerWritableStream;
          const state = stream._state;
          if (state === "errored" || state === "erroring") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return WritableStreamDefaultControllerGetDesiredSize(stream._writableStreamController);
        }
        function WritableStreamDefaultWriterRelease(writer) {
          const stream = writer._ownerWritableStream;
          const releasedError = new TypeError(`Writer was released and can no longer be used to monitor the stream's closedness`);
          WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedError);
          WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedError);
          stream._writer = void 0;
          writer._ownerWritableStream = void 0;
        }
        function WritableStreamDefaultWriterWrite(writer, chunk) {
          const stream = writer._ownerWritableStream;
          const controller = stream._writableStreamController;
          const chunkSize = WritableStreamDefaultControllerGetChunkSize(controller, chunk);
          if (stream !== writer._ownerWritableStream) {
            return promiseRejectedWith(defaultWriterLockException("write to"));
          }
          const state = stream._state;
          if (state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
            return promiseRejectedWith(new TypeError("The stream is closing or closed and cannot be written to"));
          }
          if (state === "erroring") {
            return promiseRejectedWith(stream._storedError);
          }
          const promise = WritableStreamAddWriteRequest(stream);
          WritableStreamDefaultControllerWrite(controller, chunk, chunkSize);
          return promise;
        }
        const closeSentinel = {};
        class WritableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get abortReason() {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("abortReason");
            }
            return this._abortReason;
          }
          get signal() {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("signal");
            }
            if (this._abortController === void 0) {
              throw new TypeError("WritableStreamDefaultController.prototype.signal is not supported");
            }
            return this._abortController.signal;
          }
          error(e = void 0) {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("error");
            }
            const state = this._controlledWritableStream._state;
            if (state !== "writable") {
              return;
            }
            WritableStreamDefaultControllerError(this, e);
          }
          [AbortSteps](reason) {
            const result = this._abortAlgorithm(reason);
            WritableStreamDefaultControllerClearAlgorithms(this);
            return result;
          }
          [ErrorSteps]() {
            ResetQueue(this);
          }
        }
        Object.defineProperties(WritableStreamDefaultController.prototype, {
          error: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStreamDefaultController",
            configurable: true
          });
        }
        function IsWritableStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledWritableStream")) {
            return false;
          }
          return x instanceof WritableStreamDefaultController;
        }
        function SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
          controller._controlledWritableStream = stream;
          stream._writableStreamController = controller;
          controller._queue = void 0;
          controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._abortReason = void 0;
          controller._abortController = createAbortController();
          controller._started = false;
          controller._strategySizeAlgorithm = sizeAlgorithm;
          controller._strategyHWM = highWaterMark;
          controller._writeAlgorithm = writeAlgorithm;
          controller._closeAlgorithm = closeAlgorithm;
          controller._abortAlgorithm = abortAlgorithm;
          const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
          WritableStreamUpdateBackpressure(stream, backpressure);
          const startResult = startAlgorithm();
          const startPromise = promiseResolvedWith(startResult);
          uponPromise(startPromise, () => {
            controller._started = true;
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
          }, (r) => {
            controller._started = true;
            WritableStreamDealWithRejection(stream, r);
          });
        }
        function SetUpWritableStreamDefaultControllerFromUnderlyingSink(stream, underlyingSink, highWaterMark, sizeAlgorithm) {
          const controller = Object.create(WritableStreamDefaultController.prototype);
          let startAlgorithm = () => void 0;
          let writeAlgorithm = () => promiseResolvedWith(void 0);
          let closeAlgorithm = () => promiseResolvedWith(void 0);
          let abortAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingSink.start !== void 0) {
            startAlgorithm = () => underlyingSink.start(controller);
          }
          if (underlyingSink.write !== void 0) {
            writeAlgorithm = (chunk) => underlyingSink.write(chunk, controller);
          }
          if (underlyingSink.close !== void 0) {
            closeAlgorithm = () => underlyingSink.close();
          }
          if (underlyingSink.abort !== void 0) {
            abortAlgorithm = (reason) => underlyingSink.abort(reason);
          }
          SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
        }
        function WritableStreamDefaultControllerClearAlgorithms(controller) {
          controller._writeAlgorithm = void 0;
          controller._closeAlgorithm = void 0;
          controller._abortAlgorithm = void 0;
          controller._strategySizeAlgorithm = void 0;
        }
        function WritableStreamDefaultControllerClose(controller) {
          EnqueueValueWithSize(controller, closeSentinel, 0);
          WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }
        function WritableStreamDefaultControllerGetChunkSize(controller, chunk) {
          try {
            return controller._strategySizeAlgorithm(chunk);
          } catch (chunkSizeE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, chunkSizeE);
            return 1;
          }
        }
        function WritableStreamDefaultControllerGetDesiredSize(controller) {
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function WritableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
          try {
            EnqueueValueWithSize(controller, chunk, chunkSize);
          } catch (enqueueE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, enqueueE);
            return;
          }
          const stream = controller._controlledWritableStream;
          if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._state === "writable") {
            const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
            WritableStreamUpdateBackpressure(stream, backpressure);
          }
          WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }
        function WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
          const stream = controller._controlledWritableStream;
          if (!controller._started) {
            return;
          }
          if (stream._inFlightWriteRequest !== void 0) {
            return;
          }
          const state = stream._state;
          if (state === "erroring") {
            WritableStreamFinishErroring(stream);
            return;
          }
          if (controller._queue.length === 0) {
            return;
          }
          const value = PeekQueueValue(controller);
          if (value === closeSentinel) {
            WritableStreamDefaultControllerProcessClose(controller);
          } else {
            WritableStreamDefaultControllerProcessWrite(controller, value);
          }
        }
        function WritableStreamDefaultControllerErrorIfNeeded(controller, error2) {
          if (controller._controlledWritableStream._state === "writable") {
            WritableStreamDefaultControllerError(controller, error2);
          }
        }
        function WritableStreamDefaultControllerProcessClose(controller) {
          const stream = controller._controlledWritableStream;
          WritableStreamMarkCloseRequestInFlight(stream);
          DequeueValue(controller);
          const sinkClosePromise = controller._closeAlgorithm();
          WritableStreamDefaultControllerClearAlgorithms(controller);
          uponPromise(sinkClosePromise, () => {
            WritableStreamFinishInFlightClose(stream);
          }, (reason) => {
            WritableStreamFinishInFlightCloseWithError(stream, reason);
          });
        }
        function WritableStreamDefaultControllerProcessWrite(controller, chunk) {
          const stream = controller._controlledWritableStream;
          WritableStreamMarkFirstWriteRequestInFlight(stream);
          const sinkWritePromise = controller._writeAlgorithm(chunk);
          uponPromise(sinkWritePromise, () => {
            WritableStreamFinishInFlightWrite(stream);
            const state = stream._state;
            DequeueValue(controller);
            if (!WritableStreamCloseQueuedOrInFlight(stream) && state === "writable") {
              const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
              WritableStreamUpdateBackpressure(stream, backpressure);
            }
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
          }, (reason) => {
            if (stream._state === "writable") {
              WritableStreamDefaultControllerClearAlgorithms(controller);
            }
            WritableStreamFinishInFlightWriteWithError(stream, reason);
          });
        }
        function WritableStreamDefaultControllerGetBackpressure(controller) {
          const desiredSize = WritableStreamDefaultControllerGetDesiredSize(controller);
          return desiredSize <= 0;
        }
        function WritableStreamDefaultControllerError(controller, error2) {
          const stream = controller._controlledWritableStream;
          WritableStreamDefaultControllerClearAlgorithms(controller);
          WritableStreamStartErroring(stream, error2);
        }
        function streamBrandCheckException$2(name) {
          return new TypeError(`WritableStream.prototype.${name} can only be used on a WritableStream`);
        }
        function defaultControllerBrandCheckException$2(name) {
          return new TypeError(`WritableStreamDefaultController.prototype.${name} can only be used on a WritableStreamDefaultController`);
        }
        function defaultWriterBrandCheckException(name) {
          return new TypeError(`WritableStreamDefaultWriter.prototype.${name} can only be used on a WritableStreamDefaultWriter`);
        }
        function defaultWriterLockException(name) {
          return new TypeError("Cannot " + name + " a stream using a released writer");
        }
        function defaultWriterClosedPromiseInitialize(writer) {
          writer._closedPromise = newPromise((resolve2, reject) => {
            writer._closedPromise_resolve = resolve2;
            writer._closedPromise_reject = reject;
            writer._closedPromiseState = "pending";
          });
        }
        function defaultWriterClosedPromiseInitializeAsRejected(writer, reason) {
          defaultWriterClosedPromiseInitialize(writer);
          defaultWriterClosedPromiseReject(writer, reason);
        }
        function defaultWriterClosedPromiseInitializeAsResolved(writer) {
          defaultWriterClosedPromiseInitialize(writer);
          defaultWriterClosedPromiseResolve(writer);
        }
        function defaultWriterClosedPromiseReject(writer, reason) {
          if (writer._closedPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(writer._closedPromise);
          writer._closedPromise_reject(reason);
          writer._closedPromise_resolve = void 0;
          writer._closedPromise_reject = void 0;
          writer._closedPromiseState = "rejected";
        }
        function defaultWriterClosedPromiseResetToRejected(writer, reason) {
          defaultWriterClosedPromiseInitializeAsRejected(writer, reason);
        }
        function defaultWriterClosedPromiseResolve(writer) {
          if (writer._closedPromise_resolve === void 0) {
            return;
          }
          writer._closedPromise_resolve(void 0);
          writer._closedPromise_resolve = void 0;
          writer._closedPromise_reject = void 0;
          writer._closedPromiseState = "resolved";
        }
        function defaultWriterReadyPromiseInitialize(writer) {
          writer._readyPromise = newPromise((resolve2, reject) => {
            writer._readyPromise_resolve = resolve2;
            writer._readyPromise_reject = reject;
          });
          writer._readyPromiseState = "pending";
        }
        function defaultWriterReadyPromiseInitializeAsRejected(writer, reason) {
          defaultWriterReadyPromiseInitialize(writer);
          defaultWriterReadyPromiseReject(writer, reason);
        }
        function defaultWriterReadyPromiseInitializeAsResolved(writer) {
          defaultWriterReadyPromiseInitialize(writer);
          defaultWriterReadyPromiseResolve(writer);
        }
        function defaultWriterReadyPromiseReject(writer, reason) {
          if (writer._readyPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(writer._readyPromise);
          writer._readyPromise_reject(reason);
          writer._readyPromise_resolve = void 0;
          writer._readyPromise_reject = void 0;
          writer._readyPromiseState = "rejected";
        }
        function defaultWriterReadyPromiseReset(writer) {
          defaultWriterReadyPromiseInitialize(writer);
        }
        function defaultWriterReadyPromiseResetToRejected(writer, reason) {
          defaultWriterReadyPromiseInitializeAsRejected(writer, reason);
        }
        function defaultWriterReadyPromiseResolve(writer) {
          if (writer._readyPromise_resolve === void 0) {
            return;
          }
          writer._readyPromise_resolve(void 0);
          writer._readyPromise_resolve = void 0;
          writer._readyPromise_reject = void 0;
          writer._readyPromiseState = "fulfilled";
        }
        const NativeDOMException = typeof DOMException !== "undefined" ? DOMException : void 0;
        function isDOMExceptionConstructor(ctor) {
          if (!(typeof ctor === "function" || typeof ctor === "object")) {
            return false;
          }
          try {
            new ctor();
            return true;
          } catch (_a) {
            return false;
          }
        }
        function createDOMExceptionPolyfill() {
          const ctor = function DOMException2(message, name) {
            this.message = message || "";
            this.name = name || "Error";
            if (Error.captureStackTrace) {
              Error.captureStackTrace(this, this.constructor);
            }
          };
          ctor.prototype = Object.create(Error.prototype);
          Object.defineProperty(ctor.prototype, "constructor", { value: ctor, writable: true, configurable: true });
          return ctor;
        }
        const DOMException$1 = isDOMExceptionConstructor(NativeDOMException) ? NativeDOMException : createDOMExceptionPolyfill();
        function ReadableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
          const reader = AcquireReadableStreamDefaultReader(source);
          const writer = AcquireWritableStreamDefaultWriter(dest);
          source._disturbed = true;
          let shuttingDown = false;
          let currentWrite = promiseResolvedWith(void 0);
          return newPromise((resolve2, reject) => {
            let abortAlgorithm;
            if (signal !== void 0) {
              abortAlgorithm = () => {
                const error2 = new DOMException$1("Aborted", "AbortError");
                const actions = [];
                if (!preventAbort) {
                  actions.push(() => {
                    if (dest._state === "writable") {
                      return WritableStreamAbort(dest, error2);
                    }
                    return promiseResolvedWith(void 0);
                  });
                }
                if (!preventCancel) {
                  actions.push(() => {
                    if (source._state === "readable") {
                      return ReadableStreamCancel(source, error2);
                    }
                    return promiseResolvedWith(void 0);
                  });
                }
                shutdownWithAction(() => Promise.all(actions.map((action) => action())), true, error2);
              };
              if (signal.aborted) {
                abortAlgorithm();
                return;
              }
              signal.addEventListener("abort", abortAlgorithm);
            }
            function pipeLoop() {
              return newPromise((resolveLoop, rejectLoop) => {
                function next(done) {
                  if (done) {
                    resolveLoop();
                  } else {
                    PerformPromiseThen(pipeStep(), next, rejectLoop);
                  }
                }
                next(false);
              });
            }
            function pipeStep() {
              if (shuttingDown) {
                return promiseResolvedWith(true);
              }
              return PerformPromiseThen(writer._readyPromise, () => {
                return newPromise((resolveRead, rejectRead) => {
                  ReadableStreamDefaultReaderRead(reader, {
                    _chunkSteps: (chunk) => {
                      currentWrite = PerformPromiseThen(WritableStreamDefaultWriterWrite(writer, chunk), void 0, noop2);
                      resolveRead(false);
                    },
                    _closeSteps: () => resolveRead(true),
                    _errorSteps: rejectRead
                  });
                });
              });
            }
            isOrBecomesErrored(source, reader._closedPromise, (storedError) => {
              if (!preventAbort) {
                shutdownWithAction(() => WritableStreamAbort(dest, storedError), true, storedError);
              } else {
                shutdown(true, storedError);
              }
            });
            isOrBecomesErrored(dest, writer._closedPromise, (storedError) => {
              if (!preventCancel) {
                shutdownWithAction(() => ReadableStreamCancel(source, storedError), true, storedError);
              } else {
                shutdown(true, storedError);
              }
            });
            isOrBecomesClosed(source, reader._closedPromise, () => {
              if (!preventClose) {
                shutdownWithAction(() => WritableStreamDefaultWriterCloseWithErrorPropagation(writer));
              } else {
                shutdown();
              }
            });
            if (WritableStreamCloseQueuedOrInFlight(dest) || dest._state === "closed") {
              const destClosed = new TypeError("the destination writable stream closed before all data could be piped to it");
              if (!preventCancel) {
                shutdownWithAction(() => ReadableStreamCancel(source, destClosed), true, destClosed);
              } else {
                shutdown(true, destClosed);
              }
            }
            setPromiseIsHandledToTrue(pipeLoop());
            function waitForWritesToFinish() {
              const oldCurrentWrite = currentWrite;
              return PerformPromiseThen(currentWrite, () => oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : void 0);
            }
            function isOrBecomesErrored(stream, promise, action) {
              if (stream._state === "errored") {
                action(stream._storedError);
              } else {
                uponRejection(promise, action);
              }
            }
            function isOrBecomesClosed(stream, promise, action) {
              if (stream._state === "closed") {
                action();
              } else {
                uponFulfillment(promise, action);
              }
            }
            function shutdownWithAction(action, originalIsError, originalError) {
              if (shuttingDown) {
                return;
              }
              shuttingDown = true;
              if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
                uponFulfillment(waitForWritesToFinish(), doTheRest);
              } else {
                doTheRest();
              }
              function doTheRest() {
                uponPromise(action(), () => finalize(originalIsError, originalError), (newError) => finalize(true, newError));
              }
            }
            function shutdown(isError, error2) {
              if (shuttingDown) {
                return;
              }
              shuttingDown = true;
              if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
                uponFulfillment(waitForWritesToFinish(), () => finalize(isError, error2));
              } else {
                finalize(isError, error2);
              }
            }
            function finalize(isError, error2) {
              WritableStreamDefaultWriterRelease(writer);
              ReadableStreamReaderGenericRelease(reader);
              if (signal !== void 0) {
                signal.removeEventListener("abort", abortAlgorithm);
              }
              if (isError) {
                reject(error2);
              } else {
                resolve2(void 0);
              }
            }
          });
        }
        class ReadableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("desiredSize");
            }
            return ReadableStreamDefaultControllerGetDesiredSize(this);
          }
          close() {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("close");
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
              throw new TypeError("The stream is not in a state that permits close");
            }
            ReadableStreamDefaultControllerClose(this);
          }
          enqueue(chunk = void 0) {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("enqueue");
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
              throw new TypeError("The stream is not in a state that permits enqueue");
            }
            return ReadableStreamDefaultControllerEnqueue(this, chunk);
          }
          error(e = void 0) {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("error");
            }
            ReadableStreamDefaultControllerError(this, e);
          }
          [CancelSteps](reason) {
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableStreamDefaultControllerClearAlgorithms(this);
            return result;
          }
          [PullSteps](readRequest) {
            const stream = this._controlledReadableStream;
            if (this._queue.length > 0) {
              const chunk = DequeueValue(this);
              if (this._closeRequested && this._queue.length === 0) {
                ReadableStreamDefaultControllerClearAlgorithms(this);
                ReadableStreamClose(stream);
              } else {
                ReadableStreamDefaultControllerCallPullIfNeeded(this);
              }
              readRequest._chunkSteps(chunk);
            } else {
              ReadableStreamAddReadRequest(stream, readRequest);
              ReadableStreamDefaultControllerCallPullIfNeeded(this);
            }
          }
        }
        Object.defineProperties(ReadableStreamDefaultController.prototype, {
          close: { enumerable: true },
          enqueue: { enumerable: true },
          error: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamDefaultController",
            configurable: true
          });
        }
        function IsReadableStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableStream")) {
            return false;
          }
          return x instanceof ReadableStreamDefaultController;
        }
        function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
          const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
          if (!shouldPull) {
            return;
          }
          if (controller._pulling) {
            controller._pullAgain = true;
            return;
          }
          controller._pulling = true;
          const pullPromise = controller._pullAlgorithm();
          uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
              controller._pullAgain = false;
              ReadableStreamDefaultControllerCallPullIfNeeded(controller);
            }
          }, (e) => {
            ReadableStreamDefaultControllerError(controller, e);
          });
        }
        function ReadableStreamDefaultControllerShouldCallPull(controller) {
          const stream = controller._controlledReadableStream;
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return false;
          }
          if (!controller._started) {
            return false;
          }
          if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
          }
          const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
          if (desiredSize > 0) {
            return true;
          }
          return false;
        }
        function ReadableStreamDefaultControllerClearAlgorithms(controller) {
          controller._pullAlgorithm = void 0;
          controller._cancelAlgorithm = void 0;
          controller._strategySizeAlgorithm = void 0;
        }
        function ReadableStreamDefaultControllerClose(controller) {
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
          }
          const stream = controller._controlledReadableStream;
          controller._closeRequested = true;
          if (controller._queue.length === 0) {
            ReadableStreamDefaultControllerClearAlgorithms(controller);
            ReadableStreamClose(stream);
          }
        }
        function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
          }
          const stream = controller._controlledReadableStream;
          if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            ReadableStreamFulfillReadRequest(stream, chunk, false);
          } else {
            let chunkSize;
            try {
              chunkSize = controller._strategySizeAlgorithm(chunk);
            } catch (chunkSizeE) {
              ReadableStreamDefaultControllerError(controller, chunkSizeE);
              throw chunkSizeE;
            }
            try {
              EnqueueValueWithSize(controller, chunk, chunkSize);
            } catch (enqueueE) {
              ReadableStreamDefaultControllerError(controller, enqueueE);
              throw enqueueE;
            }
          }
          ReadableStreamDefaultControllerCallPullIfNeeded(controller);
        }
        function ReadableStreamDefaultControllerError(controller, e) {
          const stream = controller._controlledReadableStream;
          if (stream._state !== "readable") {
            return;
          }
          ResetQueue(controller);
          ReadableStreamDefaultControllerClearAlgorithms(controller);
          ReadableStreamError(stream, e);
        }
        function ReadableStreamDefaultControllerGetDesiredSize(controller) {
          const state = controller._controlledReadableStream._state;
          if (state === "errored") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function ReadableStreamDefaultControllerHasBackpressure(controller) {
          if (ReadableStreamDefaultControllerShouldCallPull(controller)) {
            return false;
          }
          return true;
        }
        function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
          const state = controller._controlledReadableStream._state;
          if (!controller._closeRequested && state === "readable") {
            return true;
          }
          return false;
        }
        function SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
          controller._controlledReadableStream = stream;
          controller._queue = void 0;
          controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._started = false;
          controller._closeRequested = false;
          controller._pullAgain = false;
          controller._pulling = false;
          controller._strategySizeAlgorithm = sizeAlgorithm;
          controller._strategyHWM = highWaterMark;
          controller._pullAlgorithm = pullAlgorithm;
          controller._cancelAlgorithm = cancelAlgorithm;
          stream._readableStreamController = controller;
          const startResult = startAlgorithm();
          uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableStreamDefaultControllerCallPullIfNeeded(controller);
          }, (r) => {
            ReadableStreamDefaultControllerError(controller, r);
          });
        }
        function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark, sizeAlgorithm) {
          const controller = Object.create(ReadableStreamDefaultController.prototype);
          let startAlgorithm = () => void 0;
          let pullAlgorithm = () => promiseResolvedWith(void 0);
          let cancelAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingSource.start !== void 0) {
            startAlgorithm = () => underlyingSource.start(controller);
          }
          if (underlyingSource.pull !== void 0) {
            pullAlgorithm = () => underlyingSource.pull(controller);
          }
          if (underlyingSource.cancel !== void 0) {
            cancelAlgorithm = (reason) => underlyingSource.cancel(reason);
          }
          SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
        }
        function defaultControllerBrandCheckException$1(name) {
          return new TypeError(`ReadableStreamDefaultController.prototype.${name} can only be used on a ReadableStreamDefaultController`);
        }
        function ReadableStreamTee(stream, cloneForBranch2) {
          if (IsReadableByteStreamController(stream._readableStreamController)) {
            return ReadableByteStreamTee(stream);
          }
          return ReadableStreamDefaultTee(stream);
        }
        function ReadableStreamDefaultTee(stream, cloneForBranch2) {
          const reader = AcquireReadableStreamDefaultReader(stream);
          let reading = false;
          let canceled1 = false;
          let canceled2 = false;
          let reason1;
          let reason2;
          let branch1;
          let branch2;
          let resolveCancelPromise;
          const cancelPromise = newPromise((resolve2) => {
            resolveCancelPromise = resolve2;
          });
          function pullAlgorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const readRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const chunk1 = chunk;
                  const chunk2 = chunk;
                  if (!canceled1) {
                    ReadableStreamDefaultControllerEnqueue(branch1._readableStreamController, chunk1);
                  }
                  if (!canceled2) {
                    ReadableStreamDefaultControllerEnqueue(branch2._readableStreamController, chunk2);
                  }
                });
              },
              _closeSteps: () => {
                reading = false;
                if (!canceled1) {
                  ReadableStreamDefaultControllerClose(branch1._readableStreamController);
                }
                if (!canceled2) {
                  ReadableStreamDefaultControllerClose(branch2._readableStreamController);
                }
                if (!canceled1 || !canceled2) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promiseResolvedWith(void 0);
          }
          function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function startAlgorithm() {
          }
          branch1 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel1Algorithm);
          branch2 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel2Algorithm);
          uponRejection(reader._closedPromise, (r) => {
            ReadableStreamDefaultControllerError(branch1._readableStreamController, r);
            ReadableStreamDefaultControllerError(branch2._readableStreamController, r);
            if (!canceled1 || !canceled2) {
              resolveCancelPromise(void 0);
            }
          });
          return [branch1, branch2];
        }
        function ReadableByteStreamTee(stream) {
          let reader = AcquireReadableStreamDefaultReader(stream);
          let reading = false;
          let canceled1 = false;
          let canceled2 = false;
          let reason1;
          let reason2;
          let branch1;
          let branch2;
          let resolveCancelPromise;
          const cancelPromise = newPromise((resolve2) => {
            resolveCancelPromise = resolve2;
          });
          function forwardReaderError(thisReader) {
            uponRejection(thisReader._closedPromise, (r) => {
              if (thisReader !== reader) {
                return;
              }
              ReadableByteStreamControllerError(branch1._readableStreamController, r);
              ReadableByteStreamControllerError(branch2._readableStreamController, r);
              if (!canceled1 || !canceled2) {
                resolveCancelPromise(void 0);
              }
            });
          }
          function pullWithDefaultReader() {
            if (IsReadableStreamBYOBReader(reader)) {
              ReadableStreamReaderGenericRelease(reader);
              reader = AcquireReadableStreamDefaultReader(stream);
              forwardReaderError(reader);
            }
            const readRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const chunk1 = chunk;
                  let chunk2 = chunk;
                  if (!canceled1 && !canceled2) {
                    try {
                      chunk2 = CloneAsUint8Array(chunk);
                    } catch (cloneE) {
                      ReadableByteStreamControllerError(branch1._readableStreamController, cloneE);
                      ReadableByteStreamControllerError(branch2._readableStreamController, cloneE);
                      resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                      return;
                    }
                  }
                  if (!canceled1) {
                    ReadableByteStreamControllerEnqueue(branch1._readableStreamController, chunk1);
                  }
                  if (!canceled2) {
                    ReadableByteStreamControllerEnqueue(branch2._readableStreamController, chunk2);
                  }
                });
              },
              _closeSteps: () => {
                reading = false;
                if (!canceled1) {
                  ReadableByteStreamControllerClose(branch1._readableStreamController);
                }
                if (!canceled2) {
                  ReadableByteStreamControllerClose(branch2._readableStreamController);
                }
                if (branch1._readableStreamController._pendingPullIntos.length > 0) {
                  ReadableByteStreamControllerRespond(branch1._readableStreamController, 0);
                }
                if (branch2._readableStreamController._pendingPullIntos.length > 0) {
                  ReadableByteStreamControllerRespond(branch2._readableStreamController, 0);
                }
                if (!canceled1 || !canceled2) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
          }
          function pullWithBYOBReader(view, forBranch2) {
            if (IsReadableStreamDefaultReader(reader)) {
              ReadableStreamReaderGenericRelease(reader);
              reader = AcquireReadableStreamBYOBReader(stream);
              forwardReaderError(reader);
            }
            const byobBranch = forBranch2 ? branch2 : branch1;
            const otherBranch = forBranch2 ? branch1 : branch2;
            const readIntoRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const byobCanceled = forBranch2 ? canceled2 : canceled1;
                  const otherCanceled = forBranch2 ? canceled1 : canceled2;
                  if (!otherCanceled) {
                    let clonedChunk;
                    try {
                      clonedChunk = CloneAsUint8Array(chunk);
                    } catch (cloneE) {
                      ReadableByteStreamControllerError(byobBranch._readableStreamController, cloneE);
                      ReadableByteStreamControllerError(otherBranch._readableStreamController, cloneE);
                      resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                      return;
                    }
                    if (!byobCanceled) {
                      ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                    }
                    ReadableByteStreamControllerEnqueue(otherBranch._readableStreamController, clonedChunk);
                  } else if (!byobCanceled) {
                    ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                  }
                });
              },
              _closeSteps: (chunk) => {
                reading = false;
                const byobCanceled = forBranch2 ? canceled2 : canceled1;
                const otherCanceled = forBranch2 ? canceled1 : canceled2;
                if (!byobCanceled) {
                  ReadableByteStreamControllerClose(byobBranch._readableStreamController);
                }
                if (!otherCanceled) {
                  ReadableByteStreamControllerClose(otherBranch._readableStreamController);
                }
                if (chunk !== void 0) {
                  if (!byobCanceled) {
                    ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                  }
                  if (!otherCanceled && otherBranch._readableStreamController._pendingPullIntos.length > 0) {
                    ReadableByteStreamControllerRespond(otherBranch._readableStreamController, 0);
                  }
                }
                if (!byobCanceled || !otherCanceled) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamBYOBReaderRead(reader, view, readIntoRequest);
          }
          function pull1Algorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch1._readableStreamController);
            if (byobRequest === null) {
              pullWithDefaultReader();
            } else {
              pullWithBYOBReader(byobRequest._view, false);
            }
            return promiseResolvedWith(void 0);
          }
          function pull2Algorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch2._readableStreamController);
            if (byobRequest === null) {
              pullWithDefaultReader();
            } else {
              pullWithBYOBReader(byobRequest._view, true);
            }
            return promiseResolvedWith(void 0);
          }
          function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function startAlgorithm() {
            return;
          }
          branch1 = CreateReadableByteStream(startAlgorithm, pull1Algorithm, cancel1Algorithm);
          branch2 = CreateReadableByteStream(startAlgorithm, pull2Algorithm, cancel2Algorithm);
          forwardReaderError(reader);
          return [branch1, branch2];
        }
        function convertUnderlyingDefaultOrByteSource(source, context) {
          assertDictionary(source, context);
          const original = source;
          const autoAllocateChunkSize = original === null || original === void 0 ? void 0 : original.autoAllocateChunkSize;
          const cancel = original === null || original === void 0 ? void 0 : original.cancel;
          const pull = original === null || original === void 0 ? void 0 : original.pull;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const type = original === null || original === void 0 ? void 0 : original.type;
          return {
            autoAllocateChunkSize: autoAllocateChunkSize === void 0 ? void 0 : convertUnsignedLongLongWithEnforceRange(autoAllocateChunkSize, `${context} has member 'autoAllocateChunkSize' that`),
            cancel: cancel === void 0 ? void 0 : convertUnderlyingSourceCancelCallback(cancel, original, `${context} has member 'cancel' that`),
            pull: pull === void 0 ? void 0 : convertUnderlyingSourcePullCallback(pull, original, `${context} has member 'pull' that`),
            start: start === void 0 ? void 0 : convertUnderlyingSourceStartCallback(start, original, `${context} has member 'start' that`),
            type: type === void 0 ? void 0 : convertReadableStreamType(type, `${context} has member 'type' that`)
          };
        }
        function convertUnderlyingSourceCancelCallback(fn, original, context) {
          assertFunction(fn, context);
          return (reason) => promiseCall(fn, original, [reason]);
        }
        function convertUnderlyingSourcePullCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => promiseCall(fn, original, [controller]);
        }
        function convertUnderlyingSourceStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertReadableStreamType(type, context) {
          type = `${type}`;
          if (type !== "bytes") {
            throw new TypeError(`${context} '${type}' is not a valid enumeration value for ReadableStreamType`);
          }
          return type;
        }
        function convertReaderOptions(options2, context) {
          assertDictionary(options2, context);
          const mode = options2 === null || options2 === void 0 ? void 0 : options2.mode;
          return {
            mode: mode === void 0 ? void 0 : convertReadableStreamReaderMode(mode, `${context} has member 'mode' that`)
          };
        }
        function convertReadableStreamReaderMode(mode, context) {
          mode = `${mode}`;
          if (mode !== "byob") {
            throw new TypeError(`${context} '${mode}' is not a valid enumeration value for ReadableStreamReaderMode`);
          }
          return mode;
        }
        function convertIteratorOptions(options2, context) {
          assertDictionary(options2, context);
          const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
          return { preventCancel: Boolean(preventCancel) };
        }
        function convertPipeOptions(options2, context) {
          assertDictionary(options2, context);
          const preventAbort = options2 === null || options2 === void 0 ? void 0 : options2.preventAbort;
          const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
          const preventClose = options2 === null || options2 === void 0 ? void 0 : options2.preventClose;
          const signal = options2 === null || options2 === void 0 ? void 0 : options2.signal;
          if (signal !== void 0) {
            assertAbortSignal(signal, `${context} has member 'signal' that`);
          }
          return {
            preventAbort: Boolean(preventAbort),
            preventCancel: Boolean(preventCancel),
            preventClose: Boolean(preventClose),
            signal
          };
        }
        function assertAbortSignal(signal, context) {
          if (!isAbortSignal2(signal)) {
            throw new TypeError(`${context} is not an AbortSignal.`);
          }
        }
        function convertReadableWritablePair(pair, context) {
          assertDictionary(pair, context);
          const readable = pair === null || pair === void 0 ? void 0 : pair.readable;
          assertRequiredField(readable, "readable", "ReadableWritablePair");
          assertReadableStream(readable, `${context} has member 'readable' that`);
          const writable2 = pair === null || pair === void 0 ? void 0 : pair.writable;
          assertRequiredField(writable2, "writable", "ReadableWritablePair");
          assertWritableStream(writable2, `${context} has member 'writable' that`);
          return { readable, writable: writable2 };
        }
        class ReadableStream2 {
          constructor(rawUnderlyingSource = {}, rawStrategy = {}) {
            if (rawUnderlyingSource === void 0) {
              rawUnderlyingSource = null;
            } else {
              assertObject(rawUnderlyingSource, "First parameter");
            }
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSource = convertUnderlyingDefaultOrByteSource(rawUnderlyingSource, "First parameter");
            InitializeReadableStream(this);
            if (underlyingSource.type === "bytes") {
              if (strategy.size !== void 0) {
                throw new RangeError("The strategy for a byte stream cannot have a size function");
              }
              const highWaterMark = ExtractHighWaterMark(strategy, 0);
              SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
            } else {
              const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
              const highWaterMark = ExtractHighWaterMark(strategy, 1);
              SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
            }
          }
          get locked() {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("locked");
            }
            return IsReadableStreamLocked(this);
          }
          cancel(reason = void 0) {
            if (!IsReadableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$1("cancel"));
            }
            if (IsReadableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot cancel a stream that already has a reader"));
            }
            return ReadableStreamCancel(this, reason);
          }
          getReader(rawOptions = void 0) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("getReader");
            }
            const options2 = convertReaderOptions(rawOptions, "First parameter");
            if (options2.mode === void 0) {
              return AcquireReadableStreamDefaultReader(this);
            }
            return AcquireReadableStreamBYOBReader(this);
          }
          pipeThrough(rawTransform, rawOptions = {}) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("pipeThrough");
            }
            assertRequiredArgument(rawTransform, 1, "pipeThrough");
            const transform = convertReadableWritablePair(rawTransform, "First parameter");
            const options2 = convertPipeOptions(rawOptions, "Second parameter");
            if (IsReadableStreamLocked(this)) {
              throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");
            }
            if (IsWritableStreamLocked(transform.writable)) {
              throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");
            }
            const promise = ReadableStreamPipeTo(this, transform.writable, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
            setPromiseIsHandledToTrue(promise);
            return transform.readable;
          }
          pipeTo(destination, rawOptions = {}) {
            if (!IsReadableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$1("pipeTo"));
            }
            if (destination === void 0) {
              return promiseRejectedWith(`Parameter 1 is required in 'pipeTo'.`);
            }
            if (!IsWritableStream(destination)) {
              return promiseRejectedWith(new TypeError(`ReadableStream.prototype.pipeTo's first argument must be a WritableStream`));
            }
            let options2;
            try {
              options2 = convertPipeOptions(rawOptions, "Second parameter");
            } catch (e) {
              return promiseRejectedWith(e);
            }
            if (IsReadableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream"));
            }
            if (IsWritableStreamLocked(destination)) {
              return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream"));
            }
            return ReadableStreamPipeTo(this, destination, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
          }
          tee() {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("tee");
            }
            const branches = ReadableStreamTee(this);
            return CreateArrayFromList(branches);
          }
          values(rawOptions = void 0) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("values");
            }
            const options2 = convertIteratorOptions(rawOptions, "First parameter");
            return AcquireReadableStreamAsyncIterator(this, options2.preventCancel);
          }
        }
        Object.defineProperties(ReadableStream2.prototype, {
          cancel: { enumerable: true },
          getReader: { enumerable: true },
          pipeThrough: { enumerable: true },
          pipeTo: { enumerable: true },
          tee: { enumerable: true },
          values: { enumerable: true },
          locked: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStream",
            configurable: true
          });
        }
        if (typeof SymbolPolyfill.asyncIterator === "symbol") {
          Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.asyncIterator, {
            value: ReadableStream2.prototype.values,
            writable: true,
            configurable: true
          });
        }
        function CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
          const stream = Object.create(ReadableStream2.prototype);
          InitializeReadableStream(stream);
          const controller = Object.create(ReadableStreamDefaultController.prototype);
          SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
          return stream;
        }
        function CreateReadableByteStream(startAlgorithm, pullAlgorithm, cancelAlgorithm) {
          const stream = Object.create(ReadableStream2.prototype);
          InitializeReadableStream(stream);
          const controller = Object.create(ReadableByteStreamController.prototype);
          SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, 0, void 0);
          return stream;
        }
        function InitializeReadableStream(stream) {
          stream._state = "readable";
          stream._reader = void 0;
          stream._storedError = void 0;
          stream._disturbed = false;
        }
        function IsReadableStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readableStreamController")) {
            return false;
          }
          return x instanceof ReadableStream2;
        }
        function IsReadableStreamLocked(stream) {
          if (stream._reader === void 0) {
            return false;
          }
          return true;
        }
        function ReadableStreamCancel(stream, reason) {
          stream._disturbed = true;
          if (stream._state === "closed") {
            return promiseResolvedWith(void 0);
          }
          if (stream._state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          ReadableStreamClose(stream);
          const reader = stream._reader;
          if (reader !== void 0 && IsReadableStreamBYOBReader(reader)) {
            reader._readIntoRequests.forEach((readIntoRequest) => {
              readIntoRequest._closeSteps(void 0);
            });
            reader._readIntoRequests = new SimpleQueue();
          }
          const sourceCancelPromise = stream._readableStreamController[CancelSteps](reason);
          return transformPromiseWith(sourceCancelPromise, noop2);
        }
        function ReadableStreamClose(stream) {
          stream._state = "closed";
          const reader = stream._reader;
          if (reader === void 0) {
            return;
          }
          defaultReaderClosedPromiseResolve(reader);
          if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest) => {
              readRequest._closeSteps();
            });
            reader._readRequests = new SimpleQueue();
          }
        }
        function ReadableStreamError(stream, e) {
          stream._state = "errored";
          stream._storedError = e;
          const reader = stream._reader;
          if (reader === void 0) {
            return;
          }
          defaultReaderClosedPromiseReject(reader, e);
          if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest) => {
              readRequest._errorSteps(e);
            });
            reader._readRequests = new SimpleQueue();
          } else {
            reader._readIntoRequests.forEach((readIntoRequest) => {
              readIntoRequest._errorSteps(e);
            });
            reader._readIntoRequests = new SimpleQueue();
          }
        }
        function streamBrandCheckException$1(name) {
          return new TypeError(`ReadableStream.prototype.${name} can only be used on a ReadableStream`);
        }
        function convertQueuingStrategyInit(init2, context) {
          assertDictionary(init2, context);
          const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
          assertRequiredField(highWaterMark, "highWaterMark", "QueuingStrategyInit");
          return {
            highWaterMark: convertUnrestrictedDouble(highWaterMark)
          };
        }
        const byteLengthSizeFunction = (chunk) => {
          return chunk.byteLength;
        };
        Object.defineProperty(byteLengthSizeFunction, "name", {
          value: "size",
          configurable: true
        });
        class ByteLengthQueuingStrategy {
          constructor(options2) {
            assertRequiredArgument(options2, 1, "ByteLengthQueuingStrategy");
            options2 = convertQueuingStrategyInit(options2, "First parameter");
            this._byteLengthQueuingStrategyHighWaterMark = options2.highWaterMark;
          }
          get highWaterMark() {
            if (!IsByteLengthQueuingStrategy(this)) {
              throw byteLengthBrandCheckException("highWaterMark");
            }
            return this._byteLengthQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!IsByteLengthQueuingStrategy(this)) {
              throw byteLengthBrandCheckException("size");
            }
            return byteLengthSizeFunction;
          }
        }
        Object.defineProperties(ByteLengthQueuingStrategy.prototype, {
          highWaterMark: { enumerable: true },
          size: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ByteLengthQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: "ByteLengthQueuingStrategy",
            configurable: true
          });
        }
        function byteLengthBrandCheckException(name) {
          return new TypeError(`ByteLengthQueuingStrategy.prototype.${name} can only be used on a ByteLengthQueuingStrategy`);
        }
        function IsByteLengthQueuingStrategy(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_byteLengthQueuingStrategyHighWaterMark")) {
            return false;
          }
          return x instanceof ByteLengthQueuingStrategy;
        }
        const countSizeFunction = () => {
          return 1;
        };
        Object.defineProperty(countSizeFunction, "name", {
          value: "size",
          configurable: true
        });
        class CountQueuingStrategy {
          constructor(options2) {
            assertRequiredArgument(options2, 1, "CountQueuingStrategy");
            options2 = convertQueuingStrategyInit(options2, "First parameter");
            this._countQueuingStrategyHighWaterMark = options2.highWaterMark;
          }
          get highWaterMark() {
            if (!IsCountQueuingStrategy(this)) {
              throw countBrandCheckException("highWaterMark");
            }
            return this._countQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!IsCountQueuingStrategy(this)) {
              throw countBrandCheckException("size");
            }
            return countSizeFunction;
          }
        }
        Object.defineProperties(CountQueuingStrategy.prototype, {
          highWaterMark: { enumerable: true },
          size: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(CountQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: "CountQueuingStrategy",
            configurable: true
          });
        }
        function countBrandCheckException(name) {
          return new TypeError(`CountQueuingStrategy.prototype.${name} can only be used on a CountQueuingStrategy`);
        }
        function IsCountQueuingStrategy(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_countQueuingStrategyHighWaterMark")) {
            return false;
          }
          return x instanceof CountQueuingStrategy;
        }
        function convertTransformer(original, context) {
          assertDictionary(original, context);
          const flush = original === null || original === void 0 ? void 0 : original.flush;
          const readableType = original === null || original === void 0 ? void 0 : original.readableType;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const transform = original === null || original === void 0 ? void 0 : original.transform;
          const writableType = original === null || original === void 0 ? void 0 : original.writableType;
          return {
            flush: flush === void 0 ? void 0 : convertTransformerFlushCallback(flush, original, `${context} has member 'flush' that`),
            readableType,
            start: start === void 0 ? void 0 : convertTransformerStartCallback(start, original, `${context} has member 'start' that`),
            transform: transform === void 0 ? void 0 : convertTransformerTransformCallback(transform, original, `${context} has member 'transform' that`),
            writableType
          };
        }
        function convertTransformerFlushCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => promiseCall(fn, original, [controller]);
        }
        function convertTransformerStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertTransformerTransformCallback(fn, original, context) {
          assertFunction(fn, context);
          return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
        }
        class TransformStream {
          constructor(rawTransformer = {}, rawWritableStrategy = {}, rawReadableStrategy = {}) {
            if (rawTransformer === void 0) {
              rawTransformer = null;
            }
            const writableStrategy = convertQueuingStrategy(rawWritableStrategy, "Second parameter");
            const readableStrategy = convertQueuingStrategy(rawReadableStrategy, "Third parameter");
            const transformer = convertTransformer(rawTransformer, "First parameter");
            if (transformer.readableType !== void 0) {
              throw new RangeError("Invalid readableType specified");
            }
            if (transformer.writableType !== void 0) {
              throw new RangeError("Invalid writableType specified");
            }
            const readableHighWaterMark = ExtractHighWaterMark(readableStrategy, 0);
            const readableSizeAlgorithm = ExtractSizeAlgorithm(readableStrategy);
            const writableHighWaterMark = ExtractHighWaterMark(writableStrategy, 1);
            const writableSizeAlgorithm = ExtractSizeAlgorithm(writableStrategy);
            let startPromise_resolve;
            const startPromise = newPromise((resolve2) => {
              startPromise_resolve = resolve2;
            });
            InitializeTransformStream(this, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
            SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
            if (transformer.start !== void 0) {
              startPromise_resolve(transformer.start(this._transformStreamController));
            } else {
              startPromise_resolve(void 0);
            }
          }
          get readable() {
            if (!IsTransformStream(this)) {
              throw streamBrandCheckException("readable");
            }
            return this._readable;
          }
          get writable() {
            if (!IsTransformStream(this)) {
              throw streamBrandCheckException("writable");
            }
            return this._writable;
          }
        }
        Object.defineProperties(TransformStream.prototype, {
          readable: { enumerable: true },
          writable: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(TransformStream.prototype, SymbolPolyfill.toStringTag, {
            value: "TransformStream",
            configurable: true
          });
        }
        function InitializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
          function startAlgorithm() {
            return startPromise;
          }
          function writeAlgorithm(chunk) {
            return TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
          }
          function abortAlgorithm(reason) {
            return TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
          }
          function closeAlgorithm() {
            return TransformStreamDefaultSinkCloseAlgorithm(stream);
          }
          stream._writable = CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, writableHighWaterMark, writableSizeAlgorithm);
          function pullAlgorithm() {
            return TransformStreamDefaultSourcePullAlgorithm(stream);
          }
          function cancelAlgorithm(reason) {
            TransformStreamErrorWritableAndUnblockWrite(stream, reason);
            return promiseResolvedWith(void 0);
          }
          stream._readable = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
          stream._backpressure = void 0;
          stream._backpressureChangePromise = void 0;
          stream._backpressureChangePromise_resolve = void 0;
          TransformStreamSetBackpressure(stream, true);
          stream._transformStreamController = void 0;
        }
        function IsTransformStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_transformStreamController")) {
            return false;
          }
          return x instanceof TransformStream;
        }
        function TransformStreamError(stream, e) {
          ReadableStreamDefaultControllerError(stream._readable._readableStreamController, e);
          TransformStreamErrorWritableAndUnblockWrite(stream, e);
        }
        function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
          TransformStreamDefaultControllerClearAlgorithms(stream._transformStreamController);
          WritableStreamDefaultControllerErrorIfNeeded(stream._writable._writableStreamController, e);
          if (stream._backpressure) {
            TransformStreamSetBackpressure(stream, false);
          }
        }
        function TransformStreamSetBackpressure(stream, backpressure) {
          if (stream._backpressureChangePromise !== void 0) {
            stream._backpressureChangePromise_resolve();
          }
          stream._backpressureChangePromise = newPromise((resolve2) => {
            stream._backpressureChangePromise_resolve = resolve2;
          });
          stream._backpressure = backpressure;
        }
        class TransformStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("desiredSize");
            }
            const readableController = this._controlledTransformStream._readable._readableStreamController;
            return ReadableStreamDefaultControllerGetDesiredSize(readableController);
          }
          enqueue(chunk = void 0) {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("enqueue");
            }
            TransformStreamDefaultControllerEnqueue(this, chunk);
          }
          error(reason = void 0) {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("error");
            }
            TransformStreamDefaultControllerError(this, reason);
          }
          terminate() {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("terminate");
            }
            TransformStreamDefaultControllerTerminate(this);
          }
        }
        Object.defineProperties(TransformStreamDefaultController.prototype, {
          enqueue: { enumerable: true },
          error: { enumerable: true },
          terminate: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(TransformStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "TransformStreamDefaultController",
            configurable: true
          });
        }
        function IsTransformStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledTransformStream")) {
            return false;
          }
          return x instanceof TransformStreamDefaultController;
        }
        function SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm) {
          controller._controlledTransformStream = stream;
          stream._transformStreamController = controller;
          controller._transformAlgorithm = transformAlgorithm;
          controller._flushAlgorithm = flushAlgorithm;
        }
        function SetUpTransformStreamDefaultControllerFromTransformer(stream, transformer) {
          const controller = Object.create(TransformStreamDefaultController.prototype);
          let transformAlgorithm = (chunk) => {
            try {
              TransformStreamDefaultControllerEnqueue(controller, chunk);
              return promiseResolvedWith(void 0);
            } catch (transformResultE) {
              return promiseRejectedWith(transformResultE);
            }
          };
          let flushAlgorithm = () => promiseResolvedWith(void 0);
          if (transformer.transform !== void 0) {
            transformAlgorithm = (chunk) => transformer.transform(chunk, controller);
          }
          if (transformer.flush !== void 0) {
            flushAlgorithm = () => transformer.flush(controller);
          }
          SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm);
        }
        function TransformStreamDefaultControllerClearAlgorithms(controller) {
          controller._transformAlgorithm = void 0;
          controller._flushAlgorithm = void 0;
        }
        function TransformStreamDefaultControllerEnqueue(controller, chunk) {
          const stream = controller._controlledTransformStream;
          const readableController = stream._readable._readableStreamController;
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController)) {
            throw new TypeError("Readable side is not in a state that permits enqueue");
          }
          try {
            ReadableStreamDefaultControllerEnqueue(readableController, chunk);
          } catch (e) {
            TransformStreamErrorWritableAndUnblockWrite(stream, e);
            throw stream._readable._storedError;
          }
          const backpressure = ReadableStreamDefaultControllerHasBackpressure(readableController);
          if (backpressure !== stream._backpressure) {
            TransformStreamSetBackpressure(stream, true);
          }
        }
        function TransformStreamDefaultControllerError(controller, e) {
          TransformStreamError(controller._controlledTransformStream, e);
        }
        function TransformStreamDefaultControllerPerformTransform(controller, chunk) {
          const transformPromise = controller._transformAlgorithm(chunk);
          return transformPromiseWith(transformPromise, void 0, (r) => {
            TransformStreamError(controller._controlledTransformStream, r);
            throw r;
          });
        }
        function TransformStreamDefaultControllerTerminate(controller) {
          const stream = controller._controlledTransformStream;
          const readableController = stream._readable._readableStreamController;
          ReadableStreamDefaultControllerClose(readableController);
          const error2 = new TypeError("TransformStream terminated");
          TransformStreamErrorWritableAndUnblockWrite(stream, error2);
        }
        function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
          const controller = stream._transformStreamController;
          if (stream._backpressure) {
            const backpressureChangePromise = stream._backpressureChangePromise;
            return transformPromiseWith(backpressureChangePromise, () => {
              const writable2 = stream._writable;
              const state = writable2._state;
              if (state === "erroring") {
                throw writable2._storedError;
              }
              return TransformStreamDefaultControllerPerformTransform(controller, chunk);
            });
          }
          return TransformStreamDefaultControllerPerformTransform(controller, chunk);
        }
        function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
          TransformStreamError(stream, reason);
          return promiseResolvedWith(void 0);
        }
        function TransformStreamDefaultSinkCloseAlgorithm(stream) {
          const readable = stream._readable;
          const controller = stream._transformStreamController;
          const flushPromise = controller._flushAlgorithm();
          TransformStreamDefaultControllerClearAlgorithms(controller);
          return transformPromiseWith(flushPromise, () => {
            if (readable._state === "errored") {
              throw readable._storedError;
            }
            ReadableStreamDefaultControllerClose(readable._readableStreamController);
          }, (r) => {
            TransformStreamError(stream, r);
            throw readable._storedError;
          });
        }
        function TransformStreamDefaultSourcePullAlgorithm(stream) {
          TransformStreamSetBackpressure(stream, false);
          return stream._backpressureChangePromise;
        }
        function defaultControllerBrandCheckException(name) {
          return new TypeError(`TransformStreamDefaultController.prototype.${name} can only be used on a TransformStreamDefaultController`);
        }
        function streamBrandCheckException(name) {
          return new TypeError(`TransformStream.prototype.${name} can only be used on a TransformStream`);
        }
        exports2.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
        exports2.CountQueuingStrategy = CountQueuingStrategy;
        exports2.ReadableByteStreamController = ReadableByteStreamController;
        exports2.ReadableStream = ReadableStream2;
        exports2.ReadableStreamBYOBReader = ReadableStreamBYOBReader;
        exports2.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest;
        exports2.ReadableStreamDefaultController = ReadableStreamDefaultController;
        exports2.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
        exports2.TransformStream = TransformStream;
        exports2.TransformStreamDefaultController = TransformStreamDefaultController;
        exports2.WritableStream = WritableStream;
        exports2.WritableStreamDefaultController = WritableStreamDefaultController;
        exports2.WritableStreamDefaultWriter = WritableStreamDefaultWriter;
        Object.defineProperty(exports2, "__esModule", { value: true });
      });
    })(ponyfill_es2018, ponyfill_es2018.exports);
    POOL_SIZE$1 = 65536;
    if (!globalThis.ReadableStream) {
      try {
        const process2 = require("node:process");
        const { emitWarning } = process2;
        try {
          process2.emitWarning = () => {
          };
          Object.assign(globalThis, require("node:stream/web"));
          process2.emitWarning = emitWarning;
        } catch (error2) {
          process2.emitWarning = emitWarning;
          throw error2;
        }
      } catch (error2) {
        Object.assign(globalThis, ponyfill_es2018.exports);
      }
    }
    try {
      const { Blob: Blob3 } = require("buffer");
      if (Blob3 && !Blob3.prototype.stream) {
        Blob3.prototype.stream = function name(params) {
          let position = 0;
          const blob = this;
          return new ReadableStream({
            type: "bytes",
            async pull(ctrl) {
              const chunk = blob.slice(position, Math.min(blob.size, position + POOL_SIZE$1));
              const buffer = await chunk.arrayBuffer();
              position += buffer.byteLength;
              ctrl.enqueue(new Uint8Array(buffer));
              if (position === blob.size) {
                ctrl.close();
              }
            }
          });
        };
      }
    } catch (error2) {
    }
    POOL_SIZE = 65536;
    _Blob = class Blob {
      #parts = [];
      #type = "";
      #size = 0;
      constructor(blobParts = [], options2 = {}) {
        if (typeof blobParts !== "object" || blobParts === null) {
          throw new TypeError("Failed to construct 'Blob': The provided value cannot be converted to a sequence.");
        }
        if (typeof blobParts[Symbol.iterator] !== "function") {
          throw new TypeError("Failed to construct 'Blob': The object must have a callable @@iterator property.");
        }
        if (typeof options2 !== "object" && typeof options2 !== "function") {
          throw new TypeError("Failed to construct 'Blob': parameter 2 cannot convert to dictionary.");
        }
        if (options2 === null)
          options2 = {};
        const encoder = new TextEncoder();
        for (const element of blobParts) {
          let part;
          if (ArrayBuffer.isView(element)) {
            part = new Uint8Array(element.buffer.slice(element.byteOffset, element.byteOffset + element.byteLength));
          } else if (element instanceof ArrayBuffer) {
            part = new Uint8Array(element.slice(0));
          } else if (element instanceof Blob) {
            part = element;
          } else {
            part = encoder.encode(element);
          }
          this.#size += ArrayBuffer.isView(part) ? part.byteLength : part.size;
          this.#parts.push(part);
        }
        const type = options2.type === void 0 ? "" : String(options2.type);
        this.#type = /^[\x20-\x7E]*$/.test(type) ? type : "";
      }
      get size() {
        return this.#size;
      }
      get type() {
        return this.#type;
      }
      async text() {
        const decoder = new TextDecoder();
        let str = "";
        for await (const part of toIterator(this.#parts, false)) {
          str += decoder.decode(part, { stream: true });
        }
        str += decoder.decode();
        return str;
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of toIterator(this.#parts, false)) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        const it = toIterator(this.#parts, true);
        return new globalThis.ReadableStream({
          type: "bytes",
          async pull(ctrl) {
            const chunk = await it.next();
            chunk.done ? ctrl.close() : ctrl.enqueue(chunk.value);
          },
          async cancel() {
            await it.return();
          }
        });
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = this.#parts;
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          if (added >= span) {
            break;
          }
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            let chunk;
            if (ArrayBuffer.isView(part)) {
              chunk = part.subarray(relativeStart, Math.min(size2, relativeEnd));
              added += chunk.byteLength;
            } else {
              chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
              added += chunk.size;
            }
            relativeEnd -= size2;
            blobParts.push(chunk);
            relativeStart = 0;
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        blob.#size = span;
        blob.#parts = blobParts;
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.constructor === "function" && (typeof object.stream === "function" || typeof object.arrayBuffer === "function") && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(_Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    Blob2 = _Blob;
    Blob$1 = Blob2;
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
      return typeof object === "object" && (object[NAME] === "AbortSignal" || object[NAME] === "EventTarget");
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body4, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body4 === null) {
          body4 = null;
        } else if (isURLSearchParameters(body4)) {
          body4 = Buffer.from(body4.toString());
        } else if (isBlob(body4))
          ;
        else if (Buffer.isBuffer(body4))
          ;
        else if (import_util.types.isAnyArrayBuffer(body4)) {
          body4 = Buffer.from(body4);
        } else if (ArrayBuffer.isView(body4)) {
          body4 = Buffer.from(body4.buffer, body4.byteOffset, body4.byteLength);
        } else if (body4 instanceof import_stream.default)
          ;
        else if (isFormData(body4)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body4 = import_stream.default.Readable.from(formDataIterator(body4, boundary));
        } else {
          body4 = Buffer.from(String(body4));
        }
        this[INTERNALS$2] = {
          body: body4,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body4 instanceof import_stream.default) {
          body4.on("error", (error_) => {
            const error2 = error_ instanceof FetchBaseError ? error_ : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, "system", error_);
            this[INTERNALS$2].error = error2;
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
      let { body: body4 } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body4 instanceof import_stream.default && typeof body4.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body4.pipe(p1);
        body4.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body4 = p2;
      }
      return body4;
    };
    extractContentType = (body4, request) => {
      if (body4 === null) {
        return null;
      }
      if (typeof body4 === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body4)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body4)) {
        return body4.type || null;
      }
      if (Buffer.isBuffer(body4) || import_util.types.isAnyArrayBuffer(body4) || ArrayBuffer.isView(body4)) {
        return null;
      }
      if (body4 && typeof body4.getBoundary === "function") {
        return `multipart/form-data;boundary=${body4.getBoundary()}`;
      }
      if (isFormData(body4)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body4 instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body: body4 } = request;
      if (body4 === null) {
        return 0;
      }
      if (isBlob(body4)) {
        return body4.size;
      }
      if (Buffer.isBuffer(body4)) {
        return body4.length;
      }
      if (body4 && typeof body4.getLengthSync === "function") {
        return body4.hasKnownLength && body4.hasKnownLength() ? body4.getLengthSync() : null;
      }
      if (isFormData(body4)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body: body4 }) => {
      if (body4 === null) {
        dest.end();
      } else if (isBlob(body4)) {
        import_stream.default.Readable.from(body4.stream()).pipe(dest);
      } else if (Buffer.isBuffer(body4)) {
        dest.write(body4);
        dest.end();
      } else {
        body4.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const error2 = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(error2, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw error2;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const error2 = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(error2, "code", { value: "ERR_INVALID_CHAR" });
        throw error2;
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
                  return URLSearchParams.prototype[p].call(target, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(target, String(name).toLowerCase());
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
      forEach(callback, thisArg = void 0) {
        for (const name of this.keys()) {
          Reflect.apply(callback, thisArg, [this.get(name), name, this]);
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
      constructor(body4 = null, options2 = {}) {
        super(body4, options2);
        const status = options2.status != null ? options2.status : 200;
        const headers = new Headers(options2.headers);
        if (body4 !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body4);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          type: "default",
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get type() {
        return this[INTERNALS$1].type;
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
          type: this.type,
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
      static error() {
        const response = new Response(null, { status: 0, statusText: "" });
        response[INTERNALS$1].type = "error";
        return response;
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      type: { enumerable: true },
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
        if (signal != null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal or EventTarget");
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

// .svelte-kit/output/server/chunks/TagCloud-8d2708ec.js
var css, TagCloud;
var init_TagCloud_8d2708ec = __esm({
  ".svelte-kit/output/server/chunks/TagCloud-8d2708ec.js"() {
    init_shims();
    init_app_47afbf9a();
    css = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-350:hsl(176, 100%, 50%);--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-350:hsl(19, 100%, 60%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px}.svelte-t5th6n,.svelte-t5th6n::before,.svelte-t5th6n::after{box-sizing:border-box}.svelte-t5th6n{margin:0}a.svelte-t5th6n{color:inherit;padding:0.5rem 0.85rem 0.5rem;margin:0.5rem 0.5rem 0rem 0.5rem;border-radius:10px;background:var(--primary-400);text-decoration:none}a.svelte-t5th6n:hover{background:var(--primary-300);color:white}div.svelte-t5th6n{margin:var(--spacing-unit) var(--spacing-unit) var(--spacing-unit) 0;padding:var(--spacing-unit) var(--spacing-unit) var(--spacing-unit) 0}",
      map: null
    };
    TagCloud = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let tagArray = ["SvelteKit"];
      $$result.css.add(css);
      return `<div class="${"svelte-t5th6n"}">${each(tagArray, (tag) => `<a${add_attribute("href", `/tags/${tag}`, 0)} class="${"svelte-t5th6n"}">${escape(tag)}</a>`)}
</div>`;
    });
  }
});

// .svelte-kit/output/server/chunks/__layout-969a828d.js
var layout_969a828d_exports = {};
__export(layout_969a828d_exports, {
  default: () => _layout
});
var css2, _layout;
var init_layout_969a828d = __esm({
  ".svelte-kit/output/server/chunks/__layout-969a828d.js"() {
    init_shims();
    init_app_47afbf9a();
    init_TagCloud_8d2708ec();
    css2 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-350:hsl(176, 100%, 50%);--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-350:hsl(19, 100%, 60%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px}.svelte-1mnub1o.svelte-1mnub1o,.svelte-1mnub1o.svelte-1mnub1o::before,.svelte-1mnub1o.svelte-1mnub1o::after{box-sizing:border-box}.svelte-1mnub1o.svelte-1mnub1o{margin:0}img.svelte-1mnub1o.svelte-1mnub1o{display:block;max-width:100%}h1.svelte-1mnub1o.svelte-1mnub1o,h3.svelte-1mnub1o.svelte-1mnub1o,h4.svelte-1mnub1o.svelte-1mnub1o{overflow-wrap:break-word}.container.svelte-1mnub1o.svelte-1mnub1o{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}:root{scroll-behavior:smooth;line-height:1.3;font-size:1rem;overflow-x:hidden;color:var(--primary-100);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif}@media screen and (min-width: 400px){:root{font-sizee:1.2rem}}@media screen and (min-width: 600px){:root{font-size:1.5rem}}.sitetitle.svelte-1mnub1o.svelte-1mnub1o{color:var(--primary-100);font-size:2.3em}.sitetitle.svelte-1mnub1o a.svelte-1mnub1o{position:relative;font-weight:700;color:inherit;text-decoration:none}.sitetitle.svelte-1mnub1o a.svelte-1mnub1o:before{z-index:1;content:'';display:none;position:absolute;bottom:-0.1em;left:0em;width:100%;height:0.1em;background:var(--primary-100)}.sitetitle.svelte-1mnub1o a.svelte-1mnub1o:hover:before{display:block}header.svelte-1mnub1o.svelte-1mnub1o{margin-top:var(--spacing-unit)}.container.svelte-1mnub1o.svelte-1mnub1o{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}.wrapperForFooter.svelte-1mnub1o.svelte-1mnub1o{min-height:calc(100vh - 10rem);margin-bottom:0}.footerWrapper.svelte-1mnub1o.svelte-1mnub1o{height:5rem;background:transparent;width:100vw;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;margin-bottom:0;position:relative}footer.svelte-1mnub1o.svelte-1mnub1o{display:grid;align-items:start;justify-items:center;grid-gap:var(--spacing-unit);grid-template-columns:1fr 1fr;height:10rem;z-index:-2 !important;background:transparent;max-width:1300px;margin:auto;padding:calc(var(--spacing-unit) * 2)}footer.svelte-1mnub1o div.svelte-1mnub1o:nth-child(3){display:none}@media screen and (min-width: 900px){footer.svelte-1mnub1o.svelte-1mnub1o{grid-template-columns:1fr 1fr 1fr}footer.svelte-1mnub1o div.svelte-1mnub1o:nth-child(3){display:block}}footer.svelte-1mnub1o h3.svelte-1mnub1o{color:var(--primary-100)}footer.svelte-1mnub1o h3 a.svelte-1mnub1o{position:relative;font-weight:700;color:inherit;text-decoration:none}footer.svelte-1mnub1o h3 a.svelte-1mnub1o:before{z-index:1;content:'';display:none;position:absolute;bottom:-0.1em;left:0em;width:100%;height:0.1em;background:var(--primary-100)}footer.svelte-1mnub1o h3 a.svelte-1mnub1o:hover:before{display:block}footer.svelte-1mnub1o h4.svelte-1mnub1o{font-weight:500}.footer-wave.svelte-1mnub1o.svelte-1mnub1o{margin:auto;width:100%;transform:translateY(5rem)}a.svelte-1mnub1o.svelte-1mnub1o{position:relative;color:var(--secondary-300);font-weight:500;text-decoration:none;width:100%}a.svelte-1mnub1o.svelte-1mnub1o:before{z-index:-100;content:'';display:none;position:absolute;bottom:-0.1em;left:0em;width:100%;height:0.1em;background:var(--secondary-300)}a.svelte-1mnub1o.svelte-1mnub1o:hover:before{display:block}",
      map: null
    };
    _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { open = false } = $$props;
      if ($$props.open === void 0 && $$bindings.open && open !== void 0)
        $$bindings.open(open);
      $$result.css.add(css2);
      return `<div class="${"wrapperForFooter svelte-1mnub1o"}"><div class="${"container svelte-1mnub1o"}"><header class="${"svelte-1mnub1o"}"><h1 class="${"sitetitle svelte-1mnub1o"}"><a href="${"/"}" class="${"svelte-1mnub1o"}">koen.codes</a></h1></header></div>
    
    <main class="${"svelte-1mnub1o"}">${slots.default ? slots.default({}) : ``}</main>

  <div class="${"footerWrapper svelte-1mnub1o"}"><img alt="${"wavy line to separate content from footer"}" class="${"footer-wave svelte-1mnub1o"}" src="${"../footer-waveline.svg"}">
    <footer class="${"svelte-1mnub1o"}"><div class="${"svelte-1mnub1o"}"><h3 class="${"svelte-1mnub1o"}"><a href="${"/"}" class="${"svelte-1mnub1o"}">koen.codes</a></h3>
        <h4 class="${"svelte-1mnub1o"}">Thanks for reading!</h4></div>
      <div class="${"svelte-1mnub1o"}"><h3 class="${"svelte-1mnub1o"}">Links</h3>
        <h4 class="${"svelte-1mnub1o"}"><a href="${"/blog"}" class="${"svelte-1mnub1o"}">Blog</a></h4>
        <h4 class="${"svelte-1mnub1o"}"><a href="${"#projects"}" class="${"svelte-1mnub1o"}">Projects</a></h4></div>
      <div class="${"svelte-1mnub1o"}"><h3 class="${"svelte-1mnub1o"}">Topics</h3>
        ${validate_component(TagCloud, "TagCloud").$$render($$result, {}, {}, {})}</div></footer></div>
  
</div>`;
    });
  }
});

// .svelte-kit/output/server/chunks/Seo-8a3312ea.js
var Seo;
var init_Seo_8a3312ea = __esm({
  ".svelte-kit/output/server/chunks/Seo-8a3312ea.js"() {
    init_shims();
    init_app_47afbf9a();
    Seo = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { metaDescription: metaDescription7 } = $$props;
      let { pageTitle: pageTitle6 } = $$props;
      if ($$props.metaDescription === void 0 && $$bindings.metaDescription && metaDescription7 !== void 0)
        $$bindings.metaDescription(metaDescription7);
      if ($$props.pageTitle === void 0 && $$bindings.pageTitle && pageTitle6 !== void 0)
        $$bindings.pageTitle(pageTitle6);
      return `${$$result.head += `${$$result.title = `<title>koen.codes \xB7 ${escape(pageTitle6)}</title>`, ""}<meta name="${"description"}" content="${"The online turf of a programming noob and medicine student. " + escape(metaDescription7)}" data-svelte="svelte-15621n2"><meta name="${"robots"}" content="${"index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"}" data-svelte="svelte-15621n2"><html lang="${"en"}" data-svelte="svelte-15621n2"></html>`, ""}`;
    });
  }
});

// .svelte-kit/output/server/chunks/__error-78d0beda.js
var error_78d0beda_exports = {};
__export(error_78d0beda_exports, {
  default: () => _error
});
var css3, pageTitle, metaDescription, _error;
var init_error_78d0beda = __esm({
  ".svelte-kit/output/server/chunks/__error-78d0beda.js"() {
    init_shims();
    init_app_47afbf9a();
    init_Seo_8a3312ea();
    css3 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-350:hsl(176, 100%, 50%);--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-350:hsl(19, 100%, 60%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px}.svelte-rr3ym0.svelte-rr3ym0,.svelte-rr3ym0.svelte-rr3ym0::before,.svelte-rr3ym0.svelte-rr3ym0::after{box-sizing:border-box}.svelte-rr3ym0.svelte-rr3ym0{margin:0}p.svelte-rr3ym0.svelte-rr3ym0,h1.svelte-rr3ym0.svelte-rr3ym0{overflow-wrap:break-word}.container.svelte-rr3ym0.svelte-rr3ym0{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}.container.svelte-rr3ym0.svelte-rr3ym0{max-width:1300px;margin:auto;position:relative;padding:0 var(--spacing-unit) 0;display:grid;align-items:center;text-align:center}.container.svelte-rr3ym0 div.svelte-rr3ym0{margin-top:calc(var(--spacing-unit) * 4)}a.svelte-rr3ym0.svelte-rr3ym0{position:relative;color:var(--secondary-300);font-weight:500;text-decoration:none}a.svelte-rr3ym0.svelte-rr3ym0:before{z-index:-100;content:'';display:none;position:absolute;bottom:-0.1em;left:0em;width:100%;height:0.1em;background:var(--secondary-300)}a.svelte-rr3ym0.svelte-rr3ym0:hover:before{display:block}",
      map: null
    };
    pageTitle = "Error!";
    metaDescription = "Error page. Page not found.";
    _error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      $$result.css.add(css3);
      return `${validate_component(Seo, "Seo").$$render($$result, { pageTitle, metaDescription }, {}, {})}
<main class="${"container svelte-rr3ym0"}"><div class="${"svelte-rr3ym0"}"><h1 class="${"svelte-rr3ym0"}">Page not found.</h1>
        <p class="${"svelte-rr3ym0"}">You are in grave danger. <a href="${"/"}" class="${"svelte-rr3ym0"}">Get back to safety</a>.</p></div>
</main>`;
    });
  }
});

// .svelte-kit/output/server/chunks/Date-e4685984.js
var Date_1;
var init_Date_e4685984 = __esm({
  ".svelte-kit/output/server/chunks/Date-e4685984.js"() {
    init_shims();
    init_app_47afbf9a();
    Date_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { date } = $$props;
      if ($$props.date === void 0 && $$bindings.date && date !== void 0)
        $$bindings.date(date);
      return `${escape(new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }))}`;
    });
  }
});

// .svelte-kit/output/server/chunks/blog-eecef7ad.js
var css4, Blog;
var init_blog_eecef7ad = __esm({
  ".svelte-kit/output/server/chunks/blog-eecef7ad.js"() {
    init_shims();
    init_app_47afbf9a();
    init_Seo_8a3312ea();
    init_Date_e4685984();
    css4 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-350:hsl(176, 100%, 50%);--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-350:hsl(19, 100%, 60%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px}.svelte-pk78ir,.svelte-pk78ir::before,.svelte-pk78ir::after{box-sizing:border-box}.svelte-pk78ir{margin:0}img.svelte-pk78ir{display:block;max-width:100%}h1.svelte-pk78ir{overflow-wrap:break-word}.container.svelte-pk78ir{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}.container.svelte-pk78ir{max-width:60ch;margin:auto;position:relative;padding:var(--spacing-unit)}.post-hero.svelte-pk78ir{padding:calc(var(--spacing-unit) * 4) 0 calc(var(--spacing-unit) * 2);display:grid;align-items:center;position:relative}h1.svelte-pk78ir{text-align:center;margin:var(--spacing-unit) 0 calc(var(--spacing-unit) * 4)}.date.svelte-pk78ir{text-align:center}.background.svelte-pk78ir{position:absolute;z-index:-1;max-width:30rem;left:50%;top:50%;transform:translate(-50%, -60%)}.post-content.svelte-pk78ir a{position:relative;color:var(--secondary-300);font-weight:500;text-decoration:none}.post-content.svelte-pk78ir a::before{z-index:-100;content:'';display:none;position:absolute;bottom:-0.1em;left:0em;width:100%;height:0.1em;background:var(--secondary-300)}.post-content.svelte-pk78ir a:hover::before{display:block}",
      map: null
    };
    Blog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { title } = $$props;
      let { snippet } = $$props;
      let { date } = $$props;
      let { tags } = $$props;
      let { backgroundNumber = 4 } = $$props;
      let pageTitle6 = title;
      let metaDescription7 = snippet;
      let backgroundLink = "/postBackground-" + backgroundNumber + ".svg";
      if ($$props.title === void 0 && $$bindings.title && title !== void 0)
        $$bindings.title(title);
      if ($$props.snippet === void 0 && $$bindings.snippet && snippet !== void 0)
        $$bindings.snippet(snippet);
      if ($$props.date === void 0 && $$bindings.date && date !== void 0)
        $$bindings.date(date);
      if ($$props.tags === void 0 && $$bindings.tags && tags !== void 0)
        $$bindings.tags(tags);
      if ($$props.backgroundNumber === void 0 && $$bindings.backgroundNumber && backgroundNumber !== void 0)
        $$bindings.backgroundNumber(backgroundNumber);
      $$result.css.add(css4);
      return `${validate_component(Seo, "Seo").$$render($$result, { pageTitle: pageTitle6, metaDescription: metaDescription7 }, {}, {})}

<div class="${"container svelte-pk78ir"}"><div class="${"post-hero svelte-pk78ir"}"><img alt="${"colored shapes to illustrate the title"}" class="${"background svelte-pk78ir"}"${add_attribute("src", backgroundLink, 0)}>
        <span class="${"date svelte-pk78ir"}">${validate_component(Date_1, "Date").$$render($$result, { date }, {}, {})}</span>
        <h1 class="${"svelte-pk78ir"}">${escape(title)}</h1></div>
    <div class="${"post-content svelte-pk78ir"}">${slots.default ? slots.default({}) : ``}</div>
</div>`;
    });
  }
});

// .svelte-kit/output/server/chunks/211209-globalstyles-2a78373a.js
var globalstyles_2a78373a_exports = {};
__export(globalstyles_2a78373a_exports, {
  default: () => _211209_globalstyles,
  metadata: () => metadata
});
var metadata, _211209_globalstyles;
var init_globalstyles_2a78373a = __esm({
  ".svelte-kit/output/server/chunks/211209-globalstyles-2a78373a.js"() {
    init_shims();
    init_app_47afbf9a();
    init_blog_eecef7ad();
    init_Seo_8a3312ea();
    init_Date_e4685984();
    metadata = {
      "title": "Global styles in SvelteKit",
      "tags": ["SvelteKit"],
      "date": "2021-12-09T00:00:00.000Z",
      "snippet": "Set up Svelte Preprocess to have global SCSS variables in your SvelteKit project.",
      "backgroundNumber": 3,
      "layout": "blog"
    };
    _211209_globalstyles = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `${validate_component(Blog, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata), {}, {
        default: () => `<p>Svelte styles are scoped to their components by default, but global styles can be very useful for things like color schemes, dark mode and CSS resets. This article shows you how to install and implement Svelte Preprocess, and then prepend your your <code>.scss</code> file full of global styles. It\u2019s not difficult to set up! </p>
<p>To start, create a new folder at <code>src/lib/</code> and call it <code>styles.scss</code>. Put all of your global styles in there. </p>
<p>In the terminal, go your project folder and install <code>svelte-preprocess</code> and <code>node-sass</code>.</p>
<pre class="${"language-bash"}"><!-- HTML_TAG_START -->${`<code class="language-bash"><span class="token function">npm</span> <span class="token function">install</span> svelte-preprocess node-sass</code>`}<!-- HTML_TAG_END --></pre>
<p>Now go to your <code>svelte.config.js</code> file, and import <code>svelte-preprocess</code>, <code>dirname</code> and <code>fileURLToPath</code> like so:</p>
<pre class="${"language-js"}"><!-- HTML_TAG_START -->${`<code class="language-js"><span class="token keyword">import</span> SveltePreprocess <span class="token keyword">from</span> <span class="token string">'svelte-preprocess'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> path<span class="token punctuation">,</span> <span class="token punctuation">&#123;</span> dirname <span class="token punctuation">&#125;</span> <span class="token keyword">from</span> <span class="token string">'path'</span>
<span class="token keyword">import</span> <span class="token punctuation">&#123;</span> fileURLToPath <span class="token punctuation">&#125;</span> <span class="token keyword">from</span> <span class="token string">'url'</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Next, we will add two constants which will help us retrieve the path to our <code>styles.scss</code> file. </p>
<pre class="${"language-js"}"><!-- HTML_TAG_START -->${`<code class="language-js"><span class="token keyword">const</span> filePath <span class="token operator">=</span> <span class="token function">dirname</span><span class="token punctuation">(</span><span class="token function">fileURLToPath</span><span class="token punctuation">(</span><span class="token keyword">import</span><span class="token punctuation">.</span>meta<span class="token punctuation">.</span>url<span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token keyword">const</span> sassPath <span class="token operator">=</span> <span class="token template-string"><span class="token template-punctuation string">&#96;</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">$&#123;</span>filePath<span class="token interpolation-punctuation punctuation">&#125;</span></span><span class="token string">/src/styles/</span><span class="token template-punctuation string">&#96;</span></span></code>`}<!-- HTML_TAG_END --></pre>
<p><code>filePath</code> retrieves the path to our project folder, by converting <code>import.meta.url</code> to a usable string. <code>sassPath</code> then specifies the route to where our <code>styles.scss</code> file is. </p>
<p>Now, we need to tell Svelte Preprocess to prepend our <code>styles.scss</code> file. To do that, add the following code to <code>const config</code>.</p>
<pre class="${"language-js"}"><!-- HTML_TAG_START -->${`<code class="language-js">    preprocess<span class="token operator">:</span> <span class="token function">SveltePreprocess</span><span class="token punctuation">(</span><span class="token punctuation">&#123;</span>
        scss<span class="token operator">:</span> <span class="token punctuation">&#123;</span>
            prependData<span class="token operator">:</span> <span class="token template-string"><span class="token template-punctuation string">&#96;</span><span class="token string">@import '</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">$&#123;</span>sassPath<span class="token interpolation-punctuation punctuation">&#125;</span></span><span class="token string">styles.scss';</span><span class="token template-punctuation string">&#96;</span></span>
        <span class="token punctuation">&#125;</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">)</span><span class="token punctuation">,</span></code>`}<!-- HTML_TAG_END --></pre>
<p>If you have MDsveX installed, this will look a bit different:</p>
<pre class="${"language-js"}"><!-- HTML_TAG_START -->${`<code class="language-js">preprocess<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token function">SveltePreprocess</span><span class="token punctuation">(</span><span class="token punctuation">&#123;</span>
					scss<span class="token operator">:</span> <span class="token punctuation">&#123;</span>
						prependData<span class="token operator">:</span> <span class="token template-string"><span class="token template-punctuation string">&#96;</span><span class="token string">@import '</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">$&#123;</span>sassPath<span class="token interpolation-punctuation punctuation">&#125;</span></span><span class="token string">styles.scss';</span><span class="token template-punctuation string">&#96;</span></span>
					<span class="token punctuation">&#125;</span>
				<span class="token punctuation">&#125;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> 
				<span class="token function">mdsvex</span><span class="token punctuation">(</span>mdsvexConfig<span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token punctuation">,</span></code>`}<!-- HTML_TAG_END --></pre>
<p>That\u2019s it! Everything inside of your <code>styles.scss</code> file will now be available globally.</p>`
      })}`;
    });
  }
});

// .svelte-kit/output/server/chunks/211211-code-highlighting-a93151b2.js
var code_highlighting_a93151b2_exports = {};
__export(code_highlighting_a93151b2_exports, {
  default: () => _211211_code_highlighting,
  metadata: () => metadata2
});
var metadata2, _211211_code_highlighting;
var init_code_highlighting_a93151b2 = __esm({
  ".svelte-kit/output/server/chunks/211211-code-highlighting-a93151b2.js"() {
    init_shims();
    init_app_47afbf9a();
    init_blog_eecef7ad();
    init_Seo_8a3312ea();
    init_Date_e4685984();
    metadata2 = {
      "title": "MDsveX: styling your markdown files with layouts and highlighting.",
      "tags": ["SvelteKit", "MDsveX"],
      "date": "2021-12-11T00:00:00.000Z",
      "snippet": "Use MDsveX layouts and syntax highlighting to style markdown files.",
      "layout": "blog"
    };
    _211211_code_highlighting = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `${validate_component(Blog, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata2), {}, {
        default: () => `<h2>Layouts</h2>
<p>If you\u2019ve ever worked with <a href="${"https://jekyllrb.com"}" target="${"_blank"}" rel="${"noopener"}">Jekyll</a>, you\u2019re probably already familiar with the way MDsveX layouts work. </p>
<ol><li>Create a layout file with a <code>&lt;slot&gt;</code> element where the Markdown comes. </li>
<li>Reference the layout file in the frontmatter of your <code>.md</code> file. </li></ol>
<p>The biggest difference is that you need to tell MDsveX where you have stored your layouts.</p>
<p>A layout is like a special Svelte component that takes Markdown instead of HTML. </p>
<h3>Creating layout files</h3>
<p>First, create a <code>layouts</code> folder \u2013 mine is inside of <code>lib</code>, and add your first <code>.svelte</code> layout to it.</p>
<p>After you declare them, frontmatter variables from <code>.md</code> files will be available inside of the layout as props. They can be used just like you normally would.</p>
<p>Add a <code>&lt;slot&gt;&lt;/slot&gt;</code> element to tell MDsveX where to look for Markdown. That\u2019s it.</p>
<p>A sample layout:</p>
<pre class="${"language-html"}"><!-- HTML_TAG_START -->${`<code class="language-html"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">></span></span><span class="token script"><span class="token language-javascript">
    <span class="token keyword">export</span> <span class="token keyword">let</span> title<span class="token punctuation">;</span>
    <span class="token keyword">export</span> <span class="token keyword">let</span> snippet<span class="token punctuation">;</span>
    <span class="token keyword">export</span> <span class="token keyword">let</span> date<span class="token punctuation">;</span>
</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">></span></span>

<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>main</span><span class="token punctuation">></span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">></span></span>&#123;title&#125;<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">></span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h3</span><span class="token punctuation">></span></span>&#123;date&#125;<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h3</span><span class="token punctuation">></span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">></span></span>&#123;snippet&#125;<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>p</span><span class="token punctuation">></span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>article</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>slot</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>slot</span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>article</span><span class="token punctuation">></span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>main</span><span class="token punctuation">></span></span>

<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>style</span><span class="token punctuation">></span></span><span class="token style"><span class="token language-css">
    <span class="token selector">h1</span> <span class="token punctuation">&#123;</span>
        <span class="token property">color</span><span class="token punctuation">:</span> red<span class="token punctuation">;</span>
    <span class="token punctuation">&#125;</span>
</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>style</span><span class="token punctuation">></span></span></code>`}<!-- HTML_TAG_END --></pre>
<h3>Telling MDsveX where your layouts are</h3>
<p>Inside of <code>mdsvex.config.js</code>, or inside the <code>mdsvex()</code> function of <code>svelte.config.js</code>, add the following:</p>
<pre class="${"language-js"}"><!-- HTML_TAG_START -->${`<code class="language-js">layout<span class="token operator">:</span> <span class="token punctuation">&#123;</span>
		blog<span class="token operator">:</span> <span class="token string">'src/lib/layouts/blog.svelte'</span><span class="token punctuation">,</span>
        _<span class="token operator">:</span> <span class="token string">'src/lib/layouts/default.svelte'</span><span class="token punctuation">,</span>
	<span class="token punctuation">&#125;</span><span class="token punctuation">,</span></code>`}<!-- HTML_TAG_END --></pre>
<p>The <code>&#39;_&#39;</code> is the default layout, which will be used if the appointed layout doesn\u2019t work. </p>
<h3>Add your layout to the frontmatter</h3>
<p>Just add <code>layouts: blog</code> to your frontmatter and you\u2019re all set.</p>
<pre class="${"language-yaml"}"><!-- HTML_TAG_START -->${`<code class="language-yaml"><span class="token punctuation">---</span>
<span class="token key atrule">title</span><span class="token punctuation">:</span> Global styles in SvelteKit
<span class="token key atrule">tags</span><span class="token punctuation">:</span> 
    <span class="token punctuation">-</span> SvelteKit
<span class="token key atrule">date</span><span class="token punctuation">:</span> <span class="token datetime number">2021-12-09</span>
<span class="token key atrule">snippet</span><span class="token punctuation">:</span> <span class="token string">"Shows you how to set up Svelte Preprocess to allow global SCSS variables in your SvelteKit project."</span>
<span class="token key atrule">backgroundNumber</span><span class="token punctuation">:</span> <span class="token number">3</span>
<span class="token key atrule">layout</span><span class="token punctuation">:</span> blog
<span class="token punctuation">---</span></code>`}<!-- HTML_TAG_END --></pre>
<p><code>backgroundNumber</code> allows me to pick between a couple of illustrations for around the post title. </p>
<h2>Highlighting</h2>
<p>Adding highlighting is a piece of cake since it is an out-of-the-box feature. All you need to do is add a theme. <a href="${"https://github.com/PrismJS/prism-themes"}" target="${"_blank"}" rel="${"noopener"}">This repo</a> has a lot of options.</p>
<p>To add a theme, save the css file and and import it inside of <code>__layout.svelte</code> as follows:</p>
<pre class="${"language-html"}"><!-- HTML_TAG_START -->${`<code class="language-html"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span> <span class="token attr-name">lang</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>ts<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token script"><span class="token language-javascript">
    <span class="token keyword">import</span>  <span class="token string">"../styles/code.css"</span>
</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">></span></span></code>`}<!-- HTML_TAG_END --></pre>
<p>Inside of your Markdown file, code blocks are created by typing three backticks (\`\`\`) followed immediately by the name of the language (shorthands like \u2018js\u2019 and \u2018md\u2019 work). Then the code. Then again three backticks. </p>
<p>That\u2019s it!</p>`
      })}`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-aab870f8.js
var index_aab870f8_exports = {};
__export(index_aab870f8_exports, {
  default: () => Routes,
  load: () => load
});
var css$2, Project, css$1, Art, css5, allPosts, body, load, pageTitle2, metaDescription2, Routes;
var init_index_aab870f8 = __esm({
  ".svelte-kit/output/server/chunks/index-aab870f8.js"() {
    init_shims();
    init_app_47afbf9a();
    init_Seo_8a3312ea();
    init_TagCloud_8d2708ec();
    css$2 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-350:hsl(176, 100%, 50%);--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-350:hsl(19, 100%, 60%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px}.svelte-1q6u47e.svelte-1q6u47e,.svelte-1q6u47e.svelte-1q6u47e::before,.svelte-1q6u47e.svelte-1q6u47e::after{box-sizing:border-box}.svelte-1q6u47e.svelte-1q6u47e{margin:0}img.svelte-1q6u47e.svelte-1q6u47e{display:block;max-width:100%}p.svelte-1q6u47e.svelte-1q6u47e,h3.svelte-1q6u47e.svelte-1q6u47e{overflow-wrap:break-word}p.svelte-1q6u47e a{position:relative;color:var(--secondary-300);font-weight:500;text-decoration:none}p.svelte-1q6u47e a:before{z-index:-100;content:'';display:none;position:absolute;bottom:-0.1em;left:0em;width:100%;height:0.1em;background:var(--secondary-300)}p.svelte-1q6u47e a:hover:before{display:block}h3.svelte-1q6u47e img{display:inline;max-height:0.75rem;margin:0;padding:0;transform:translateY(-0.25rem);max-width:1rem}.divlink.svelte-1q6u47e.svelte-1q6u47e{text-decoration:none;color:inherit}.divlink.svelte-1q6u47e:hover h3.svelte-1q6u47e{color:var(--primary-300)}.divlink.svelte-1q6u47e:hover .project.svelte-1q6u47e{transform:translate(-0.05rem, -0.05rem);transition:0.1s ease;box-shadow:var(--shadow-elevation-mediumhigh)}.project.svelte-1q6u47e.svelte-1q6u47e{overflow:hidden;border-radius:var(--corner-unit);position:relative;background:white;box-shadow:var(--shadow-elevation-medium)}.project.svelte-1q6u47e div.svelte-1q6u47e:first-child{display:grid;place-items:center;background:var(--gray-500);position:relative;padding:var(--spacing-unit)}.project.svelte-1q6u47e div:first-child div.svelte-1q6u47e{width:50%;max-height:5rem}.project.svelte-1q6u47e div:first-child div img.svelte-1q6u47e{max-height:5rem}.project.svelte-1q6u47e div.svelte-1q6u47e:nth-child(2){padding:var(--spacing-unit)}.project.svelte-1q6u47e div:nth-child(2) p.svelte-1q6u47e{padding:0;margin:0}.project.svelte-1q6u47e div:nth-child(2) h3.svelte-1q6u47e{padding:0;margin:var(--spacing-unit) 0 var(--spacing-unit)}",
      map: null
    };
    Project = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { title = "a project" } = $$props;
      let { src: src2 = "/" } = $$props;
      let { description = "a project about something." } = $$props;
      let { img = "&#128161" } = $$props;
      let { outside = false } = $$props;
      if ($$props.title === void 0 && $$bindings.title && title !== void 0)
        $$bindings.title(title);
      if ($$props.src === void 0 && $$bindings.src && src2 !== void 0)
        $$bindings.src(src2);
      if ($$props.description === void 0 && $$bindings.description && description !== void 0)
        $$bindings.description(description);
      if ($$props.img === void 0 && $$bindings.img && img !== void 0)
        $$bindings.img(img);
      if ($$props.outside === void 0 && $$bindings.outside && outside !== void 0)
        $$bindings.outside(outside);
      $$result.css.add(css$2);
      return `${outside === true ? `<a class="${"divlink svelte-1q6u47e"}" target="${"_blank"}" rel="${"noopener"}"${add_attribute("href", src2, 0)}><div class="${"project svelte-1q6u47e"}"><div class="${"svelte-1q6u47e"}"><div class="${"svelte-1q6u47e"}"><img alt="${"simple brushed line decoration"}"${add_attribute("src", img, 0)} class="${"svelte-1q6u47e"}"></div></div>
                <div class="${"svelte-1q6u47e"}"><h3 class="${"svelte-1q6u47e"}"><!-- HTML_TAG_START -->${title}<!-- HTML_TAG_END --></h3>
                    <p class="${"svelte-1q6u47e"}"><!-- HTML_TAG_START -->${description}<!-- HTML_TAG_END --></p></div></div></a>` : `<a class="${"divlink svelte-1q6u47e"}"${add_attribute("href", src2, 0)}><div class="${"project svelte-1q6u47e"}"><div class="${"svelte-1q6u47e"}"><div class="${"svelte-1q6u47e"}"><img alt="${"simple brushed line decoration"}"${add_attribute("src", img, 0)} class="${"svelte-1q6u47e"}"></div></div>
                <div class="${"svelte-1q6u47e"}"><h3 class="${"svelte-1q6u47e"}"><!-- HTML_TAG_START -->${title}<!-- HTML_TAG_END --></h3>
                    <p class="${"svelte-1q6u47e"}"><!-- HTML_TAG_START -->${description}<!-- HTML_TAG_END --></p></div></div></a>`}`;
    });
    css$1 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-350:hsl(176, 100%, 50%);--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-350:hsl(19, 100%, 60%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px}.svelte-l9j1d2,.svelte-l9j1d2::before,.svelte-l9j1d2::after{box-sizing:border-box}.svelte-l9j1d2{margin:0}img.svelte-l9j1d2{display:block;max-width:100%}@keyframes svelte-l9j1d2-wiggle{0%{transform:rotate(0turn)}33%{transform:rotate(0.012turn)}66%{transform:rotate(-0.012turn)}}img.svelte-l9j1d2{width:20em;height:auto;margin-top:-2rem;filter:drop-shadow(var(--shadow-elevation-medium));animation:svelte-l9j1d2-wiggle 500ms;animation-delay:2250ms;animation-fill-mode:both}@media screen and (max-width: 600px){img.svelte-l9j1d2{width:15em}}",
      map: null
    };
    Art = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      $$result.css.add(css$1);
      return `<img alt="${"man with map on top of 404-error statue trying to figure out what to do"}" src="${"artError-3.svg"}" class="${"svelte-l9j1d2"}">



`;
    });
    css5 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-350:hsl(176, 100%, 50%);--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-350:hsl(19, 100%, 60%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px}.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun,.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun::before,.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun::after{box-sizing:border-box}.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{margin:0}svg.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{display:block;max-width:100%}p.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun,h1.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun,h2.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun,h3.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun,h4.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{overflow-wrap:break-word}.container.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}@keyframes svelte-1ge6oun-appear{0%{opacity:0}100%{opacity:1}}.grid1-hero.svelte-1ge6oun h2.svelte-1ge6oun.svelte-1ge6oun{animation:svelte-1ge6oun-appear 500ms;animation-delay:100ms;animation-fill-mode:both}.grid1-hero.svelte-1ge6oun h1.svelte-1ge6oun.svelte-1ge6oun{animation:svelte-1ge6oun-appear 500ms;animation-delay:500ms;animation-fill-mode:both}.grid1-hero.svelte-1ge6oun h3.svelte-1ge6oun.svelte-1ge6oun{animation:svelte-1ge6oun-appear 500ms;animation-delay:1000ms;animation-fill-mode:both}.grid1-hero.svelte-1ge6oun nav a.svelte-1ge6oun.svelte-1ge6oun:first-child{animation:svelte-1ge6oun-appear 500ms;animation-delay:1500ms;animation-fill-mode:both}.grid1-hero.svelte-1ge6oun nav a.svelte-1ge6oun.svelte-1ge6oun:nth-child(2){animation:svelte-1ge6oun-appear 500ms;animation-delay:1750ms;animation-fill-mode:both}@keyframes svelte-1ge6oun-horizontal-move-fade{0%{transform:translateX(var(--offset));opacity:1}50%{opacity:0.5}100%{transform:translateX(100%);opacity:0}}@keyframes svelte-1ge6oun-horizontal-move-no-fade{0%{transform:translateX(var(--offset));opacity:1}100%{transform:translateX(100%)}}.wrapperForHero.svelte-1ge6oun svg path.svelte-1ge6oun.svelte-1ge6oun:nth-child(1){--offset:-100%;--duration:30s}.wrapperForHero.svelte-1ge6oun svg path.svelte-1ge6oun.svelte-1ge6oun:nth-child(2){--offset:-75%;--duration:29s}.wrapperForHero.svelte-1ge6oun svg path.svelte-1ge6oun.svelte-1ge6oun:nth-child(3){--offset:0%;--duration:43s}.wrapperForHero.svelte-1ge6oun svg path.svelte-1ge6oun.svelte-1ge6oun:nth-child(4){--offset:25%;--duration:40s}.wrapperForHero.svelte-1ge6oun svg path.svelte-1ge6oun.svelte-1ge6oun:nth-child(5){--offset:50%;--duration:46s}.wrapperForHero.svelte-1ge6oun svg path.svelte-1ge6oun.svelte-1ge6oun:nth-child(6){--offset:75%;--duration:45s;animation:svelte-1ge6oun-horizontal-move-no-fade var(--duration) infinite linear}.wrapperForHero.svelte-1ge6oun svg path.svelte-1ge6oun.svelte-1ge6oun:nth-child(7){--offset:90%;--duration:50s}.wrapperForHero.svelte-1ge6oun svg path.svelte-1ge6oun.svelte-1ge6oun:nth-child(7){--offset:60%;--duration:80s;animation:svelte-1ge6oun-horizontal-move-no-fade var(--duration) infinite linear}.wrapperForHero.svelte-1ge6oun svg path.svelte-1ge6oun.svelte-1ge6oun:nth-child(8){--offset:50%;--duration:75s;animation:svelte-1ge6oun-horizontal-move-no-fade var(--duration) infinite linear}.wrapperForHero.svelte-1ge6oun svg path.svelte-1ge6oun.svelte-1ge6oun{animation:svelte-1ge6oun-horizontal-move-fade var(--duration) infinite linear;animation-fill-mode:both}.grid1.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun,.grid2.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun,.grid3.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{display:grid;grid-template-columns:1fr;grid-gap:1.5rem;align-content:stretch;justify-content:stretch;margin:var(--spacing-unit)}.grid1.svelte-1ge6oun .grid1-hero.svelte-1ge6oun.svelte-1ge6oun{display:grid;align-items:center;text-align:center;margin:calc(var(--spacing-unit) * -3.5) var(--spacing-unit) var(--spacing-unit);grid-column:1/2;grid-row:2/3}.grid1.svelte-1ge6oun .grid1-hero h1.svelte-1ge6oun.svelte-1ge6oun,.grid2.svelte-1ge6oun .grid1-hero.svelte-1ge6oun h1.svelte-1ge6oun{font-weight:600}.grid1.svelte-1ge6oun .grid1-hero h2.svelte-1ge6oun.svelte-1ge6oun,.grid2.svelte-1ge6oun .grid1-hero.svelte-1ge6oun h2.svelte-1ge6oun{font-weight:600;color:var(--gray-100)}.grid1.svelte-1ge6oun .grid1-hero h3.svelte-1ge6oun.svelte-1ge6oun,.grid2.svelte-1ge6oun .grid1-hero.svelte-1ge6oun h3.svelte-1ge6oun,.grid2.svelte-1ge6oun .grid1-hero h4.svelte-1ge6oun.svelte-1ge6oun{margin:0;color:var(--gray-100);font-weight:normal}.grid1.svelte-1ge6oun .grid1-hero nav.svelte-1ge6oun.svelte-1ge6oun,.grid2 .grid1-hero.svelte-1ge6oun nav.svelte-1ge6oun.svelte-1ge6oun{float:none}@media screen and (min-width: 1200px){.grid1.svelte-1ge6oun .grid1-hero nav.svelte-1ge6oun.svelte-1ge6oun,.grid2 .grid1-hero.svelte-1ge6oun nav.svelte-1ge6oun.svelte-1ge6oun{float:right}}.grid1.svelte-1ge6oun .grid1-art.svelte-1ge6oun.svelte-1ge6oun{display:grid;place-items:center}@media screen and (min-width: 1200px){.grid1.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun,.grid2.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{grid-template-columns:2fr 1fr}.grid1.svelte-1ge6oun .grid1-hero.svelte-1ge6oun.svelte-1ge6oun{margin:calc(var(--spacing-unit) * 5) var(--spacing-unit) var(--spacing-unit);grid-column:1/2;grid-row:1/2;text-align:left}}@media screen and (min-width: 800px){.grid3.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{grid-template-columns:1fr 1fr}}@media screen and (min-width: 1100px){.grid3.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{grid-template-columns:1fr 1fr 1fr}}.blogPost.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{overflow:hidden;border-radius:var(--corner-unit);position:relative;box-shadow:var(--shadow-elevation-medium);padding:var(--spacing-unit)}.blogPost.svelte-1ge6oun p.svelte-1ge6oun.svelte-1ge6oun{padding:0;margin:0 0 var(--spacing-unit)}.blogPost.svelte-1ge6oun h3.svelte-1ge6oun.svelte-1ge6oun{padding:0;margin:var(--spacing-unit) 0 var(--spacing-unit)}.blogPost.svelte-1ge6oun .date.svelte-1ge6oun.svelte-1ge6oun{opacity:0.5;font-size:0.9rem}.divlink.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{height:100%;text-decoration:none;color:inherit}.divlink.svelte-1ge6oun:hover:hover h3.svelte-1ge6oun.svelte-1ge6oun{color:var(--primary-300)}.divlink.svelte-1ge6oun:hover:hover .blogPost.svelte-1ge6oun.svelte-1ge6oun{transform:translate(-0.05rem, -0.05rem);transition:0.1s ease;box-shadow:var(--shadow-elevation-mediumhigh)}.divlink.svelte-1ge6oun:hover:hover .allPostButton.svelte-1ge6oun.svelte-1ge6oun{background:var(--primary-300)}.allPostButton.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{background:var(--primary-200);justify-self:start;align-self:start}.allPostButton.svelte-1ge6oun h4.svelte-1ge6oun.svelte-1ge6oun{margin:0;padding:0;color:white;text-decoration:none}.grid2-tags.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{position:relative;margin-bottom:var(--spacing-unit)}.blog-parent.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{display:grid;grid-gap:1.5rem;justify-content:stretch;align-content:stretch;grid-template-columns:1fr;margin-bottom:calc(var(--spacing-unit) * 2)}@media screen and (min-width: 900px){.blog-parent.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{grid-template-columns:1fr 1fr}.blog-parent.svelte-1ge6oun a.svelte-1ge6oun.svelte-1ge6oun:first-child{grid-row:1 / 2;grid-column:1 / 3}}.wrapperForHero.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{width:100vw;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;margin-bottom:0rem;position:relative}.wrapperForHero.svelte-1ge6oun svg.svelte-1ge6oun.svelte-1ge6oun{transform:rotate(180deg) translateY(4rem);width:100vw;height:auto;position:relative;z-index:-1}.wrapperForHero.svelte-1ge6oun svg path.svelte-1ge6oun.svelte-1ge6oun:nth-child(8){transform:translateY(8rem)}@media screen and (max-width: 600px){.wrapperForHero.svelte-1ge6oun svg.svelte-1ge6oun.svelte-1ge6oun{transform:rotate(180deg) translateY(0rem)}}@media screen and (max-width: 900px){.wrapperForHero.svelte-1ge6oun svg.svelte-1ge6oun.svelte-1ge6oun{transform:rotate(180deg) translateY(2rem)}}.hero-background.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{background:var(--primary-400);position:relative;width:100vw;position:relative;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw}.hero-background.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun:before{content:'';background:var(--primary-400);position:absolute;z-index:-1;top:-50vh;left:0;height:50vh;width:100vw}@media screen and (min-width: 900px){}.container.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{max-width:1300px;margin:auto}.header.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{margin-left:var(--spacing-unit)}@media screen and (min-width: 900px){#blogposts.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{margin-left:-0.5rem}}#tags.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{margin-left:0}.button.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{color:inherit;display:inline-block;font-size:1.2em;padding:0.5rem 0.85rem 0.5rem;margin:var(--spacing-unit) var(--spacing-unit) 0rem;border-radius:calc(var(--corner-unit) * 2);background:var(--primary-400);box-shadow:var(--shadow-elevation-medium);text-decoration:none;font-weight:600}.button.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun:hover{background:var(--primary-300);box-shadow:var(--shadow-elevation-mediumhigh);color:white}@media screen and (max-width: 500px){.button.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{font-size:1em;margin:var(--spacing-unit) calc(var(--spacing-unit) * 0.5) 0rem}}.projectsbutton.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{background:var(--primary-300);color:white}.projectsbutton.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun:hover{background:var(--primary-350);transform:translate(-0.05rem, -0.05rem);transition:0.2s ease-in-out}.blogbutton.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun{background:var(--secondary-350);color:white}.blogbutton.svelte-1ge6oun.svelte-1ge6oun.svelte-1ge6oun:hover{background:var(--secondary-300);transform:translate(-0.05rem, -0.05rem);transition:0.2s ease-in-out}",
      map: null
    };
    allPosts = { "./blog/211209-globalstyles.md": () => Promise.resolve().then(() => (init_globalstyles_2a78373a(), globalstyles_2a78373a_exports)), "./blog/211211-code-highlighting.md": () => Promise.resolve().then(() => (init_code_highlighting_a93151b2(), code_highlighting_a93151b2_exports)) };
    body = [];
    for (let path in allPosts) {
      body.push(allPosts[path]().then(({ metadata: metadata3 }) => {
        return { path, metadata: metadata3 };
      }));
    }
    load = async () => {
      const posts = await Promise.all(body);
      return { props: { posts } };
    };
    pageTitle2 = "home";
    metaDescription2 = "The homepage: a collection of projects and blog posts.";
    Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { posts } = $$props;
      posts.slice().sort((post1, post2) => {
        return new Date(post2.metadata.date) - new Date(post1.metadata.date);
      });
      let projects = [
        {
          title: 'My charity website <span><img class="svg-icon" src="link.svg"></span>',
          src: "https://www.vriendenvoorkika.nl/",
          description: 'Climbing a mountain for charity. Made a website for it using Jekyll and Netlify. Consider <a target="_blank" rel="noopener" href="https://www.actievoorkika.nl/sanne-koen-thomas-en-romy">donating</a>!',
          img: "illustration-crosses.svg",
          outside: true
        },
        {
          title: "This blog",
          src: "/",
          description: "Maxed out Jekyll, and felt overwhelmed by React. In comes SvelteKit!",
          img: "illustration-3scribbles.svg",
          outside: false
        },
        {
          title: "An investing calculator",
          src: "/calculator",
          description: "Making this in SvelteKit was a breeze. My Python version stranded due the price of Flask hosting.",
          img: "illustration-shapes.svg",
          outside: false
        }
      ];
      if ($$props.posts === void 0 && $$bindings.posts && posts !== void 0)
        $$bindings.posts(posts);
      $$result.css.add(css5);
      return `${validate_component(Seo, "Seo").$$render($$result, { pageTitle: pageTitle2, metaDescription: metaDescription2 }, {}, {})}
<div class="${"wrapperForHero svelte-1ge6oun"}"><div class="${"hero-background svelte-1ge6oun"}"><div class="${"container svelte-1ge6oun"}"><div class="${"grid1 svelte-1ge6oun"}"><div class="${"grid1-art svelte-1ge6oun"}">${validate_component(Art, "Art").$$render($$result, {}, {}, {})}</div>
                <div class="${"grid1-hero svelte-1ge6oun"}"><div class="${"svelte-1ge6oun"}"><h2 class="${"svelte-1ge6oun"}">Hi, I&#39;m Koen!</h2>
                        <h1 class="${"svelte-1ge6oun"}">I do some programming in my <br class="${"svelte-1ge6oun"}">off-time.</h1>
                        <h3 class="${"svelte-1ge6oun"}">I write about web development as if you know nothing, because neither do I!</h3>
                        <nav class="${"svelte-1ge6oun"}"><a class="${"button blogbutton svelte-1ge6oun"}" href="${"#blogposts"}">Blog</a>
                            <a class="${"button projectsbutton svelte-1ge6oun"}" href="${"#projects"}">Projects</a></nav></div></div></div></div></div>
    <svg id="${"visual"}" viewBox="${"0 24 150 28"}" width="${"1440"}" height="${"250"}" xmlns="${"http://www.w3.org/2000/svg"}" xmlns:xlink="${"http://www.w3.org/1999/xlink"}" version="${"1.1"}" class="${"svelte-1ge6oun"}"><defs class="${"svelte-1ge6oun"}"><linearGradient id="${"gradient400"}" x1="${"0"}" x2="${"1"}" y1="${"0"}" y2="${"1"}" class="${"svelte-1ge6oun"}"><stop offset="${"100%"}" style="${"stop-color:var(--primary-400);stop-opacity: 1;"}" class="${"svelte-1ge6oun"}"></stop><stop offset="${"0%"}" style="${"stop-color:var(--primary-400);stop-opacity: 0;"}" class="${"svelte-1ge6oun"}"></stop></linearGradient><linearGradient id="${"gradient300"}" x1="${"0"}" x2="${"1"}" y1="${"0"}" y2="${"1"}" class="${"svelte-1ge6oun"}"><stop offset="${"100%"}" style="${"stop-color:var(--primary-375);stop-opacity: 1;"}" class="${"svelte-1ge6oun"}"></stop><stop offset="${"0%"}" style="${"stop-color:var(--primary-375);stop-opacity: 0;"}" class="${"svelte-1ge6oun"}"></stop></linearGradient><linearGradient id="${"gradient3"}" x1="${"0"}" x2="${"1"}" y1="${"0"}" y2="${"1"}" class="${"svelte-1ge6oun"}"><stop offset="${"0%"}" stop-color="${"var(--primary-400)"}" class="${"svelte-1ge6oun"}"></stop><stop offset="${"100%"}" stop-color="${"var(--primary-400-transp"}" class="${"svelte-1ge6oun"}"></stop></linearGradient></defs><path fill="${"url(#gradient400)"}" id="${"gentle-wave"}" d="${"M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"}" class="${"svelte-1ge6oun"}"></path><path fill="${"url(#gradient300)"}" id="${"gentle-wave"}" d="${"M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"}" class="${"svelte-1ge6oun"}"></path><path fill="${"var(--primary-375-transp)"}" id="${"gentle-wave"}" d="${"M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"}" class="${"svelte-1ge6oun"}"></path><path fill="${"url(#gradient400)"}" id="${"gentle-wave"}" d="${"M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"}" class="${"svelte-1ge6oun"}"></path><path fill="${"var(--primary-375-transp)"}" id="${"gentle-wave"}" d="${"M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"}" class="${"svelte-1ge6oun"}"></path><path fill="${"url(#gradient300)"}" id="${"gentle-wave"}" d="${"M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"}" class="${"svelte-1ge6oun"}"></path><path fill="${"url(#gradient400)"}" id="${"gentle-wave"}" d="${"M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"}" class="${"svelte-1ge6oun"}"></path></svg></div>


<div class="${"container svelte-1ge6oun"}"><div class="${"grid2 svelte-1ge6oun"}"><div class="${"grid2-blog svelte-1ge6oun"}"><h1 id="${"blogposts"}" class="${"header svelte-1ge6oun"}">Recently published</h1>
            <div class="${"blog-parent svelte-1ge6oun"}">${each(posts.slice(0, 4), ({ path, metadata: { title, snippet, date } }) => `<a class="${"divlink svelte-1ge6oun"}"${add_attribute("href", `${path.replace(".md", "")}`, 0)}><div class="${"blogPost svelte-1ge6oun"}"><h3 class="${"svelte-1ge6oun"}">${escape(title)}</h3>
                        <p class="${"svelte-1ge6oun"}">${escape(snippet)}</p>
                        <span class="${"date svelte-1ge6oun"}">${escape(new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }))}</span></div>
                    </a>`)}
                <a href="${"/blog"}" class="${"divlink svelte-1ge6oun"}"><div class="${"blogPost allPostButton svelte-1ge6oun"}"><h4 class="${"svelte-1ge6oun"}">All posts \u2794</h4></div></a></div></div> 

    <div class="${"grid2-tags svelte-1ge6oun"}"><h2 id="${"tags"}" class="${"header svelte-1ge6oun"}">Explore topics</h2>
        ${validate_component(TagCloud, "TagCloud").$$render($$result, {}, {}, {})}</div></div>
    
<h1 id="${"projects"}" class="${"header svelte-1ge6oun"}">Projects</h1>
<div class="${"grid3 svelte-1ge6oun"}">${each(projects, ({ title, src: src2, description, img, outside }) => `${validate_component(Project, "Project").$$render($$result, { title, src: src2, description, img, outside }, {}, {})}`)}</div>


</div>`;
    });
  }
});

// .svelte-kit/output/server/chunks/calculator-14731781.js
var calculator_14731781_exports = {};
__export(calculator_14731781_exports, {
  default: () => Calculator
});
var css6, pageTitle3, metaDescription3, Calculator;
var init_calculator_14731781 = __esm({
  ".svelte-kit/output/server/chunks/calculator-14731781.js"() {
    init_shims();
    init_app_47afbf9a();
    init_Seo_8a3312ea();
    css6 = {
      code: ':root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-350:hsl(176, 100%, 50%);--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-350:hsl(19, 100%, 60%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px}.svelte-x4wh8e.svelte-x4wh8e,.svelte-x4wh8e.svelte-x4wh8e::before,.svelte-x4wh8e.svelte-x4wh8e::after{box-sizing:border-box}.svelte-x4wh8e.svelte-x4wh8e{margin:0}svg.svelte-x4wh8e.svelte-x4wh8e{display:block;max-width:100%}input.svelte-x4wh8e.svelte-x4wh8e{font:inherit}p.svelte-x4wh8e.svelte-x4wh8e,h1.svelte-x4wh8e.svelte-x4wh8e,h3.svelte-x4wh8e.svelte-x4wh8e{overflow-wrap:break-word}.container.svelte-x4wh8e.svelte-x4wh8e{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}.container.svelte-x4wh8e.svelte-x4wh8e{max-width:70ch}.wrapper.svelte-x4wh8e.svelte-x4wh8e{display:grid;align-items:center;text-align:center;justify-items:center;grid-gap:var(--spacing-unit);margin:var(--spacing-unit)}.explanation-pie.svelte-x4wh8e.svelte-x4wh8e{padding:var(--spacing-unit) 0 0;justify-self:center;width:10rem}@media screen and (min-width: 600px){.explanation-pie.svelte-x4wh8e.svelte-x4wh8e{padding:0}}h3.svelte-x4wh8e.svelte-x4wh8e{font-weight:normal;margin:0}svg.svelte-x4wh8e.svelte-x4wh8e{width:10rem;height:10rem}svg.svelte-x4wh8e text.svelte-x4wh8e{font-weight:bold;fill:white}a.svelte-x4wh8e.svelte-x4wh8e{color:var(--primary-300);text-decoration:none}a.svelte-x4wh8e.svelte-x4wh8e:hover{text-decoration:underline}ol.svelte-x4wh8e.svelte-x4wh8e{list-style:none;margin:0;padding:0}ol.svelte-x4wh8e li.svelte-x4wh8e{display:grid;grid-template-columns:1fr;grid-gap:0.25rem;padding-bottom:1rem}span.svelte-x4wh8e.svelte-x4wh8e{color:var(--primary-300);font-weight:bold}form.svelte-x4wh8e.svelte-x4wh8e{box-shadow:var(--shadow-elevation-mediumhigh);padding:var(--spacing-unit);max-width:25rem}input[type="number"].svelte-x4wh8e.svelte-x4wh8e{font-size:inherit;box-shadow:none;appearance:none;-moz-appearance:none;-webkit-appearance:none;padding:0.25rem;margin:0 0.25rem 0;width:auto}label.svelte-x4wh8e.svelte-x4wh8e{padding-left:0.25rem}.svelte-x4wh8e.svelte-x4wh8e::-moz-focus-inner{border:0;padding:0}input[type="range"].svelte-x4wh8e.svelte-x4wh8e{-webkit-appearance:none;width:auto;margin:0.25rem 0 0.25rem;padding:0 0.25rem 0}input[type="range"].svelte-x4wh8e.svelte-x4wh8e::-webkit-slider-runnable-track{background:var(--primary-100);height:5px}input[type="range"].svelte-x4wh8e.svelte-x4wh8e::-moz-range-track{background:var(--primary-100);height:5px}input[type="range"].svelte-x4wh8e.svelte-x4wh8e::-webkit-slider-thumb{-webkit-appearance:none;height:20px;width:20px;background:var(--primary-300);margin-top:-7.5px;border-radius:50%}@media screen and (min-width: 600px){input[type="range"].svelte-x4wh8e.svelte-x4wh8e::-webkit-slider-thumb{height:15px;width:15px;margin-top:-5px}}input[type="range"].svelte-x4wh8e.svelte-x4wh8e::-moz-range-thumb{height:20px;width:20px;background:var(--primary-300);margin-top:-5px;border-radius:50%}@media screen and (min-width: 600px){input[type="range"].svelte-x4wh8e.svelte-x4wh8e::-moz-range-thumb{height:15px;width:15px;margin-top:-5px}}.container.svelte-x4wh8e h1.svelte-x4wh8e{margin:calc(var(--spacing-unit) * 3) 0 calc(var(--spacing-unit) * 1);text-align:center}',
      map: null
    };
    pageTitle3 = "portfolio rebalancing calculator";
    metaDescription3 = "An interactive calculator meant to rebalance an investing portfolio consisting of volatile assets such as stocks, and stable assets such as bonds.";
    Calculator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let totalPortfValue;
      let actPercVolatile;
      let diffActAndDesVolatile;
      let volatileAssets = null;
      let stableAssets = null;
      let desiredPercVolatile = 0;
      $$result.css.add(css6);
      totalPortfValue = volatileAssets + stableAssets;
      actPercVolatile = volatileAssets / totalPortfValue * 100;
      diffActAndDesVolatile = volatileAssets - desiredPercVolatile / 100 * totalPortfValue;
      return `${validate_component(Seo, "Seo").$$render($$result, { pageTitle: pageTitle3, metaDescription: metaDescription3 }, {}, {})} 


<main class="${"container svelte-x4wh8e"}"><h1 class="${"svelte-x4wh8e"}">Portfolio rebalancing calculator</h1>
    <div class="${"grid svelte-x4wh8e"}"><div class="${"wrapper svelte-x4wh8e"}"><form name="${"calculator"}" class="${"svelte-x4wh8e"}"><input type="${"hidden"}" name="${"form-name"}" value="${"contact"}" class="${"svelte-x4wh8e"}">
                <ol class="${"svelte-x4wh8e"}"><li class="${"svelte-x4wh8e"}"><label for="${"field-volatile"}" class="${"svelte-x4wh8e"}">Current money in volatile assets?</label>
                        <input type="${"number"}" min="${"0"}" name="${"volatile"}" id="${"field-volatile"}" required="${""}" aria-required="${"true"}" placeholder="${"Enter value of volatile assets"}" autocomplete="${"volatile"}" autocorrect="${"off"}" autocapitalize="${"off"}" oninput="${"this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\\..*)\\./g, '$1');"}" class="${"svelte-x4wh8e"}"${add_attribute("value", volatileAssets, 0)}></li>
                    <li class="${"svelte-x4wh8e"}"><label for="${"field-stable"}" class="${"svelte-x4wh8e"}">Current money in stable assets?</label>
                        <input type="${"number"}" min="${"0"}" name="${"stable"}" id="${"field-stable"}" required="${""}" aria-required="${"true"}" placeholder="${"Enter value of stable assets"}" autocomplete="${"stable"}" oninput="${"this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\\..*)\\./g, '$1');"}" class="${"svelte-x4wh8e"}"${add_attribute("value", stableAssets, 0)}></li>
                    <li class="${"svelte-x4wh8e"}"><label for="${"field-percentage"}" class="${"svelte-x4wh8e"}">Preferred percentage of volatile assets?</label>
                        <input type="${"range"}" min="${"0"}" max="${"100"}" name="${"percentage"}" id="${"field-percentage"}" required="${""}" aria-required="${"true"}" autocapitalize="${"off"}" class="${" svelte-x4wh8e"}"${add_attribute("value", desiredPercVolatile, 0)}>
                        <label class="${"svelte-x4wh8e"}">${escape(desiredPercVolatile)}%</label></li></ol></form></div>

        <div class="${"wrapper svelte-x4wh8e"}"><div class="${"explanation-text svelte-x4wh8e"}"><h3 class="${"svelte-x4wh8e"}">You currently have <span class="${"svelte-x4wh8e"}">${`${`${`0%`}`}
                `}</span> of your total portfolio value of <span class="${"svelte-x4wh8e"}">\u20AC${escape(totalPortfValue)}</span> in volatile assets.<br class="${"svelte-x4wh8e"}"> To rebalance, 
                ${diffActAndDesVolatile > 0 ? `sell` : `buy`}
                <span class="${"svelte-x4wh8e"}">\u20AC${escape(Math.abs(Math.round(diffActAndDesVolatile)))}</span> of volatile assets. </h3></div>

            <div class="${"explanation-pie svelte-x4wh8e"}"><svg height="${"20"}" width="${"20"}" viewBox="${"0 0 20 20"}" class="${"svelte-x4wh8e"}"><circle class="${"circle svelte-x4wh8e"}" r="${"10"}" cx="${"10"}" cy="${"10"}" fill="${"var(--primary-300)"}"></circle><circle r="${"5"}" cx="${"10"}" cy="${"10"}" fill="${"transparent"}" stroke="${"var(--secondary-300)"}" stroke-width="${"10"}" stroke-dasharray="${"calc(" + escape(Math.round(actPercVolatile)) + " * 30.65 / 100) 31.4159"}" transform="${"rotate(-90) translate(-20)"}" class="${"svelte-x4wh8e"}"></circle><text x="${"50%"}" y="${"50%"}" dominant-baseline="${"middle"}" text-anchor="${"middle"}" font-size="${"3"}" class="${"svelte-x4wh8e"}">${!actPercVolatile ? `` : `${escape(Math.round(actPercVolatile))}`}</text></svg></div></div>

        <div style="${"margin-top: var(--spacing-unit);"}" class="${"disclaimer svelte-x4wh8e"}"><hr class="${"svelte-x4wh8e"}">
            <p class="${"svelte-x4wh8e"}">This calculator is intended for people who follow a long-term investment strategy such as the <a target="${"_blank"}" rel="${"noopener"}" href="${"https://www.bogleheads.org/wiki/Bogleheads\xAE_investment_philosophy"}" class="${"svelte-x4wh8e"}">Boglehead method</a>, where there&#39;s a volatile part and a stable part: stocks and bonds.</p>
            <p class="${"svelte-x4wh8e"}">In recent years, low interest rates have made bonds unattractive. People now opt for deposit savings or cash buffers. Stocks are still in high demand, but crypto currencies are gaining ground.</p> 
            <p class="${"svelte-x4wh8e"}">None of this is relevant for this calculator, as long as there is a volatile and a stable asset that you&#39;re trying to balance!</p></div></div>
    
</main>`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-10342206.js
var index_10342206_exports = {};
__export(index_10342206_exports, {
  default: () => Schildklier
});
function pageScroll() {
  window.scrollBy(0, 50);
  setTimeout("pageScroll()", 100);
}
var css7, pageTitle4, metaDescription4, Schildklier;
var init_index_10342206 = __esm({
  ".svelte-kit/output/server/chunks/index-10342206.js"() {
    init_shims();
    init_app_47afbf9a();
    init_Seo_8a3312ea();
    css7 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-350:hsl(176, 100%, 50%);--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-350:hsl(19, 100%, 60%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px}.svelte-naw2b3,.svelte-naw2b3::before,.svelte-naw2b3::after{box-sizing:border-box}.svelte-naw2b3{margin:0}button.svelte-naw2b3{font:inherit}p.svelte-naw2b3,h1.svelte-naw2b3{overflow-wrap:break-word}button.svelte-naw2b3{font-family:inherit;font-size:inherit;padding:0.25rem;background:transparent;box-shadow:none;outline:none;border:2px solid #111344}button.svelte-naw2b3:hover{outline:2px solid #06D6A0;cursor:pointer}.dark button.svelte-naw2b3{color:white;border:2px solid white}a.svelte-naw2b3{color:#06D6A0;text-decoration:none}a.svelte-naw2b3:hover{text-decoration:underline}",
      map: null
    };
    pageTitle4 = "interactive flowchart for diagnosing thyroid disease";
    metaDescription4 = "An interactive flowchart for diagnosing thyroid disease, adapted from a guideline by the Dutch Association of General Practitioners.";
    Schildklier = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let start;
      let tsh;
      let tsh1t4;
      let bevallen;
      let iatrogeen;
      let tsh0t4;
      let ziek;
      let bse;
      let tshr;
      let amiolith;
      let bevallen2;
      let struma;
      let nodus;
      let solnodus;
      pageScroll();
      $$result.css.add(css7);
      start = false;
      tsh = null;
      tsh1t4 = null;
      bevallen = null;
      iatrogeen = null;
      tsh0t4 = null;
      ziek = null;
      bse = null;
      tshr = null;
      amiolith = null;
      bevallen2 = null;
      struma = null;
      nodus = null;
      solnodus = null;
      return `${validate_component(Seo, "Seo").$$render($$result, { pageTitle: pageTitle4, metaDescription: metaDescription4 }, {}, {})}
<h1 class="${"svelte-naw2b3"}">Diagnostiek bij vermoeden van een schildklierfunctiestoornis</h1>
<p class="${"svelte-naw2b3"}"><i class="${"svelte-naw2b3"}">This interactive flowchart is adapted from the <a target="${"_blank"}" rel="${"noopener"}" href="${"https://richtlijnen.nhg.org/standaarden/schildklieraandoeningen#samenvatting-richtlijnen-beleid-bij-hyperthyreodie"}" class="${"svelte-naw2b3"}">NHG-Standaard Schildklieraandoeningen</a>, and specifically from <a href="${"https://richtlijnen.nhg.org/files/2021-06/M31_juli_2013_2.png"}" class="${"svelte-naw2b3"}">this flowchart</a>. I might have made mistakes so plz don&#39;t use it.</i></p>
<p style="${"padding-bottom: 0.5rem;"}" class="${"svelte-naw2b3"}">Dit interactieve stroomdiagram is een aanpassing van de <a target="${"_blank"}" rel="${"noopener"}" href="${"https://richtlijnen.nhg.org/standaarden/schildklieraandoeningen#samenvatting-richtlijnen-beleid-bij-hyperthyreodie"}" class="${"svelte-naw2b3"}">NHG-Standaard Schildklieraandoeningen</a>, en specifiek van <a href="${"https://richtlijnen.nhg.org/files/2021-06/M31_juli_2013_2.png"}" class="${"svelte-naw2b3"}">dit stroomdiagram</a>. Er kunnen zeker nog fouten in zitten!</p>

<button class="${"svelte-naw2b3"}">Start beslisboom</button>
${start ? `<p class="${"svelte-naw2b3"}">Is het TSH verhoogd, verlaagd of normaal?</p>
    <button class="${"svelte-naw2b3"}">Verhoogd</button>
    <button class="${"svelte-naw2b3"}">Verlaagd</button>
    <button class="${"svelte-naw2b3"}">Normaal</button>
    ` : ``}
${tsh ? `${tsh === 3 ? `<p class="${"svelte-naw2b3"}">Euthyreo\xEFdie</p>` : `${tsh === 1 ? `<p class="${"svelte-naw2b3"}">Is het Vrije T4 verhoogd, verlaagd of normaal?</p>
        <button class="${"svelte-naw2b3"}">Verhoogd</button>
        <button class="${"svelte-naw2b3"}">Verlaagd</button>
        <button class="${"svelte-naw2b3"}">Normaal</button>
        ${tsh1t4 === 3 ? `<p class="${"svelte-naw2b3"}">Subklinische hypothyreo\xEFdie</p>` : `${tsh1t4 === 1 ? `<ul class="${"svelte-naw2b3"}"><li class="${"svelte-naw2b3"}">TSH-producerend adenoom van de hypofyse</li>
                <li class="${"svelte-naw2b3"}">Perifere resistentie schildklierhormoon (<i class="${"svelte-naw2b3"}">zeldzaam</i>)</li></ul>` : `${tsh1t4 === 2 ? `<p class="${"svelte-naw2b3"}">Minder dan 1 jaar geleden bevallen?</p>
            <button class="${"svelte-naw2b3"}">Nee</button>
            <button class="${"svelte-naw2b3"}">Ja</button>

            ${bevallen === 1 ? `<p class="${"svelte-naw2b3"}">Post-partum thyreo\xEFditis</p>` : `${bevallen === 2 ? `<p class="${"svelte-naw2b3"}">Schildklieroperatie, bestraling van de hals, of medicatiegebruik?</p>
                <button class="${"svelte-naw2b3"}">Nee</button>
                <button class="${"svelte-naw2b3"}">Ja</button>
                ${iatrogeen === 1 ? `<p class="${"svelte-naw2b3"}">Iatrogene hypothyreo\xEFdie</p>` : `${iatrogeen === 2 ? `<ul class="${"svelte-naw2b3"}"><li class="${"svelte-naw2b3"}">Thyreo\xEFditis van Hashimoto</li>
                        <li class="${"svelte-naw2b3"}">Stille lymfocytaire thyreo\xEFditis</li></ul>` : ``}`}` : ``}`}` : ``}`}`}` : `${tsh === 2 ? `<p class="${"svelte-naw2b3"}">Is het Vrije T4 verhoogd, verlaagd of normaal?</p>
        <button class="${"svelte-naw2b3"}">Verhoogd</button>
        <button class="${"svelte-naw2b3"}">Verlaagd</button>
        <button class="${"svelte-naw2b3"}">Normaal</button>
        ${tsh0t4 === 3 ? `<p class="${"svelte-naw2b3"}">Subklinische hyperthyreo\xEFdie</p>` : `${tsh0t4 === 1 ? `<p class="${"svelte-naw2b3"}">Hyperthyreo\xEFdie</p>
            <p class="${"svelte-naw2b3"}">Pijnlijke schildklier, koorts, koude rillingen en malaise?</p>
            <button class="${"svelte-naw2b3"}">Nee</button>
            <button class="${"svelte-naw2b3"}">Ja</button>
            ${ziek === 2 ? `x (TSH-R)` : `${ziek === 1 ? `<p class="${"svelte-naw2b3"}">Verhoogde BSE, leucocytose?</p>
                <button class="${"svelte-naw2b3"}">Nee</button>
                <button class="${"svelte-naw2b3"}">Ja</button>
                ${bse === 1 ? `<p class="${"svelte-naw2b3"}">Sucacute thyreo\xEFditis</p>` : `${bse === 2 ? `<p class="${"svelte-naw2b3"}">Anti-TSH-R antistoffen?</p>
                    <button class="${"svelte-naw2b3"}">Nee</button>
                    <button class="${"svelte-naw2b3"}">Ja</button>
                    ${tshr === 1 ? `<p class="${"svelte-naw2b3"}">Ziekte van Graves</p>` : `${tshr === 2 ? `<p class="${"svelte-naw2b3"}">Amiodaron of lithiumgebruik?</p>
                        <button class="${"svelte-naw2b3"}">Nee</button>
                        <button class="${"svelte-naw2b3"}">Ja</button>
                        ${amiolith === 1 ? `<p class="${"svelte-naw2b3"}">Iatrogene hyperthyreo\xEFdie</p>` : `${amiolith === 2 ? `<p class="${"svelte-naw2b3"}">Minder dan 1 jaar geleden bevallen?</p>
                            <button class="${"svelte-naw2b3"}">Nee</button>
                            <button class="${"svelte-naw2b3"}">Ja</button>
                            ${bevallen2 === 1 ? `<p class="${"svelte-naw2b3"}">Post-partum thyreo\xEFditis</p>` : `${bevallen2 === 2 ? `<p class="${"svelte-naw2b3"}">Is er sprake van struma?</p>
                                <button class="${"svelte-naw2b3"}">Nee</button>
                                <button class="${"svelte-naw2b3"}">Ja</button>
                                ${struma === 1 ? `<p class="${"svelte-naw2b3"}">Is er een dominante nodus?</p>
                                    <button class="${"svelte-naw2b3"}">Nee</button>
                                    <button class="${"svelte-naw2b3"}">Ja</button>
                                    ${nodus === 1 ? `<p class="${"svelte-naw2b3"}">Multinodulair struma</p>` : `${nodus === 2 ? `<p class="${"svelte-naw2b3"}">Multinodulair struma met dominante nodus</p>` : ``}`}` : `${struma === 2 ? `<p class="${"svelte-naw2b3"}">Is er een solitaire nodus?</p>
                                    <button class="${"svelte-naw2b3"}">Nee</button>
                                    <button class="${"svelte-naw2b3"}">Ja</button>
                                    ${solnodus === 2 ? `<p class="${"svelte-naw2b3"}">Stille lymfocytaire thyreo\xEFditis</p>` : `${solnodus === 1 ? `<p class="${"svelte-naw2b3"}">Toxisch adenoom</p>` : ``}`}` : ``}`}` : ``}`}` : ``}`}` : ``}`}` : ``}`}` : ``}`}` : `${tsh0t4 === 2 ? `<p class="${"svelte-naw2b3"}">Secundaire of tertiaire hypothyreo\xEFdie (<i class="${"svelte-naw2b3"}">zeldzaam</i>)</p>` : ``}`}`}` : ``}`}`}` : ``}

`;
    });
  }
});

// .svelte-kit/output/server/chunks/blog-accfba20.js
var blog_accfba20_exports = {};
__export(blog_accfba20_exports, {
  default: () => Blog2,
  load: () => load2
});
var css$12, Posts, css8, allPosts2, body2, load2, pageTitle5, metaDescription5, Blog2;
var init_blog_accfba20 = __esm({
  ".svelte-kit/output/server/chunks/blog-accfba20.js"() {
    init_shims();
    init_app_47afbf9a();
    init_Seo_8a3312ea();
    init_Date_e4685984();
    css$12 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-350:hsl(176, 100%, 50%);--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-350:hsl(19, 100%, 60%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px}.svelte-ddz962.svelte-ddz962,.svelte-ddz962.svelte-ddz962::before,.svelte-ddz962.svelte-ddz962::after{box-sizing:border-box}.svelte-ddz962.svelte-ddz962{margin:0}p.svelte-ddz962.svelte-ddz962,h3.svelte-ddz962.svelte-ddz962{overflow-wrap:break-word}.blog-parent.svelte-ddz962.svelte-ddz962{display:grid;grid-auto-flow:dense;grid-gap:var(--spacing-unit);justify-content:stretch;align-content:stretch;grid-template-columns:1fr;margin-bottom:calc(var(--spacing-unit) * 2)}@media screen and (min-width: 900px){.blog-parent.svelte-ddz962.svelte-ddz962{grid-template-columns:1fr 1fr;grid-gap:calc(var(--spacing-unit) * 1.5)}}.divlink.svelte-ddz962.svelte-ddz962{height:100%;text-decoration:none;color:inherit}.divlink.svelte-ddz962:hover:hover h3.svelte-ddz962{color:var(--primary-300)}.divlink.svelte-ddz962:hover:hover .blogPost.svelte-ddz962{transform:translate(-0.05rem, -0.05rem);transition:0.1s ease;box-shadow:var(--shadow-elevation-mediumhigh)}.blogPost.svelte-ddz962.svelte-ddz962{overflow:hidden;background:rgba(255, 255, 255, 0.5);border-radius:var(--corner-unit);position:relative;box-shadow:var(--shadow-elevation-medium);padding:var(--spacing-unit)}.blogPost.svelte-ddz962 p.svelte-ddz962{padding:0;margin:0 0 var(--spacing-unit)}.blogPost.svelte-ddz962 h3.svelte-ddz962{padding:0;margin:var(--spacing-unit) 0 var(--spacing-unit)}.blogPost.svelte-ddz962 .date.svelte-ddz962{opacity:0.5;font-size:0.9em}",
      map: null
    };
    Posts = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { dateSortedPosts } = $$props;
      if ($$props.dateSortedPosts === void 0 && $$bindings.dateSortedPosts && dateSortedPosts !== void 0)
        $$bindings.dateSortedPosts(dateSortedPosts);
      $$result.css.add(css$12);
      return `<div class="${"blog-parent svelte-ddz962"}">${each(dateSortedPosts, ({ path, metadata: { title, snippet, date } }) => `<a class="${"divlink svelte-ddz962"}"${add_attribute("href", `${path.replace(".md", "")}`, 0)}><div class="${"blogPost svelte-ddz962"}"><h3 class="${"svelte-ddz962"}">${escape(title)}</h3>
            <p class="${"svelte-ddz962"}">${escape(snippet)}</p>
            <span class="${"date svelte-ddz962"}">${validate_component(Date_1, "Date").$$render($$result, { date }, {}, {})}</span></div>
        </a>`)}
</div>`;
    });
    css8 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-350:hsl(176, 100%, 50%);--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-350:hsl(19, 100%, 60%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px}.svelte-1f2l7b7.svelte-1f2l7b7,.svelte-1f2l7b7.svelte-1f2l7b7::before,.svelte-1f2l7b7.svelte-1f2l7b7::after{box-sizing:border-box}.svelte-1f2l7b7.svelte-1f2l7b7{margin:0}h1.svelte-1f2l7b7.svelte-1f2l7b7{overflow-wrap:break-word}.container.svelte-1f2l7b7.svelte-1f2l7b7{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}.container.svelte-1f2l7b7.svelte-1f2l7b7{max-width:1300px;margin:auto;position:relative;padding:0 var(--spacing-unit) 0}.container.svelte-1f2l7b7 div.svelte-1f2l7b7{display:grid;align-items:center}.container.svelte-1f2l7b7 div h1.svelte-1f2l7b7{text-align:center}.wrapper.svelte-1f2l7b7.svelte-1f2l7b7{margin-top:calc(var(--spacing-unit) * 3)}.background.svelte-1f2l7b7.svelte-1f2l7b7{width:100vw;height:calc(100% + 25rem);top:-15rem;z-index:-1;position:fixed;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;background:var(--primary-500);background-size:cover;background-position:center}",
      map: null
    };
    allPosts2 = { "./blog/211209-globalstyles.md": () => Promise.resolve().then(() => (init_globalstyles_2a78373a(), globalstyles_2a78373a_exports)), "./blog/211211-code-highlighting.md": () => Promise.resolve().then(() => (init_code_highlighting_a93151b2(), code_highlighting_a93151b2_exports)) };
    body2 = [];
    for (let path in allPosts2) {
      body2.push(allPosts2[path]().then(({ metadata: metadata3 }) => {
        return { path, metadata: metadata3 };
      }));
    }
    load2 = async ({ page }) => {
      const posts = await Promise.all(body2);
      const tag = page.params.tag;
      return { props: { posts, tag } };
    };
    pageTitle5 = "blog";
    metaDescription5 = "Collection of all blog posts on the website.";
    Blog2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { posts } = $$props;
      const dateSortedPosts = posts.slice().sort((post1, post2) => {
        return new Date(post2.metadata.date) - new Date(post1.metadata.date);
      });
      if ($$props.posts === void 0 && $$bindings.posts && posts !== void 0)
        $$bindings.posts(posts);
      if ($$props.dateSortedPosts === void 0 && $$bindings.dateSortedPosts && dateSortedPosts !== void 0)
        $$bindings.dateSortedPosts(dateSortedPosts);
      $$result.css.add(css8);
      return `${validate_component(Seo, "Seo").$$render($$result, { pageTitle: pageTitle5, metaDescription: metaDescription5 }, {}, {})}

    <main class="${"container svelte-1f2l7b7"}"><div class="${"svelte-1f2l7b7"}"><h1 class="${"svelte-1f2l7b7"}">All posts</h1></div>
        <div class="${"wrapper svelte-1f2l7b7"}">${validate_component(Posts, "Posts").$$render($$result, { dateSortedPosts }, {}, {})} 
            <div class="${"background svelte-1f2l7b7"}"></div></div>
    </main>`;
    });
  }
});

// .svelte-kit/output/server/chunks/_tag_-5cfc3f6a.js
var tag_5cfc3f6a_exports = {};
__export(tag_5cfc3f6a_exports, {
  default: () => U5Btagu5D,
  load: () => load3
});
var css9, allPosts3, body3, load3, metaDescription6, U5Btagu5D;
var init_tag_5cfc3f6a = __esm({
  ".svelte-kit/output/server/chunks/_tag_-5cfc3f6a.js"() {
    init_shims();
    init_app_47afbf9a();
    init_Seo_8a3312ea();
    css9 = {
      code: ":root{--gray-100:hsl(176, 5%, 10%);--gray-200:hsl(176, 5%, 25%);--gray-300:hsl(176, 5%, 46%);--gray-350:#949e9d;--gray-400:#bfd9d7;--gray-500:hsl(180, 10%, 98%);--white:hsl(0, 0%, 100%);--primary-100:#003330;--primary-200:#008077;--primary-300:#00bdb0;--primary-325:#53c6be;--primary-350:hsl(176, 100%, 50%);--primary-375:hsla(176, 65%, 80%, 1);--primary-400:#d9f7f5;--primary-500:#ebfffe;--secondary-100:hsl(19, 100%, 15%);--secondary-200:hsl(19, 100%, 30%);--secondary-300:#ff5100;--secondary-350:hsl(19, 100%, 60%);--secondary-400:#FFA076;--secondary-500:#FFF1EB;--primary-100-transp:#003330;--primary-200-transp:#008077;--primary-300-transp:hsla(176, 100%, 37%, 0.5);--primary-325-transp:#53c6be;--primary-350-transp:hsla(176, 100%, 50%, 0.7);--primary-375-transp:hsla(176, 65%, 80%, 0.7);--primary-400-transp:hsla(176, 65%, 91%, 0.7);--primary-500-transp:hsla(177, 100%, 96%, 0.7);--shadow-color:0deg 0% 70%;--shadow-elevation-low:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        0.6px 0.6px 1.3px hsl(var(--shadow-color) / 0.18),\n        1.2px 1.1px 2.4px hsl(var(--shadow-color) / 0.35);--shadow-elevation-medium:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.47),\n    0.9px 1px 1.4px -1.1px hsl(var(--shadow-color) / 0.42),\n    2.6px 2.7px 3.8px -2.2px hsl(var(--shadow-color) / 0.36),\n    6.7px 7.1px 9.9px -3.2px hsl(var(--shadow-color) / 0.31);--shadow-elevation-mediumhigh:0.3px 0.3px 0.6px hsl(var(--shadow-color) / 0),\n        1.5px 1.4px 3.1px hsl(var(--shadow-color) / 0.14),\n        2.9px 2.8px 6px hsl(var(--shadow-color) / 0.28),\n        5.9px 5.7px 12.3px hsl(var(--shadow-color) / 0.42);--shadow-elevation-high:0.3px 0.4px 0.5px hsl(var(--shadow-color) / 0.39),\n        1.2px 1.2px 1.7px -0.5px hsl(var(--shadow-color) / 0.36),\n        2.3px 2.4px 3.2px -1px hsl(var(--shadow-color) / 0.33),\n        4.2px 4.2px 5.8px -1.5px hsl(var(--shadow-color) / 0.3),\n        7.2px 7.4px 10.1px -2px hsl(var(--shadow-color) / 0.28),\n        12px 12.3px 16.8px -2.5px hsl(var(--shadow-color) / 0.25),\n        19.1px 19.5px 26.6px -3px hsl(var(--shadow-color) / 0.22),\n        28.8px 29.4px 40.1px -3.5px hsl(var(--shadow-color) / 0.19);--spacing-unit:1rem;--corner-unit:10px}.svelte-1jz35mv.svelte-1jz35mv,.svelte-1jz35mv.svelte-1jz35mv::before,.svelte-1jz35mv.svelte-1jz35mv::after{box-sizing:border-box}.svelte-1jz35mv.svelte-1jz35mv{margin:0}p.svelte-1jz35mv.svelte-1jz35mv,h1.svelte-1jz35mv.svelte-1jz35mv,h3.svelte-1jz35mv.svelte-1jz35mv{overflow-wrap:break-word}.container.svelte-1jz35mv.svelte-1jz35mv{max-width:1300px;margin:auto;padding:0 var(--spacing-unit) var(--spacing-unit)}.blog-parent.svelte-1jz35mv.svelte-1jz35mv{display:grid;grid-auto-flow:dense;grid-gap:1.5rem;justify-content:stretch;align-content:stretch;grid-template-columns:1fr;margin-bottom:calc(var(--spacing-unit) * 2)}@media screen and (min-width: 900px){.blog-parent.svelte-1jz35mv.svelte-1jz35mv{grid-template-columns:1fr 1fr}}.divlink.svelte-1jz35mv.svelte-1jz35mv{height:100%;text-decoration:none;color:inherit}.divlink.svelte-1jz35mv .date.svelte-1jz35mv{opacity:0.5;font-size:1rem}.divlink.svelte-1jz35mv:hover:hover h3.svelte-1jz35mv{color:var(--primary-300)}.divlink.svelte-1jz35mv:hover:hover .blogPost.svelte-1jz35mv{transform:translate(-0.05rem, -0.05rem);transition:0.1s ease;box-shadow:var(--shadow-elevation-mediumhigh)}.blogPost.svelte-1jz35mv.svelte-1jz35mv{overflow:hidden;background:rgba(255, 255, 255, 0.5);border-radius:var(--corner-unit);position:relative;box-shadow:var(--shadow-elevation-medium);padding:var(--spacing-unit)}.blogPost.svelte-1jz35mv p.svelte-1jz35mv{padding:0;margin:0}.blogPost.svelte-1jz35mv h3.svelte-1jz35mv{padding:0;margin:var(--spacing-unit) 0 var(--spacing-unit)}.container.svelte-1jz35mv.svelte-1jz35mv{max-width:1300px;margin:auto;position:relative;padding:0 var(--spacing-unit) 0}.container.svelte-1jz35mv .title.svelte-1jz35mv{display:grid;align-items:center}.container.svelte-1jz35mv .title h1.svelte-1jz35mv{text-align:center}.wrapper.svelte-1jz35mv.svelte-1jz35mv{margin-top:calc(var(--spacing-unit) * 3)}.background.svelte-1jz35mv.svelte-1jz35mv{width:100vw;height:calc(100% + 25rem);top:-15rem;z-index:-1;position:fixed;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;background:var(--primary-500);background-size:cover;background-position:center}",
      map: null
    };
    allPosts3 = { "../blog/211209-globalstyles.md": () => Promise.resolve().then(() => (init_globalstyles_2a78373a(), globalstyles_2a78373a_exports)), "../blog/211211-code-highlighting.md": () => Promise.resolve().then(() => (init_code_highlighting_a93151b2(), code_highlighting_a93151b2_exports)) };
    body3 = [];
    for (let path in allPosts3) {
      body3.push(allPosts3[path]().then(({ metadata: metadata3 }) => {
        return { path, metadata: metadata3 };
      }));
    }
    load3 = async ({ page }) => {
      const posts = await Promise.all(body3);
      const tag = page.params.tag;
      const filteredPosts = posts.filter((post) => {
        return post.metadata.tags.includes(tag);
      });
      return { props: { filteredPosts, tag } };
    };
    metaDescription6 = "All blog posts about {tag}";
    U5Btagu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { filteredPosts } = $$props;
      let { tag } = $$props;
      let pageTitle6 = tag;
      if ($$props.filteredPosts === void 0 && $$bindings.filteredPosts && filteredPosts !== void 0)
        $$bindings.filteredPosts(filteredPosts);
      if ($$props.tag === void 0 && $$bindings.tag && tag !== void 0)
        $$bindings.tag(tag);
      $$result.css.add(css9);
      return `${validate_component(Seo, "Seo").$$render($$result, { pageTitle: pageTitle6, metaDescription: metaDescription6 }, {}, {})}

<main class="${"container svelte-1jz35mv"}"><div class="${"title svelte-1jz35mv"}"><h1 class="${"svelte-1jz35mv"}">${escape(tag.replace(/^\w/, (c) => c.toUpperCase()))}</h1></div>
    <div class="${"wrapper svelte-1jz35mv"}"><div class="${"blog-parent svelte-1jz35mv"}">${each(filteredPosts, ({ path, metadata: { title, date, snippet } }) => `<a class="${"divlink svelte-1jz35mv"}"${add_attribute("href", `/blog/${path.replace(".md", "")}`, 0)}><div class="${"blogPost svelte-1jz35mv"}"><h3 class="${"svelte-1jz35mv"}">${escape(title)}</h3>
                        <span class="${"date svelte-1jz35mv"}">${escape(new Date(date).toLocaleDateString("en-us", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }))}</span>
                        <p class="${"svelte-1jz35mv"}">${escape(snippet)}</p></div>
                </a>`)}</div>
        <div class="${"background svelte-1jz35mv"}"></div></div>
</main>`;
    });
  }
});

// .svelte-kit/output/server/chunks/app-47afbf9a.js
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function resolve(base2, path) {
  if (scheme.test(path))
    return path;
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
function is_root_relative(path) {
  return path[0] === "/" && path[1] !== "/";
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error(body4) {
  return {
    status: 500,
    body: body4,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler) {
    return;
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
  let { status = 200, body: body4, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body4 instanceof Uint8Array || is_string(body4))) {
    return error(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body4 === "object" || typeof body4 === "undefined") && !(body4 instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body4 === "undefined" ? {} : body4);
  } else {
    normalized_body = body4;
  }
  return { status, body: normalized_body, headers };
}
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
function writable(value, start = noop) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
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
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
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
function escape_json_string_in_html(str) {
  return escape$1(str, escape_json_string_in_html_dict, (code) => `\\u${code.toString(16).toUpperCase()}`);
}
function escape_html_attr(str) {
  return '"' + escape$1(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}
function escape$1(str, dict, unicode_encoder) {
  let result = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char in dict) {
      result += dict[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += unicode_encoder(code);
      }
    } else {
      result += char;
    }
  }
  return result;
}
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page
}) {
  const css22 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css22.add(url));
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
    ...Array.from(css22).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
    init2 += options2.service_worker ? '<script async custom-element="amp-install-serviceworker" src="https://cdn.ampproject.org/v0/amp-install-serviceworker-0.1.js"><\/script>' : "";
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${page && page.path ? try_serialize(page.path, (error3) => {
      throw new Error(`Failed to serialize page.path: ${error3.message}`);
    }) : null},
						query: new URLSearchParams(${page && page.query ? s$1(page.query.toString()) : ""}),
						params: ${page && page.params ? try_serialize(page.params, (error3) => {
      throw new Error(`Failed to serialize page.params: ${error3.message}`);
    }) : null}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += options2.amp ? `<amp-install-serviceworker src="${options2.service_worker}" layout="nodisplay"></amp-install-serviceworker>` : `<script>
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
  const body4 = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body22, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url)}`;
    if (body22)
      attributes += ` data-body="${hash(body22)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
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
    body: options2.template({ head, body: body4 })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
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
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
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
  if (loaded.context) {
    throw new Error('You are returning "context" from a load function. "context" was renamed to "stuff", please adjust your code accordingly.');
  }
  return loaded;
}
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  stuff,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module2.load) {
    const load_input = {
      page: page_proxy,
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
        const prefix = options2.paths.assets || options2.paths.base;
        const filename = (resolved.startsWith(prefix) ? resolved.slice(prefix.length) : resolved).slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (is_root_relative(resolved)) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
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
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
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
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, _receiver) {
              async function text() {
                const body4 = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":"${escape_json_string_in_html(body4)}"}`
                  });
                }
                return body4;
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
      stuff: { ...stuff }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
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
    stuff: loaded.stuff || stuff,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
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
    stuff: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
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
      stuff: loaded ? loaded.stuff : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
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
      error: error2,
      branch,
      page
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {}
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let stuff = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              stuff,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    stuff: node_loaded.stuff,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.stuff) {
          stuff = {
            ...stuff,
            ...loaded.loaded.stuff
          };
        }
      }
    }
  try {
    return with_cookies(await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    }), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    }), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page
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
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body4 = match[2].trim();
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
    append(key, body4);
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
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                let if_none_match_value = request2.headers["if-none-match"];
                if (if_none_match_value?.startsWith('W/"')) {
                  if_none_match_value = if_none_match_value.substring(2);
                }
                const etag = `"${hash(response.body || "")}"`;
                if (if_none_match_value === etag) {
                  return {
                    status: 304,
                    headers: {}
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
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
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
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
          code: Array.from(result.css).map((css22) => css22.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-aeed1e04.js",
      css: [assets + "/_app/assets/start-61d1577b.css"],
      js: [assets + "/_app/start-aeed1e04.js", assets + "/_app/chunks/vendor-2ca5b27b.js", assets + "/_app/chunks/preload-helper-ec9aa979.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
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
async function load_component(file) {
  const { entry, css: css22, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css22.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
var __accessCheck, __privateGet, __privateAdd, __privateSet, _map, absolute, scheme, chars, unsafeChars, reserved, escaped$1, objectProtoOwnPropertyNames, subscriber_queue, escape_json_string_in_html_dict, escape_html_attr_dict, s$1, s, ReadOnlyFormData, current_component, escaped, missing_component, on_destroy, css10, Root, base, assets, user_hooks, template, options, default_settings, d, empty, manifest, get_hooks, module_lookup, metadata_lookup;
var init_app_47afbf9a = __esm({
  ".svelte-kit/output/server/chunks/app-47afbf9a.js"() {
    init_shims();
    __accessCheck = (obj, member, msg) => {
      if (!member.has(obj))
        throw TypeError("Cannot " + msg);
    };
    __privateGet = (obj, member, getter) => {
      __accessCheck(obj, member, "read from private field");
      return getter ? getter.call(obj) : member.get(obj);
    };
    __privateAdd = (obj, member, value) => {
      if (member.has(obj))
        throw TypeError("Cannot add the same private member more than once");
      member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
    };
    __privateSet = (obj, member, value, setter) => {
      __accessCheck(obj, member, "write to private field");
      setter ? setter.call(obj, value) : member.set(obj, value);
      return value;
    };
    absolute = /^([a-z]+:)?\/?\//;
    scheme = /^[a-z]+:/;
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
    unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
    reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
    escaped$1 = {
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
    objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
    Promise.resolve();
    subscriber_queue = [];
    escape_json_string_in_html_dict = {
      '"': '\\"',
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
    escape_html_attr_dict = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    };
    s$1 = JSON.stringify;
    s = JSON.stringify;
    ReadOnlyFormData = class {
      constructor(map) {
        __privateAdd(this, _map, void 0);
        __privateSet(this, _map, map);
      }
      get(key) {
        const value = __privateGet(this, _map).get(key);
        return value && value[0];
      }
      getAll(key) {
        return __privateGet(this, _map).get(key);
      }
      has(key) {
        return __privateGet(this, _map).has(key);
      }
      *[Symbol.iterator]() {
        for (const [key, value] of __privateGet(this, _map)) {
          for (let i = 0; i < value.length; i += 1) {
            yield [key, value[i]];
          }
        }
      }
      *entries() {
        for (const [key, value] of __privateGet(this, _map)) {
          for (let i = 0; i < value.length; i += 1) {
            yield [key, value[i]];
          }
        }
      }
      *keys() {
        for (const [key] of __privateGet(this, _map))
          yield key;
      }
      *values() {
        for (const [, value] of __privateGet(this, _map)) {
          for (let i = 0; i < value.length; i += 1) {
            yield value[i];
          }
        }
      }
    };
    _map = new WeakMap();
    Promise.resolve();
    escaped = {
      '"': "&quot;",
      "'": "&#39;",
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;"
    };
    missing_component = {
      $$render: () => ""
    };
    css10 = {
      code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
      map: null
    };
    Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
      $$result.css.add(css10);
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
    base = "";
    assets = "";
    user_hooks = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      [Symbol.toStringTag]: "Module"
    });
    template = ({ head, body: body4 }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png">\n		<link rel="icon" type="image/png" sizes="32x32" href="favicon/favicon-32x32.png">\n		<link rel="icon" type="image/png" sizes="16x16" href="favicon/favicon-16x16.png">\n		<link rel="manifest" href="favicon/site.webmanifest">\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body4 + "</div>\n	</body>\n</html>\n";
    options = null;
    default_settings = { paths: { "base": "", "assets": "" } };
    d = (s2) => s2.replace(/%23/g, "#").replace(/%3[Bb]/g, ";").replace(/%2[Cc]/g, ",").replace(/%2[Ff]/g, "/").replace(/%3[Ff]/g, "?").replace(/%3[Aa]/g, ":").replace(/%40/g, "@").replace(/%26/g, "&").replace(/%3[Dd]/g, "=").replace(/%2[Bb]/g, "+").replace(/%24/g, "$");
    empty = () => ({});
    manifest = {
      assets: [{ "file": ".DS_Store", "size": 6148, "type": null }, { "file": "artComputerman.svg", "size": 35544, "type": "image/svg+xml" }, { "file": "artError-2.svg", "size": 18616, "type": "image/svg+xml" }, { "file": "artError-3.svg", "size": 18615, "type": "image/svg+xml" }, { "file": "artError-3.vectornator/Artboard0.json", "size": 213929, "type": "application/json" }, { "file": "artError-3.vectornator/Document.json", "size": 829, "type": "application/json" }, { "file": "artError-3.vectornator/Manifest.json", "size": 148, "type": "application/json" }, { "file": "artError-3.vectornator/Thumbnail.png", "size": 94361, "type": "image/png" }, { "file": "artError-3.vectornator/UndoHistory.json", "size": 22977, "type": "application/json" }, { "file": "artError.svg", "size": 67186, "type": "image/svg+xml" }, { "file": "artMountain.svg", "size": 30329, "type": "image/svg+xml" }, { "file": "background-stackedwaves.svg", "size": 4914, "type": "image/svg+xml" }, { "file": "blob-scene.svg", "size": 4970, "type": "image/svg+xml" }, { "file": "favicon/android-chrome-192x192.png", "size": 10552, "type": "image/png" }, { "file": "favicon/android-chrome-512x512.png", "size": 33736, "type": "image/png" }, { "file": "favicon/apple-touch-icon.png", "size": 9310, "type": "image/png" }, { "file": "favicon/favicon-16x16.png", "size": 690, "type": "image/png" }, { "file": "favicon/favicon-32x32.png", "size": 1360, "type": "image/png" }, { "file": "favicon/favicon.ico", "size": 15406, "type": "image/vnd.microsoft.icon" }, { "file": "favicon/site.webmanifest", "size": 263, "type": "application/manifest+json" }, { "file": "footer-waveline.svg", "size": 579, "type": "image/svg+xml" }, { "file": "footer-waveline2.svg", "size": 584, "type": "image/svg+xml" }, { "file": "illustration-0arrow.svg", "size": 2484, "type": "image/svg+xml" }, { "file": "illustration-3scribbles.svg", "size": 11862, "type": "image/svg+xml" }, { "file": "illustration-crosses.svg", "size": 16139, "type": "image/svg+xml" }, { "file": "illustration-shapes.svg", "size": 13936, "type": "image/svg+xml" }, { "file": "layered-waves.svg", "size": 4056, "type": "image/svg+xml" }, { "file": "link.svg", "size": 1165, "type": "image/svg+xml" }, { "file": "man.svg", "size": 18398, "type": "image/svg+xml" }, { "file": "postBackground-1.svg", "size": 687, "type": "image/svg+xml" }, { "file": "postBackground-2.svg", "size": 678, "type": "image/svg+xml" }, { "file": "postBackground-3.svg", "size": 689, "type": "image/svg+xml" }, { "file": "postBackground-4.svg", "size": 570, "type": "image/svg+xml" }],
      layout: "src/routes/__layout.svelte",
      error: "src/routes/__error.svelte",
      routes: [
        {
          type: "page",
          pattern: /^\/$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
          b: ["src/routes/__error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/calculator\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/calculator.svelte"],
          b: ["src/routes/__error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/flowcharts\/schildklier\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/flowcharts/schildklier/index.svelte"],
          b: ["src/routes/__error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/blog\/211211-code-highlighting\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/blog/211211-code-highlighting.md"],
          b: ["src/routes/__error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/blog\/211209-globalstyles\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/blog/211209-globalstyles.md"],
          b: ["src/routes/__error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/blog\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/blog.svelte"],
          b: ["src/routes/__error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/tags\/([^/]+?)\/?$/,
          params: (m) => ({ tag: d(m[1]) }),
          a: ["src/routes/__layout.svelte", "src/routes/tags/[tag].svelte"],
          b: ["src/routes/__error.svelte"]
        }
      ]
    };
    get_hooks = (hooks) => ({
      getSession: hooks.getSession || (() => ({})),
      handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
      handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
      externalFetch: hooks.externalFetch || fetch
    });
    module_lookup = {
      "src/routes/__layout.svelte": () => Promise.resolve().then(() => (init_layout_969a828d(), layout_969a828d_exports)),
      "src/routes/__error.svelte": () => Promise.resolve().then(() => (init_error_78d0beda(), error_78d0beda_exports)),
      "src/routes/index.svelte": () => Promise.resolve().then(() => (init_index_aab870f8(), index_aab870f8_exports)),
      "src/routes/calculator.svelte": () => Promise.resolve().then(() => (init_calculator_14731781(), calculator_14731781_exports)),
      "src/routes/flowcharts/schildklier/index.svelte": () => Promise.resolve().then(() => (init_index_10342206(), index_10342206_exports)),
      "src/routes/blog/211211-code-highlighting.md": () => Promise.resolve().then(() => (init_code_highlighting_a93151b2(), code_highlighting_a93151b2_exports)),
      "src/routes/blog/211209-globalstyles.md": () => Promise.resolve().then(() => (init_globalstyles_2a78373a(), globalstyles_2a78373a_exports)),
      "src/routes/blog.svelte": () => Promise.resolve().then(() => (init_blog_accfba20(), blog_accfba20_exports)),
      "src/routes/tags/[tag].svelte": () => Promise.resolve().then(() => (init_tag_5cfc3f6a(), tag_5cfc3f6a_exports))
    };
    metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-b98c9fb8.js", "css": ["assets/pages/__layout.svelte-2f06bd98.css", "assets/TagCloud-e0efec28.css"], "js": ["pages/__layout.svelte-b98c9fb8.js", "chunks/vendor-2ca5b27b.js", "chunks/TagCloud-87f128ce.js"], "styles": [] }, "src/routes/__error.svelte": { "entry": "pages/__error.svelte-d7f17794.js", "css": ["assets/pages/__error.svelte-4a2984d3.css"], "js": ["pages/__error.svelte-d7f17794.js", "chunks/vendor-2ca5b27b.js", "chunks/Seo-db1af496.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-1dd15d12.js", "css": ["assets/pages/index.svelte-c711b1c9.css", "assets/TagCloud-e0efec28.css"], "js": ["pages/index.svelte-1dd15d12.js", "chunks/preload-helper-ec9aa979.js", "chunks/vendor-2ca5b27b.js", "chunks/Seo-db1af496.js", "chunks/TagCloud-87f128ce.js"], "styles": [] }, "src/routes/calculator.svelte": { "entry": "pages/calculator.svelte-fd2cdc84.js", "css": ["assets/pages/calculator.svelte-c34af457.css"], "js": ["pages/calculator.svelte-fd2cdc84.js", "chunks/vendor-2ca5b27b.js", "chunks/Seo-db1af496.js"], "styles": [] }, "src/routes/flowcharts/schildklier/index.svelte": { "entry": "pages/flowcharts/schildklier/index.svelte-53191f0e.js", "css": ["assets/pages/flowcharts/schildklier/index.svelte-4050857a.css"], "js": ["pages/flowcharts/schildklier/index.svelte-53191f0e.js", "chunks/vendor-2ca5b27b.js", "chunks/Seo-db1af496.js"], "styles": [] }, "src/routes/blog/211211-code-highlighting.md": { "entry": "pages/blog/211211-code-highlighting.md-2311274c.js", "css": ["assets/blog-b2bf76ef.css"], "js": ["pages/blog/211211-code-highlighting.md-2311274c.js", "chunks/vendor-2ca5b27b.js", "chunks/blog-1c8f7519.js", "chunks/Seo-db1af496.js", "chunks/Date-ea83ee58.js"], "styles": [] }, "src/routes/blog/211209-globalstyles.md": { "entry": "pages/blog/211209-globalstyles.md-0d94b363.js", "css": ["assets/blog-b2bf76ef.css"], "js": ["pages/blog/211209-globalstyles.md-0d94b363.js", "chunks/vendor-2ca5b27b.js", "chunks/blog-1c8f7519.js", "chunks/Seo-db1af496.js", "chunks/Date-ea83ee58.js"], "styles": [] }, "src/routes/blog.svelte": { "entry": "pages/blog.svelte-d79efeef.js", "css": ["assets/pages/blog.svelte-2bf2c180.css"], "js": ["pages/blog.svelte-d79efeef.js", "chunks/preload-helper-ec9aa979.js", "chunks/vendor-2ca5b27b.js", "chunks/Seo-db1af496.js", "chunks/Date-ea83ee58.js"], "styles": [] }, "src/routes/tags/[tag].svelte": { "entry": "pages/tags/_tag_.svelte-255c7bc3.js", "css": ["assets/pages/tags/_tag_.svelte-260734ec.css"], "js": ["pages/tags/_tag_.svelte-255c7bc3.js", "chunks/preload-helper-ec9aa979.js", "chunks/vendor-2ca5b27b.js", "chunks/Seo-db1af496.js"], "styles": [] } };
  }
});

// .svelte-kit/vercel/entry.js
__export(exports, {
  default: () => entry_default
});
init_shims();

// node_modules/@sveltejs/kit/dist/node.js
init_shims();
function getRawBody(req) {
  return new Promise((fulfil, reject) => {
    const h = req.headers;
    if (!h["content-type"]) {
      return fulfil(null);
    }
    req.on("error", reject);
    const length = Number(h["content-length"]);
    if (isNaN(length) && h["transfer-encoding"] == null) {
      return fulfil(null);
    }
    let data = new Uint8Array(length || 0);
    if (length > 0) {
      let offset = 0;
      req.on("data", (chunk) => {
        const new_len = offset + Buffer.byteLength(chunk);
        if (new_len > length) {
          return reject({
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
      fulfil(data);
    });
  });
}

// .svelte-kit/output/server/app.js
init_shims();
init_app_47afbf9a();

// .svelte-kit/vercel/entry.js
init();
var entry_default = async (req, res) => {
  const { pathname, searchParams } = new URL(req.url || "", "http://localhost");
  let body4;
  try {
    body4 = await getRawBody(req);
  } catch (err) {
    res.statusCode = err.status || 400;
    return res.end(err.reason || "Invalid request body");
  }
  const rendered = await render({
    method: req.method,
    headers: req.headers,
    path: pathname,
    query: searchParams,
    rawBody: body4
  });
  if (rendered) {
    const { status, headers, body: body5 } = rendered;
    return res.writeHead(status, headers).end(body5);
  }
  return res.writeHead(404).end();
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
/*! fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */

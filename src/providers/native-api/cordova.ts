import { Observable } from "rxjs/Rx";
import { Observer } from "rxjs/Observer";
import { Subscription } from "rxjs";

type execFunction = (bridgeSecret: number, service: string, action: string, callbackId: string, argsJson: string) => string;
type successCallback = (params?: string) => void;
type failCallback = (params?: string) => void;

interface PluginResult {
  status: number;
  message: string;
  keepCallback: boolean;
}

class CordovaRequest {
  success: successCallback = null;
  fail: failCallback = null;

  constructor(success: successCallback, fail: failCallback) {
    this.success = success;
    this.fail = fail;
  }
}

var callbackId: number = 0;
var requests: any = new Object();

function arrayBufferToBase64(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
}

function getConstructorName(obj: any) {
  if (typeof obj === "object") {
    return (<Object>obj).constructor.name;
  }

  return "";
}

function exec(
  success: successCallback,
  fail: failCallback,
  service: string,
  action: string,
  args: any[]
) {
  let id: string;
  let request: CordovaRequest;
  let argsJson: string;

  args = args || [];

  for (let i: number = 0; i < args.length; i++) {
    if (getConstructorName(args[i]) == "ArrayBuffer") {
      args[i] = arrayBufferToBase64(args[i]);
    }
  }

  argsJson = JSON.stringify(args);
  id = service + callbackId.toString();
  callbackId++;
  request = new CordovaRequest(success, fail);
  requests[id] = request;

  if ((<any>window).$bridge) {
    (<execFunction>(<any>window).$bridge.exec)(0, service, action, id, argsJson);
  }
}

function callback(state: boolean, callbackId: string, result: PluginResult) {
  try {
    let cb: CordovaRequest = requests[callbackId];

    if (cb) {
      try {
        if (state) {
          cb.success(result.message);
        } else {
          cb.fail(result.message);
        }
      } catch (err) {
        console.error(err);
      }

      if (!result.keepCallback) {
        delete requests[callbackId];
      }
    }
  } catch (err) {
    console.error(err);
  }

  return "error";
}

export function init() {
  let cordova: any = new Object();

  cordova.exec = exec;
  cordova.callback = callback;
  (<any>window).cordova = cordova;
}

import { Injectable } from "@angular/core";
import $ from "jquery";
import { Resolve, Reject } from "../../app/models";
import { getBool, sleep } from "../../app/common";

class JsonRequest {
  public static mac: string = "";
  public static regcode: string = "";
  public static sessionId: number = 0;
  public static sequence: number = 1;

  public get getSequence(): number {
    return JsonRequest.sequence++;
  }

  public mac?: string;
  public sessionId: number = JsonRequest.sessionId;
  public sequence: number = this.getSequence;
  public poolCode: string = btoa(`${JsonRequest.regcode}:${JsonRequest.mac}`);
  public info?: any;

  public constructor(info: any, mac?: string) {
    if (info) this.info = info;
    if (mac) this.mac = mac;
  }
}

export type CardType =
  | "身份证"
  | "驾驶证"
  | "护照"
  | "军官证"
  | "OCR身份证"
  | "OCR护照"
  | "OCR驾驶证"
  | "电子护照";

export class JsonResponse {
  public sessionId: number;
  public sequence: number;
  public result: boolean;
  public code: number;
  public info?: any;

  public static check(data: any): boolean {
    if (!data) return false;
    if (!("sessionId" in data)) return false;
    if (!("sequence" in data)) return false;
    if (!("result" in data)) return false;
    if (!("code" in data)) return false;

    return true;
  }

  public from(data: any): boolean {
    if (!data) return false;
    if (!("sessionId" in data)) return false;
    if (!("sequence" in data)) return false;
    if (!("result" in data)) return false;
    if (!("code" in data)) return false;

    try {
      this.sessionId = Number(data.sessionId);
      this.sequence = Number(data.sequence);
      this.result = getBool(data.result);
      this.code = Number(data.code);
      if ("info" in data) this.info = data.info;
    } catch (err) {
      console.error("JsonResponse.from error:", err);
      return false;
    }

    return true;
  }
}

export class WebError {
  public jqXHR: JQuery.jqXHR;
  public textStatus: JQuery.Ajax.ErrorTextStatus;
  public errorThrown: string;

  constructor(
    jqXHR: JQuery.jqXHR,
    textStatus: JQuery.Ajax.ErrorTextStatus,
    errorThrown: string
  ) {
    this.jqXHR = jqXHR;
    this.textStatus = textStatus;
    this.errorThrown = errorThrown;
  }
}

export class PublicInfo {
  public v_name: string = "";
  public v_nation: string = "";
  public v_phone: string = "";
  public v_dw: string = "";
  public v_sex?: 0 | 1 | 2 = 0;
  public v_certificateNumber: string = "";
  public v_certificateType: CardType = "身份证";
  public v_certificateUnit?: string = "";
  public v_address?: string = "";
  public v_reason: string = "";
  // public v_aging: string = "";
  public v_personSum: number = 1;
  public v_plateNumber?: string = "";
  public v_belonging?: string = "";
  public isv_id?: number = 0;  //访客ID
  public isv_code?: string = "";
  public status: 0 | 1 | 2 | 3 | 4 = 1;
  public v_cardNumber?: string = "";
  public inviteCode?: string = "";
  public v_time?: string = "";
  public r_v_time?: string = "";
  public v_lvTime?: string = "";
  public r_v_lvTime?: string = "";
  public v_box?: number = 0; // 访客器ID
  public v_duration?: number = 0;
  public isv_deptName?: string = "";
  public isv_name?: string = "";
  public v_capturePic?: string = "";
  public v_certificatePic?: string = "";
  public v_certificateHead?: string = "";
  public uid?: string = "";
}

export class VisitorInfo extends PublicInfo { }

export class FullVisitorInfo extends PublicInfo {
  public id: number;
}

export class StaffInfo {
  public id: number;
  public name: string;
  public phone: string;
  public sex: number;
  public company: string;
  public deptName: string;
  public deptId: number;
  public code: string;
  public location: string;
}

export class VisitorList {
  visitorList: FullVisitorInfo[];
}

export class PersonList {
  personList: StaffInfo[];
}

class BoxInfo {
  boxId?: number;
  boxName?: string;
}

@Injectable()
export class WebapiProvider {
  //private $sessionId: number = 0;
  //private $timerTry: number = null;
  //private $timerHold: number = null;
  private $state: number = 0;
  private $timer: number = null;
  private $boxInfo: BoxInfo = null;
  private isReconnect: boolean = false;
  public isHold: boolean = false;
  public host: string = "10.35.120.98";
  public port: number = 80;
  public regcode: string = "123456";
  public encKey: string = "";
  public timeout: number = 30000;

  constructor() {
    if (!window.$test) window.$test = new Object();

    window.$test.register = this.register.bind(this);
    window.$test.unregister = this.unregister.bind(this);
    window.$test.heartbeat = this.heartbeat.bind(this);
    window.$test.getVisitor = this.getVisitor.bind(this);
    window.$test.getInterviewee = this.getInterviewee.bind(this);
    window.$test.addVisitor = this.addVisitor.bind(this);
  }

  /**
   * 平台状态
   * 1: 已连接
   * @readonly
   * @type {number}
   * @memberof WebapiProvider
   */
  public get state(): number {
    return this.$state;
  }

  public reset() {
    JsonRequest.sessionId = 0;
    JsonRequest.sequence = 1;
  }

  public createTimer() {
    if (this.$timer) {
      window.clearInterval(this.$timer);
      this.$timer = null;
    }

    this.$timer = window.setInterval(() => {
      if (this.$state === 1) {
      }
    }, 20000);
  }

  /**
   * 心跳保活
   */
  private holdSession() {
    if (this.isHold) return;
    this.isHold = true;

    window.setTimeout(async () => {
      try {
        while (true) {
          let success: boolean;
          let count: number = 3;

          try {
            do {
              if (this.isHold === false) return;

              count--;
              success = false;

              try {
                let resp: JsonResponse;

                resp = await this.heartbeat(3000);

                if (resp && resp.code === 200) {
                  success = true;
                }
              } catch (err) {
                if (err instanceof WebError) {
                  console.error(`web error: ${err.textStatus}!`);
                } else {
                  console.error(err);
                }
              }
            } while (success === false && count >= 0);

            if (success) {
              await sleep(10000);
            } else {
              this.$state = -1;
              this.tryReconnect();
              break;
            }
          } catch (err) {
            console.error(err);
          }
        }
      } finally {
        this.isHold = false;
      }
    }, 0);
  }

  public connectServer(mac?: string): Promise<boolean> {
    let promise: Promise<boolean>;

    promise = new Promise<boolean>(
      async (resolve: Resolve<boolean>, reject: Reject) => {
        let resp: JsonResponse;

        try {
          if (mac) {
            JsonRequest.mac = mac;

            if (this.regcode) {
              JsonRequest.regcode = window.$native.aesEncrypt(
                btoa(this.regcode),
                this.encKey
              );
            }
          }

          resp = await this.unregister(3000);
        } catch (err) {
          if (err instanceof WebError) {
            console.error(`web error: ${err.textStatus}!`);
          } else {
            console.error(err);
          }
        }

        try {
          resp = await this.register(mac, this.regcode, 3000);

          if (resp) {
            switch (resp.code) {
              case 200:
              case 606:
                console.log("retry ok!");
                this.holdSession();
                resolve(true);
                return;
            }
          }

          console.log("get resp:", resp);
        } catch (err) {
          if (err instanceof WebError) {
            console.error(`web error: ${err.textStatus}!`);
          } else {
            console.error(err);
          }
        }
        resolve(false);
      }
    );

    return promise;
  }
  // 尝试重新连接
  public tryReconnect() {
    if (this.isReconnect) return;
    this.isReconnect = true;

    window.setTimeout(async () => {
      let count: number = 0;

      while (true) {
        try {
          let promise: Promise<boolean> = null;
          promise = this.connectServer();
          count++;

          // console.log(`try reconnect: ${count}`);

          if (await promise) {
            console.log("login success!");
            break;
          }
        } catch (err) {
          console.error(err);
        } finally {
          await sleep(1800);
        }
      }

      this.isReconnect = false;
    }, 0);
  }

  public getErrorMsg(code: number): string {
    switch (code) {
      case 200:
        return "成功";
      case 601:
        return "参数错误";
      case 602:
        return "操作超时";
      case 603:
        return "岗亭信息不存在";
      case 604:
        return "命令不支持";
      case 605:
        return "存储空间不足";
      case 606:
        return "注册信息已存在";
      case 607:
        return "图片解码错误";
      case 608:
        return "访客信息已存在";
      case 609:
        return "被访人不存在";
      case 610:
        return "访客信息不存在";
      case 611:
        return "内部人员无需预约";
      case 612:
        return "访客已在黑名单列表";
      default:
        return String(code);
    }
  }

  /**
   * 注册协议
   */
  public register(
    mac?: string,
    regcode?: string,
    timeout?: number
  ): Promise<JsonResponse> {
    let promise: Promise<JsonResponse>;

    promise = new Promise<JsonResponse>(
      (resolve: Resolve<JsonResponse>, reject: Reject) => {
        let url: string;
        let json: JsonRequest;

        url = `http://${this.host}:${this.port
          }/CardSolution/visitorcenter/session`;

        if (mac) JsonRequest.mac = mac;

        if (!window.$native) reject("window.$native cannot be null!");

        if (regcode) {
          JsonRequest.regcode = window.$native.aesEncrypt(
            btoa(regcode),
            this.encKey
          );
        }

        json = new JsonRequest({ clientType: "1" }, JsonRequest.mac);

        $.ajax(url, {
          type: "POST",
          dataType: "json",
          contentType: "application/json;charset=UTF-8",
          data: JSON.stringify(json),
          async: true,
          timeout: timeout | this.timeout,
          beforeSend: (
            jqXHR: JQuery.jqXHR,
            settings: JQuery.AjaxSettings<any>
          ) => {
            // console.log("headers:", settings.headers);
          },
          error: (
            jqXHR: JQuery.jqXHR,
            textStatus: JQuery.Ajax.ErrorTextStatus,
            errorThrown: string
          ) => {
            // console.log(`error: ${textStatus}`, jqXHR);
            reject(new WebError(jqXHR, textStatus, errorThrown));
          },
          success: (
            data: any,
            textStatus: JQuery.Ajax.SuccessTextStatus,
            jqXHR: JQuery.jqXHR,
          ) => {
            console.log(111);
            let resp: JsonResponse = new JsonResponse();
            console.log("注册协议" + JSON.stringify(data));
            if (resp.from(data)) {
              switch (resp.code) {
                // 如果注册成功
                case 200:
                case 606:
                  console.log(
                    `register ok on ${new Date().toISOString()}:`,
                    resp.code
                  );
                  JsonRequest.sessionId = resp.sessionId;
                  this.$state = 1;
                  // console.log(11111);
                  if ("boxInfo" in resp.info) this.$boxInfo = resp.info.boxInfo;
                  this.createTimer();
                  break;
                default:
                  this.$state = -1;
                  // console.log(-1 - 1 - 1 - 1 - 1);

                  break;
              }

              resolve(resp);
            } else {

              this.$state = -2;
              reject("响应格式不正确!");
            }
          }
        });
      }
    );

    return promise;
  }

  /**
   * 注销协议
   */
  public unregister(timeout?: number): Promise<JsonResponse> {
    let promise: Promise<JsonResponse>;

    promise = new Promise<JsonResponse>(
      (resolve: Resolve<JsonResponse>, reject: Reject) => {
        let url: string;
        let json: JsonRequest;

        url = `http://${this.host}:${this.port
          }/CardSolution/visitorcenter/session`;

        json = new JsonRequest({});

        $.ajax(url, {
          type: "DELETE",
          dataType: "json",
          contentType: "application/json;charset=UTF-8",
          data: JSON.stringify(json),
          async: true,
          timeout: timeout | this.timeout,
          beforeSend: (
            jqXHR: JQuery.jqXHR,
            settings: JQuery.AjaxSettings<any>
          ) => {
            //console.log("headers:", settings.headers);
          },
          error: (
            jqXHR: JQuery.jqXHR,
            textStatus: JQuery.Ajax.ErrorTextStatus,
            errorThrown: string
          ) => {
            //console.log(`error: ${textStatus}`, jqXHR);
            reject(new WebError(jqXHR, textStatus, errorThrown));
          },
          success: (
            data: any,
            textStatus: JQuery.Ajax.SuccessTextStatus,
            jqXHR: JQuery.jqXHR
          ) => {
            let resp: JsonResponse = new JsonResponse();
            console.log("注销协议" + JSON.stringify(data));
            if (resp.from(data)) {
              // 如果注销成功
              if (resp.code === 200) {
                JsonRequest.sessionId = 0;
                this.$state = 0;
                this.$boxInfo = null;

                /*
                if (this.$timerHold) {
                  window.clearInterval(this.$timerHold);
                  this.$timerHold = null;
                }
                */
              }
              resolve(resp);
            } else {
              reject("响应格式不正确!");
            }
          }
        });
      }
    );

    return promise;
  }

  /**
   * 心跳包
   */
  public heartbeat(timeout?: number): Promise<JsonResponse> {
    let promise: Promise<JsonResponse>;

    promise = new Promise<JsonResponse>(
      (resolve: Resolve<JsonResponse>, reject: Reject) => {
        let url: string;
        let json: JsonRequest;

        url = `http://${this.host}:${this.port
          }/CardSolution/visitorcenter/heartbeat`;

        json = new JsonRequest({});

        $.ajax(url, {
          type: "POST",
          dataType: "json",
          contentType: "application/json;charset=UTF-8",
          data: JSON.stringify(json),
          async: true,
          timeout: timeout | this.timeout,
          beforeSend: (
            jqXHR: JQuery.jqXHR,
            settings: JQuery.AjaxSettings<any>
          ) => { },
          error: (
            jqXHR: JQuery.jqXHR,
            textStatus: JQuery.Ajax.ErrorTextStatus,
            errorThrown: string
          ) => {
            //console.log(`error: ${textStatus}`, jqXHR);
            reject(new WebError(jqXHR, textStatus, errorThrown));
          },
          success: (
            data: any,
            textStatus: JQuery.Ajax.SuccessTextStatus,
            jqXHR: JQuery.jqXHR
          ) => {
            let resp: JsonResponse = new JsonResponse();

            if (resp.from(data)) {
              resolve(resp);
            } else {
              reject("响应格式不正确!");
            }
          }
        });
      }
    );

    return promise;
  }

  /**
   * 查询访客
   * @param code
   * @param cardType
   * @param cardNum 证件号码明文
   */
  public getVisitor(
    code?: string,
    cardType?: CardType,
    cardNum?: string
  ): Promise<JsonResponse> {
    let promise: Promise<JsonResponse>;

    promise = new Promise<JsonResponse>(
      (resolve: Resolve<JsonResponse>, reject: Reject) => {
        let url: string;
        let json: JsonRequest;
        let info: any = new Object();

        url = `http://${this.host}:${this.port
          }/CardSolution/visitorcenter/visitor`;

        if (code) info.inviteCode = btoa(code);

        if (cardType && cardNum) {
          info.certificateType = cardType;
          info.certificateNumber = window.$native.aesEncrypt(
            btoa(cardNum),
            this.encKey
          );
        }

        json = new JsonRequest(info);

        $.ajax(url, {
          type: "POST",
          dataType: "json",
          contentType: "application/json;charset=UTF-8",
          data: JSON.stringify(json),
          async: true,
          timeout: this.timeout,
          beforeSend: (
            jqXHR: JQuery.jqXHR,
            settings: JQuery.AjaxSettings<any>
          ) => {
            //console.log("headers:", settings.headers);
          },
          error: (
            jqXHR: JQuery.jqXHR,
            textStatus: JQuery.Ajax.ErrorTextStatus,
            errorThrown: string
          ) => {
            console.log(`查询访客error: ${textStatus}`, jqXHR);
            // console.log("查询访客error：" + JSON.stringify(data));

            reject(new WebError(jqXHR, textStatus, errorThrown));
          },
          success: (
            data: any,
            textStatus: JQuery.Ajax.SuccessTextStatus,
            jqXHR: JQuery.jqXHR
          ) => {
            let resp: JsonResponse = new JsonResponse();
            console.log("查询访客接收到的参数：" + JSON.stringify(data));

            if (resp.from(data)) {
              resolve(resp);
              console.log("查询访客接收转换的参数：" + JSON.stringify(resp));

            } else {
              reject("响应格式不正确!");
            }
          }
        });
      }
    );
    return promise;
  }

  /**
   * 查询被访人
   * @param person
   * @param phone
   * @param id
   * @param cardType
   * @param cardNum
   */
  public getInterviewee(
    person?: string,
    phone?: string,
    code?: string,
    id?: number,
    cardType?: CardType,
    cardNum?: string
  ): Promise<JsonResponse> {
    let promise: Promise<JsonResponse>;

    promise = new Promise<JsonResponse>(
      (resolve: Resolve<JsonResponse>, reject: Reject) => {
        let url: string;
        let json: JsonRequest;
        let info: any = new Object();

        url = `http://${this.host}:${this.port
          }/CardSolution/visitorcenter/person`;

        if (person) info.person = person;
        if (phone) info.phone = phone;
        if (code) info.code = code;
        if (id) info.id = id;

        if (cardType && cardNum) {
          info.certificateType = cardType;
          info.certificateNumber = window.$native.aesEncrypt(
            btoa(cardNum),
            this.encKey
          );
        }

        json = new JsonRequest(info);
        console.log("查询被访人" + JSON.stringify(json));

        $.ajax(url, {
          type: "POST",
          dataType: "json",
          contentType: "application/json;charset=UTF-8",
          data: JSON.stringify(json),
          async: true,
          timeout: this.timeout,
          beforeSend: (
            jqXHR: JQuery.jqXHR,
            settings: JQuery.AjaxSettings<any>
          ) => {
            // console.log("headers:", settings.headers);
          },
          error: (
            jqXHR: JQuery.jqXHR,
            textStatus: JQuery.Ajax.ErrorTextStatus,
            errorThrown: string
          ) => {
            // console.log(`error: ${textStatus}`, jqXHR);
            reject(new WebError(jqXHR, textStatus, errorThrown));
          },
          success: (
            data: any,
            textStatus: JQuery.Ajax.SuccessTextStatus,
            jqXHR: JQuery.jqXHR
          ) => {
            console.log("data" + JSON.stringify(data));
            let resp: JsonResponse = new JsonResponse();


            if (resp.from(data)) {
              resolve(resp);
            } else {
              reject("响应格式不正确!");
            }
          }
        });
      }
    );

    return promise;
  }

  /**
   * 增加访客 (现场来访)
   * @param info
   */
  public addVisitor(info: VisitorInfo): Promise<JsonResponse> {
    let promise: Promise<JsonResponse>;

    promise = new Promise<JsonResponse>(
      (resolve: Resolve<JsonResponse>, reject: Reject) => {
        let url: string;
        let json: JsonRequest;

        url = `http://${this.host}:${this.port
          }/CardSolution/visitorcenter/visitor`;

        if (this.$boxInfo && this.$boxInfo.boxId) {
          info.v_box = this.$boxInfo.boxId;
        }

        if (info.v_certificateNumber) {
          info.v_certificateNumber = window.$native.aesEncrypt(
            info.v_certificateNumber,
            this.encKey
          );
        }

        info.status = 2;
        json = new JsonRequest(info);

        $.ajax(url, {
          type: "PUT",
          dataType: "json",
          contentType: "application/json;charset=UTF-8",
          data: JSON.stringify(json),
          async: true,
          timeout: this.timeout,
          beforeSend: (
            jqXHR: JQuery.jqXHR,
            settings: JQuery.AjaxSettings<any>
          ) => {
            //console.log("headers:", settings.headers);
          },
          error: (
            jqXHR: JQuery.jqXHR,
            textStatus: JQuery.Ajax.ErrorTextStatus,
            errorThrown: string
          ) => {
            //console.log(`error: ${textStatus}`, jqXHR);
            reject(new WebError(jqXHR, textStatus, errorThrown));
          },
          success: (
            data: any,
            textStatus: JQuery.Ajax.SuccessTextStatus,
            jqXHR: JQuery.jqXHR
          ) => {
            let resp: JsonResponse = new JsonResponse();

            if (resp.from(data)) {
              resolve(resp);
            } else {
              reject("响应格式不正确!");
            }
          }
        });
      }
    );

    return promise;
  }

  /**
   * 更新访客信息 (预约来访)
   * @param info
   */
  public updateVisitor(info: FullVisitorInfo): Promise<JsonResponse> {
    let promise: Promise<JsonResponse>;

    promise = new Promise<JsonResponse>(
      (resolve: Resolve<JsonResponse>, reject: Reject) => {
        let url: string;
        let json: JsonRequest;

        url = `http://${this.host}:${this.port
          }/CardSolution/visitorcenter/updateVisitor`;

        if (this.$boxInfo && this.$boxInfo.boxId) {
          info.v_box = this.$boxInfo.boxId;
        }

        if (info.v_certificateNumber) {
          info.v_certificateNumber = window.$native.aesEncrypt(
            info.v_certificateNumber,
            this.encKey
          );
        }

        json = new JsonRequest(info);

        $.ajax(url, {
          type: "POST",
          dataType: "json",
          contentType: "application/json;charset=UTF-8",
          data: JSON.stringify(json),
          async: true,
          timeout: this.timeout,
          beforeSend: (
            jqXHR: JQuery.jqXHR,
            settings: JQuery.AjaxSettings<any>
          ) => {
            //console.log("headers:", settings.headers);
          },
          error: (
            jqXHR: JQuery.jqXHR,
            textStatus: JQuery.Ajax.ErrorTextStatus,
            errorThrown: string
          ) => {
            //console.log(`error: ${textStatus}`, jqXHR);
            reject(new WebError(jqXHR, textStatus, errorThrown));
          },
          success: (
            data: any,
            textStatus: JQuery.Ajax.SuccessTextStatus,
            jqXHR: JQuery.jqXHR
          ) => {
            let resp: JsonResponse = new JsonResponse();

            if (resp.from(data)) {
              resolve(resp);
            } else {
              reject("响应格式不正确!");
            }
          }
        });
      }
    );

    return promise;
  }

  /**
   * 签离访客
   * @param code 通行码
   * @param inviteCode 邀请码
   * @param cardType 证件类型
   * @param cardNum 证件号码明文
   */
  public leaveVisitor(
    code?: string,
    inviteCode?: string,
    cardType?: CardType,
    cardNum?: string
  ): Promise<JsonResponse> {
    let promise: Promise<JsonResponse>;

    promise = new Promise<JsonResponse>(
      (resolve: Resolve<JsonResponse>, reject: Reject) => {
        let url: string;
        let json: JsonRequest;
        let info: any = new Object();

        url = `http://${this.host}:${this.port
          }/CardSolution/visitorcenter/leaveVisitor`;

        if (this.$boxInfo && this.$boxInfo.boxId) {
          info.boxId = this.$boxInfo.boxId;
        } else {
          info.boxId = 0;
        }

        if (code) info.code = btoa(code);

        if (inviteCode) info.inviteCode = btoa(inviteCode);

        if (cardType && cardNum) {
          info.certificateType = cardType;
          info.certificateNumber = window.$native.aesEncrypt(
            btoa(cardNum),
            this.encKey
          );
        }

        json = new JsonRequest(info);

        $.ajax(url, {
          type: "POST",
          dataType: "json",
          contentType: "application/json;charset=UTF-8",
          data: JSON.stringify(json),
          async: true,
          timeout: this.timeout,
          beforeSend: (
            jqXHR: JQuery.jqXHR,
            settings: JQuery.AjaxSettings<any>
          ) => {
            //console.log("headers:", settings.headers);
          },
          error: (
            jqXHR: JQuery.jqXHR,
            textStatus: JQuery.Ajax.ErrorTextStatus,
            errorThrown: string
          ) => {
            //console.log(`error: ${textStatus}`, jqXHR);
            reject(new WebError(jqXHR, textStatus, errorThrown));
          },
          success: (
            data: any,
            textStatus: JQuery.Ajax.SuccessTextStatus,
            jqXHR: JQuery.jqXHR
          ) => {
            let resp: JsonResponse = new JsonResponse();

            if (resp.from(data)) {
              resolve(resp);
            } else {
              reject("响应格式不正确!");
            }
          }
        });
      }
    );

    return promise;
  }
}

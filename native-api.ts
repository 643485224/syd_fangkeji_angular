import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { Observer } from "rxjs/Observer";
import { Subscription } from "rxjs";
import { Resolve, Reject } from "../../app/models";
import { init } from "./cordova";

export class PrintRequest {
  Id: number = 0;
  Title: string = "来访登记单";
  Name: string = "";
  Sex: string = "";
  Folk: string = "";
  Mobile: string = "";
  Reason: string = "";
  Company: string = "";
  CardNum: string = "";
  Interviewee: string = "";
  Department: string = "";
  Time: string = "";
  RegCode: string = "";
  Code: string = "";
  Bitmap: string = "";
  Bitmap2: string = "";
}

export class ReadPpRequest {
  //护照号
  sn: string;
  //出生日期
  birth: string;
  //有效日期
  expiry: string;
}

export interface IdCardInfo {
  Name?: string;
  Sex?: string;
  Folk?: string;
  Address?: string;
  Birth?: string;
  Department?: string;
  Effect?: string;
  Expire?: string;
  Head?: string;
  IdNo?: string;
  Uid?: string;
}

export interface TaskResult {
  Id: number;
  Code: number;
  Data: number;
  Result: number;
  Payload: any;
}

export interface OcrResult {
  result?: number;
  type?: number;
  picture?: string;
  content?: object | string;
}

export class OcrIdcardInfo {
  Name?: string;
  Num?: string;
  Sex?: string;
  Birt?: string;
  Addr?: string;
  Folk?: string;
  Type?: string;

  public static isSuccess($this: any): boolean {
    if ('Num' in $this && $this.Num) return true;
    return false;
  }
}

export class OcrPpInfo {
  Name?: string;
  NameCh?: string;
  EnFir?: string;
  EnSen?: string;
  NameFir?: string;
  NameSen?: string;
  CardNo?: string;
  Sex?: string;
  SexCH?: string;
  Birthday?: string;
  Address?: string;
  AddressCH?: string;
  IssueDate?: string;
  ValidPeriod?: string;
  Nation?: string;
  IssueAddress?: string;
  IssueAddressCH?: string;
  personalNo?: string;
  MRZ?: string;
  BIDC_MRZ1?: string;
  BIDC_MRZ2?: string;

  public static isSuccess($this: any): boolean {
    if ('CardNo' in $this && $this.CardNo) return true;
    return false;
  }
}

export class OcrDrivingCardInfo {
  Name?: string;
  CardNo?: string;
  Sex?: string;
  Address?: string;
  IssueDate?: string;
  ValidPeriod?: string;
  Nation?: string;
  DrivingType?: string;
  RegisterDate?: string;

  public static isSuccess($this: any): boolean {
    if ('CardNo' in $this && $this.CardNo) return true;
    return false;
  }
}

export class ReadPpInfo {
  ResCode: number;
  DG11_Addr: string;
  DG11_Birth: string;
  DG11_BirthPlace: string;
  DG11_Job: string;
  DG11_LocalName: string;
  DG11_Monitoring: string;
  DG11_Number: string;
  DG11_OtherNumber: string;
  DG11_Phone: string;
  DG11_Resume: string;
  DG11_Title: string;
  DG12_Date: string;
  DG12_Endorsement_Opinion: string;
  DG12_IssuingAgency: string;
  DG12_OtherPeople: string;
  DG12_PeopleDeviceNumber: string;
  DG12_Tax_Exit_Requirements: string;
  DG12_Time: string;
  DG16_Addr: string;
  DG16_Date: string;
  DG16_Name: string;
  DG16_Peoples: string;
  DG16_Phone: string;
  DG1_Birth: string;
  DG1_BirthCheck: string;
  DG1_CardType: string;
  DG1_Check: string;
  DG1_Country: string;
  DG1_CountryIssue: string;
  DG1_Effective: string;
  DG1_EffectiveCheck: string;
  DG1_Name: string;
  DG1_Number: string;
  DG1_NumberCheck: string;
  DG1_SelectiveData: string;
  DG1_SelectiveDataCheck: string;
  DG1_Sex: "M" | "F";
  OCR_DateBirth: string;
  OCR_EnName: string;
  OCR_ExpirationDate: string;
  OCR_Issuing: string;
  OCR_Monitoring: string;
  OCR_Name: string;
  OCR_Nationality: string;
  OCR_Num: string;
  OCR_Sex: string;
  time: number;

  public static isSuccess($this: any): boolean {
    if ('ResCode' in $this) {
      return $this.ResCode >= 0;
    } else {
      return false;
    }
  }
}

export class ReadPpResult {
  Info?: ReadPpInfo;
  BmpHead?: string;

  public static isSuccess($this: any): boolean {
    if ('Info' in $this) {
      return ReadPpInfo.isSuccess($this.Info);
    } else {
      return false;
    }
  }
}

export interface AndroidEvent {
  Code: number;
  State: number;
  Data: number;
  Param1?: string;
  Param2?: string;
}

interface SuccessPackage {
  STX: number;
  ADDR: number;
  LEN: number;
  PMT: number;
  CM: number;
  PM: number;
  st0: number;
  st1: number;
  st2: number;
  DATA: number[];
  ETX: number;
  BCC: number;
}

interface ErrorPackage {
  STX: number;
  ADDR: number;
  LEN: number;
  EMT: number;
  CM: number;
  PM: number;
  e1: number;
  e0: number;
  DATA: number[];
  ETX: number;
  BCC: number;
}

export interface CardResponse {
  success?: SuccessPackage;
  error?: ErrorPackage;
  isError: boolean;
  result: number;
}

export enum TaskCode {
  TASK_TEST = 100,
  TASK_PRINT_TEST = 101,
  TASK_PRINT_FORM = 102,
  TASK_TEST_EXCEL = 103,
  TASK_EXPORT_TPL = 104,
  TASK_IMPORT_STAFF = 105,
  TASK_EXPORT_STAFF = 106,
  TASK_SAVE_PICTURE = 107,
  TASK_LOAD_PICTURE = 108,
  TASK_PRINT_TEST_FORM_MUL = 110,
  TASK_PRINT_TEST_MUL = 111,
  TASK_PRINT_FORM_BY_SN = 112,
  TASK_PRINT_TEXT_BY_SN = 113,
  TASK_GET_PRINTER_LIST = 114,
  TASK_CAPTURE_OCR_CAM = 115,
  TASK_CARD_OPERATION = 119,
  TASK_START_ACT_FACE = 201,
  TASK_START_OCR = 301,
  TASK_READ_PP = 302
}

export enum EventCode {
  EVENT_FIND_FACE = 1,
  EVENT_SCAN_CODE = 2
}

@Injectable()
export class NativeApiProvider {
  private taskId: number = 1;
  private svrIdCard: Observable<IdCardInfo> = null;
  private svrTask: Observable<TaskResult> = null;
  private svrEvent: Observable<AndroidEvent> = null;
  private obsIdCard: Observer<IdCardInfo> = null;
  private obsTask: Observer<TaskResult> = null;
  private obsEvent: Observer<AndroidEvent> = null;

  constructor() {
    try {
      this.createObservable();
      init();
    } catch (error) {
      console.error(error);
    }

    try {
      if (!window.$web) window.$web = new Object();

      window.$web.onGetIdCard = this.onGetIdCard.bind(this);
      window.$web.onTaskComplete = this.onTaskComplete.bind(this);
      window.$web.onEvent = this.onEvent.bind(this);
    } catch (error) {
      console.error(error);
    }
  }

  private createObservable() {
    this.svrIdCard = Observable.create((observer: Observer<IdCardInfo>) => {
      this.obsIdCard = observer;
    });

    this.svrTask = Observable.create((observer: Observer<TaskResult>) => {
      this.obsTask = observer;
    });

    this.svrEvent = Observable.create((observer: Observer<AndroidEvent>) => {
      this.obsEvent = observer;
    });
  }

  protected onGetIdCard(data: IdCardInfo): string {
    try {
      console.log("onGetIdCard:", data);

      if (this.obsIdCard && data && "Head" in data && "IdNo" in data) {
        this.obsIdCard.next(data);
        return String(0);
      }
    } catch (error) {
      console.error(error);
      return String(-1);
    }

    return String(1);
  }

  protected onTaskComplete(data: TaskResult): string {
    try {
      console.log("onTaskComplete:", data);

      if (this.obsTask && data && "Id" in data && "Code" in data) {
        this.obsTask.next(data);
        return String(0);
      }
    } catch (err) {
      console.error(err);
      return String(-1);
    }

    return String(1);
  }

  protected onEvent(event: AndroidEvent): string {
    try {
      console.log("onEvent:", event);

      if (
        this.obsEvent &&
        event &&
        "Code" in event &&
        "State" in event &&
        "Data" in event
      ) {
        this.obsEvent.next(event);
        return String(0);
      }
    } catch (err) {
      console.error(err);
      return String(-1);
    }

    return String(1);
  }

  /**
   * 订阅二代证
   */
  public subscribe_IdCard(): Observable<IdCardInfo> {
    let source: Observable<IdCardInfo> = Observable.create(
      (observer: Observer<IdCardInfo>) => {
        this.svrIdCard.subscribe(observer);
      }
    );

    return source;
  }

  /**
   * 任务
   */
  public subscribe_Task(): Observable<TaskResult> {
    let source: Observable<TaskResult> = Observable.create(
      (observer: Observer<TaskResult>) => {
        this.svrTask.subscribe(observer);
      }
    );

    return source;
  }

  /**
   * 事件
   */
  public subscribe_Event(): Observable<AndroidEvent> {
    let source: Observable<AndroidEvent> = Observable.create(
      (observer: Observer<AndroidEvent>) => {
        this.svrEvent.subscribe(observer);
      }
    );

    return source;
  }

  public loaded() {
    if (window.$native) {
      window.$native.onLoad();
    }
  }

  public getConfig(key: string): string {
    if (window.$native) {
      return window.$native.getConfig(key, "");
    }

    return null;
  }

  public setConfig(key: string, value: string): number {
    if (window.$native) {
      return window.$native.setConfig(key, value);
    }

    return -100;
  }

  public execTask(
    code: TaskCode,
    data: number,
    param1?: string,
    param2?: string,
    timeout?: number
  ): Promise<TaskResult> {
    if (!window.$native) return null;
    if (!param1) param1 = "";
    if (!param2) param2 = "";

    let result: Promise<TaskResult>;

    result = new Promise<TaskResult>(
      (resolve: Resolve<TaskResult>, reject: Reject) => {
        let id: number = null;
        let subscription: Subscription = null;
        let timer: number = null;

        id = this.taskId;
        this.taskId++;

        subscription = this.subscribe_Task().subscribe((value: TaskResult) => {
          if (value.Id === id) {
            if (timer) {
              clearTimeout(timer);
              timer = null;
            }

            subscription.unsubscribe();
            resolve(value);
          }
        });

        if (timeout) {
          timer = window.setTimeout(() => {
            timer = null;
            subscription.unsubscribe();
            reject("timeout");
          }, timeout);
        }

        window.$native.exec(id, code, data, param1, param2);
      }
    );

    return result;
  }

  public exit(mode: number) {
    if (window.$native) {
      window.$native.exit(mode);
    }
  }

  public beep() {
    if (window.$native) {
      window.$native.beep();
    }
  }

  public async printForm(request: PrintRequest): Promise<TaskResult> {
    let style: number = 0;

    if (!request) return;

    try {
      style = Number(this.getConfig("form_style"));
    } catch (err) {
      console.error(err);
    }

    await this.execTask(
      TaskCode.TASK_PRINT_FORM,
      style,
      JSON.stringify(request),
      ""
    );
  }

  public async Ocr(type: number): Promise<OcrResult> {
    if (!window.$native) return null;

    let result: TaskResult;

    try {
      result = await this.execTask(TaskCode.TASK_START_OCR, type, "", "", 5000);

      if (result.Result === 0) return JSON.parse(result.Payload);
    } catch (err) {
      console.error(err);
    }

    return null;
  }

  public async GetPrinterList(): Promise<string[]> {
    if (!window.$native) return null;

    let result: TaskResult;

    try {
      result = await this.execTask(TaskCode.TASK_GET_PRINTER_LIST, 0);

      if (result.Result === 0) return JSON.parse(result.Payload);
    } catch (err) {
      console.error(err);
    }

    return null;
  }

  public async CardOperation(data: number, param1?: string, param2?: string, timeout?: number): Promise<CardResponse> {
    if (!window.$native) return null;

    let result: TaskResult;

    try {
      timeout = timeout || 10000;
      result = await this.execTask(TaskCode.TASK_CARD_OPERATION, data, param1, param2, timeout);

      if (result.Result === 0 && result.Payload) return result.Payload;
    } catch (err) {
      console.error(err);
    }

    return null;
  }
}

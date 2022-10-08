import { Resolve, Reject } from "./models";

export function clone(src: any): any {
  let target: any = {};

  if (!src) return null;

  for (const prop in src) {
    if (src.hasOwnProperty(prop)) {
      target[prop] = src[prop];
    }
  }

  return target;
}

export function getBool(strBool: string): boolean {
  switch (strBool) {
    case "true":
    case "1":
      return true;
    default:
      return false;
  }
}

export function formatChsText(date: Date): string {
  let strYears: string;
  let strMonth: string;
  let strDays: string;
  let strHours: string;
  let strMinutes: string;
  let strSeconds: string;

  strYears = date.getFullYear().toString();

  strMonth =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1).toString()
      : (date.getMonth() + 1).toString();

  strDays =
    date.getDate() < 10
      ? "0" + date.getDate().toString()
      : date.getDate().toString();

  strHours =
    date.getHours() < 10
      ? "0" + date.getHours().toString()
      : date.getHours().toString();

  strMinutes =
    date.getMinutes() < 10
      ? "0" + date.getMinutes().toString()
      : date.getMinutes().toString();

  strSeconds =
    date.getSeconds() < 10
      ? "0" + date.getSeconds().toString()
      : date.getSeconds().toString();

  return (
    strYears +
    "年" +
    strMonth +
    "月" +
    strDays +
    "日 " +
    strHours +
    ":" +
    strMinutes +
    ":" +
    strSeconds
  );
}

export function formatNormal(date: Date): string {
  let tzoffset: number = date.getTimezoneOffset() * 60000; //offset in milliseconds
  return new Date(date.valueOf() - tzoffset)
    .toISOString()
    .slice(0, -1)
    .substr(0, 19)
    .replace(/T/, " ");
}

export function getNowDate(): string {
  let date: Date = new Date();

  return new Date(Date.now() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, -1)
    .substr(0, 19)
    .replace(/-/g, "")
    .replace(/T/g, "")
    .replace(/:/g, "");
}

export async function sleep(ms: number): Promise<any> {
  let promise: Promise<any>;

  promise = new Promise<any>((resolve: Resolve<any>, reject: Reject) => {
    window.setTimeout(() => {
      resolve(true);
    }, ms);
  });

  return promise;
}

export function getSexNum(strSex: string): 0 | 1 | 2 {
  switch (strSex) {
    case "男":
    case "M":
      return 1;
    case "女":
    case "F":
      return 2;
    default:
      return 0;
  }
}

export function getSexNumEx(obj: any, field: string): number {
  let f: any;

  if (!obj) return 0;
  if (!(field in obj)) return 0;

  f = obj[field];

  if (typeof f === "number") {
    if (f === 1) return 1;
    else if (f === 2) return 2;
  } else if (typeof f === "string") {
    f = f.trim();

    if (f === "男" || f === "M") return 1;
    if (f === "女" || f === "F") return 2;
  }

  return 0;
}

export function getCode(): string {
  let date: Date = new Date();

  return date.getTime().toString();
}

export function getDateNumber(strDate: string): number | null {
  let reg: RegExp = new RegExp(/^\d{8}$/);
  let date: Date;

  if (reg.test(strDate)) {
    let strY: string, strM: string, strD: string;

    strY = strDate.substr(0, 4);
    strM = strDate.substr(4, 2);
    strD = strDate.substr(6, 2);

    date = new Date(Number(strY), Number(strM) - 1, Number(strD));
    return date.getTime();
  }

  return null;
}

export function getSexStr(numSex: number): string {
  switch (numSex) {
    case 1:
      return "男";
    case 2:
      return "女";
    default:
      return "未知";
  }
}

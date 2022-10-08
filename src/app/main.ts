import { isDevMode, enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import $ from "jquery";
import FastClick from "fastclick";
import { AppModule } from './app.module';
import "hammerjs";
//安卓层服务支持
interface AndroidService {
  //web页面已载入的回调
  onLoad(): void;

  //页面加载错误时调用
  onError(error: string): void;

  //重绘视图
  invalidate(): void;

  //获取人脸服务状态
  getFaceServiceState(): number;

  //获取特征
  getFeature(data: string): string;

  //脸部比较 (位图)
  bmpCompare(data1: string, data2: string): number;

  //脸部比较
  faceCompare(feature1: string, feature2: string): number;

  //解析图片中的二维码
  parsePicture(bmp: string): string;

  //打印表单
  printForm(data: string): number;

  //打印测试
  printTest(): number;

  //弹出文本
  toast(text: string): void;

  //获取硬件信息
  getInfo(): string;

  //播放哔
  beep(): number;

  //退出进程
  exit(mode: number);

  //获取参数
  getConfig(key: string, defValue: string): string;

  //设置参数
  setConfig(key: string, value: string): number;

  //推送任务 (异步)
  exec(id: number, code: number, data: number, param1: string, param2: string);

  // sha256 return hex str
  sha256hex(val: string): string;

  // sha256 return base64 str
  sha256b64(val: string): string;

  // aes加密
  aesEncrypt(b64data: string, key: string): string;

  // aes解密
  aesDecrypt(b64data: string, key: string): string;
}

interface VConsole {
  constructor(arg?: any);

  readonly version: string;
  option: any;
  $dom: HTMLDivElement;

  showSwitch();
  hideSwitch();
  show();
  hide();
  destroy();
}

interface Base64 {
  encode(input: string): string;
  decode(input: string): string;
  _utf8_encode(input: string): string;
  _utf8_decode(input: string): string;
}

declare global {
  interface Window {
    readonly VConsole?: any;
    readonly $native?: AndroidService;
    readonly $base64?: Base64;
    readonly IonicDevServer?: any;
    $isDevMode: boolean;
    $runInDevMode: boolean;
    $web: any;
    $test: any;
    $console: VConsole;
  }
}

declare var TYPEORM_VERSION: any;
declare var IONIC_VERSION: any;
declare var APP_SCRIPTS_VERSION: any;
declare var BUILD_TIME: any;
declare var IS_DEV_MODE: boolean;

try {
  if (TYPEORM_VERSION) {
    console.log("TypeORM Version:", TYPEORM_VERSION);
  }

  if (IONIC_VERSION) {
    console.log("Ionic Version:", IONIC_VERSION);
  }

  if (APP_SCRIPTS_VERSION) {
    console.log("Ionic App Scripts Version:", APP_SCRIPTS_VERSION);
  }

  if (BUILD_TIME) {
    console.log("Build Time:", BUILD_TIME);
  }

  if (IS_DEV_MODE === false) {
    console.log("compile on prod mode!");
  } else if (IS_DEV_MODE === true) {
    console.log("compile on dev mode!");
  }

  //enableProdMode();

  window.$web = window.$web || {};
  window.$test = window.$test || {};
  window.$isDevMode = IS_DEV_MODE;

  /*
  $(() => {
    let fc: FastClickStatic = <any>FastClick;

    if (fc && fc.attach) {
      fc.attach(document.body);
    }
  });
  */
} catch (err) {
  console.error(err);
}

platformBrowserDynamic().bootstrapModule(AppModule);

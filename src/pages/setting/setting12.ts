import { Component, ApplicationRef, NgZone, ViewChild } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import {
  NativeApiProvider, TaskCode
} from "../../providers/native-api/native-api";
import { GlobalProvider } from "../../providers/global/global";
import { getBool } from '../../app/common';
import { PickerController } from "ionic-angular/components/picker/picker-controller";
import { PickerColumn } from "ionic-angular/components/picker/picker-options";
@Component({
  selector: "page-setting12",
  templateUrl: "setting12.html"
})
export class Setting12Page {
  constructor(
    public appRef: ApplicationRef,
    public zone: NgZone,
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public nativeApi: NativeApiProvider,
    public pickerCtrl: PickerController
  ) { }
  protected CRT591:boolean = false;
  protected com :string = "";
  private timer: number = null;
  protected enable_onsite: boolean = true;
  protected enable_visitor: boolean = true;
  protected enable_commonlogo: boolean = true;
  protected enable_print: boolean = true;
  protected field_phone: boolean = true;
  protected field_reason: boolean = true;
  protected field_platenum: boolean = true;
  protected field_company: boolean = true;
  protected Task: Array<any> = [];
  protected pickerVal: string = '';
  protected restartTime: string = "";
  protected columnData: any[] = [
    { name: '周一', code: 1 },
    { name: '周二', code: 2 },
    { name: '周三', code: 3 },
    { name: '周四', code: 4 },
    { name: '周五', code: 5 },
    { name: '周六', code: 6 },
    { name: '周日', code: 0 },
  ]
  protected code: any;
  protected enable_restart: boolean = true;
  protected enable_undocumented: boolean = false;
  protected enable_temperature: boolean = false;
  protected enable_SYD_K3A:boolean = false;
  ionViewDidLoad() {
    this.enable_onsite = this.globalSvr.enable_onsite = getBool(this.nativeApi.getConfig("enable_onsite"));
    this.enable_print = this.globalSvr.enable_print = getBool(this.nativeApi.getConfig("enable_print"));
    this.enable_visitor = this.globalSvr.enable_visitor = getBool(this.nativeApi.getConfig("enable_visitor"));
    this.field_phone = this.globalSvr.field_phone = getBool(this.nativeApi.getConfig("field_phone"));
    this.field_reason = this.globalSvr.field_reason = getBool(this.nativeApi.getConfig("field_reason"));
    this.field_platenum = this.globalSvr.field_platenum = getBool(this.nativeApi.getConfig("field_platenum"));
    this.enable_commonlogo = this.globalSvr.enable_commonlogo = getBool(this.nativeApi.getConfig("enable_commonlogo"));
    this.field_company = this.globalSvr.field_company = getBool(this.nativeApi.getConfig("field_company"));
    this.Task = this.globalSvr.Task = JSON.parse(this.nativeApi.getConfig("Task"));
    this.enable_restart = this.globalSvr.enable_restart = getBool(this.nativeApi.getConfig("enable_restart"));
    this.enable_undocumented = this.globalSvr.enable_undocumented = getBool(this.nativeApi.getConfig("enable_undocumented"));
    this.enable_temperature = this.globalSvr.enable_temperature = getBool(this.nativeApi.getConfig("enable_temperature"));
    this.enable_SYD_K3A = this.globalSvr.enable_SYD_K3A = getBool(this.nativeApi.getConfig("SYD-K3A"));
    this.com = this.globalSvr.com = this.nativeApi.getConfig("com");
    this.CRT591 = this.globalSvr.CRT591 = getBool(this.nativeApi.getConfig("CRT591"));
  }
  protected onReason() {
    if (this.restartTime == "") {
      this.globalSvr.showAlert("警告", "不能为空!");
    } else {
      this.Task.push({ "id": this.code, "endTime": this.restartTime, "week": this.pickerVal })
    }
  }
  protected openPickerCard() {
    this.openPicker(this.pickerVal, (val: any) => {
      console.log(val);
      console.log(val.data.value);
      this.pickerVal = val.data.text;
      this.code = val.data.value;
    })
  }
  async openPicker(defaultval?: string, okBackFun?: any) {
    const picker = await this.pickerCtrl.create({
      columns: this.generateColumns(defaultval),
      buttons: [
        { text: 'CANCEL', role: 'cancel' },
        {
          text: 'DONE', handler: (value) => {
            okBackFun && okBackFun(value);
          }
        }]
    })
    picker.present();
  }
  private generateColumns(defaultval?: string): PickerColumn[] {
    const columns = [];
    const pickerCol: PickerColumn = {
      name: 'data',
      options: this.columnData.map(province => ({ text: province.name, value: province.code, disabled: false, duration: 100 }))
    };
    let Index = this.columnData.findIndex(option => option.name === defaultval);
    pickerCol.selectedIndex = Index === -1 ? 0 : Index;
    columns.push(pickerCol);
    return columns;
  }
  protected async onRemove(subscript) {
    let bool: boolean;
    bool = await this.globalSvr.showConfirm("警告", "确认要删除！");
    // console.log("点击了");
    if (bool) {
      let array = this.Task
      console.log("array", array);
      console.log("this.Task", this.Task);

      for (let index = 0; index < array.length; index++) {
        if (subscript == index) {
          array.splice(index, 1)
        } else {

        }
      }
    }
  }
  private createTimer() {
    if (this.timer) return;

    this.timer = window.setInterval(async () => {
      if (this.timer && this.globalSvr.checkTimeout()) {
        this.navCtrl.popToRoot();
        this.cleanTimer();
      }
    }, 1000);
  }

  private cleanTimer() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  ionViewDidEnter() {
    this.createTimer();
  }

  ionViewDidLeave() {
    this.cleanTimer();
  }

  protected onSave(event: any) {
    this.globalSvr.enable_onsite = this.enable_onsite;
    this.globalSvr.enable_print = this.enable_print;
    this.globalSvr.enable_visitor = this.enable_visitor;
    this.globalSvr.field_phone = this.field_phone;
    this.globalSvr.field_reason = this.field_reason;
    this.globalSvr.field_platenum = this.field_platenum;
    this.globalSvr.field_company = this.field_company;
    this.globalSvr.enable_commonlogo = this.enable_commonlogo;
    this.globalSvr.Task = this.Task;
    this.globalSvr.enable_restart = this.enable_restart;
    this.globalSvr.enable_undocumented = this.enable_undocumented;
    this.globalSvr.enable_temperature = this.enable_temperature;
    this.globalSvr.enable_SYD_K3A = this.enable_SYD_K3A;
    this.globalSvr.com = this.com;
    this.globalSvr.CRT591 = this.CRT591;
    
    this.nativeApi.setConfig("CRT591", String(this.CRT591));
    this.nativeApi.setConfig("com", String(this.com));
    this.nativeApi.setConfig("enable_visitor", String(this.enable_visitor));
    this.nativeApi.setConfig("enable_onsite", String(this.enable_onsite));
    this.nativeApi.setConfig("enable_print", String(this.enable_print));
    this.nativeApi.setConfig("field_phone", String(this.field_phone));
    this.nativeApi.setConfig("field_reason", String(this.field_reason));
    this.nativeApi.setConfig("field_platenum", String(this.field_platenum));
    this.nativeApi.setConfig("field_company", String(this.field_company));
    this.nativeApi.setConfig("enable_commonlogo", String(this.enable_commonlogo));
    this.nativeApi.setConfig("Task", JSON.stringify(this.Task));
    this.nativeApi.setConfig("enable_restart", String(this.enable_restart))
    this.nativeApi.setConfig("enable_undocumented", String(this.enable_undocumented))
    this.nativeApi.setConfig("enable_temperature", String(this.enable_temperature))
    this.nativeApi.setConfig("SYD-K3A", String(this.enable_SYD_K3A))

    // if( this.globalSvr.enable_commonlogo){
    //   this.nativeApi.execTask( TaskCode.TASK_COMMONLOGO,1,"","");
    // }  else{
    //   this.nativeApi.execTask( TaskCode.TASK_COMMONLOGO,0,"","");
    // }
    this.navCtrl.pop();
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}

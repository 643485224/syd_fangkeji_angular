import { Component } from "@angular/core";
import { Platform } from "ionic-angular";
import { HomePage } from "../pages/home/home";
import { NativeApiProvider } from "../providers/native-api/native-api";

@Component({
  templateUrl: "app.html"
})
export class MyApp {
  protected rootPage: any = HomePage;

  constructor(platform: Platform, public nativeApi: NativeApiProvider) {
    platform.ready().then(() => {
      try {
        this.nativeApi.loaded();
      } catch (err) {
        console.error(err);
      }
    });
  }
}

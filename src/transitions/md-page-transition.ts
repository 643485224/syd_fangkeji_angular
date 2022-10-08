import { Animation, PageTransition } from 'ionic-angular';

const SHOW_BACK_BTN_CSS = 'show-back-button';
export class FadeTansition extends PageTransition {
  init() {
    super.init();
    const plt = this.plt;
    const enteringView = this.enteringView;
    const leavingView = this.leavingView;
    const opts = this.opts;

    // what direction is the transition going
    const backDirection = opts.direction === 'back';

    if (enteringView) {
      if (backDirection) {
        this.duration(50);
      } else {
        this.duration(50);
        this.enteringPage.fromTo('opacity', 0, 1, true);
      }

      if (enteringView.hasNavbar()) {
        const enteringPageEle: Element = enteringView.pageRef().nativeElement;
        const enteringNavbarEle: Element = enteringPageEle.querySelector(
          'ion-navbar'
        );

        const enteringNavBar = new Animation(plt, enteringNavbarEle);
        this.add(enteringNavBar);

        const enteringBackButton = new Animation(
          plt,
          enteringNavbarEle.querySelector('.back-button')
        );
        this.add(enteringBackButton);
        if (enteringView.enableBack()) {
          enteringBackButton.beforeAddClass(SHOW_BACK_BTN_CSS);
        } else {
          enteringBackButton.beforeRemoveClass(SHOW_BACK_BTN_CSS);
        }
      }
    }

    // setup leaving view
    if (leavingView && backDirection) {
      // leaving content
      this.duration(50);
      const leavingPage = new Animation(plt, leavingView.pageRef());
      this.add(leavingPage.fromTo('opacity', 1, 0));
    }
  }
}

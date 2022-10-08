try {
  if (window.$native && VConsole) {
    var test = window.$native.getConfig("debug_mode", "");

    switch (test) {
      case "true":
      case "1":
        window.$console = new VConsole({
          maxLogNumber: 2000,
          onReady: function () {
            if (window.$console && window.$console.hideSwitch) {
              window.$console.hideSwitch();
            } else {
              var t = null;

              t = window.setInterval(function () {
                if (window.$console) {
                  window.clearInterval(t);
                  t = null;

                  window.$console.hideSwitch();
                }
              }, 1);
            }
          }
        });
        break;
    }
  }


} catch (err) {
  console.error("init vConsole error", err);
}

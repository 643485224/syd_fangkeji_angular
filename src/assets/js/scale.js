var viewport = document.querySelector("meta[name=viewport]");
var width = window.screen.width;
var scale = 1.0;

if (width >= 1024 && width < 1366) {
  scale = 0.72;
} else if (width >= 1366 && width < 1440) {
  scale = 0.8;
}

if (viewport) {
  var content = "";

  content += 'width=device-width, initial-scale=';
  content += scale.toString();
  content += ', minimum-scale=0.5, maximum-scale=2.0, user-scalable=no';
  viewport.setAttribute('content', content);
}

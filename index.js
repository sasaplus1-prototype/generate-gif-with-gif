(function(){

  'use strict';

  var gifImage = document.getElementById('js-gif-image'),
      generate = document.getElementById('js-generate'),
      abort = document.getElementById('js-abort'),
      delay = document.getElementById('js-delay'),
      state = document.getElementById('js-state');

  var images;

  Promise
    .all(
      (function(){
        var promises = [],
            i, len;

        for (i = 1, len = 406 + 1; i < len; ++i) {
          promises.push(new Promise(function(resolve, reject) {
            var name, image;

            name = 'images/' + ('00' + i).slice(-3) + '.jpg';

            image = new Image();

            image.onabort = reject;
            image.onerror = reject;
            image.onload = function() {
              resolve(image);
            };
            image.src = name;

            if (image.naturalWidth) {
              resolve(image);
            }
          }));
        }

        return promises;
      }())
    )
    .then(function(results) {
      images = results;

      generate.disabled = false;
    })
    ['catch'](function(err) {
      state.innerHTML = err;
    });

  generate.addEventListener('click', function() {
    var gif, i, len;

    gif = new GIF({
      workers: 2,
      quality: 10
    });

    abort.onclick = function() {
      gif.abort();
    };

    for (i = 0, len = images.length; i < len; ++i) {
      gif.addFrame(images[i], {
        delay: parseFloat(delay.value)
      });
    }

    gif.on('start', function() {
      state.innerHTML = 'start';
    });

    gif.on('progress', function(frame) {
      state.innerHTML = 'progress: ' + frame;
    });

    gif.on('abort', function() {
      state.innerHTML = 'abort';
    });

    gif.on('finished', function(blob, data) {
      console.log(blob);
      console.log(data);

      abort.onclick = function() {};

      gifImage.src = URL.createObjectURL(blob);

      state.innerHTML = 'finished';
    });

    gif.render();
  }, false);

}());

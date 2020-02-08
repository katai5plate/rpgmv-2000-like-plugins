/*:
 * @plugindesc MV で 2000 する: コア
 * @author Had2Apps
 *
 * @help H2A_2K 系プラグインを使用する為に最初に読み込む必要があるプラグインです
 */

(function() {
  "use strict";

  // プラグイン共通ユーティリティ
  var r2k = {
    chunk: function(arr, size) {
      return Array.from(
        {
          length: Math.ceil(arr.length / size)
        },
        function(_, i) {
          return arr.slice(i * size, i * size + size);
        }
      );
    },
    asyncGetPellete: function(bitmap) {
      return new Promise(function(resolve, reject) {
        fetch(bitmap._image.src)
          .then(function(x) {
            return x.arrayBuffer();
          })
          .then(function(x) {
            try {
              resolve(
                r2k.chunk(
                  String.fromCharCode
                    .apply(null, Array.from(new Uint8Array(x)))
                    .match(/PLTE(.*?)IDAT/)[1]
                    .split("")
                    .map(char => char.charCodeAt(0)),
                  3
                )
              );
            } catch (e) {
              console.warn(
                "パレット情報を取得できませんでした。",
                e,
                bitmap._image.src
              );
              reject(e);
            }
          });
      });
    }
  };
  window.r2k = r2k;

  // 透過色を透明に置き換える
  Bitmap.prototype.chroma = function(defaultColor, customColor) {
    var that = this;
    var process = function(color) {
      var img = that._context.getImageData(0, 0, that.width, that.height);
      for (var i = 0; i < img.data.length; i += 4) {
        if (img.data.slice(i, i + 3).join() === color.join())
          img.data[i + 3] = 0;
      }
      that._context.putImageData(img, 0, 0);
    };
    if (customColor) {
      process(customColor);
      return;
    }
    // パレット番号 0 番から色を取得
    r2k
      .asyncGetPellete(that)
      .then(x => x[0])
      .then(process)
      .catch(function() {
        process(defaultColor);
      });
  };

  // 左右反転
  Bitmap.prototype.bltReverse = function(
    source,
    sx,
    sy,
    sw,
    sh,
    dx,
    dy,
    dw,
    dh
  ) {
    dw = dw || sw;
    dh = dh || sh;
    if (
      sx >= 0 &&
      sy >= 0 &&
      sw > 0 &&
      sh > 0 &&
      dw > 0 &&
      dh > 0 &&
      sx + sw <= source.width &&
      sy + sh <= source.height
    ) {
      this._context.globalCompositeOperation = "source-over";
      this._context.transform(-1, 0, 0, 1, dw, 0);
      this._context.drawImage(source._canvas, sx, sy, sw, sh, dx, dy, dw, dh);
      this._context.transform(-1, 0, 0, 1, dw, 0);
      this._setDirty();
    }
  };
})();

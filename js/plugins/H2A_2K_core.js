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
    // 配列を分ける
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
    // PNG からパレットを取得する
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
    },
    // 2k_ がついているか？
    is2kPrefix: function(filename, noHead) {
      var sign = noHead ? filename.match(/2k_+/) : filename.match(/^2k_+/);
      return sign && sign[0].contains("2k_");
    },
    // 2k のつく bitmap がロードされた時
    bitmapOnLoadList: [],
    bitmapOnLoads: function(bitmap, path, hue) {
      r2k.bitmapOnLoadList.forEach(function(item) {
        item(bitmap, path, hue);
      });
    },
    // バックスラッシュをスラッシュに変換
    backslash: function(text) {
      return text.replace(/\\/g, "/");
    },
    // 透過フィルター
    ChromaFilter: function(color) {
      var filter = function() {
        /*!
         * @pixi/filter-color-replace - v3.0.3
         * Compiled Fri, 07 Feb 2020 21:26:48 UTC
         *
         * @pixi/filter-color-replace is licensed under the MIT License.
         * http://www.opensource.org/licenses/mit-license
         */
        var vertexShader = [
          "attribute vec2 aVertexPosition;",
          "attribute vec2 aTextureCoord;",
          "uniform mat3 projectionMatrix;",
          "varying vec2 vTextureCoord;",
          "void main(void) {",
          "    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);",
          "    vTextureCoord = aTextureCoord;",
          "}"
        ].join("\n");
        var fragmentShader = [
          "varying vec2 vTextureCoord;",
          "uniform sampler2D uSampler;",
          "uniform vec3 originalColor;",
          "void main(void) {",
          "    vec4 currentColor = texture2D(uSampler, vTextureCoord);",
          "    vec3 colorDiff = originalColor - (currentColor.rgb / max(currentColor.a, 0.0000000001));",
          "    float doReplace = step(length(colorDiff), 0.0);",
          "    gl_FragColor = vec4(mix(currentColor.rgb, vec3(0, 0, 0), doReplace), mix(currentColor.a, 0.0, doReplace));",
          "}"
        ].join("\n");
        PIXI.Filter.call(this, vertexShader, fragmentShader);
        var f32a = new Float32Array(3);
        if (typeof color === "number") {
          PIXI.utils.hex2rgb(color, f32a);
        } else {
          var div = Math.max(color[0], color[1], color[2]) > 1 ? 255 : 1;
          f32a[0] = color[0] / div;
          f32a[1] = color[1] / div;
          f32a[2] = color[2] / div;
        }
        this.uniforms.originalColor = f32a;
      };
      filter.prototype = Object.create(PIXI.Filter.prototype);
      filter.prototype.constructor = filter;
      return filter;
    }
  };
  window.r2k = r2k;

  // ファイル名で判断
  ImageManager.is2kPrefix = r2k.is2kPrefix;

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

  // 画像が読み込まれた時の処理を埋め込む
  ImageManager.loadNormalBitmap = function(path, hue) {
    var key = this._generateCacheKey(path, hue);
    var bitmap = this._imageCache.get(key);
    if (!bitmap) {
      bitmap = Bitmap.load(path);
      this._callCreationHook(bitmap);
      bitmap.addLoadListener(function() {
        bitmap.rotateHue(hue);
        console.log(path);
        if (r2k.is2kPrefix(path, true)) {
          r2k.bitmapOnLoads(bitmap, path, hue);
        }
      });
      this._imageCache.add(key, bitmap);
    } else if (!bitmap.isReady()) {
      bitmap.decode();
    }
    return bitmap;
  };
})();

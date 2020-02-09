/*:
 * @plugindesc MV で 2000 する: チップセット一括変換
 * @author Had2Apps
 *
 * @help 2000 チップセットを MV に一括変換します。
 *
 * 使い方:
 * 1. img/tilesets に 2000 のチップセットを置き、ファイル名の頭に 2k_ をつける
 * 2. このプラグインを有効にして、テストプレイを開始する
 * 3. 指示通りに進めて、上手くいけば img/tilesets に変換素材が保存されます
 *
 * 注意:
 * - くらむぼん氏の RPGツクール2000→MV素材変換器 から一部処理を引用しています。（許諾済）
 *
 * @param chipSize
 * @desc タイルの拡大率(整数): 1 ～ 3
 * @default 3
 *
 * @param autotile
 * @desc オートタイル全パターン出力: 空文字 なら無効
 * @default 1
 *
 * @param animation
 * @desc アニメーションタイル出力: 空文字 なら無効
 * @default 1
 *
 * @param src
 * @desc 読込先(絶対パス, 末尾スラッシュなし): 空文字 ならデフォルト
 * @default
 *
 * @param dist
 * @desc 保存先(絶対パス, 末尾スラッシュなし): 空文字 ならデフォルト
 * @default
 */

(function() {
  "use strict";

  var pluginParams = PluginManager._parameters.h2a_2k_chipsetconverter;
  var options = {
    chipSize: { 1: 1, 2: 2, 3: 3 }[pluginParams.chipSize] || 3,
    autotile: pluginParams.autotile !== "" ? true : false,
    animation: pluginParams.animation !== "" ? true : false,
    src: pluginParams.src,
    dist: pluginParams.dist
  };

  // くらむぼん氏の RPGツクール2000→MV素材変換器 から引用（認可済）
  function convertChipset(image) {
    function toBuf(dataURL) {
      return Buffer.from(dataURL.match(/;base64,(.*)$/)[1], "base64");
    }
    function transparent(imageData, point) {
      var data = imageData.data;
      for (var y = 0; y < imageData.height; y++) {
        for (var x = 0; x < imageData.width; x++) {
          var i = (x + y * imageData.width) * 4;
          if (
            data[i] === data[point + 0] &&
            data[i + 1] === data[point + 1] &&
            data[i + 2] === data[point + 2]
          ) {
            data[i + 3] = 0;
          }
        }
      }
    }
    function dot2x(input, output) {
      var inputData = new Uint32Array(input.data.buffer);
      var outputData = new Uint32Array(output.data.buffer);
      for (var y = 0; y < input.height; y++) {
        for (var x = 0; x < input.width; x++) {
          var i = (x + y * input.width * 2) * 2;
          outputData[i] = outputData[i + 1] = outputData[
            i + input.width * 2
          ] = outputData[i + 1 + input.width * 2] =
            inputData[x + y * input.width];
        }
      }
    }
    function dot3x(input, output) {
      var inputData = new Uint32Array(input.data.buffer);
      var outputData = new Uint32Array(output.data.buffer);
      for (var y = 0; y < input.height; y++) {
        for (var x = 0; x < input.width; x++) {
          var i = (x + y * input.width * 3) * 3;
          outputData[i] = outputData[i + 1] = outputData[i + 2] = outputData[
            i + input.width * 3
          ] = outputData[i + 1 + input.width * 3] = outputData[
            i + 2 + input.width * 3
          ] = outputData[i + input.width * 6] = outputData[
            i + 1 + input.width * 6
          ] = outputData[i + 2 + input.width * 6] =
            inputData[x + y * input.width];
        }
      }
    }
    function putHalfTile(dx, dy, sx, sy) {
      ctx.putImageData(
        imageData,
        (dx - sx) * tileSize,
        (dy - sy) * tileSize,
        sx * tileSize,
        sy * tileSize,
        tileSize / 2,
        tileSize / 2
      );
    }
    function putFullTile(dx, dy, sx, sy) {
      ctx.putImageData(
        imageData,
        (dx - sx) * tileSize,
        (dy - sy) * tileSize,
        sx * tileSize,
        sy * tileSize,
        tileSize,
        tileSize
      );
    }
    function putRectangle(dx, dy, sx, sy, sw, sh) {
      ctx.putImageData(
        imageData,
        (dx - sx) * tileSize,
        (dy - sy) * tileSize,
        sx * tileSize,
        sy * tileSize,
        tileSize * sw,
        tileSize * sh
      );
    }
    function putCircle(dx, dy, sx, sy) {
      putHalfTile(dx + 0.5, dy + 0.5, sx + 2.5, sy + 0.5);
      putHalfTile(dx + 1, dy + 0.5, sx + 2, sy + 0.5);
      putHalfTile(dx + 0.5, dy + 1, sx + 2.5, sy + 0);
      putHalfTile(dx + 1, dy + 1, sx + 2, sy + 0);
    }
    function putAutoTile(dx, dy, sx, sy) {
      putFullTile(dx + 0, dy + 0, sx + 0, sy + 0);
      putFullTile(dx + 1, dy + 0, sx + 2, sy + 0);
      //角優先に選別、中央に装飾などがある場合失われる
      //2000規格でも2x2にタイルを置いた時のために一応角同士がつながるようになっているため、角優先を採用
      putFullTile(dx + 0, dy + 1, sx + 0, sy + 1);
      putFullTile(dx + 1, dy + 1, sx + 2, sy + 1);
      putFullTile(dx + 0, dy + 2, sx + 0, sy + 3);
      putFullTile(dx + 1, dy + 2, sx + 2, sy + 3);
      //中央優先に選別、角に装飾などがある場合失われる
      // putHalfTile(dx + 0, dy + 1, sx + 0, sy + 1);
      // putHalfTile(dx + 0.5, dy + 1, sx + 1.5, sy + 1);
      // putHalfTile(dx + 1, dy + 1, sx + 1, sy + 1);
      // putHalfTile(dx + 1.5, dy + 1, sx + 2.5, sy + 1);
      // putHalfTile(dx + 0, dy + 1.5, sx + 0, sy + 2.5);
      // putHalfTile(dx + 0.5, dy + 1.5, sx + 1.5, sy + 2.5);
      // putHalfTile(dx + 1, dy + 1.5, sx + 1, sy + 2.5);
      // putHalfTile(dx + 1.5, dy + 1.5, sx + 2.5, sy + 2.5);
      // putHalfTile(dx + 0, dy + 2, sx + 0, sy + 2);
      // putHalfTile(dx + 0.5, dy + 2, sx + 1.5, sy + 2);
      // putHalfTile(dx + 1, dy + 2, sx + 1, sy + 2);
      // putHalfTile(dx + 1.5, dy + 2, sx + 2.5, sy + 2);
      // putHalfTile(dx + 0, dy + 2.5, sx + 0, sy + 3.5);
      // putHalfTile(dx + 0.5, dy + 2.5, sx + 1.5, sy + 3.5);
      // putHalfTile(dx + 1, dy + 2.5, sx + 1, sy + 3.5);
      // putHalfTile(dx + 1.5, dy + 2.5, sx + 2.5, sy + 3.5);
    }
    function putAllAutoTile(dx, dy, sx, sy) {
      putRectangle(dx + 0, dy + 0, sx + 0, sy + 0, 3, 4);
      putHalfTile(dx + 1, dy + 0, sx + 0, sy + 1);
      putHalfTile(dx + 1.5, dy + 0, sx + 2.5, sy + 1);
      putHalfTile(dx + 1, dy + 0.5, sx + 0, sy + 3.5);
      putHalfTile(dx + 1.5, dy + 0.5, sx + 2.5, sy + 3.5);
      putFullTile(dx + 0, dy + 4, sx + 1, sy + 2);
      putFullTile(dx + 1, dy + 4, sx + 1, sy + 2);
      putFullTile(dx + 2, dy + 4, sx + 1, sy + 2);
      putFullTile(dx + 0, dy + 5, sx + 1, sy + 2);
      putFullTile(dx + 1, dy + 5, sx + 1, sy + 2);
      putFullTile(dx + 2, dy + 5, sx + 1, sy + 2);
      putHalfTile(dx + 0, dy + 4.5, sx + 2, sy + 0.5);
      putHalfTile(dx + 0, dy + 5, sx + 2, sy + 0);
      putHalfTile(dx + 0.5, dy + 4.5, sx + 2.5, sy + 0.5);
      putHalfTile(dx + 0.5, dy + 5, sx + 2.5, sy + 0);
      putHalfTile(dx + 1.5, dy + 4, sx + 2.5, sy + 0);
      putHalfTile(dx + 1.5, dy + 4.5, sx + 2.5, sy + 0.5);
      putHalfTile(dx + 2, dy + 4, sx + 2, sy + 0);
      putHalfTile(dx + 2, dy + 4.5, sx + 2, sy + 0.5);
      putHalfTile(dx + 1, dy + 5.5, sx + 2, sy + 0.5);
      putHalfTile(dx + 1.5, dy + 5, sx + 2.5, sy + 0);
      putHalfTile(dx + 2, dy + 5, sx + 2, sy + 0);
      putHalfTile(dx + 2.5, dy + 5.5, sx + 2.5, sy + 0.5);
      putFullTile(dx + 3, dy + 0, sx + 1, sy + 2);
      putFullTile(dx + 4, dy + 0, sx + 1, sy + 2);
      putFullTile(dx + 3, dy + 1, sx + 1, sy + 2);
      putFullTile(dx + 4, dy + 1, sx + 1, sy + 2);
      putCircle(dx + 3, dy + 0, sx, sy);
      putFullTile(dx + 3, dy + 2, sx + 2, sy + 0);
      putFullTile(dx + 4, dy + 2, sx + 2, sy + 0);
      putFullTile(dx + 3, dy + 3, sx + 2, sy + 0);
      putFullTile(dx + 4, dy + 3, sx + 2, sy + 0);
      putHalfTile(dx + 3, dy + 2, sx + 1, sy + 2);
      putHalfTile(dx + 4.5, dy + 2, sx + 1.5, sy + 2);
      putHalfTile(dx + 3, dy + 3.5, sx + 1, sy + 2.5);
      putHalfTile(dx + 4.5, dy + 3.5, sx + 1.5, sy + 2.5);
      putFullTile(dx + 3, dy + 4, sx + 0, sy + 1);
      putFullTile(dx + 4, dy + 4, sx + 2, sy + 1);
      putFullTile(dx + 3, dy + 5, sx + 0, sy + 3);
      putFullTile(dx + 4, dy + 5, sx + 2, sy + 3);
      putCircle(dx + 3, dy + 4, sx, sy);
      putRectangle(dx + 5, dy + 0, sx + 0, sy + 1, 0.5, 3);
      putRectangle(dx + 5.5, dy + 0, sx + 2.5, sy + 1, 0.5, 3);
      putFullTile(dx + 6, dy + 0, sx + 0, sy + 2);
      putFullTile(dx + 6, dy + 1, sx + 0, sy + 2);
      putFullTile(dx + 6, dy + 2, sx + 0, sy + 2);
      putFullTile(dx + 7, dy + 0, sx + 2, sy + 2);
      putFullTile(dx + 7, dy + 1, sx + 2, sy + 2);
      putFullTile(dx + 7, dy + 2, sx + 2, sy + 2);
      putCircle(dx + 6, dy + 0, sx, sy);
      putCircle(dx + 6, dy + 1, sx, sy);
      putRectangle(dx + 5, dy + 3, sx + 0, sy + 1, 3, 0.5);
      putRectangle(dx + 5, dy + 3.5, sx + 0, sy + 3.5, 3, 0.5);
      putFullTile(dx + 5, dy + 4, sx + 1, sy + 1);
      putFullTile(dx + 6, dy + 4, sx + 1, sy + 1);
      putFullTile(dx + 7, dy + 4, sx + 1, sy + 1);
      putFullTile(dx + 5, dy + 5, sx + 1, sy + 3);
      putFullTile(dx + 6, dy + 5, sx + 1, sy + 3);
      putFullTile(dx + 7, dy + 5, sx + 1, sy + 3);
      putCircle(dx + 5, dy + 4, sx, sy);
      putCircle(dx + 6, dy + 4, sx, sy);
    }
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    var prevData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    transparent(prevData, (18 + 8 * prevData.width) * 16 * 4);
    var imageData = ctx.createImageData(
      canvas.width * options.chipSize,
      canvas.height * options.chipSize
    );
    switch (options.chipSize) {
      case 1:
        imageData = prevData;
        break;
      case 2:
        dot2x(prevData, imageData);
        break;
      case 3:
        dot3x(prevData, imageData);
        break;
      default:
        break;
    }
    var tileSize = 16 * options.chipSize;
    var tilesets = [];
    // TileA1 水タイル
    canvas.width = (768 / 3) * options.chipSize;
    canvas.height = (576 / 3) * options.chipSize;
    // TileA1 ブロックA(D) 海タイル Dは深海タイルとの接続が不自然
    var offset = 0;
    do {
      for (var i = 0; i < 3; i++) {
        var dx = i * 2;
        var sx = i + offset / 2;
        putFullTile(dx + 0, offset + 0, sx + 0, 0);
        putFullTile(dx + 1, offset + 0, sx + 0, 3);
        putHalfTile(dx + 0, offset + 1, sx + 0, 0);
        putHalfTile(dx + 0.5, offset + 1, sx + 0.5, 2);
        putHalfTile(dx + 1, offset + 1, sx + 0, 2);
        putHalfTile(dx + 1.5, offset + 1, sx + 0.5, 0);
        putHalfTile(dx + 0, offset + 1.5, sx + 0, 1.5);
        putHalfTile(dx + 0.5, offset + 1.5, sx - offset / 2 + 0.5, 4.5);
        putHalfTile(dx + 1, offset + 1.5, sx - offset / 2 + 0, 4.5);
        putHalfTile(dx + 1.5, offset + 1.5, sx + 0.5, 1.5);
        putHalfTile(dx + 0, offset + 2, sx + 0, 1);
        putHalfTile(dx + 0.5, offset + 2, sx - offset / 2 + 0.5, 4);
        putHalfTile(dx + 1, offset + 2, sx - offset / 2 + 0, 4);
        putHalfTile(dx + 1.5, offset + 2, sx + 0.5, 1);
        putHalfTile(dx + 0, offset + 2.5, sx + 0, 0.5);
        putHalfTile(dx + 0.5, offset + 2.5, sx + 0.5, 2.5);
        putHalfTile(dx + 1, offset + 2.5, sx + 0, 2.5);
        putHalfTile(dx + 1.5, offset + 2.5, sx + 0.5, 0.5);
      }
      offset += 6;
    } while (offset === 6);
    // TileA1 ブロックB 深海タイル
    for (var i = 0; i < 3; i++) {
      var dx = i * 2;
      var sx = i;
      putFullTile(dx + 0, 3, sx + 0, 6);
      putFullTile(dx + 1, 3, sx + 0, 7);
      putFullTile(dx + 0, 4, sx + 0, 7);
      putFullTile(dx + 1, 4, sx + 0, 7);
      putFullTile(dx + 0, 5, sx + 0, 7);
      putFullTile(dx + 1, 5, sx + 0, 7);
      putHalfTile(dx + 0, 4, sx + 0, 6);
      putHalfTile(dx + 1.5, 4, sx + 0.5, 6);
      putHalfTile(dx + 0, 5.5, sx + 0, 6.5);
      putHalfTile(dx + 1.5, 5.5, sx + 0.5, 6.5);
    }
    // TileA1 ブロックE 滝タイル 4コマ目が失われる
    for (var i = 0; i < 3; i++) {
      for (var j = 14; j < 16; j++) {
        for (var k = 0; k < 3; k++) {
          putFullTile(j, k + i * 3, i + 3, k + 4);
        }
      }
    }
    tilesets.push({ type: "A1", data: toBuf(canvas.toDataURL()) });
    // TileA2 ブロックAのみ オートタイル 親パターンが失われるため、一部オートタイル間の接続が不自然
    canvas.width = (768 / 3) * options.chipSize;
    canvas.height = (576 / 3) * options.chipSize;
    putAutoTile(0, 0, 0, 8);
    putAutoTile(2, 0, 3, 8);
    putAutoTile(4, 0, 0, 12);
    putAutoTile(6, 0, 3, 12);
    putAutoTile(0, 3, 6, 0);
    putAutoTile(2, 3, 9, 0);
    putAutoTile(4, 3, 6, 4);
    putAutoTile(6, 3, 9, 4);
    putAutoTile(0, 6, 6, 8);
    putAutoTile(2, 6, 9, 8);
    putAutoTile(4, 6, 6, 12);
    putAutoTile(6, 6, 9, 12);
    ctx.fillRect(8 * tileSize, 0 * tileSize, 8 * tileSize, 12 * tileSize);
    tilesets.push({ type: "A2", data: toBuf(canvas.toDataURL()) });
    // TileA5 通常下層タイル
    canvas.width = (384 / 3) * options.chipSize;
    canvas.height = (768 / 3) * options.chipSize;
    putRectangle(0, 0, 12, 0, 6, 16);
    putRectangle(6, 0, 18, 0, 2, 8);
    putRectangle(6, 8, 20, 0, 2, 8);
    tilesets.push({ type: "A5", data: toBuf(canvas.toDataURL()) });
    // TileB 上層タイル＋通常下層タイルの残り
    canvas.width = (768 / 3) * options.chipSize;
    canvas.height = (768 / 3) * options.chipSize;
    putRectangle(0, 0, 18, 8, 6, 8);
    putRectangle(0, 8, 24, 0, 6, 8);
    putRectangle(8, 0, 24, 8, 6, 8);
    putRectangle(8, 8, 18, 0, 6, 8);
    tilesets.push({ type: "B", data: toBuf(canvas.toDataURL()) });
    // おまけ オートタイル全パターン
    if (options.autotile) {
      canvas.width = (768 / 3) * options.chipSize;
      canvas.height = (768 / 3) * options.chipSize;
      putAllAutoTile(0, 0, 0, 8);
      putAllAutoTile(0, 8, 3, 8);
      putAllAutoTile(8, 0, 0, 12);
      putAllAutoTile(8, 8, 3, 12);
      tilesets.push({ type: "C", data: toBuf(canvas.toDataURL()) });
      canvas.width = (768 / 3) * options.chipSize;
      canvas.height = (768 / 3) * options.chipSize;
      putAllAutoTile(0, 0, 6, 0);
      putAllAutoTile(0, 8, 9, 0);
      putAllAutoTile(8, 0, 6, 4);
      putAllAutoTile(8, 8, 9, 4);
      tilesets.push({ type: "D", data: toBuf(canvas.toDataURL()) });
      canvas.width = (768 / 3) * options.chipSize;
      canvas.height = (768 / 3) * options.chipSize;
      putAllAutoTile(0, 0, 6, 8);
      putAllAutoTile(0, 8, 9, 8);
      putAllAutoTile(8, 0, 6, 12);
      putAllAutoTile(8, 8, 9, 12);
      tilesets.push({ type: "E", data: toBuf(canvas.toDataURL()) });
    }
    // !$Animation アニメーション（4コマ目あり） キャラグラ 右回転でアニメーション
    if (options.animation) {
      canvas.width = tileSize * 3;
      canvas.height = tileSize * 4;
      putRectangle(0, 0, 3, 4, 3, 2);
      putRectangle(0, 2, 3, 7, 3, 1);
      putRectangle(0, 3, 3, 6, 3, 1);
      tilesets.push({ type: "!$", data: toBuf(canvas.toDataURL()) });
    }
    return tilesets;
  }

  // 以下自作
  var IMG_TILESETS = "/img/tilesets";
  var ERR_TEST = "このプラグインはテストプレイ専用です。\n処理を中断しました。";

  // テストプレイ判定に必要な定義が行われるまで待つ
  new Promise(function(resolve) {
    setInterval(function() {
      if (window.$gameTemp && window.$gameTemp.isPlaytest) resolve();
    }, 1);
  })
    // テストプレイ判定
    .then(function() {
      if (
        $gameTemp.isPlaytest() !== true ||
        window.require === undefined ||
        Utils.isNwjs() !== true
      ) {
        return alert(ERR_TEST);
      }
      try {
        if (require === undefined) return alert(ERR_TEST);
      } catch (error) {
        return alert(ERR_TEST);
      }

      var __path = require("path");
      var __fs = require("fs");

      var srcDir =
        options.src !== ""
          ? options.src
          : r2k.backslash(process.cwd() + IMG_TILESETS);
      var distDir =
        options.dist !== ""
          ? options.dist
          : r2k.backslash(process.cwd() + IMG_TILESETS);

      if (
        confirm(
          `処理を開始します。よろしいですか？\n\n読込先: ${srcDir}/2k_**.png\n保存先: ${distDir}/**_XX.png`
        ) === false
      ) {
        return;
      }

      // tilesets ディレクトリを探索
      new Promise(r => __fs.readdir(srcDir, (_, f) => r(f)))
        // 画像を絞り込み、Image化し、ロードされるまで待つ
        .then(function(fileList) {
          var list = fileList.filter(function(name) {
            return r2k.is2kPrefix(name) && __path.parse(name).ext === ".png";
          });
          if (
            confirm(
              `以下のファイルを変換します。続けますか？\n\n${list.join("\n")}`
            ) === false
          ) {
            return;
          }
          return Promise.all(
            list.map(function(name) {
              var img = new Image();
              // img.src = `${IMG_TILESETS}/${name}`;
              img.src = `${srcDir}/${name}`;
              return new Promise(function(resolve) {
                img.onload = function() {
                  resolve(img);
                };
              });
            })
          );
        })
        // 変換器を作動させ、画像変換
        .then(function(images) {
          return images.map(function(image) {
            var res = __path.parse(decodeURIComponent(image.src));
            return convertChipset(image).map(function(v) {
              return {
                dist: r2k.backslash(
                  `${distDir}/${
                    v.type === "!$"
                      ? `${v.type}_${res.name.replace(/^2k_/, "")}`
                      : `${res.name.replace(/^2k_/, "")}_${v.type}`
                  }${res.ext}`
                ),
                buffer: v.data
              };
            });
          });
        })
        // 変換結果を出力
        .then(function(items) {
          return Promise.all(
            items.map(function(files) {
              return new Promise(function(resolve) {
                for (var i = 0; i < files.length; i++) {
                  var file = files[i];
                  __fs.writeFileSync(file.dist, file.buffer);
                }
                resolve(
                  files.map(function(file) {
                    return file.dist;
                  })
                );
              });
            })
          );
        })
        // 結果ログを作成
        .then(function(names) {
          return names.reduce(function(p, c) {
            Array.prototype.push.apply(p, c);
            return p;
          }, []);
        })
        .then(function(list) {
          alert(`変換完了！\n\n${list.join("\n")}`);
        });
    });
})();

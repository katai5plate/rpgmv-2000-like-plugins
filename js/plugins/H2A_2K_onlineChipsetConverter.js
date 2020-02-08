/*:
 * @plugindesc MV で 2000 する: チップセットをオンラインで変換
 * @author Had2Apps
 *
 * @help RPGツクール2000→MV素材変換器 のチップセット機能をオンライン実行します。
 *
 * 使い方:
 * 1. img/tilesets に 2000 のチップセットを置き、ファイル名の頭に 2k_ をつける
 * 2. このプラグインを有効にして、テストプレイを開始する
 * 3. 指示通りに進めて、上手くいけば img/tilesets に変換素材が保存されます
 *
 * 注意:
 * - くらむぼん氏の RPGツクール2000→MV素材変換器 をダウンロードして実行します。
 * - スクレイピングの類ですので、変換器のソースコードが変更されると動かなくなる可能性があります。
 *
 * @param chipSize
 * @desc タイルの拡大率(整数): 1 ～ 3
 * @default 3
 */

(function() {
  "use strict";

  var URL = "https://krmbn0576.github.io/rpgmakermv/converter.html";
  var IMG_TILESETS = "/img/tilesets";
  var ERR_TEST = "このプラグインはテストプレイ専用です。\n処理を中断しました。";
  var ERR_NET =
    "インターネットが接続されていないか、\n素材変換器のURLが存在しません。\n処理を中断しました。";
  var ERR_CRASH =
    "処理を中断しました。コードが処理できません。\n素材変換器素材変換器のソースコードが\n大幅に変更された可能性があります。\n自前で修正する場合は、内部のスクレイピング方法を変更してください。";

  var pluginParams = PluginManager._parameters.h2a_2k_charset;
  var params = {
    chipSize: { 1: 1, 2: 2, 3: 3 }[pluginParams.chipSize] || 3
  };

  // テストプレイ判定に必要な定義が行われるまで待つ
  new Promise(function(resolve) {
    setInterval(function() {
      if (window.$gameTemp && window.$gameTemp.isPlaytest) resolve();
    }, 1);
  })
    // テストプレイ判定
    .then(function() {
      if ($gameTemp.isPlaytest() !== true || window.require === undefined) {
        return alert(ERR_TEST);
      }
      try {
        if (require === undefined) return alert(ERR_TEST);
      } catch (error) {
        return alert(ERR_TEST);
      }

      var __path = require("path");
      var __fs = require("fs");

      if (
        confirm(
          `処理を開始します。よろしいですか？\n保存先: ${process.cwd() +
            IMG_TILESETS}`
        ) === false
      ) {
        return;
      }

      // tilesets ディレクトリを探索
      new Promise(r =>
        __fs.readdir(r2k.backslash(process.cwd() + IMG_TILESETS), (_, f) =>
          r(f)
        )
      )
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
              img.src = `${IMG_TILESETS}/${name}`;
              return new Promise(function(resolve) {
                img.onload = function() {
                  resolve(img);
                };
              });
            })
          );
        })
        // 変換器をダウンロード
        .then(function(images) {
          return new Promise(function(resolve) {
            fetch(URL)
              .catch(function(e) {
                alert(ERR_NET);
                throw new Error(e);
              })
              .then(function(res) {
                return res.text();
              })
              .then(function(webContent) {
                resolve({
                  images: images.map(function(image) {
                    var res = __path.parse(decodeURIComponent(image.src));
                    res.dir = res.dir.match(/(\/img\/.*)$/)[1];
                    res.img = image;
                    return res;
                  }),
                  webContent: webContent
                });
              });
          });
        })
        // 変換器をスクレイピングし、convertChipset と必要な関数を抽出
        .then(function(state) {
          var code = new DOMParser()
            .parseFromString(state.webContent, "text/html")
            .querySelector("script").innerText;
          var fn = code.match(/function convertChipset\(image\) {(.*)}/s)[1];
          var utils = code.match(
            /(function transparent.*)function convertFaceset/s
          )[1];
          return {
            images: state.images,
            convertChipset: new Function(
              "image",
              `${utils}\nvar options={chipSize:${params.chipSize}};\n${fn}`
            )
          };
        })
        // 変換器を作動させ、画像変換
        .then(function(state) {
          return state.images.map(function(image) {
            return state.convertChipset(image.img).map(function(v) {
              return {
                dist: r2k.backslash(
                  `${process.cwd()}${image.dir}/${image.name.replace(
                    /^2k_/,
                    ""
                  )}_${v.desc.match(/(^.*?)\s/)[1]}${image.ext}`
                ),
                buffer: (function() {
                  var data = v.data.match(/;base64,(.*)$/)[1];
                  return Buffer.from(data, "base64");
                })()
              };
            });
          });
        })
        .catch(function(e) {
          alert(ERR_CRASH);
          throw new Error(e);
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

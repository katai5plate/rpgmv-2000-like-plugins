/*:
 * @plugindesc MV で 2000 する: キャラチップ
 * @author Had2Apps
 *
 * @help ツクール2000 のキャラチップをそのまま使えるようにします。
 *
 * 使い方:
 * 1. 素材を img/charactors に入れる
 * 2. ファイル名の先頭に `2k_` を付け、
 *    パレット 0 番に透過色が設定されていることを確認する
 * 3. 問題なく動くことを確認したら、お楽しみタイム
 *
 * 注意:
 * - パレットが無い画像の場合は defaultColor が透過色になります。
 *
 * @param scale
 * @desc キャラクターの拡大率
 * @default 3
 *
 * @param defaultColor
 * @desc パレットが見つからなかった場合の透過色: R,G,B
 * @default 32,156,0
 *
 * @param customColor
 * @desc 透過色を固定する: R,G,B or 空
 * @default
 */

(function() {
  "use strict";

  var pluginParams = PluginManager._parameters.h2a_2k_charset;
  var params = {
    scale: Number(pluginParams.scale),
    defaultColor: pluginParams.defaultColor.split(",").map(Number),
    customColor:
      pluginParams.customColor === ""
        ? null
        : pluginParams.customColor.split(",").map(Number)
  };

  // 画像が読み込まれた時の処理を埋め込む
  r2k.bitmapOnLoadList.push(function(bitmap, path, hue) {
    if (ImageManager.is2kPrefix(path, true) && path.contains("/characters/")) {
      bitmap.chroma(params.defaultColor, params.customColor);
    }
  });

  // 常に判定する
  var setCharacterBitmap = Sprite_Character.prototype.setCharacterBitmap;
  Sprite_Character.prototype.setCharacterBitmap = function() {
    setCharacterBitmap.apply(this);
    this._is2kPrefix = ImageManager.is2kPrefix(this._characterName);
  };

  // 歩行グラを N 倍表示する
  var updateCharacterFrame = Sprite_Character.prototype.updateCharacterFrame;
  Sprite_Character.prototype.updateCharacterFrame = function() {
    updateCharacterFrame.apply(this);
    if (this._is2kPrefix) {
      this.scale.x = params.scale;
      this.scale.y = params.scale;
    }
  };

  // 2kキャラの向きを強制補正
  Sprite_Character.prototype.characterPatternY = function() {
    return (
      ((this._is2kPrefix
        ? [, , 6, , 8, , 4, , 2][this._character.direction()]
        : this._character.direction()) -
        2) /
      2
    );
  };

  // セーブ画面などで上を向いてしまっているのを修正
  Window_Base.prototype.drawCharacter = function(
    characterName,
    characterIndex,
    x,
    y
  ) {
    var bitmap = ImageManager.loadCharacter(characterName);
    var big = ImageManager.isBigCharacter(characterName);
    var k2 = ImageManager.is2kPrefix(characterName); // 判定
    var pw = bitmap.width / (big ? 3 : 12);
    var ph = bitmap.height / (big ? 4 : 8);
    var n = big ? 0 : characterIndex;
    var sx = ((n % 4) * 3 + 1) * pw;
    var sy = (Math.floor(n / 4) * 4 + (k2 ? 2 : 0)) * ph; // 向き指定
    var mul = 2; // 倍率
    this.contents.blt(
      bitmap,
      sx,
      sy,
      pw,
      ph,
      x - pw / 2,
      k2 ? y - ph * mul : y - ph,
      k2 ? pw * mul : pw,
      k2 ? ph * mul : ph
    );
  };
})();

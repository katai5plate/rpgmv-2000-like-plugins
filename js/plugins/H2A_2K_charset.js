(function() {
  "use strict";

  // ファイル名で判断
  var is2kCharacter = function(filename, noHead) {
    var sign = noHead ? filename.match(/2k_+/) : filename.match(/^2k_+/);
    return sign && sign[0].contains("2k_");
  };
  ImageManager.is2kCharacter = is2kCharacter;

  // 画像が読み込まれた時の処理を埋め込む
  ImageManager.loadNormalBitmap = function(path, hue) {
    var key = this._generateCacheKey(path, hue);
    var bitmap = this._imageCache.get(key);
    if (!bitmap) {
      bitmap = Bitmap.load(path);
      this._callCreationHook(bitmap);

      bitmap.addLoadListener(function() {
        bitmap.rotateHue(hue);
        if (is2kCharacter(path, true) && path.contains("/characters/")) {
          bitmap.chroma(); //
        }
      });
      this._imageCache.add(key, bitmap);
    } else if (!bitmap.isReady()) {
      bitmap.decode();
    }

    return bitmap;
  };

  // 常に判定する
  var setCharacterBitmap = Sprite_Character.prototype.setCharacterBitmap;
  Sprite_Character.prototype.setCharacterBitmap = function() {
    setCharacterBitmap.apply(this);
    this._is2kCharacter = ImageManager.is2kCharacter(this._characterName);
  };

  // 3 倍表示する
  var updateCharacterFrame = Sprite_Character.prototype.updateCharacterFrame;
  Sprite_Character.prototype.updateCharacterFrame = function() {
    updateCharacterFrame.apply(this);
    if (this._is2kCharacter) {
      this.scale.x = 3;
      this.scale.y = 3;
    }
  };

  // 2kキャラの向きを強制補正
  Sprite_Character.prototype.characterPatternY = function() {
    return (
      ((this._is2kCharacter
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
    var k2 = ImageManager.is2kCharacter(characterName); // 判定
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

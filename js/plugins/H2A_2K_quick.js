/*:
 * @plugindesc MV で 2000 する: 様々な挙動
 * @author Had2Apps
 *
 * @help RPG ツクール 2000 の様々な挙動を再現します
 *
 * おしながき:
 * - ジャンプの挙動、ダッシュの挙動
 *   -> 2000 に近いスピードに補正されます。
 * - 顔グラフィック左右反転の復刻
 *   -> 文章の表示で \R を使用することで機能します。
 * - F12 キー
 *   -> 2000 同様にタイトルに戻ります
 *
 * 補足:
 * - このプラグインはくらむぼん氏の QuickMove.js を改変したものです。
 *   -> いくつかの不具合を修正しました。
 *
 */

(function() {
  "use strict";

  // F12 でタイトルに戻る
  var onKeyDown = SceneManager.onKeyDown;
  SceneManager.onKeyDown = function(e) {
    if (e.keyCode === 123 && Utils.isNwjs()) location.reload();
    onKeyDown.apply(this, arguments);
  };

  // ジャンプ軌道調整用変数を定義
  var initMembers = Game_CharacterBase.prototype.initMembers;
  Game_CharacterBase.prototype.initMembers = function() {
    initMembers.apply(this, arguments);
    this._jumpAdjust = 0;
  };

  // ジャンプの設定を変更
  var jump = Game_CharacterBase.prototype.jump;
  Game_CharacterBase.prototype.jump = function(xPlus, yPlus) {
    jump.apply(this, arguments);
    // ジャンプの高さは移動距離や移動速度に関わらず一定
    this._jumpPeak = 9;
    // ジャンプにかかる時間は移動速度が速いほど短いが、移動距離には影響されない
    this._jumpCount = (7 - this._moveSpeed) * 4;
    // ジャンプの軌道調整用
    this._jumpAdjust = (2 * this._jumpPeak) / this._jumpCount;
  };

  // ジャンプの軌道は二次関数なので、x軸方向に潰す
  Game_CharacterBase.prototype.jumpHeight = function() {
    return (
      (this._jumpPeak * this._jumpPeak -
        Math.pow(this._jumpAdjust * this._jumpCount - this._jumpPeak, 2)) /
      2
    );
  };

  // 歩行速度を倍にする
  Game_CharacterBase.prototype.distancePerFrame = function() {
    var defaultFrame = Math.pow(2, this.realMoveSpeed()) / 256;
    return defaultFrame * 2;
  };

  // ダッシュの ON/OFF 切り替えをフレーム単位に変更
  Game_Player.prototype.updateDashing = function() {
    this._dashing =
      this.canMove() && !this.isInVehicle() && !$gameMap.isDashDisabled()
        ? this.isDashButtonPressed() || $gameTemp.isDestinationValid()
        : false;
  };

  // 顔グラフィックの反転に対応する
  Window_Base.prototype.drawFace = function(
    faceName,
    faceIndex,
    x,
    y,
    width,
    height
  ) {
    width = width || Window_Base._faceWidth;
    height = height || Window_Base._faceHeight;
    var bitmap = ImageManager.loadFace(faceName);
    var pw = Window_Base._faceWidth;
    var ph = Window_Base._faceHeight;
    var sw = Math.min(width, pw);
    var sh = Math.min(height, ph);
    var dx = Math.floor(x + Math.max(width - pw, 0) / 2);
    var dy = Math.floor(y + Math.max(height - ph, 0) / 2);
    var sx = (faceIndex % 4) * pw + (pw - sw) / 2;
    var sy = Math.floor(faceIndex / 4) * ph + (ph - sh) / 2;
    var fn = this._faceReverse ? "bltReverse" : "blt";
    // 軌跡が残るのを防ぐ
    if (this.constructor.name === "Window_Message") {
      this.contents.context.clearRect(0, 0, sw, sh);
    }
    this.contents[fn](bitmap, sx, sy, sw, sh, dx, dy);
  };

  // \R で顔グラフィックを左右反転する
  var processEscapeCharacter = Window_Message.prototype.processEscapeCharacter;
  Window_Message.prototype.processEscapeCharacter = function(code, textState) {
    if (code === "R")
      this.loadMessageFace(), (this._faceReverse = !this._faceReverse);
    else processEscapeCharacter.apply(this, arguments);
  };
})();

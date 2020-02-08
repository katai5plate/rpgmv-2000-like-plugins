# rpgmv-2000-like-plugins

テーマは「ツクールMV で ツクール2000 する」

そんなプラグイン集。今後も続々気まぐれ公開予定。

## ダウンロード

1. [こちらから zip をダウンロード](https://github.com/katai5plate/rpgmv-2000-like-plugins/archive/master.zip)
2. `js/plugins/` の中にプラグインが入っています。

## おしながき

### H2A_2K_core.js

- このプラグイン群のコアです。これが無ければ以下プラグインは動作しません。

### H2A_2K_charset.js

<details><summary>画像を開く</summary><div>

![image](https://user-images.githubusercontent.com/22496143/74085215-2d251980-4aba-11ea-9022-946f1ea9f799.png)

![image](https://user-images.githubusercontent.com/22496143/74085202-0d8df100-4aba-11ea-9d2b-c84de4710241.png)

![image](https://user-images.githubusercontent.com/22496143/74085230-49c15180-4aba-11ea-80a7-090c3dc539be.png)

</div></details>

- RPG ツクール 2000 のキャラチップを、無編集で使用できるようになります。
- パレット 0 番の色を自動的に透過します。

### H2A_2K_quick.js

- RPG ツクール 2000 の様々な挙動を再現します。
  - ジャンプの挙動
  - ダッシュの挙動
  - 顔グラフィック左右反転（文章で `\R`）
  - F12 キー
- このプラグインはくらむぼん氏の QuickMove.js を改変したものです。

## バグ報告について

- [ここからバグ報告をしてください](https://github.com/katai5plate/rpgmv-2000-like-plugins/issues)
- バグ報告には GitHub のアカウント登録が必要です。`New issue` という緑色のボタンから報告してください。
- バグ修正も歓迎します。このリポジトリを Fork して、変更したものを Pull Request してください。

## 開発方法について

- 必須:
  - Git
  - Node.js
  - Yarn
  - VSCode
  - VSCode: Prettier

```
git clone https://github.com/katai5plate/rpgmv-2000-like-plugins
cd rpgmv-2000-like-plugins
yarn
```

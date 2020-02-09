# rpgmv-2000-like-plugins
![version](https://img.shields.io/github/package-json/v/katai5plate/rpgmv-2000-like-plugins)
![license](https://img.shields.io/github/license/katai5plate/rpgmv-2000-like-plugins)

テーマは「ツクール MV で ツクール 2000 する」

そんなプラグイン集。今後も続々気まぐれ公開予定。

右上の `★ Star` ボタンを押して頂けると励みになります。

## 動作環境

- コアスクリプト:
  - [コミュニティ版コアスクリプト community-1.3b](https://atsumaru.github.io/api-references/download/corescript/)
- RPG ツクール MV エディタ:
  - バージョン 1.6.2

Mac, Linux, スマホ 環境下での動作は確かめてませんので、バグがあれば報告お願いします。

## ダウンロード

1. [こちらから zip をダウンロード](https://github.com/katai5plate/rpgmv-2000-like-plugins/archive/master.zip)
2. `js/plugins/` の中にプラグインが入っています。

## おしながき

### H2A_2K_core.js

<details><summary>画像を開く</summary><div>

![image](https://user-images.githubusercontent.com/22496143/74085963-e3403180-4ac1-11ea-94b9-e354c1d474b1.png)

</div></details>

- このプラグイン群のコアです。これが無ければ以下プラグインは動作しません。

### H2A_2K_charset.js

<details><summary>画像を開く</summary><div>

![image](https://user-images.githubusercontent.com/22496143/74086217-3adf9c80-4ac4-11ea-985e-20df3189ad21.png)

![image](https://user-images.githubusercontent.com/22496143/74085202-0d8df100-4aba-11ea-9d2b-c84de4710241.png)

![image](https://user-images.githubusercontent.com/22496143/74085230-49c15180-4aba-11ea-80a7-090c3dc539be.png)

</div></details>

- RPG ツクール 2000 のキャラチップを、無編集で使用できるようになります。
- ファイル名の先頭に `2k_` を付けることで使用可能になります。
- パレット 0 番の色を自動的に透過します。

### H2A_2K_quick.js

- RPG ツクール 2000 の様々な挙動を再現します。
  - ジャンプの挙動
  - ダッシュの挙動
  - 顔グラフィック左右反転（文章で `\R`）
  - F12 キー
- このプラグインはくらむぼん氏の QuickMove.js を改変したものです。

### H2A_2K_chipsetConverter.js

<details><summary>画像を開く</summary><div>

![image](https://user-images.githubusercontent.com/22496143/74091770-9f1f5200-4afe-11ea-8893-ba4f7d1c8693.png)

![image](https://user-images.githubusercontent.com/22496143/74091778-b9f1c680-4afe-11ea-9435-8cd6b60262e5.png)

</div></details>

- ディレクトリ内の 2000 チップセットを MV に一括変換します。
- ファイル名の先頭に `2k_` を付けることで変換対象になります。
- 処理内容はくらむぼん氏の RPG ツクール 2000→MV 素材変換器 と同じです。
  - くらむぼん氏からコードの一部利用の許諾をいただきました。
- テストプレイ専用です。

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

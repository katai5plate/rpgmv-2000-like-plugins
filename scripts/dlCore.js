const clone = require("./gitClone");
const rm = require("rimraf");
const { core } = require("../config.json");

// コアスクリプトの各バージョンをクローンする
Promise.all(
  core.tags.map(tag => clone("https://github.com/rpgtkoolmv/corescript", tag))
)
  // 各 .git ファイルを削除する
  .then(dirs =>
    Promise.all(
      dirs.map(
        dir =>
          new Promise(done => {
            rm(`${dir}/.git`, done);
          })
      )
    )
  );

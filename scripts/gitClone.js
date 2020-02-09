const { spawn } = require("child_process");

module.exports = (url, version) =>
  new Promise((finish, reject) => {
    const path = `${process.cwd().replace(/\\/g, "/")}/core/${version.replace(
      /\./g,
      "-"
    )}`;
    const clone = spawn("git", [
      "clone",
      url,
      "--single-branch",
      "--depth",
      1,
      "-b",
      `v${version}`,
      path
    ]);
    clone.stderr.on("data", data => {
      console.error(data.toString(), "from:", { url, version }, "\n");
    });
    clone.stdout.on("data", data => {
      console.log(data.toString(), "from:", { url, version }, "\n");
    });
    clone.on("error", reject);
    clone.on("close", () => finish(path));
  });

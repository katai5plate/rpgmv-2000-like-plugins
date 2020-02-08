window.r2k = {};

r2k.chunk = function(arr, size) {
  return Array.from(
    {
      length: Math.ceil(arr.length / size)
    },
    function(_, i) {
      return arr.slice(i * size, i * size + size);
    }
  );
};

r2k.asyncGetPellete = function(bitmap) {
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
};

const mega = require("megajs");

const _config = {
  email: 'nimsarahhnaviduhj@gmail.com',
  password: 'T8.x3qh-CVS7xjc',
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246"
};

const upload = (stream, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const storage = new mega.Storage(_config, () => {
        const opts = { name: filename, allowUploadBuffering: true };
        stream.pipe(storage.upload(opts));
        storage.on("add", file => {
          file.link((err, url) => {
            if (err) return reject(err);
            storage.close();
            resolve(url);
          });
        });
      });
      storage.on('error', reject);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = { upload };

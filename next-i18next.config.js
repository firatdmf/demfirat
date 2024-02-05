const path = require("path");

module.exports = {
  i18: {
    locales: ["en", "ru", "tr"],
    defaultLocale: "en",
  },
  localePath:path.resolve('./public/locales'),
};

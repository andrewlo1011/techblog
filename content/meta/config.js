const colors = require("../../src/styles/colors");

module.exports = {
  siteTitle: "Technical blog - sharing Technical Stuff", // <title>
  shortSiteTitle: "Technical blog", // <title> ending for posts and pages
  siteDescription: "A blog for sharing Technical Stuff.",
  siteUrl: "https://drew.vip",
  pathPrefix: "",
  siteImage: "preview.jpg",
  siteLanguage: "en",
  // author
  authorName: "Drew Lo",
  //authorTwitterAccount: "NA",
  // info
  infoTitle: "Drew Lo",
  infoTitleNote: "Technical blog",
  // manifest.json
  manifestName: "TechBlog - sharing Technical Stuff",
  manifestShortName: "TechBlog", // max 12 characters
  manifestStartUrl: "/",
  manifestBackgroundColor: colors.background,
  manifestThemeColor: colors.background,
  manifestDisplay: "standalone",
  // contact
  contactEmail: "andrewlo1011@gmail.com",
  // social
  authorSocialLinks: [
    { name: "github", url: "https://github.com/andrewlo1011" },
  ]
};

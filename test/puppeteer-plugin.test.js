const { expect } = require("chai");
const http = require("http");
const finalhandler = require("finalhandler");
const serveStatic = require("serve-static");
const fs = require("fs-extra");
const scrape = require("website-scraper");
const PuppeteerPlugin = require("../index");

const directory = __dirname + "/tmp";

describe("Puppeteer plugin test", () => {
  before("serve website", () => serveWebsite(4567));

  after("delete dir", () => fs.removeSync(directory));

  it("should render dymanic website", async () => {
    const inject =
      '<script type="text/javascript">window.addEventListener()</script>';
    const result = await scrape({
      urls: ["http://localhost:4567"],
      directory: directory,
      plugins: [new PuppeteerPlugin({ append: inject })]
    });

    expect(result.length).eql(1);

    const content = fs
      .readFileSync(`${directory}/${result[0].filename}`)
      .toString();
    expect(content).to.contain('<div id="root">Hello world from JS!</div>');
    expect(content).to.contain(
      '<script type="text/javascript">window.addEventListener()</script>'
    );
  });
});

function serveWebsite(port = 3000) {
  const serve = serveStatic(__dirname + "/mock", { index: ["index.html"] });
  const server = http.createServer(function onRequest(req, res) {
    serve(req, res, finalhandler(req, res));
  });
  server.listen(port);
}

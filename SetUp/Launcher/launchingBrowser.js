import { chromium, devices, webkit } from "playwright";
// import { retries } from "../../uploadingImage/uploadingImages.js";

class BrowserSetupHandler {
  constructor() {
    this.browser = null;
    this.instagramUrl = "https://www.instagram.com/";
    this.fbUrl = "https://www.facebook.com/";
    this.iphone = devices["iPhone 13 Pro"];
    // this.iphone = devices["iPhone 13 Pro"];
    this.userAgent = `User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1`;
    this.retries = () => ({ maxRetries: 3, retry: 0, success: false });
  }

  async sleep(time) {
    const duration = time || 1;
    await new Promise((resolve) => setTimeout(resolve, duration * 1000));
  }

  settingUpBrowser = async ({
    headless = false,
    videos,
    device,
    proxy = {},
    userAgent,
  }) => {
    await this.browser?.close();
    const browser = await webkit.launch({
      headless,
      chromiumSandbox: false,
    });
    this.browser = browser;
    const context = await browser.newContext({
      permissions: ["clipboard-read"],
      ...(videos
        ? {
            recordVideo: {
              dir: "./videos/",
              size: { width: 1280, height: 720 },
            },
          }
        : {}),
      ...(device ? { ...device } : {}),
      userAgent: this.iphone.userAgent,
    });

    if (device) {
      await context.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => false });
        window.ontouchstart = true;
        navigator.maxTouchPoints = 5;

        const getParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function (param) {
          if (param === 37445) return "Apple Inc.";
          if (param === 37446) return "Apple GPU";
          return getParameter.call(this, param);
        };
      });
    }

    const page = await context.newPage();

    if (device) {
      await page.setViewportSize({
        width: this.iphone.viewport.width,
        height: this.iphone.viewport.height,
      });
    }
    return { browser, page, context };
  };
}

export const browserSetupHandler = new BrowserSetupHandler();
export default BrowserSetupHandler;

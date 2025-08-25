import BrowserSetupHandler from "../Launcher/launchingBrowser.js";

class MailsHandler extends BrowserSetupHandler {
  constructor() {
    super();
    this.gmxUrl = "https://www.gmx.com/consentpage";
    this.mailcomUrl = "https://www.mail.com/";
    this.mailPageId = {};
  }

  gmxMailcomLogin = async (page, email, emailPassword, timeout = 20000) => {
    try {
      await page.getByRole("link", { name: "Log in" }).click();
      await this.sleep(1);
      await page.getByRole("textbox", { name: "Email address" }).click();
      await page
        .getByRole("textbox", { name: "Email address" })
        .type(email, { delay: 10 });
      await page.getByRole("textbox", { name: "Password" }).click();
      await page
        .getByRole("textbox", { name: "Password" })
        .type(emailPassword, { delay: 10 });
      await this.sleep(1);
      await page.getByRole("button", { name: "Log in" }).click();
      await page.waitForNavigation({ timeout }).catch(() => {});
      await Promise.race([
        page.locator('[data-webdriver="INBOX:Inbox"]').click(),
        page.locator('[data-webdriver="INBOX:INBOX"]').click(),
      ]);
      return true;
    } catch (error) {
      console.log(error);
    }
  };

  gmxLoginPlaywright = async (context, email, emailPassword) => {
    try {
      const page = await context.newPage();

      await page.goto(this.gmxUrl).catch(() => {});
      await page
        .locator('iframe[title="Cookie settings required"]')
        .contentFrame()
        .locator('iframe[title="Cookie settings required"]')
        .contentFrame()
        .getByRole("button", { name: "Agree and continue" })
        .click()
        .catch(() => {});

      const res = await this.gmxMailcomLogin(page, email, emailPassword);
      if (!res) return false;
      return page;
    } catch (error) {
      console.log(error);

      return false;
    }
  };

  mailcomLoginPlaywright = async (context, email, emailPassword) => {
    try {
      const page = await context.newPage();
      await page.setViewportSize({
        width: this.iphone.viewport.width,
        height: this.iphone.viewport.height,
      });
      await page.goto(this.mailcomUrl).catch(() => {});
      const res = await this.gmxMailcomLogin(page, email, emailPassword);

      if (!res) return false;
      return page;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  extractingMailCode = async (page, sleepTime = 2) => {
    let { maxRetries, retry, success } = this.retries();

    try {
      await page.bringToFront();
      console.log("brinfort");

      while (retry < maxRetries && !success) {
        try {
          await page.reload().catch(() => {});
          await page
            .getByRole("link", { name: "Open E-mail: Confirm Email" })
            .first()
            .click();
        } catch (error) {
          console.log(error);
          retry++;
          continue;
        }
        //   await this.sleep(sleepTime);
        try {
          const emailText = await page
            .locator("#bodyIFrame")
            .contentFrame()
            .getByRole("table")
            .nth(4)
            .innerText()
            .catch(() => {});

          const codeMatch = emailText?.match(/\b\d{6}\b/);
          console.log(codeMatch[0]);
          if (codeMatch && codeMatch[0]?.length >= 6) {
            success = true;
            page.goBack().catch(() => {});
            return codeMatch[0];
          }
          throw new Error("Code not found in email");
        } catch (error) {
          console.log(error);
          await page.goBack().catch(() => {});
          await this.sleep(2);
          retry++;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  extractingfbSignupCode = async (page) => {
    let { maxRetries, retry, success } = this.retries();

    try {
      await page.bringToFront();

      while (retry < maxRetries && !success) {
        try {
          await page.reload().catch(() => {});
          const el = await page
            .getByRole("link", {
              name: /Open E-mail: \d{5} is your confirmation code/,
            })
            .first();

          if ((await el.count()) === 0) {
            throw new Error("Email element not found");
          }

          const emailText = await el.innerText();
          const codeMatch = emailText.match(/\b\d{5}\b/);
          console.log("Email code:", codeMatch);
          if (codeMatch && codeMatch[0]?.length >= 5) {
            success = true;
            return codeMatch[0];
          }
          throw new Error("Code not found in email");
        } catch (error) {
          console.log(error);
          await this.sleep(2);
          retry++;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
}

export const mailsHandler = new MailsHandler();
export default MailsHandler;

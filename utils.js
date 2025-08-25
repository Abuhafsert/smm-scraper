import { authenticator } from "otplib";
import * as fs from "node:fs/promises";


class Utils {
  constructor() {
    this.twoFaUrl = `https://2fa.live/`;
    this.hotmailUrl = "https://outlook.live.com/";
  }

  getFilesArray = async (file = "./accountOnMaFilesArray") => {
    const savingAccount = await fs.readFile(file, "utf8").catch(() => null);
    const splitAccount = savingAccount?.split("\n").filter((acc) => acc !== "") || [];
    return [...splitAccount];
  };

  emailUseFiltered = async ({ 
    fileToFilter = "emailChanged",
    emailToUse = [],
    emailErrorFile = 'errorEmail'
  }) => {
    const allFileChange = await this.getFilesArray(`./${fileToFilter}`);
    const allErrorMailFile = await this.getFilesArray(`./${emailErrorFile}`);

    const filterMailChange = (email) => allFileChange?.find(mail => mail.includes(email));
    const filterMailError = (email) => allErrorMailFile?.find(mail => mail.includes(email));
    const mailToUse = emailToUse.length > 0 ? emailToUse : await this.getFilesArray("./availableMails");

    const filterMail = mailToUse?.filter(mail => !filterMailChange(mail) && !filterMailError(mail)) || [];

    return [...filterMail];
  } 

  generate2faCode = async (value) => {
    try {
      const timeout = authenticator.timeRemaining();
      if(timeout <= 2) await this.sleep(3);
      const token = authenticator.generate(value?.replaceAll(' ', ''));
      return token;
    } catch (error) {
      console.error("Error generating 2FA code:", error);
      return;
    }
  };
  generate2faCodeLive = async (context, value) => {
    let copied = "";
    let attempts = 0;
    try {
      const page = await context.newPage();
      await page.setViewportSize({
        width: this.iphone.viewport.width,
        height: this.iphone.viewport.height,
      });
      await page.goto(this.twoFaUrl).catch(() => {});
      await page.getByRole("textbox", { name: "BK5V TVQ7 D2RB..." }).click();
      await page
        .getByRole("textbox", { name: "BK5V TVQ7 D2RB..." })
        .fill(value);
      await page.getByText("Submit").click();
      while (copied.length < 1 && attempts < 1000) {
        if (attempts > 300 || attempts > 600) await this.sleep(2);
        copied = await page
          .getByRole("textbox", { name: "ABC|2FA Code" })
          .inputValue();
        attempts++;
      }

      if (copied.length < 1) {
        console.error("Failed to generate 2FA code");
        return null;
      }
      page.close();
      return copied?.split("|")?.at(-1)?.trim();
    } catch (error) {
      console.error("Error generating 2FA code:", error);
      return null;
    }
  };
}

export const utils = new Utils();
export default Utils;

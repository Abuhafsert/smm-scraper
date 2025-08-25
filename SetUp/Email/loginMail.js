import MailsHandler from "./mails.js";
import { v4 as uuidv4 } from "uuid";

class LoginMails extends MailsHandler {
  constructor() {
    super();
  }

  loginMail = async (mails, type) => {
    const [mail] = mails?.split("\n") || [];
    const [email, password] = mail.split(":");
    const id = uuidv4();
    const emailType = email?.includes("gmx");
    console.log(emailType);
    

    try {
      const { page, browser, context } = await this.settingUpBrowser({
        headless: false,
        device: this.iphone,
        userAgent: this.userAgent,
      });

      this.mailPageId[id] = emailType ? await this.gmxLoginPlaywright(context, email, password) : await this.mailcomLoginPlaywright(
        context,
        email,
        password
      );
      const buffer = await this.mailPageId[id].screenshot();
      // await this.mailPageId[id].pause()
      return {
        image: buffer,
        id,
        success: true,
      };
    } catch (error) {
      return { error: true, message: error.message || "an error occured" };
    }
  };
}

export const loginMailsHandler = new LoginMails();
export default LoginMails;

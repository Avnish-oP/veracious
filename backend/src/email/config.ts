import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.MAILTRAP_API_TOKEN;
if (!TOKEN) {
  throw new Error("MAILTRAP_API_TOKEN environment variable is not set.");
}

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "cs@otticamart.com",
  name: "Mailtrap Test",
};

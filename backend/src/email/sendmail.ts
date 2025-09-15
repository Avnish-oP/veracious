import { mailtrapClient, sender } from "./config";
import {
  resetPasswordEmailTemplate,
  sendResetSuccessMailTemplate,
  verifyEmailTemplate,
  welcomeEmailTemplate,
} from "./EmailTemplates/authEmailsTemplate";

const sendVerificationEmail = async (to: string, code: string) => {
  const recipient = [{ email: to }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: verifyEmailTemplate(code),
    });
    if (!response.success) {
      throw new Error("Failed to send verification email");
    }
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

const sendWelcomeEmail = async (to: string, name: string) => {
  const recipient = [{ email: to }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Welcome to Veracious",
      html: welcomeEmailTemplate(name),
    });
    if (!response.success) {
      throw new Error("Failed to send welcome email");
    }
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
};

const sendResetPasswordEmail = async (to: string, token: string) => {
  const recipient = [{ email: to }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: resetPasswordEmailTemplate(token),
    });
    if (!response.success) {
      throw new Error("Failed to send reset password email");
    }
    console.log("Reset password email sent successfully");
  } catch (error) {
    console.error("Error sending reset password email:", error);
    throw error;
  }
};

const sendResetSuccessEmail = async (to: string, name: string) => {
  const recipient = [{ email: to }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Your password has been reset",
      html: sendResetSuccessMailTemplate(name),
    });
    if (!response.success) {
      throw new Error("Failed to send reset success email");
    }
    console.log("Reset success email sent successfully");
  } catch (error) {
    console.error("Error sending reset success email:", error);
    throw error;
  }
};

export {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendResetSuccessEmail,
};

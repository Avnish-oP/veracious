import { mailtrapClient, sender } from "./config";
import {
  resetPasswordEmailTemplate,
  sendResetSuccessMailTemplate,
  verifyEmailTemplate,
  welcomeEmailTemplate,
} from "./EmailTemplates/authEmailsTemplate";
import {
  orderConfirmationTemplate,
  orderStatusUpdateTemplate,
} from "./EmailTemplates/orderEmailsTemplate";

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

interface OrderEmailData {
  id: string;
  items: Array<{
    productName: string;
    productImage: string | null;
    quantity: number;
    price: number;
    configuration?: {
      lensType?: string;
      lensPrice?: number;
    };
  }>;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal: string;
    country: string;
  };
  userName?: string;
}

const sendOrderConfirmationEmail = async (to: string, order: OrderEmailData) => {
  const recipient = [{ email: to }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: `Order Confirmed - #${order.id}`,
      html: orderConfirmationTemplate(order),
    });
    if (!response.success) {
      throw new Error("Failed to send order confirmation email");
    }
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    // Don't throw - email failure shouldn't block order processing
  }
};

const sendOrderStatusEmail = async (
  to: string,
  order: { id: string; userName?: string },
  status: string
) => {
  const recipient = [{ email: to }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: `Order Update - #${order.id} is now ${status.replace('_', ' ')}`,
      html: orderStatusUpdateTemplate(order, status),
    });
    if (!response.success) {
      throw new Error("Failed to send order status email");
    }
  } catch (error) {
    console.error("Error sending order status email:", error);
    // Don't throw - email failure shouldn't block status update
  }
};

export {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendResetSuccessEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
};

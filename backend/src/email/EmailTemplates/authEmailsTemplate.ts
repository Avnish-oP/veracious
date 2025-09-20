const verifyEmailTemplate = (code: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;    

            padding: 0;
        }
        .container {
            max-width: 500px;
            margin: 40px auto;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            padding: 32px 24px;
        }
        h2 {
            color: #333;
            margin-bottom: 16px;
        }
        p {
            color: #555;
            margin-bottom: 24px;
            font-size: 16px;
        }
        .code-box {
            display: inline-block;
            background: #eaf6ff;
            color: #1976d2;
            font-size: 24px;
            letter-spacing: 4px;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: bold;
            margin-bottom: 24px;
        }
        .footer {
            color: #888;
            font-size: 13px;
            margin-top: 32px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Email Verification</h2>
        <p>Thank you for signing up! Please use the verification code below to verify your email address:</p>
        <div class="code-box">${code}</div>
        <p>If you did not request this, you can safely ignore this email.</p>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Veracious. All rights reserved.
        </div>
    </div>
</body>
</html>
`;

const welcomeEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Veracious</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 500px;
            margin: 40px auto;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            padding: 32px 24px;
        }
        h2 {
            color: #333;
            margin-bottom: 16px;
        }
        p {
            color: #555;
            margin-bottom: 24px;
            font-size: 16px;
        }
        .footer {
            color: #888;
            font-size: 13px;
            margin-top: 32px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Welcome to Veracious, ${name}!</h2>
        <p>We're excited to have you on board. If you have any questions, feel free to reach out to our support team.</p>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Veracious. All rights reserved.
        </div>
    </div>
</body>
</html>
`;

const resetPasswordEmailTemplate = (token: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 500px;
            margin: 40px auto;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            padding: 32px 24px;
        }
        h2 {
            color: #333;
            margin-bottom: 16px;
        }
        p {
            color: #555;
            margin-bottom: 24px;
            font-size: 16px;
        }
        .code-box {
            display: inline-block;
            background: #eaf6ff;
            color: #1976d2;
            font-size: 24px;
            letter-spacing: 4px;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: bold;
            margin-bottom: 24px;
        }
        .footer {
            color: #888;
            font-size: 13px;
            margin-top: 32px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Reset Your Password</h2>
        <p>To reset your password, please use the following link:</p>
        <a href="${
          process.env.FRONTEND_URL
        }/auth/reset-password?token=${token}" class="code-box">Reset Password</a>
        <p>If you did not request this, you can safely ignore this email.</p>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Veracious. All rights reserved.
        </div>
    </div>
</body>
</html>
`;

const sendResetSuccessMailTemplate = (name: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset Successful</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 500px;
            margin: 40px auto;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            padding: 32px 24px;
        }
        h2 {
            color: #333;
            margin-bottom: 16px;
        }
        p {
            color: #555;
            margin-bottom: 24px;
            font-size: 16px;
        }
        .footer {
            color: #888;
            font-size: 13px;
            margin-top: 32px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Reset Successful</h2>
        <p>Hi ${name},</p>
        <p>Your password has been successfully reset. If you did not initiate this change, please contact support immediately.</p>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Veracious. All rights reserved.
        </div>
    </div>
</body>
</html>
`;

export {
  verifyEmailTemplate,
  welcomeEmailTemplate,
  resetPasswordEmailTemplate,
  sendResetSuccessMailTemplate,
};

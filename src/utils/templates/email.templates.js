export const templateEmail = ({ otp, title = "TapTalk OTP" } = {}) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      background-color: #1d1b2e;
      margin: 0;
      font-family: Arial, sans-serif;
    }
    .container {
      max-width: 350px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
      text-align: center;
      padding: 30px 20px;
    }
    .logo-box {
      font-size: 80px;
      font-weight: bold;
      color: #1d1b2e;
      position: relative;
      display: inline-block;
      margin: 20px 0 40px 0;
    }
    .logo-box img {
      max-width: 100%;
      display: block;
      margin: 0 auto 20px;
      border-radius: 12px;
    }
    .bubble {
      display: inline-block;
      background: #ff7043;
      color: #fff;
      padding: 10px 16px;
      border-radius: 16px;
      font-size: 14px;
      position: absolute;
      top: -10px;
      right: -100px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.15);
    }
    .bubble.gray {
      background: #e0e0e0;
      color: #333;
      top: 40px;
      right: -80px;
    }
    .bubble.blue {
      background: #42a5f5;
      top: 20px;
      left: -90px;
    }
    .otp-box {
      background-color: #ff7043;
      padding: 15px 25px;
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #fff;
      border-radius: 8px;
      display: inline-block;
      margin: 30px 0;
    }
    .footer {
      margin-top: 40px;
      font-size: 15px;
      color: #ffffffff;
      background-color: #ff7043;
      padding:15px;
      border-radius: 8px;

    }
  </style>
</head>
<body>
  <div class="container">
    <!-- الصورة -->
    <div class="logo-box">
      <img src="cid:topImage" alt="TapTalk Banner" />
      T
      <div class="bubble">...</div>
      <div class="bubble gray">...</div>
      <div class="bubble blue">...</div>
    </div>

    <h1 style="color:#1d1b2e;">Email Confirmation</h1>
    <p style="color:#555; font-size:16px;">
      Use the following OTP code to confirm your email or reset your password on <strong>TapTalk</strong>.
      This code is valid for <strong>3 minutes</strong>.
    </p>
    <div class="otp-box">${otp}</div>

    <div class="footer">
      © ${new Date().getFullYear()} TapTalk. All rights reserved.
    </div>
  </div>
</body>
</html>`;
};

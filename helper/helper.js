const nodemailer = require("nodemailer");
const getParamsQuerry = (arr) => {
  let results = arr.map((a, index) => {
    return "$" + `${index + 1}`;
  });
  return results.join(", ");
};

const mailerUmat = (email, content, title) => {
  let transporter = nodemailer.createTransport({
    // config mail server
    service: "Gmail",
    auth: {
      user: "umat.findjob@gmail.com",
      pass: "skujsvbwfeicrurj",
    },
  });

  let mailTempllate = `<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title></title>
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
    <style>
      table, td, div, h1, p {font-family: Arial, sans-serif;}
    </style>
  </head>
  <body style="margin:0;padding:0;">
    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
      <tr>
        <td align="center" style="padding:0;">
          <table role="presentation" style="width:602px;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;">
            <tr>
              <td align="center" style="padding:40px 0 30px 0;background:#111958;">
                <img src="https://res.cloudinary.com/ntq-solution/image/upload/v1659971878/Screen_Shot_2022-08-08_at_22.17.36_kipbwd.png" alt="" width="300" style="height:300;display:block;" />
              </td>
            </tr>
            <tr>
              <td style="padding:36px 30px 42px 30px;">
                <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                  <tr>
                    <td style="padding:0 0 36px 0;color:#153643;">
                      <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial,sans-serif;">Umat xin chào bạn !</h1>
                      <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">Cảm ơn bạn đã sử dụng dịch vụ tuyển dụng của Umat và mong rằng bạn hài lòng với dịch vụ của chúng tôi. Mọi thắc mắc cần giải đáp xin vui lòng liên hệ tới email umat.findjob@gmail.com</p>
                      ${content}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;background:#ee4c50;">
                <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:9px;font-family:Arial,sans-serif;">
                  <tr>
                    <td style="padding:0;width:50%;" align="left">
                      <p style="margin:0;font-size:14px;line-height:16px;font-family:Arial,sans-serif;color:#fff;">
                        &reg; Công Nguyễn, Hà Nội 2022<br/><a href="https://www.facebook.com/profile.php?id=100012082206799" style="color:#fff;text-decoration:underline;">Theo dõi tại đây</a>
                      </p>
                    </td>
                    <td style="padding:0;width:50%;" align="right">
                      <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
                        <tr>
                          <td style="padding:0 0 0 10px;width:38px;">
                            <a href="http://www.twitter.com/" style="color:#ffffff;"><img src="https://assets.codepen.io/210284/tw_1.png" alt="Twitter" width="38" style="height:auto;display:block;border:0;" /></a>
                          </td>
                          <td style="padding:0 0 0 10px;width:38px;">
                            <a href="http://www.facebook.com/" style="color:#ffffff;"><img src="https://assets.codepen.io/210284/fb_1.png" alt="Facebook" width="38" style="height:auto;display:block;border:0;" /></a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;

  let mainOptions = {
    // thiết lập đối tượng, nội dung gửi mail
    from: "umat.findjob@gmail.com",
    to: `${email}`,
    subject: title,
    html: mailTempllate,
  };
  transporter.sendMail(mainOptions, function (err, info) {
    if (err) {
      console.log(err);
      const error = new Error(
        "Cấp lại mật khẩu không thành công hãy thử lại với email chính xác !",
      );
      error.statusCode = 303;
      throw error;
    } else {
      console.log("Message sent: " + info.response);
    }
  });
};

module.exports = {
  getParamsQuerry,
  mailerUmat,
};

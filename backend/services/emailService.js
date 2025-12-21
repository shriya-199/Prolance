const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.log('Email server connection error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Send OTP email
const sendOTPEmail = async (email, name, otp) => {
    try {
        const mailOptions = {
            from: `"Prolance" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset OTP - Prolance',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background-color: #16a34a;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 5px 5px 0 0;
                        }
                        .content {
                            background-color: #f9f9f9;
                            padding: 30px;
                            border-radius: 0 0 5px 5px;
                        }
                        .otp-box {
                            background-color: white;
                            border: 2px dashed #16a34a;
                            padding: 20px;
                            text-align: center;
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 5px;
                            margin: 20px 0;
                            color: #16a34a;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            font-size: 12px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Password Reset Request</h1>
                        </div>
                        <div class="content">
                            <p>Hi ${name},</p>
                            <p>You requested to reset your password. Use the OTP below to proceed:</p>
                            <div class="otp-box">${otp}</div>
                            <p><strong>This code will expire in 10 minutes.</strong></p>
                            <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                            <p>Best regards,<br>The Prolance Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};

module.exports = {
    sendOTPEmail
};

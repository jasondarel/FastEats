import amqp from "amqplib";
import nodemailer from "nodemailer";
import envInit from "../../config/envInit.js";
import logger from "../../config/loggerInit.js";

envInit();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672"; 
const EXCHANGE_NAME = process.env.EXCHANGE_NAME || "email_exchange"; 
const EXCHANGE_TYPE = process.env.EXCHANGE_TYPE || "direct"; 
const QUEUE_NAME = process.env.USER_RESET_QUEUE || "email_verification_queue"; 
const ROUTING_KEY = process.env.EMAIL_RESET_PASSWORD_ROUTE || "email_verification";  

logger.info("RESET PASSWORD EMAIL CONSUMER SERVICE");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  logger.error("❌ ERROR: Missing EMAIL_USER or EMAIL_PASSWORD in .env");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendResetPasswordEmail = async (email, token) => {
  const resetPasswordLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  const subject = "FastEats Password Reset Request";
  const body = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your FastEats account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetPasswordLink}" 
               style="background-color: #3498db; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset My Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #7f8c8d;">${resetPasswordLink}</p>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This link will expire in 5 minutes for security reasons</li>
            <li>If you didn't request this password reset, please ignore this email</li>
            <li>Your password will remain unchanged until you create a new one</li>
          </ul>
          <p>If you continue to have problems, please contact our support team.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #7f8c8d;">
            This is an automated message from FastEats. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: `"FastEats Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    text: `Password Reset Request\n\nWe received a request to reset your password for your FastEats account.\n\nClick the link below to reset your password:\n${resetPasswordLink}\n\nThis link will expire in 1 hour for security reasons.\n\nIf you didn't request this password reset, please ignore this email.`,
    html: body,
  };

  await transporter.sendMail(mailOptions);
  logger.info(`📧 Password reset email sent to ${email}`);
};

const startResetPasswordConsumer = async () => {
  try {
    logger.info("⏳ Connecting to RabbitMQ...");
    logger.info(`🔗 RabbitMQ URL: ${RABBITMQ_URL}`);
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    logger.info("✅ Connected to RabbitMQ");

    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    logger.info(`📩 Waiting for reset password messages in "${QUEUE_NAME}"`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          const { email, token } = JSON.parse(msg.content.toString());
          
          if (!email || !token) {
            throw new Error("Missing required fields: email or token");
          }
          
          logger.info(`📨 Processing reset password request for: ${email}`);
          await sendResetPasswordEmail(email, token);
          channel.ack(msg);
          logger.info(`✅ Reset password email processed successfully for: ${email}`);
        } catch (error) {
          logger.error(`❌ Error processing reset password message: ${error.message}`);
          // Reject message and don't requeue to avoid infinite loop
          channel.nack(msg, false, false);
        }
      }
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`\n🔌 Received ${signal}. Closing RabbitMQ connection...`);
      try {
        await channel.close();
        await connection.close();
        logger.info("✅ RabbitMQ connection closed successfully");
        process.exit(0);
      } catch (error) {
        logger.error("❌ Error during shutdown:", error);
        process.exit(1);
      }
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

  } catch (error) {
    logger.error("❌ RabbitMQ Connection Failed:", error);
    logger.info("🔄 Retrying connection in 5 seconds...");
    setTimeout(startResetPasswordConsumer, 5000);
  }
};

export default startResetPasswordConsumer;
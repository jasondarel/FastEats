import amqp from "amqplib";
import nodemailer from "nodemailer";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
const EXCHANGE_NAME = "email_exchange";
const EXCHANGE_TYPE = "direct";
const QUEUE_NAME = "email_verification_queue";
const ROUTING_KEY = "email_verification";

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error("❌ ERROR: Missing EMAIL_USER or EMAIL_PASSWORD in .env");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (email, token, otpCode) => {
  const verificationLink = `http://localhost:5173/verify-token?token=${token}`;
  const subject = "FastEats Email Verification";
  const body = `
    <html>
      <body>
        <p>Your OTP Code is: <strong>${otpCode}</strong></p>
        <p>Valid for 5 minutes. If you did not request this, ignore this email.</p>
        <p>Click <a href="${verificationLink}">here</a> to verify your email.</p>
      </body>
    </html>
  `;

  const mailOptions = {
    from: `"FastEats" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    text: `Your OTP Code is: ${otpCode}\n\nClick the link to verify your email: ${verificationLink}`,
    html: body,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Verification email sent to ${email}`);
};

const startConsumer = async () => {
  try {
    console.log("⏳ Connecting to RabbitMQ...");
    console.log(`🔗 RabbitMQ URL: ${RABBITMQ_URL}`);
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    console.log("✅ Connected to RabbitMQ");

    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    console.log(`📩 Waiting for messages in "${QUEUE_NAME}"`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          const { email, token, otp } = JSON.parse(msg.content.toString());

          await sendVerificationEmail(email, token, otp);
          channel.ack(msg);
        } catch (error) {
          console.error(`❌ Error processing message: ${error.message}`);
        }
      }
    });

    process.on("SIGINT", async () => {
      console.log("\n🔌 Closing RabbitMQ connection...");
      await channel.close();
      await connection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ RabbitMQ Connection Failed:", error);
    setTimeout(startConsumer, 5000);
  }
};

export default startConsumer;

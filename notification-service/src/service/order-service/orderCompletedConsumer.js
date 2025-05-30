import amqp from "amqplib";
import nodemailer from "nodemailer";
import envInit from "../../config/envInit.js";
import logger from "../../config/loggerInit.js";

envInit();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
const EXCHANGE_NAME = process.env.EXCHANGE_NAME || "email_exchange";
const EXCHANGE_TYPE = process.env.EXCHANGE_TYPE || "direct";
const QUEUE_NAME = process.env.QUEUE_NAME || "email_verification_queue";
const ROUTING_KEY = process.env.EMAIL_COMPLETED_ORDER_ROUTE || "email_verification";

logger.info("ORDER COMPLETED CONSUMER SERVICE");

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

const buildOrderTable = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        return "<tr><td colspan='4' style='padding:12px;text-align:center;color:#888;'>No items found</td></tr>";
    }
    
    let totalAmount = 0;
    
    const tableRows = items.map((item, idx) => {
        const itemName = item.menu_name || item.name || `Menu Item #${item.menu_id || 'Unknown'}`;
        const quantity = item.item_quantity || item.quantity || 1;
        const price = item.menu_price || 0;
        const itemTotal = price * quantity;
        totalAmount += itemTotal;
        
        const formatPrice = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
        };
        
        return `
        <tr>
            <td style="padding:12px;border:1px solid #ddd;text-align:center;background:#fafafa;">${idx + 1}</td>
            <td style="padding:12px;border:1px solid #ddd;">
            <div style="font-weight:600;">${itemName}</div>
            ${item.menu_description ? `<div style="font-size:12px;color:#666;margin-top:4px;">${item.menu_description}</div>` : ''}
            </td>
            <td style="padding:12px;border:1px solid #ddd;text-align:center;">${quantity}</td>
            <td style="padding:12px;border:1px solid #ddd;text-align:right;font-weight:600;">${formatPrice(itemTotal)}</td>
        </tr>
        `;
    }).join("");
    
    const totalRow = `
        <tr style="background:#f8f9fa;font-weight:bold;">
        <td colspan="3" style="padding:12px;border:1px solid #ddd;text-align:right;">Total:</td>
        <td style="padding:12px;border:1px solid #ddd;text-align:right;color:#e74c3c;font-size:16px;">${new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(totalAmount)}</td>
        </tr>
    `;
    return tableRows + totalRow;
};

const getStatusColor = (status) => {
    const statusColors = {
        'PREPARING': '#f39c12',   // orange
        'READY': '#27ae60',       // green
        'COMPLETED': '#3498db',   // blue
        'DELIVERED': '#2ecc71',   // green
        'CANCELLED': '#e74c3c',   // red
        'PENDING': '#95a5a6'      // grey
    };
    // Default to blue if unknown status to match COMPLETED
    return statusColors[status?.toUpperCase()] || '#3498db';
};

const sendOrderCompletedEmail = async ({
    recipientType,
    toEmail,
    recipientName,
    order_id,
    status,
    items,
    restaurant,
    created_at,
    order_type,
    otherName
}) => {
  const restaurantName = restaurant?.restaurant_name || "Our Partner Restaurant";
  const restaurantAddress = restaurant?.restaurant_address || "";
  const orderStatus = status || "COMPLETED";
  const statusColor = getStatusColor(orderStatus);
  const orderDate = created_at ? new Date(created_at).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : "N/A";

  // Custom greeting and message per recipient
  let greeting, mainMessage, extraMessage;
  if (recipientType === "customer") {
        greeting = `Hi ${recipientName || "Valued Customer"}! 👋`;
        mainMessage = `
        Your order <strong>#${order_id}</strong> is now 
        <span style="color:${statusColor};font-weight:bold;text-transform:uppercase;">${orderStatus}</span>
        at <strong>${restaurantName}</strong>.
        `;
        extraMessage = `
        <div style="background:#fff3cd;border:1px solid #ffeaa7;border-radius:6px;padding:15px;margin:20px 0;">
            <p style="margin:0;color:#856404;font-weight:500;">
            🍳 Your delicious meal is being prepared with care! 
            We'll notify you once it's ready for pickup or delivery.
            </p>
        </div>
        `;
  } else {
        greeting = `Hi ${recipientName || "Partner"}! 👋`;
        mainMessage = `
        A new order <strong>#${order_id}</strong> is now 
        <span style="color:${statusColor};font-weight:bold;text-transform:uppercase;">${orderStatus}</span>
        in <strong>${restaurantName}</strong> from customer <strong>${otherName || "a customer"}</strong>.
        `;
        extraMessage = `
        <div style="background:#d4edda;border:1px solid #c3e6cb;border-radius:6px;padding:15px;margin:20px 0;">
            <p style="margin:0;color:#155724;font-weight:500;">
            🚀 Please prepare the order as soon as possible to maintain excellent service!
            </p>
        </div>
        `;
  }

  const subject = recipientType === "customer"
      ? `FastEats Order #${order_id} - Now ${orderStatus}!`
      : `New Order #${order_id} is ${orderStatus} at ${restaurantName}`;

  const body = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update</title>
      </head>
      <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f8f9fa;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:30px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:bold;">FastEats</h1>
            <p style="color:#ffffff;margin:10px 0 0 0;opacity:0.9;">Your food delivery partner</p>
          </div>

          <!-- Content -->
          <div style="padding:30px;">
            <h2 style="color:#333;margin:0 0 20px 0;">${greeting}</h2>
            
            <div style="background:#f8f9fa;border-left:4px solid ${statusColor};padding:20px;margin:20px 0;border-radius:4px;">
              <p style="margin:0;font-size:16px;color:#333;">
                ${mainMessage}
              </p>
              ${restaurantAddress ? `<p style="margin:10px 0 0 0;color:#666;font-size:14px;">📍 ${restaurantAddress}</p>` : ''}
            </div>

            <div style="margin:30px 0;">
              <h3 style="color:#333;margin:0 0 15px 0;font-size:18px;">Order Details:</h3>
              
              <table style="width:100%;border-collapse:collapse;margin:15px 0;border-radius:6px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <thead>
                  <tr style="background:#667eea;">
                    <th style="padding:15px 12px;color:#ffffff;text-align:center;font-weight:600;">#</th>
                    <th style="padding:15px 12px;color:#ffffff;text-align:left;font-weight:600;">Item</th>
                    <th style="padding:15px 12px;color:#ffffff;text-align:center;font-weight:600;">Qty</th>
                    <th style="padding:15px 12px;color:#ffffff;text-align:center;font-weight:600;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildOrderTable(items)}
                </tbody>
              </table>
            </div>

            <div style="background:#f8f9fa;padding:20px;border-radius:6px;margin:20px 0;">
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                <span style="color:#666;font-weight:500;">Order ID:</span>
                <span style="color:#333;font-weight:bold;">#${order_id}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                <span style="color:#666;font-weight:500;">Status:</span>
                <span style="color:${statusColor};font-weight:bold;text-transform:uppercase;">${orderStatus}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                <span style="color:#666;font-weight:500;">Order Date:</span>
                <span style="color:#333;">${orderDate}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#666;font-weight:500;">Restaurant:</span>
                <span style="color:#333;font-weight:500;">${restaurantName}</span>
              </div>
            </div>

            ${extraMessage}

            <p style="color:#333;line-height:1.6;margin:25px 0;">
              Thank you for choosing FastEats! We're committed to delivering the best food experience right to your doorstep.
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #e9ecef;">
            <p style="margin:0;color:#6c757d;font-size:12px;">
              Need help? Contact us at support@fasteats.com or call (555) 123-FAST
            </p>
            <p style="margin:10px 0 0 0;color:#6c757d;font-size:11px;">
              This is an automated message. Please do not reply to this email.
            </p>
            <p style="margin:10px 0 0 0;color:#6c757d;font-size:11px;">
              © 2025 FastEats. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

  const text = recipientType === "customer" ?
    `
Hi ${recipientName || "Customer"}!

Your order #${order_id} is now ${orderStatus} at ${restaurantName}.

Order Details:
${items.map((item, idx) => {
  const itemName = item.menu_name || `Menu #${item.menu_id}`;
  const quantity = item.item_quantity || 1;
  const price = item.menu_price || 0;
  const total = price * quantity;
  const formatPrice = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  return `${idx + 1}. ${itemName} x${quantity} - ${formatPrice(total)}`;
}).join('\n')}

Order Date: ${orderDate}
Restaurant: ${restaurantName}
${restaurantAddress ? `Address: ${restaurantAddress}` : ''}

Thank you for choosing FastEats!

Need help? Contact us at support@fasteats.com or call (555) 123-FAST
`
    :
    `
Hi ${recipientName || "Partner"}!

A new order #${order_id} is now ${orderStatus} in ${restaurantName} from customer ${otherName || "a customer"}.

Order Details:
${items.map((item, idx) => {
  const itemName = item.menu_name || `Menu #${item.menu_id}`;
  const quantity = item.item_quantity || 1;
  const price = item.menu_price || 0;
  const total = price * quantity;
  const formatPrice = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  return `${idx + 1}. ${itemName} x${quantity} - ${formatPrice(total)}`;
}).join('\n')}

Order Date: ${orderDate}
Restaurant: ${restaurantName}
${restaurantAddress ? `Address: ${restaurantAddress}` : ''}

Thank you for your partnership with FastEats!

Need help? Contact us at support@fasteats.com or call (555) 123-FAST
`;

  const mailOptions = {
    from: `"FastEats Order Updates" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: body,
    text,
  };

  await transporter.sendMail(mailOptions);
  logger.info(`📧 Order completed email sent to ${toEmail} (${recipientType}) for order #${order_id}`);
};

// Send to both customer and owner, if their emails exist
const sendOrderNotifications = async (payload) => {
  const tasks = [];
  const {
    ownerEmail,
    ownerName,
    customerEmail,
    customerName,
    order_id,
    status,
    items,
    restaurant,
    created_at,
    order_type,
  } = payload;

  if (customerEmail) {
    tasks.push(sendOrderCompletedEmail({
      recipientType: "customer",
      toEmail: customerEmail,
      recipientName: customerName,
      order_id,
      status,
      items,
      restaurant,
      created_at,
      order_type,
      otherName: ownerName
    }));
  }
  if (ownerEmail) {
    tasks.push(sendOrderCompletedEmail({
      recipientType: "owner",
      toEmail: ownerEmail,
      recipientName: ownerName,
      order_id,
      status,
      items,
      restaurant,
      created_at,
      order_type,
      otherName: customerName
    }));
  }
  if (tasks.length === 0) {
    logger.error("❌ No valid recipient emails found for order notification.");
    return;
  }
  await Promise.all(tasks);
};

const startOrderCompletedConsumer = async () => {
  try {
    logger.info("⏳ Connecting to RabbitMQ...");
    logger.info(`🔗 RabbitMQ URL: ${RABBITMQ_URL}`);
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    logger.info("✅ Connected to RabbitMQ");

    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    logger.info(`📩 Waiting for messages in "${QUEUE_NAME}" with routing key "${ROUTING_KEY}"`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          const payload = JSON.parse(msg.content.toString());
          logger.info(`📨 Processing order notification for order #${payload.order_id}`);
          
          await sendOrderNotifications(payload);
          channel.ack(msg);
          
          logger.info(`✅ Successfully processed order #${payload.order_id}`);
        } catch (error) {
          logger.error(`❌ Error processing message: ${error.message}`);
          logger.error(`📋 Payload: ${msg.content.toString()}`);
          channel.nack(msg, false, false);
        }
      }
    });

    process.on("SIGINT", async () => {
      logger.info("\n🔌 Closing RabbitMQ connection gracefully...");
      await channel.close();
      await connection.close();
      logger.info("✅ RabbitMQ connection closed");
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("\n🔌 Received SIGTERM, closing RabbitMQ connection gracefully...");
      await channel.close();
      await connection.close();
      logger.info("✅ RabbitMQ connection closed");
      process.exit(0);
    });

  } catch (error) {
    logger.error("❌ RabbitMQ Connection Failed:", error);
    logger.info("🔄 Retrying connection in 5 seconds...");
    setTimeout(startOrderCompletedConsumer, 5000);
  }
};

export default startOrderCompletedConsumer;
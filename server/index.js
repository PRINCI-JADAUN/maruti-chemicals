import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import { z } from "zod";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { catalogue } from "../shared/catalogue.js";

const app = express();
const port = Number(process.env.PORT) || 3000;
const currentDir = dirname(fileURLToPath(import.meta.url));
const clientDist = resolve(currentDir, "../dist");
const { company: companyDetails, categories, products } = catalogue;
const categoryById = new Map(categories.map((category) => [category.id, category]));
const productById = new Map(products.map((product) => [product.id, product]));

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));

const enquirySchema = z.object({
  name: z.string().trim().min(1).max(120),
  companyName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().default(""),
  industry: z.string().trim().min(1).max(120),
  message: z.string().trim().max(2000).optional().default(""),
  items: z.array(z.object({
    productId: z.string().min(1),
    categoryId: z.string().min(1),
    quantity: z.number().int().min(1).max(100000),
  }).strict()).min(1).max(40),
}).strict();

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many enquiries from this connection. Please try again later." },
});

app.get("/api/health", (_request, response) => response.json({ status: "ok" }));

app.post("/api/enquiries", enquiryLimiter, async (request, response) => {
  const parsed = enquirySchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ error: "Please check your details and enquiry list, then try again." });
  }

  const invalidProduct = parsed.data.items.some((item) =>
    !productById.has(item.productId) ||
    !categoryById.has(item.categoryId) ||
    !productById.get(item.productId).categoryIds.includes(item.categoryId),
  );
  if (invalidProduct) {
    return response.status(400).json({ error: "The enquiry list contains an unrecognised product or industry. Refresh the catalogue and try again." });
  }

  const requiredSettings = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
  const missingSettings = requiredSettings.filter((key) => !process.env[key]);
  if (missingSettings.length) {
    console.error(`Cannot send enquiry: missing email configuration (${missingSettings.join(", ")}).`);
    return response.status(503).json({ error: "Enquiry email is not configured yet. Please contact the company directly." });
  }

  const { name, companyName, email, phone, industry, message, items } = parsed.data;
  const itemLines = items.map(({ productId, categoryId, quantity }) => {
    const product = productById.get(productId);
    return `• ${product.name} | ${quantity} unit(s) | Industry: ${categoryById.get(categoryId).name}`;
  });
  const text = [
    "A new Maruti Chemicals product enquiry has been submitted.",
    "",
    `Contact: ${name}`,
    `Company: ${companyName}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    `Industry: ${industry}`,
    "",
    "Requested products:",
    ...itemLines,
    "",
    "Additional notes:",
    message || "None provided",
  ].join("\n");

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.COMPANY_EMAIL || companyDetails.enquiryEmail || companyDetails.email,
      replyTo: email,
      subject: "New Maruti Chemicals product enquiry",
      text,
    });
    return response.status(201).json({ message: "Enquiry sent successfully." });
  } catch (error) {
    console.error("Failed to send product enquiry email:", error);
    return response.status(502).json({ error: "We couldn't deliver your enquiry email. Please try again or contact the company directly." });
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDist));
  app.get("*", (_request, response) => response.sendFile(resolve(clientDist, "index.html")));
}

app.listen(port, () => {
  console.log(`Maruti Chemicals API listening on http://localhost:${port}`);
});

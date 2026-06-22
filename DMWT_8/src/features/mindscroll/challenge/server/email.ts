import nodemailer from "nodemailer";
import type { ReportData } from "./types";

export async function sendReportEmail(to: string, report: ReportData) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const from = process.env.GMAIL_FROM_EMAIL ?? (gmailUser ? `MINDSCROLL <${gmailUser}>` : "MINDSCROLL");

  if (!gmailUser || !gmailPassword) {
    throw new Error("GMAIL_USER oder GMAIL_APP_PASSWORD fehlt.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject: report.subject,
    html: report.html,
    text: report.text,
  });
}

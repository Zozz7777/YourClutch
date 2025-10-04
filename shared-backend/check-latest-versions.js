/**
 * Fetch latest versions for a list of npm packages.
 * Run: node check-latest-versions.js
 */

import fetch from "node-fetch";

const packages = [
  "express", "compression", "cors", "helmet", "hpp", "connect-timeout",
  "mongodb", "mongoose", "redis", "ioredis", "node-cache",
  "@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner",
  "jsonwebtoken", "bcryptjs", "speakeasy", "xss-clean", "express-mongo-sanitize",
  "express-rate-limit", "rate-limit-redis", "bull", "agenda",
  "@anthropic-ai/sdk", "@google/generative-ai", "openai",
  "@sendgrid/mail", "@mailchimp/mailchimp_marketing", "twilio",
  "nodemailer", "socket.io", "socket.io-client", "ws", "stripe",
  "multer", "sharp", "jimp", "pdf-lib", "pdfkit", "pizzip", "docxtemplater",
  "unzipper", "archiver", "joi", "express-validator", "lodash", "moment",
  "csv-parser", "exceljs", "axios", "node-fetch", "form-data", "uuid",
  "dotenv", "dotenv-expand", "fs-extra", "public-ip", "network-interfaces",
  "node-cron", "node-schedule", "cron", "winston", "morgan",
  "commander", "inquirer", "chalk", "boxen", "gradient-string",
  "figlet", "ora", "nanospinner", "progress", "listr2",
  "envinfo", "kleur", "config", "nconf", "cross-env", "concurrently",
  "cheerio", "jsdom", "pm2", "nodemon", "swagger-ui-express", "qrcode",
  "firebase-admin", "eslint", "eslint-config-airbnb-base", "eslint-plugin-import",
  "eslint-plugin-jest", "eslint-plugin-node", "eslint-plugin-promise",
  "eslint-plugin-security", "jest", "k6", "mongodb-memory-server", "supertest"
];

async function getLatestVersion(pkg) {
  try {
    const res = await fetch(`https://registry.npmjs.org/${pkg}/latest`);
    const data = await res.json();
    return data.version;
  } catch (error) {
    console.error(`Error fetching version for ${pkg}:`, error.message);
    return "ERROR";
  }
}

async function checkAllVersions() {
  console.log("🔍 Checking latest versions for all packages...\n");
  
  const results = [];
  
  for (const pkg of packages) {
    const version = await getLatestVersion(pkg);
    results.push({ package: pkg, version });
    console.log(`✅ ${pkg}: ${version}`);
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log("\n📊 Summary:");
  console.log(`Total packages checked: ${packages.length}`);
  console.log(`Successful: ${results.filter(r => r.version !== "ERROR").length}`);
  console.log(`Errors: ${results.filter(r => r.version === "ERROR").length}`);
  
  return results;
}

// Run the check
checkAllVersions().catch(console.error);

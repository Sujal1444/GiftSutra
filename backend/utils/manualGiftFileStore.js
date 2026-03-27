import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.resolve(__dirname, "..", "logs");
const manualGiftFilePath = path.join(logsDir, "manual-gifts.jsonl");

const ensureManualGiftFile = () => {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  if (!fs.existsSync(manualGiftFilePath)) {
    fs.writeFileSync(manualGiftFilePath, "", "utf8");
  }
};

export const appendManualGiftEntryToFile = (entry) => {
  ensureManualGiftFile();
  fs.appendFileSync(
    manualGiftFilePath,
    `${JSON.stringify(entry)}\n`,
    "utf8",
  );
};

export const getManualGiftFilePath = () => manualGiftFilePath;

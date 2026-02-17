import fs from "fs";
import path from "path";

const inputDir = "./JS/JSON";
const outputDir = "./JS/data";

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
const files = fs.readdirSync(inputDir).filter(file => file.endsWith(".json"));

files.forEach(file => {
    const jsonPath = path.join(inputDir, file);
    const rawData = fs.readFileSync(jsonPath, "utf-8");

    const baseName = path.basename(file, ".json");

    const variableName = baseName
        .replace(/-/g, "_")
        .toUpperCase();

    const outputContent = `export const ${variableName} = ${rawData};\n`;

    const outputPath = path.join(outputDir, `${baseName}.js`);

    fs.writeFileSync(outputPath, outputContent);

    console.log(`Converted: ${file} → ${baseName}.js`);
});

console.log("All JSON files converted successfully.");

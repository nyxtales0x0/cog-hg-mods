const fs = require("fs");
const log = console.log;

let indent = "";
let indentCounter = 0;
const modMenuLabel = "nyxmodmenu";

const startupBuffer = fs.readFileSync("./startup.txt.json");
const startupString = startupBuffer.toString();
const startupObject = JSON.parse(startupString);

const statsPageBuffer = fs.readFileSync("./choicescript_stats.txt.json");
const statsPageString = statsPageBuffer.toString();
const statsPageObject = JSON.parse(statsPageString);

if (statsPageObject.lines[0].includes("nyxmainstats")) {
  log("Cannot edit already modded files.");
  process.exit();
}

modStatsPage();

const variables = getVariables();
const numberVariables = getNumberVariables();
const booleanVariables = getBooleanVariables();
const stringVariables = getStringVariables();

const modMenu = {
  crc : -000000000,
  lines : [],
  labels : {}
}

createModMenu();



/* ========= FUNCTIONS ========= */

function getVariables() {

  const varArray = [];
  const lines = startupObject.lines;
  lines.forEach(line => {
    if (line.includes("*create")) varArray.push(line.trim());
  });
  return varArray;
}

function getNumberVariables() {

  const numVarArray = [];
  variables.forEach(line => {
    if (isNumberStat(line)) numVarArray.push(line);
  });
  return numVarArray;
}

function getBooleanVariables() {

  const boolVarArray = [];
  variables.forEach(line => {
    if (isBooleanStat(line)) boolVarArray.push(line);
  });
  return boolVarArray;
}

function getStringVariables() {

  const strVarArray = [];
  variables.forEach(line => {
    if (isStringStat(line)) strVarArray.push(line);
  });
  return strVarArray;
}

function isNumberStat(line) {

  const args = line.split(" ");
  if (
    args[2].startsWith("0") ||
    args[2].startsWith("1") ||
    args[2].startsWith("2") ||
    args[2].startsWith("3") ||
    args[2].startsWith("4") ||
    args[2].startsWith("5") ||
    args[2].startsWith("6") ||
    args[2].startsWith("7") ||
    args[2].startsWith("8") ||
    args[2].startsWith("9")
  ) return true;
  else return false;
}

function isBooleanStat(line) {

  const args = line.split(" ");
  if (
    args[2] === "false" ||
    args[2] === "true"
  ) return true;
  else return false;
}

function isStringStat(line) {
  
  const args = line.split(" ");
  if (
    args[2].startsWith(`"`) &&
    args[2].endsWith(`"`)
  ) return true;
  else return false;
}

function createModMenu() {

  indentCounter = 0;
  initiateModMenu();
  addNumberStats();
  addBooleanStats();
  addStringStats();
  adjustLabels(modMenu);
  save(modMenu, "nyxmodmenu.txt.json");
  log("Success.");
}

function initiateModMenu() {

  modMenu.lines.push(autoIndent(`*label ${modMenuLabel}`));
  modMenu.lines.push(autoIndent("*choice"));
  modMenu.lines.push(autoIndent("#Return to Stats Page"));
  modMenu.lines.push(autoIndent("*return"));
}

function addNumberStats() {
  
  modMenu.lines.push(autoIndent("#Number Stats"));
  modMenu.lines.push(autoIndent("*label numberstats"));
  modMenu.lines.push(autoIndent("*choice"));
  modMenu.lines.push(autoIndent("#Go Back"));
  modMenu.lines.push(autoIndent(`*goto ${modMenuLabel}`));
  numberVariables.forEach(line => {
    const args = line.split(" ");
    const statName = args[1];
    modMenu.lines.push(autoIndent(`#${statName} | \${${statName}}`));
    modMenu.lines.push(autoIndent(`Initial Value : ${args[2]}`));
    modMenu.lines.push(autoIndent("*line_break"));
    modMenu.lines.push(autoIndent(`Current Value : \${${statName}}`));
    modMenu.lines.push(autoIndent(`*input_number ${statName} 0 999999999`));
    modMenu.lines.push(autoIndent("*goto numberstats"));
  });
  indentCounter -= 2;
}

function addBooleanStats() {

  modMenu.lines.push(autoIndent("#Boolean Stats"));
  modMenu.lines.push(autoIndent("*label booleanstats"));
  modMenu.lines.push(autoIndent("*choice"));
  modMenu.lines.push(autoIndent("#Go Back"));
  modMenu.lines.push(autoIndent(`*goto ${modMenuLabel}`));
  booleanVariables.forEach(line => {
    const args = line.split(" ");
    const statName = args[1];
    modMenu.lines.push(autoIndent(`#${statName} | \${${statName}}`));
    modMenu.lines.push(autoIndent(`Initial Value : ${args[2]}`));
    modMenu.lines.push(autoIndent("*line_break"));
    modMenu.lines.push(autoIndent(`Current Value : \${${statName}}`));
    modMenu.lines.push(autoIndent("*choice"));
    modMenu.lines.push(autoIndent("#Set True"));
    modMenu.lines.push(autoIndent(`*set ${statName} true`));
    modMenu.lines.push(autoIndent("*goto booleanstats"));
    modMenu.lines.push(autoIndent("#Set False"));
    modMenu.lines.push(autoIndent(`*set ${statName} false`));
    modMenu.lines.push(autoIndent("*goto booleanstats"));
    indentCounter -= 2;
  });
  indentCounter -= 2;
}

function addStringStats() {

  modMenu.lines.push(autoIndent("#String Stats"));
  modMenu.lines.push(autoIndent("*label stringstats"));
  modMenu.lines.push(autoIndent("*choice"));
  modMenu.lines.push(autoIndent("#Go Back"));
  modMenu.lines.push(autoIndent(`*goto ${modMenuLabel}`));
  stringVariables.forEach(line => {
    const args = line.split(" ");
    const statName = args[1];
    modMenu.lines.push(autoIndent(`#${statName} | \${${statName}}`));
    modMenu.lines.push(autoIndent(`Initial Value : ${args[2]}`));
    modMenu.lines.push(autoIndent("*line_break"));
    modMenu.lines.push(autoIndent(`Current Value : \${${statName}}`));
    modMenu.lines.push(autoIndent(`*input_text ${statName}`));
    modMenu.lines.push(autoIndent("*goto stringstats"));
  });
  indentCounter -= 2;
}

function modStatsPage() {

  indent = getIndent(statsPageObject);
  if (!indent) indent = "\t";
  statsPageObject.lines.unshift("*label nyxmainstats");
  addModMenuButton();
  adjustLabels(statsPageObject);
  save(statsPageObject, "choicescript_stats.txt.json");
}

function autoIndent(param) {

  let str = "";
  for (let i = 0; i < indentCounter; i++) {
    str += indent;
  }
  if (param.includes("*choice")) indentCounter++;
  if (param.includes("#")) indentCounter++;
  if (param.includes("*goto")) indentCounter--;
  if (param.includes("*return")) indentCounter--;
  return str + param;
}

function adjustLabels(sceneObject) {

  const labels = {};
  sceneObject.lines.forEach(line => {
    if (line.includes("*label")) {
      const args = line.trim().toLowerCase().split(" ");
      const lineIndex = sceneObject.lines.indexOf(line);
      labels[args[1]] = lineIndex;
    }
  });
  sceneObject.labels = labels;
}

function save(sceneObject, path) {

  fs.writeFileSync(`./${path}`, JSON.stringify(sceneObject));
}

function getIndent(fileObject) {

  const line = getSingleIndentedLine(fileObject);
  let str = "";
  if (!line) return "";
  if (line[0] === "\t") {
    for (let i = 0; i < line.length; i++) {
      if (line[i] === "\t") str += "\t";
      if (line[i] != "\t") return str;
    }
  }
  else if (line[0] === " ") {
    for (let i = 0; i < line.length; i++) {
      if (line[i] === " ") str += " ";
      if (line[i] != " ") return str;
    }
  }
  else return str;
}

function getSingleIndentedLine(fileObject) {

  const lines = fileObject.lines;
  for (let line of lines) {
    if (line[0] === "*" && (line.includes("*choice") || line.includes("*if") || line.includes("*stat_chart"))) {
      const lineIndex = lines.indexOf(line);
      const nextLine = lines[lineIndex + 1];
      return nextLine;
    }
    else continue;
  }
}

function addModMenuButton() {

  let buttonAlreadyAdded = false;
  for (let i = 0; i < statsPageObject.lines.length; i++) {
    const line = statsPageObject.lines[i];
    if (line.includes("*choice")) {
      const nextLine = statsPageObject.lines[i + 1];
      const nextLineIndex = i + 1;
      indentCounter = getIndentCounter(nextLine);
      statsPageObject.lines.splice(nextLineIndex, 0,
        autoIndent("#Mod Menu (:"),
        autoIndent("*gosub_scene nyxmodmenu"),
        autoIndent("*goto nyxmainstats")
      );
      buttonAlreadyAdded = true;
    }
    else if (line.includes("*finish")) {
      indentCounter = getIndentCounter(line);
      const lineIndex = i;
      statsPageObject.lines.splice(lineIndex, 0,
        autoIndent("*choice"),
        autoIndent("#Mod Menu (:"),
        autoIndent("*gosub_scene nyxmodmenu"),
        autoIndent("*goto nyxmainstats")
      );
      i += 5;
      return;
    }
    else if (i === statsPageObject.lines.length - 1) {
      if (buttonAlreadyAdded) return;
      indentCounter = 0;
      statsPageObject.lines.push(autoIndent("*choice"));
      statsPageObject.lines.push(autoIndent("#Mod Menu (:"));
      statsPageObject.lines.push(autoIndent("*gosub_scene nyxmodmenu"));
      statsPageObject.lines.push(autoIndent("*goto nyxmainstats"));
      return;
    }
    else continue;
  }
  return;
}

function getIndentCounter(line) {
  
  if (!indent) return 0;
  let newLine = line.trimEnd().replaceAll(indent, "^");
  let count = 0;
  for (let x = 0; x < newLine.length; x++) {
    if (newLine[x] === "^") {
      count++;
    }
    if (newLine[x] != "^") break;
  }
  return count;
}
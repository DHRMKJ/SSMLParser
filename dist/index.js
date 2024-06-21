"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  parseSSML: () => parseSSML
});
module.exports = __toCommonJS(src_exports);

// src/utils.ts
var ERROR_MESSAGE = "[ERROR]: error parsing ssml";
function assert(condition, message) {
  if (!condition) {
    let EMESSAGE = ERROR_MESSAGE;
    if (message) {
      EMESSAGE += `, ${message}`;
    }
    throw Error(EMESSAGE);
  }
}
function extractName(badTag) {
  return badTag.match(/\b[a-z]+\b/i);
}
function extractAttributes(badTag) {
  const getTagName = extractName(badTag);
  assert(getTagName !== null, "bad tag");
  const tagName = getTagName[0];
  let badTagAttributes = badTag.substring(tagName.length);
  let ssmlAttributes = [];
  let regex = /[a-z]+\s*=\s*['"].+['"]/i;
  let match;
  while ((match = regex.exec(badTagAttributes)) !== null) {
    const length = match.index + match[0].length;
    let [key, value] = match[0].split("=");
    assert(
      value.length > 2 && value[0] === value[value.length - 1],
      ' " issue'
    );
    value = value.slice(1, -1);
    badTagAttributes = badTagAttributes.substring(length);
    ssmlAttributes.push({ name: key, value });
  }
  badTagAttributes = badTagAttributes.trim();
  assert(
    badTagAttributes.length > 0 ? badTagAttributes.length === 1 ? badTagAttributes[0] === "/" : false : true,
    "attribute farming"
  );
  return { name: tagName, attributes: ssmlAttributes, children: [] };
}
function decodeSSMLEntities(encodedSSML) {
  return encodedSSML.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

// src/index.ts
var stack = [];
function extractSSML(decodedSSML) {
  const startingBracket = decodedSSML.indexOf("<");
  const endingBracket = decodedSSML.indexOf(">");
  assert(startingBracket !== -1 || endingBracket !== -1, "missing brackets");
  const badTag = decodedSSML.substring(startingBracket + 1, endingBracket).trim();
  assert(badTag.length > 0);
  let isEndTag = badTag[0] === "/";
  if (isEndTag) {
    const lastNode = stack.pop();
    assert(lastNode !== void 0 || lastNode !== null);
    const getEndTagName = extractName(badTag);
    assert(getEndTagName !== null);
    assert(lastNode.name === getEndTagName[0]);
    if (stack.length === 0) {
      return lastNode;
    }
    stack[stack.length - 1].children.push(lastNode);
  } else {
    const node = extractAttributes(badTag);
    if (badTag[badTag.length - 1] === "/") {
      assert(stack.length > 0);
      stack[stack.length - 1].children.push(node);
    } else {
      stack.push(node);
    }
  }
  if (endingBracket + 1 < decodedSSML.length) {
    return extractSSML(decodedSSML.substring(endingBracket + 1));
  }
}
function parseSSML(unparsedSSML) {
  let decodedSSML = decodeSSMLEntities(unparsedSSML.trim());
  const parsedSSML = extractSSML(decodedSSML);
  assert(parsedSSML !== void 0);
  return parsedSSML;
}
var anotherSSML = `
<speak>
  Here are <say-as interpret-as="characters">SSML</say-as> samples.
  I can pause <break time="3s"></break>.
  I can play a sound
  <audio src="https://www.example.com/MY_MP3_FILE.mp3">didn't get your MP3 audio file</audio>.
  I can speak in cardinals. Your number is <say-as interpret-as="cardinal">10</say-as>.
  Or I can speak in ordinals. You are <say-as interpret-as="ordinal">10</say-as> in line.
  Or I can even speak in digits. The digits for ten are <say-as interpret-as="characters">10</say-as>.
  I can also substitute phrases, like the <sub alias="World Wide Web Consortium">W3C</sub>.
  Finally, I can speak a paragraph with two sentences.
  <p><s>This is sentence one.</s><s>This is sentence two.</s>></p>
  </speak>
`;
parseSSML(anotherSSML);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseSSML
});

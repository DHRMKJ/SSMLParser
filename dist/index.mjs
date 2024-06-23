// src/utils.ts
var ERROR_MESSAGE = "[ERROR]: error parsing ssml";
function assert(condition, message) {
  if (!condition) {
    throw Error(ERROR_MESSAGE + `, ${message}`);
  }
}
function extractName(badTag) {
  return badTag.match(/\b[a-z]+\b/i);
}
function generateRandom(LENGTH = 16) {
  let characters = "abcdefghijklmnopqrstuvwxyz";
  characters += characters.toUpperCase();
  characters += "0123456789";
  let randomString = "";
  for (let i = 0; i < LENGTH; i++) {
    randomString += characters[Math.floor(Math.random() * (characters.length - 1))];
  }
  return randomString;
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
  return {
    name: tagName,
    attributes: ssmlAttributes,
    id: generateRandom(),
    children: {},
    textContent: ""
  };
}
function decodeSSMLEntities(encodedSSML) {
  return encodedSSML.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

// src/index.ts
var RAND_ID_START = "XmNjtYdxRXkbfci4nxOUAA4D0vFoVKju";
var RAND_ID_END = "XmNjtYdxRXkbfci4nxOUAA4D0vFoVKju";
var stack = [];
function extractSSML(unparsedSSML) {
  const startingBracket = unparsedSSML.indexOf("<");
  const endingBracket = unparsedSSML.indexOf(">");
  assert(startingBracket !== -1 || endingBracket !== -1, "missing brackets");
  const badTag = unparsedSSML.substring(startingBracket + 1, endingBracket).trim();
  assert(badTag.length > 0);
  const leftOverSSML = unparsedSSML.substring(endingBracket + 1);
  const textContent = unparsedSSML.substring(0, startingBracket).trim();
  const regex = /^[^<>]*$/;
  assert(regex.test(textContent));
  assert(textContent.length > 0 ? stack.length > 0 : true);
  if (textContent.length > 0) {
    const lastNode = stack[stack.length - 1];
    lastNode.textContent += decodeSSMLEntities(textContent);
  }
  let isEndTag = badTag[0] === "/";
  if (isEndTag) {
    const lastNode = stack.pop();
    assert(lastNode !== void 0 || lastNode !== null);
    const getEndTagName = extractName(badTag);
    assert(getEndTagName !== null);
    assert(lastNode.name === getEndTagName[0]);
    if (stack.length === 0) {
      assert(leftOverSSML.length === 0);
      return lastNode;
    }
    stack[stack.length - 1].children[lastNode.id] = lastNode;
    stack[stack.length - 1].textContent += RAND_ID_START + lastNode.id + RAND_ID_END;
  } else {
    const node = extractAttributes(badTag);
    if (badTag[badTag.length - 1] === "/") {
      assert(stack.length > 0);
      stack[stack.length - 1].children[node.id] = node;
      stack[stack.length - 1].textContent += RAND_ID_START + node.id + RAND_ID_END;
    } else {
      assert(node !== void 0);
      stack.push(node);
    }
  }
  if (endingBracket + 1 < unparsedSSML.length) {
    return extractSSML(leftOverSSML);
  }
}
function parseSSML(unparsedSSML) {
  const parsedSSML = extractSSML(unparsedSSML.trim());
  assert(parsedSSML !== void 0);
  console.log(parsedSSML);
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
  <p><s>This is sentence one.</s><s>This is sentence two.</s></p>
  </speak>
`;
parseSSML(anotherSSML);
export {
  parseSSML
};

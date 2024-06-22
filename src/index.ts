import { SSMLTag } from "./types";
import {
  decodeSSMLEntities,
  extractAttributes,
  assert,
  extractName,
} from "./utils";

const stack: SSMLTag[] = [];
function extractSSML(unparsedSSML: string): SSMLTag | undefined {
  const startingBracket = unparsedSSML.indexOf("<");
  const endingBracket = unparsedSSML.indexOf(">");

  assert(startingBracket !== -1 || endingBracket !== -1, "missing brackets");

  const badTag = unparsedSSML
    .substring(startingBracket + 1, endingBracket)
    .trim();

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
    assert(lastNode !== undefined || lastNode !== null);
    const getEndTagName = extractName(badTag);
    assert(getEndTagName !== null);
    assert(lastNode!.name === getEndTagName![0]);
    if (stack.length === 0) {
      assert(leftOverSSML.length === 0);
      return lastNode!;
    }
    stack[stack.length - 1].children.push(lastNode!);
  } else {
    const node: SSMLTag = extractAttributes(badTag);
    if (badTag[badTag.length - 1] === "/") {
      assert(stack.length > 0);
      stack[stack.length - 1].children.push(node);
    } else {
      assert(node !== undefined);
      stack.push(node);
    }
  }
  if (endingBracket + 1 < unparsedSSML.length) {
    return extractSSML(leftOverSSML);
  }
}

export function parseSSML(unparsedSSML: string) {
  const parsedSSML = extractSSML(unparsedSSML.trim());
  assert(parsedSSML !== undefined);
  return parsedSSML;
}

let anotherSSML = `
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

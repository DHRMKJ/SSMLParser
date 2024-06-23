// import { SSMLTag } from "./types";

import { SSMLAttribute } from "./types";

export const ERROR_MESSAGE = "[ERROR]: error parsing ssml";

export function assert(condition: boolean, message?: string) {
  if (!condition) {
    throw Error(ERROR_MESSAGE + `, ${message}`);
  }
}

export function extractName(badTag: string) {
  return badTag.match(/\b[a-z]+\b/i);
}

export function generateRandom(LENGTH: number = 16) {
  let characters = "abcdefghijklmnopqrstuvwxyz";
  characters += characters.toUpperCase();
  characters += "0123456789";
  let randomString = "";

  for (let i = 0; i < LENGTH; i++) {
    randomString +=
      characters[Math.floor(Math.random() * (characters.length - 1))];
  }
  return randomString;
}

export function extractAttributes(badTag: string) {
  const getTagName = extractName(badTag);
  assert(getTagName !== null, "bad tag");

  const tagName = getTagName![0];

  let badTagAttributes = badTag.substring(tagName.length);
  let ssmlAttributes: SSMLAttribute[] = [];

  let regex = /[a-z]+\s*=\s*(['"][a-zA-Z0-9-:/. ]+["'])/i;
  let match;

  while ((match = regex.exec(badTagAttributes)) !== null) {
    const length = match.index + match![0].length;
    let [key, value] = match![0].split("=");

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
    badTagAttributes.length > 0
      ? badTagAttributes.length === 1
        ? badTagAttributes[0] === "/"
        : false
      : true,
    "attribute farming"
  );

  return {
    name: tagName,
    attributes: ssmlAttributes,
    id: generateRandom(),
    children: {},
    textContent: "",
  };
}

export function decodeSSMLEntities(encodedSSML: string): string {
  return encodedSSML
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

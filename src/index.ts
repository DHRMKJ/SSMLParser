import { SSMLTag } from "./types";
import {
  decodeSSMLEntities,
  extractAttributes,
  assert,
  extractName,
} from "./utils";

const stack: SSMLTag[] = [];
function extractSSML(decodedSSML: string): SSMLTag | undefined {
  const startingBracket = decodedSSML.indexOf("<");
  const endingBracket = decodedSSML.indexOf(">");

  assert(startingBracket !== -1 || endingBracket !== -1, "missing brackets");

  const badTag = decodedSSML
    .substring(startingBracket + 1, endingBracket)
    .trim();

  assert(badTag.length > 0);

  let isEndTag = badTag[0] === "/";
  if (isEndTag) {
    const lastNode = stack.pop();
    assert(lastNode !== undefined || lastNode !== null);
    const getEndTagName = extractName(badTag);
    assert(getEndTagName !== null);
    assert(lastNode!.name === getEndTagName![0]);
    if (stack.length === 0) {
      return lastNode!;
    }
    stack[stack.length - 1].children.push(lastNode!);
  } else {
    const node: SSMLTag = extractAttributes(badTag);
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

export function parseSSML(unparsedSSML: string) {
  let decodedSSML = decodeSSMLEntities(unparsedSSML.trim());
  const parsedSSML = extractSSML(decodedSSML);
  assert(parsedSSML !== undefined);
  return parsedSSML;
}

// let ssml = `
// &lt;speak name="biatch" thing="such and such"/&gt; Hello, world!
// &lt;&gt;
// &lt;break time=&quot;1s&quot;/&gt;Welcome to our &lt;emphasis level=&quot;strong&quot;&gt;amazing&lt;/emphasis&gt; service.
// &amp;lt; This should be a less than sign.
// How about some special characters like &amp;quot;, &amp;amp;, &amp;apos;?
// &lt;prosody rate=&quot;fast&quot; pitch=&quot;high&quot;&gt; Enjoy your experience &lt;/prosody&gt;
// &lt;/speak&gt;`;

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

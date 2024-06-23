// src/utils.ts
var ERROR_MESSAGE = "[ERROR]: error parsing ssml";
function assert(condition, message = "") {
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
  let regex = /[a-z]+\s*=\s*(['"][a-zA-Z0-9-:/. ]+["'])/i;
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
var RAND_ID_START = "---";
var RAND_ID_END = "---";
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
    <voice name="en-US-Wavenet-A">
        <prosody rate="slow" pitch="low">
            <p>
                Welcome to the exciting world of speech synthesis. Today, we'll explore the various features of SSML.
            </p>
        </prosody>
    </voice>
    
    <break time="1s"/>
    
    <voice name="en-GB-Wavenet-B">
        <prosody rate="medium" pitch="high">
            <p>
                Let's start with some basic formatting. You can control the <emphasis level="strong">emphasis</emphasis> on words, and even add pauses. 
                For example, let's take a <break time="500ms"/> short pause here.
            </p>
        </prosody>
    </voice>
    <voice name="en-AU-Wavenet-C">
        <prosody rate="fast" pitch="x-high">
            <p>
                Moving on to more advanced features, you can include <say-as interpret-as="characters">HTML</say-as> like elements, 
                such as <sub alias="World Wide Web">WWW</sub>. You can also spell out words like <say-as interpret-as="spell-out">SSML</say-as>.
            </p>
        </prosody>
    </voice>
    
    <break time="1s"/>
    
    <voice name="en-IN-Wavenet-D">
        <prosody rate="default" pitch="default">
            <p>
                How about some numbers? You can read them in different ways. 
                For example, <say-as interpret-as="cardinal">123</say-as> as a cardinal number, 
                or <say-as interpret-as="ordinal">1st</say-as> as an ordinal number. 
                You can also say it as digits: <say-as interpret-as="digits">123</say-as>.
            </p>
        </prosody>
    </voice>
    
    <voice name="en-US-Wavenet-E">
        <prosody rate="medium" pitch="low">
            <p>
                Now, let's try some dates and times. You can read dates like <say-as interpret-as="date" format="mdy">04/15/2024</say-as> 
                and times like <say-as interpret-as="time" format="hms12">03:45:30 PM</say-as>.
            </p>
        </prosody>
    </voice>
    
    <break time="1s"/>
    
    <voice name="en-GB-Wavenet-F">
        <prosody rate="fast" pitch="high">
            <p>
                Lastly, you can add some fun elements like <audio src="https://www.example.com/sound.mp3">sound effects</audio> 
                and control the volume of your speech. 
                For example, this sentence will be spoken at a <prosody volume="loud">louder volume</prosody>.
            </p>
        </prosody>
    </voic>
    
    <voice name="en-AU-Wavenet-G">
        <prosody rate="default" pitch="default">
            <p>
                Thank you for exploring SSML with us. We hope you have a great day!
            </p>
        </prosody>
    </voice>
</speak>
`;
parseSSML(anotherSSML);
export {
  parseSSML
};

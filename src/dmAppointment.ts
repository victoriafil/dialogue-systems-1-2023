import { MachineConfig, send, Action, assign } from "xstate";

function say(text: string): Action<SDSContext, SDSEvent> {
  return send((_context: SDSContext) => ({ type: "SPEAK", value: text }));
}

interface Grammar {
  [index: string]: {
    intent: string;
    entities: {
      [index: string]: string;
    };
  };
}
/*
const grammar: Grammar = {
  lecture: {
    intent: "None",
    entities: { title: "Dialogue systems lecture" },
  },
  coffee: {
    intent: "None",
    entities: { title: "Coffe date" },
  },
  doctor: {
    intent: "None",
    entities: { title: "Doctor's appointment" },
  },
  lunch: {
    intent: "None",
    entities: { title: "Lunch at the canteen" },
  },
  "beers with mark": {
    intent: "None",
    entities: { title: "pub date" },
  },
  interview: {
    intent: "None",
    entities: { title: "Job interview" },
  },
  "on saturday": {
    intent: "None",
    entities: { day: "Saturday" },
  },
  "on sunday": {
    intent: "None",
    entities: { day: "Sunday" },
  },
  "tuesday afternoon": {
    intent: "None",
    entities: { day: "Tuesday" },
  },
  "on friday": {
    intent: "None",
    entities: { day: "Friday" },
  },
  "monday morning": {
    intent: "None",
    entities: { day: "Monday" },
  },
  "seven in the evening": {
    intent: "None",
    entities: { time: "7" },
  },
  "at 12": {
    intent: "None",
    entities: { time: "12" },
  },
  "at 6": {
    intent: "None",
    entities: { time: "6" },
  },
  "9 in the morning": {
    intent: "None",
    entities: { time: "9" },
  },
  "at 10": {
    intent: "None",
    entities: { time: "10" },
  },
  "yes": {
    intent: "None",
    entities: { confirmation: "yes" },
  },
  "sure": {
    intent: "None",
    entities: { confirmation: "sure" },
  },
  "yes, that's right": {
    intent: "None",
    entities: { confirmation: "yes, that's right" },
  },
  "yes, thank you!": {
    intent: "None",
    entities: { confirmation: "yes" },
  },
  "yes, please. thanks!": {
    intent: "None",
    entities: { confirmation: "yes" },
  },
  "of course": {
    intent: "None",
    entities: { confirmation: "of course" },
  },
  "yeah": {
    intent: "None",
    entities: { confirmation: "yeah" },
  },
  "yes, yes": {
    intent: "None",
    entities: { confirmation: "yes" },
  },
  "no": {
    intent: "None",
    entities: { denial: "no"}
  },
  "not really": {
    intent: "None",
    entities: { denial: "not really"}
  },
  "I don't think so": {
    intent: "None",
    entities: { denial: "I don't think so"}
  },
  "that's totally wrong": {
    intent: "None",
    entities: { denial: "that's totally wrong"}
  },
  "hey, let's create a meeting": {
    intent: "None",
    entities: { meeting: "create a meeting"}
  },
  "I want to create a meeting": {
    intent: "None",
    entities: { meeting: "create a meeting"}
  },
  "create a meeting": {
    intent: "None",
    entities: { meeting: "create a meeting"}
  },
  "i have a question": {
    intent: "None",
    entities: {question: "I have a question"}
  },
  "i want to ask a question": {
    intent: "None",
    entities: {question: "I want to ask a question"}
  }
};
*/

const getEntity = (context: SDSContext, category: string) => {
  const result = [];
  const entities = context.nluResult.prediction.entities
  for (let i = 0; i < entities.length; i++) {
    if (entities[i].category === category) {
      result.push(entities[i].text);
      return result
    }
  }
  return false;
};
  // lowercase the utterance and remove tailing "."
  //let query = context.nluResult.query.toLowerCase().replace(/\.$/g, "");
  //for (let i = 0;entities && i < entities.length; i++) {
    
  /*if (u in grammar) {
    if (entity in grammar[u].entities) {
      return grammar[u].entities[entity];
    }
  }*/
 

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = {
  initial: "idle",
  states: {
    idle: {
      on: {
        CLICK: "init",
      },
    },
    init: {
      on: {
        TTS_READY: "introduction",
        CLICK: "introduction",
      },
    },
    introduction: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "hello",
            actions: assign({
              name: (context) => context.recResult[0].utterance.replace(/\.$/g, "")
            }),
          },
          {
            target: ".noname",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: say("Hello! I am your new personal assistant, Mary. What is your name?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        noname: {
          entry: say(
            "Sorry, I couldn't quite catch that. What is your name?"
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    hello: {
      id: "hello",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "whenDay",
            cond: (context) => context.nluResult.prediction.topIntent === "createMeeting" &&
               !!getEntity(context, "meetingType"),
             actions: assign({
               title: (context) => getEntity(context, "meetingType") //{return context.nluResult.prediction.entities[0].text}
              }),
          },
          {
            target: "createAMeeting",
            cond: (context) => context.nluResult.prediction.topIntent === "createMeeting",
             actions: assign({
              meeting: (context) => context.nluResult.query,
        }),
          },
          {
            target: "whoIsX",
            cond: (context) => context.nluResult.prediction.topIntent === "whoIsX",
             actions: assign({
               celeb: (context) => {return context.nluResult.prediction.entities[0].text}
              }),
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Nice to meet you ${context.name}! What can I help you with today?`
          })),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "I can either help you schedule a meeting, or you can ask me about someone famous."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    whoIsX: {
      initial: "xIs",
      on: {
        RECOGNISED: [
          {
            target: ".xIs",
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: "#hello",
      },
      states: {
        xIs: {
          invoke: {
            id: 'getXIs',
            src: (context, event) => kbRequest(context.celeb),
            onDone: [{
              target: 'success',
              cond: (context, event) => event.data.Abstract !== "",
              actions: assign({ information: (context, event) => event.data })
            },
            {
              target: 'failure',
            },
          ],
            onError: {
              target: 'failure',
            }
          }
        },
        success: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `This is what I know about ${context.celeb}. ${context.information.Abstract}`
          })),
          on: {ENDSPEECH: "#meetingX"}
        },
        failure: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Sorry, I don't seem to know anything about ${context.celeb}. Ask me about someone else!`
          })),
          on: {ENDSPEECH: "#hello"}
        },
          ask: {
            entry: send("LISTEN"),
          },
          nomatch: {
            entry: say(
              "Sorry, I don't really understand you. Tell me something else."
            ),
            on: { ENDSPEECH: "ask" },
          },
      },
    },
    meetingX: {
      id:"meetingX",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "denyMeeting",
            cond: (context) => context.nluResult.prediction.topIntent === "denial",
          },
          {
            target: "acceptMeeting",
            cond: (context) => context.nluResult.prediction.topIntent === "confirmation", 
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: say("Would you like to meet them?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I didn't catch that!"
          ),
          on: {ENDSPEECH: "prompt"},
        },
      },
    },
    denyMeeting: {
      entry: say("Ok then! See you!"),
      on: { ENDSPEECH: "init" },
    },
    acceptMeeting: {
      entry: [
        say("Perfect!"),
        assign((context) => ({title: `meeting with ${context.celeb}`}))
      ],
      on: { ENDSPEECH: "whenDay" },
      },
    createAMeeting: {
      id: "createAMeeting",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "info",
            cond: (context) => !!getEntity(context, "meetingType"),
            actions: assign({
              title: (context) => getEntity(context, "meetingType"),
            }),
          },
          {
            target: "info",
            actions: assign({
              title: (context) => context.nluResult.query,
            }),
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: say("Perfect! Let's create a meeting. What is it about?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I don't think I know what that is. Tell me something else."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    info: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, ${context.title}`,
      })),
      on: { ENDSPEECH: "whenDay" },
    },
    whenDay: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "appointmentDay",
            cond: (context) => !!getEntity(context, "dateTime"),
            actions: assign({ 
              day: (context) => getEntity(context, "dateTime"),
            }),
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: say("On which day would you like me to schedule your meeting?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I don't understand. Please repeat."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    appointmentDay: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, ${context.day}`,
      })),
      on: { ENDSPEECH: "duration" },
    },
    duration: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "wholeDay", 
            cond: (context) => context.nluResult.prediction.topIntent === "confirmation",
          },
          {
            target: "whenTime", 
            cond: (context) => context.nluResult.prediction.topIntent === 'denial',
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: say("Is your meeting going to take the whole day?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I'm not sure I understand that. Tell me again."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    wholeDay: {
      entry: say("Awesome! Let's create the meeting"),
      on: { ENDSPEECH: "confirmMeetingWholeDay" },
    },
    whenTime: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "timeOfDay",
            cond: (context) => !!getEntity(context, "dateTime"),
            actions: assign({
              time: (context) => getEntity(context, "dateTime"),
            }),
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: say("What time is your meeting taking place?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I don't know what it is. Tell me something I know."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    timeOfDay: {
      entry: say("Great, let's create your meeting!"),
      on: { ENDSPEECH: "confirmMeeting" },
    },
    confirmMeetingWholeDay: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "meetingCreated", 
            cond: (context) => context.nluResult.prediction.topIntent === "confirmation",
          },
          {
            target: "incorrectInfo", 
            cond: (context) => context.nluResult.prediction.topIntent === "denial",
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Do you want me to create a meeting titled ${context.title}, on ${context.day} for the whole day?`,
          })),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I find it difficult to understand."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    confirmMeeting: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "meetingCreated",
            cond: (context) => context.nluResult.prediction.topIntent === "confirmation",
          },
          {
            target: "incorrectInfo", 
            cond: (context) => context.nluResult.prediction.topIntent === "denial",
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Do you want me to create a meeting titled ${context.title}, on ${context.day} at ${context.time}?`,
          })),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I don't know what it is. Tell me something I know."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    meetingCreated: {
      entry: send((context) => ({
        type: "SPEAK", 
        value: "Amazing! Your meeting has been created! See you!",
      })),
      on: { ENDSPEECH: "init" },
    },
    incorrectInfo: {
      entry: send((context) => ({
        type: "SPEAK", 
        value: "Sorry, it's probably my fault. Let's try again!",
      })),
      on: { ENDSPEECH: "init" },
    },
  },
};

const kbRequest = (text: string) =>
  fetch(
    new Request(
      `https://cors.eu.org/https://api.duckduckgo.com/?q=${text}&format=json&skip_disambig=1`
    )
  ).then((data) => data.json());

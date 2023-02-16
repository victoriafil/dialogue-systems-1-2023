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
  "7 in the evening": {
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
  "yes, please. Thanks!": {
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
  "yes yes": {
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

const getEntity = (context: SDSContext, entity: string) => {
  // lowercase the utterance and remove tailing "."
  let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "");
  if (u in grammar) {
    if (entity in grammar[u].entities) {
      return grammar[u].entities[entity];
    }
  }
  return false;
};

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
        TTS_READY: "hello",
        CLICK: "hello",
      },
    },
    hello: {
      id: "hello",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "createAMeeting",
            cond: (context) => !!getEntity(context, "meeting"),
            actions: assign({
              meeting: (context) => getEntity(context, "meeting"),
            }),
          },
          {
            target: "whoIsX",
            cond: (context) => !!getEntity(context, "question"),
            actions: assign({
              question: (context) => getEntity(context, "question"),
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
          entry: say("Hi, Victoria! Good to see you today! Do you want to create a meeting or ask a question about someone?"),
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
    whoIsX: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: ".xIs",
            actions: assign({name:  
              context => {return context.recResult[0].utterance}
            }),
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        xIs: {
          invoke: {
            id: 'getXIs',
            src: (context, event) => kbRequest(context.name),
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
            value: `This is what I know about ${context.name}. ${context.information.Abstract}`
          })),
          on: {ENDSPEECH: "#meetingX"}
        },
        failure: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Sorry, I don't know anything about ${context.name}. Ask me about someone else!`
          })),
          on: {ENDSPEECH: "prompt"}
        },
          prompt: {
            entry: say("Of course! Who would you like to know about?"),
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
    meetingX: {
      id:"meetingX",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "denyMeeting",
            cond: (context) => !!getEntity(context, "denial"),
            actions: assign({
              denial: (context) => getEntity(context, "denial"),
            }), 
          },
          {
            target: "acceptMeeting",
            cond: (context) => !!getEntity(context, "confirmation"),
            actions: assign({
              confirmation: (context) => getEntity(context, "confirmation"),
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
        say("That's so great!"),
        assign((context) => ({title: `meeting with ${context.name}`}))
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
            cond: (context) => !!getEntity(context, "title"),
            actions: assign({
              title: (context) => getEntity(context, "title"),
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
          entry: say("Let's create a meeting. What is it about?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I don't know what it is. Tell me something else."
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
            cond: (context) => !!getEntity(context, "day"),
            actions: assign({ 
              day: (context) => getEntity(context, "day"),
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
          entry: say("On which day is your meeting taking place?"),
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
            cond: (context) => !!getEntity(context, "confirmation"),
            actions: assign({ 
              confirmation: (context) => getEntity(context, "confirmation"),
            }),
          },
          {
            target: "whenTime", 
            cond: (context) => !!getEntity(context, "denial"),
            actions: assign({ 
              denial: (context) => getEntity(context, "denial"),
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
          entry: say(`Is your meeting going to take the whole day?`),
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
    wholeDay: {
      entry: say("Let's create the meeting"),
      on: { ENDSPEECH: "confirmMeetingWholeDay" },
    },
    whenTime: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "timeOfDay",
            cond: (context) => !!getEntity(context, "time"),
            actions: assign({
              time: (context) => getEntity(context, "time"),
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
            cond: (context) => !!getEntity(context, "confirmation"),
            actions: assign({ 
              confirmation: (context) => getEntity(context, "confirmation"),
            }),
          },
          {
            target: "incorrectInfo", 
            cond: (context) => !!getEntity(context, "denial"),
            actions: assign({ 
              denial: (context) => getEntity(context, "denial"),
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
            value: `Do you want me to create a meeting titled ${context.title}, on ${context.day} for the whole day?`,
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
    confirmMeeting: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "meetingCreated",
            cond: (context) => !!getEntity(context, "confirmation"),
            actions: assign({ 
              confirmation: (context) => getEntity(context, "confirmation"),
            }),
          },
          {
            target: "incorrectInfo", 
            cond: (context) => !!getEntity(context, "denial"),
            actions: assign({ 
              denial: (context) => getEntity(context, "denial"),
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
        value: "Your meeting has been created!",
      })),
      on: { ENDSPEECH: "init" },
    },
    incorrectInfo: {
      entry: send((context) => ({
        type: "SPEAK", 
        value: "Sorry, let's try again!",
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

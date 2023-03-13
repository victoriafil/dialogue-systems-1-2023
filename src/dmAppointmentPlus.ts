import { MachineConfig, send, Action, assign, State } from "xstate";

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
  "who is x": {
    intent: "None",
    entities: {question: "celeb"}
  },
  "tell me about x": {
    intent: "None",
    entities: {question: "celeb"}
  },
  "help": {
    intent: "None",
    entities: {help: "help"}
  },
  "i don't know": {
    intent: "None",
    entities: {help: "help"}
  },
  "i need help": {
    intent: "None",
    entities: {help: "help"}
  },
  "what should I do": {
    intent: "None",
    entities: {help: "help"}
  },
  "what can you do": {
    intent: "None",
    entities: {help: "help"}
  },
  "how does this work": {
    intent: "None",
    entities: {help: "help"}
  },
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

const getName = (context: SDSContext) => {
  let name = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "");
      name = name.replace("who is ","").replace("tell me about ","").replace("what do you know about ","").replace("tell me everything you know about","").replace("?","")
  return name
};

const getNluEntity = (context: SDSContext, category: string) => {
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

const getHelp = (context: SDSContext, stateName: string) => {
  type HelpMessages = {
    [key: string]: string;
  }
  const helpMessages: HelpMessages = {
    introduction : "We can start by telling me your name. Let's try again.",
    hello : "I can help you create a meeting or give you information about someone famous. Try asking me who someone is or just say 'create a meeting'.",
    whoIsX : "Just tell me the name of the famous person you seek information for.",
    meetingX : "A yes or no answer will do here! Say yes if you want to meet the person you asked info for, and no if you don't.",
    createAMeeting : "Just give me a title for your meeting.",
    whenDay : "At this stage I need you to tell me the day of your meeting.",
    duration : "A yes or no answer will do here! Say yes if you want a whole day meeting and no if you don't.",
    whenTime : "This stage is very simple. Just give me the time you want to have your meeting at.",
    confirmMeetingWholeDay : "A yes or no answer will do here! Say yes if you agree to what I'll say and no if you don't.",
    confirmMeeting : "A yes or no answer will do here! Say yes if you want to have this meeting and no if you don't."
  }
  let message = helpMessages[stateName]
  return message
  };

    //tried creating a function that transitions to the previous state or the next one depending on the user's answer, but for some reason
    // my machine stopped whenever it reached the transition. 
    //    this is how I called it
    //      {
    //       target: ".reassurement", 
    //       cond: (context) => !!getEntity(context, "meeting") && getConfidence(context) === false,
    //     },
    // ....
    // states: {
    //   reassurement: {
    //     ...reassuring("hello", "createAMeeting")
    //   },
  // const reassuring = (previousState: any, nextState: any): StatesConfig<SDSContext, any, EventObject, SDSEvent>  => ({
  //   reassurement: {
  //     id: "reassurement",
  //     initial: "prompt",
  //     on: {
  //       RECOGNISED: [
  //       {
  //         target: previousState,
  //         cond: (context) => !!getEntity(context, "denial"),
  //         actions: assign({
  //           denial: (context) => getEntity(context, "denial"),
  //         }),
  //       },
  //       {
  //         target: nextState,
  //         cond: (context) => !!getEntity(context, "confirmation"),
  //         actions: assign({
  //           confirmation: (context) => getEntity(context, "confirmation"),
  //         }), 
  //       },
  //     ]},
  //     states: {
  //       prompt: {
  //         entry: send((context) => ({
  //           type: "SPEAK",
  //           value: `Did I catch that correctly? Did you say ${context.recResult[0].utterance}?`
  //           })),
  //         on: { ENDSPEECH: "ask" },
  //         },
  //         ask: 
  //         {
  //         entry: send("LISTEN"),
  //       },
  //     },
  //   },
  // });

  const getConfidence = (context: SDSContext) => {
    let u = context.recResult[0].confidence
    if (u > 0.68) {
      return true
    } else {
      return false
    }
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
      id: "init",
      on: {
        TTS_READY: "help",
        CLICK: "help",
      },
    },
    helping: {
      id: "helping",
      entry: send((context) => ({
        type: "SPEAK",
        value: `${context.help}`
      })),
      on: { ENDSPEECH: "#help.hist" },
    },
    help: {
      id: "help",
      initial: 'introduction',
      states: {
          hist: {
              type: 'history',
              history: "deep",
          },
        introduction: {
          initial: "prompt",
          entry: [assign({ count: 1 })],
          on: {
            RECOGNISED: [
              {
                target: "#helping", 
                cond: (context) => !!getEntity(context, "help") && getConfidence(context) === true,
                actions: assign({
                  help: (context) => getHelp(context,"introduction"),
                })
              },
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
            TIMEOUT: ".noinput"
          },
          states: {
              noinput: {
                entry: send({
                  type: "SPEAK",
                  value: "I don't quite hear you.",
                }),
                on: {
                  ENDSPEECH: "reprompt",
                },
              },
              reprompt: {
                initial: "choice",
                states: {
                  choice: {
                    always: [
                      {
                        target: "p2.hist",
                        cond: (context) => context.count === 2,
                      },
                      {
                        target: "p3.hist",
                        cond: (context) => context.count === 3,
                      },
                      {
                        target: "#init",
                        cond: (context) => context.count === 4,
                      },
                      "p1",
                    ],
                  },
                  p1: {
                    entry: [assign({ count: 2 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                        entry: send({
                          type: "SPEAK",
                          value: "Can you tell me your name please?",
                        }),
                        on: { ENDSPEECH: "ask" },
                      },
                      ask: {
                        entry: send("LISTEN"),
                      },
                    },
                  },
                  p2: {
                    entry: [assign({ count: 3 })],
                    initial: "prompt",
                    states: {
                      hist: { type: "history" },
                      prompt: {
                        entry: send({
                          type: "SPEAK",
                          value: "What is your name?",
                        }),
                        on: { ENDSPEECH: "ask" },
                      },
                      ask: {
                        entry: send("LISTEN"),
                      },
                    },
                  },
                  p3: {
                    entry: [assign({ count: 4 })],
                    initial: "prompt",
                    states: {
                      hist: { type: "history" },
                      prompt: {
                        entry: send({
                          type: "SPEAK",
                          value: "Your name?",
                        }),
                        on: { ENDSPEECH: "ask" },
                      },
                      ask: {
                        entry: send("LISTEN"),
                      },
                    },
                  },
                },
              },
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
          entry: [assign({ count: 1 })],
          on: {
            RECOGNISED: [
              {target: "#helping", 
                cond: (context) => !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context,"hello"),
                })
              },
              {
                target: ".reassurement", 
                cond: (context) => !!getEntity(context, "meeting") && getConfidence(context) === false,
              },
              {
                target: ".reassurement1", 
                cond: (context) => !!getEntity(context, "celeb") || !!getName(context) && getConfidence(context) === false,
                actions: assign({
                celeb: (context) => getName(context) || getNluEntity(context, "celeb"),
                }),
              },
              {
                target: "createAMeeting",
                cond: (context) => !!getEntity(context, "meeting"),
                actions: assign({
                  meeting: (context) => getEntity(context, "meeting"),
                }),
              },
              {
                target: "whoIsX",
                cond: (context) => !!getEntity(context, "celeb") || !!getName(context) || !!getNluEntity(context, "celeb"),
                actions: assign({
                  celeb: (context) => getName(context) || getNluEntity(context, "celeb"),
                }),
              },
              {
                target: ".nomatch",
              },
            ],
            TIMEOUT: ".noinput",
          },
          states: {
            reassurement: {
              id: "reassurement",
              initial: "prompt",
              on: {
                RECOGNISED: [
                {
                  target: "#hello",
                  cond: (context) => !!getEntity(context, "denial"),
                  actions: assign({
                    denial: (context) => getEntity(context, "denial"),
                  }),
                },
                {
                  target: "#createAMeeting",
                  cond: (context) => !!getEntity(context, "confirmation"),
                  actions: assign({
                    confirmation: (context) => getEntity(context, "confirmation"),
                  }), 
                },
              ]},
              states: {
                prompt: {
                  entry: send((context) => ({
                    type: "SPEAK",
                    value: `Did I catch that correctly? Did you say ${context.recResult[0].utterance}?`
                    })),
                  on: { ENDSPEECH: "ask" },
                  },
                  ask: 
                  {
                  entry: send("LISTEN"),
                },
              },
            },
            reassurement1: {
              id: "reassurement1",
              initial: "prompt",
              on: {
                RECOGNISED: [
                {
                  target: "#hello",
                  cond: (context) => !!getEntity(context, "denial"),
                  actions: assign({
                    denial: (context) => getEntity(context, "denial"),
                  }),
                },
                {
                  target: "#whoIsX",
                  cond: (context) => !!getEntity(context, "confirmation"),
                  actions: assign({
                    confirmation: (context) => getEntity(context, "confirmation"),
                  }), 
                },
              ]},
              states: {
                prompt: {
                  entry: send((context) => ({
                    type: "SPEAK",
                    value: `Did I catch that correctly? Did you say ${context.recResult[0].utterance}?`
                    })),
                  on: { ENDSPEECH: "ask" },
                  },
                  ask: 
                  {
                  entry: send("LISTEN"),
                },
              },
            },
            noinput: {
              entry: send({
                type: "SPEAK",
                value: "I don't hear you.",
              }),
              on: {
                ENDSPEECH: "reprompt",
              },
            },
            reprompt: {
              initial: "choice",
              states: {
                choice: {
                  always: [
                    {
                      target: "p2.hist",
                      cond: (context) => context.count === 2,
                    },
                    {
                      target: "p3.hist",
                      cond: (context) => context.count === 3,
                    },
                    {
                      target: "#init",
                      cond: (context) => context.count === 4,
                    },
                    "p1",
                  ],
                },
                p1: {
                  entry: [assign({ count: 2 })],
                  initial: "prompt",
                  states: {
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "What do you need help with?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p2: {
                  entry: [assign({ count: 3 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "What kind of help do you need?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p3: {
                  entry: [assign({ count: 4 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "Do you want to create a meeting or ask me who someone is?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
              },
            },
            prompt: {
              entry: send((context) => ({
                type: "SPEAK",
                value: `Nice to meet you ${context.name}! What can I help you with today? If you're not sure you can just say 'help' now or at any point.`
              })),
              on: { ENDSPEECH: "ask" },
            },
            ask: {
              entry: send("LISTEN"),
            },
            nomatch: {
              entry: say(
                "I'm sorry, I didn't understand you quite right. Can you repeat?"
              ),
              on: { ENDSPEECH: "ask" },
            },
          },
        },   
        whoIsX: {
          id: "whoIsX",
          initial: "xIs",
          entry: [assign({ count: 1 })],
          on: {
            RECOGNISED: [
              {target: "#helping", 
                cond: (context) => !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context,"whoIsX"),
                })
              },
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
          entry: [assign({ count: 1 })],
          on: {
            RECOGNISED: [
              {target: "#helping", 
              cond: (context) => !!getEntity(context, "help"),
              actions: assign({
                help: (context) => getHelp(context,"meetingX"),
              })
            },
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
            noinput: {
              entry: send({
                type: "SPEAK",
                value: "I didn't catch that.",
              }),
              on: {
                ENDSPEECH: "reprompt",
              },
            },
            reprompt: {
              initial: "choice",
              states: {
                choice: {
                  always: [
                    {
                      target: "p2.hist",
                      cond: (context) => context.count === 2,
                    },
                    {
                      target: "p3.hist",
                      cond: (context) => context.count === 3,
                    },
                    {
                      target: "#init",
                      cond: (context) => context.count === 4,
                    },
                    "p1",
                  ],
                },
                p1: {
                  entry: [assign({ count: 2 })],
                  initial: "prompt",
                  states: {
                    prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Do you want to meet ${context.celeb}?`,
                      })),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p2: {
                  entry: [assign({ count: 3 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "Should I create a meet up?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p3: {
                  entry: [assign({ count: 4 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "Meet them?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
              },
            },
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
          on: { ENDSPEECH: "#init" },
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
          entry: [assign({ count: 1 })],
          on: {
            RECOGNISED: [
              {target: "#helping", 
                cond: (context) => !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context,"createAMeeting"),
                })
              },
              {
                target: ".reassurement", 
                cond: (context) => !!getEntity(context, "title") && getConfidence(context) === false,
              },
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
            TIMEOUT: ".noinput",
          },
          states: {
            reassurement: {
              id: "reassurement",
              initial: "prompt",
              on: {
                RECOGNISED: [
                {
                  target: "#createAMeeting",
                  cond: (context) => !!getEntity(context, "denial"),
                  actions: assign({
                    denial: (context) => getEntity(context, "denial"),
                  }),
                },
                {
                  target: "#info",
                  cond: (context) => !!getEntity(context, "confirmation"),
                  actions: assign({
                    confirmation: (context) => getEntity(context, "confirmation"),
                  }), 
                },
              ]},
              states: {
                prompt: {
                  entry: send((context) => ({
                    type: "SPEAK",
                    value: `Did I catch that correctly? Did you say ${context.recResult[0].utterance}?`
                    })),
                  on: { ENDSPEECH: "ask" },
                  },
                  ask: 
                  {
                  entry: send("LISTEN"),
                },
              },
            },
            noinput: {
              entry: send({
                type: "SPEAK",
                value: "I don't seem to hear you.",
              }),
              on: {
                ENDSPEECH: "reprompt",
              },
            },
            reprompt: {
              initial: "choice",
              states: {
                choice: {
                  always: [
                    {
                      target: "p2.hist",
                      cond: (context) => context.count === 2,
                    },
                    {
                      target: "p3.hist",
                      cond: (context) => context.count === 3,
                    },
                    {
                      target: "#init",
                      cond: (context) => context.count === 4,
                    },
                    "p1",
                  ],
                },
                p1: {
                  entry: [assign({ count: 2 })],
                  initial: "prompt",
                  states: {
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "What is your meeting about",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p2: {
                  entry: [assign({ count: 3 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "What is it about?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p3: {
                  entry: [assign({ count: 4 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "Meeting title?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
              },
            },
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
          id: "info",
          entry: send((context) => ({
            type: "SPEAK",
            value: `OK, ${context.title}`,
          })),
          on: { ENDSPEECH: "whenDay" },
        },
        whenDay: {
          id: "whenDay",
          initial: "prompt",
          entry: [assign({ count: 1 })],
          on: {
            RECOGNISED: [
              {target: "#helping", 
                cond: (context) => !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context,"whenDay"),
                })
              },
              {
                target: ".reassurement",
                cond: (context) => !!getEntity(context, "day") || !!getNluEntity(context, "dateTime") && getConfidence(context) === false,
                actions: assign({ 
                  day: (context) => getEntity(context, "day") || getNluEntity(context, "dateTime"),
                }),
              },
              {
                target: "appointmentDay",
                cond: (context) => !!getEntity(context, "day") || !!getNluEntity(context, "dateTime"),
                actions: assign({ 
                  day: (context) => getEntity(context, "day") || getNluEntity(context, "dateTime"),
                }),
              },
              {
                target: ".nomatch",
              },
            ],
            TIMEOUT: ".noinput",
          },
          states: {
            reassurement: {
              id: "reassurement",
              initial: "prompt",
              on: {
                RECOGNISED: [
                {
                  target: "#whenDay",
                  cond: (context) => !!getEntity(context, "denial"),
                  actions: assign({
                    denial: (context) => getEntity(context, "denial"),
                  }),
                },
                {
                  target: "#appointmentDay",
                  cond: (context) => !!getEntity(context, "confirmation"),
                  actions: assign({
                    confirmation: (context) => getEntity(context, "confirmation"),
                  }), 
                },
              ]},
              states: {
                prompt: {
                  entry: send((context) => ({
                    type: "SPEAK",
                    value: `Did I catch that correctly? Did you say ${context.recResult[0].utterance}?`
                    })),
                  on: { ENDSPEECH: "ask" },
                  },
                  ask: 
                  {
                  entry: send("LISTEN"),
                },
              },
            },
            noinput: {
              entry: send({
                type: "SPEAK",
                value: "I didn't catch that.",
              }),
              on: {
                ENDSPEECH: "reprompt",
              },
            },
            reprompt: {
              initial: "choice",
              states: {
                choice: {
                  always: [
                    {
                      target: "p2.hist",
                      cond: (context) => context.count === 2,
                    },
                    {
                      target: "p3.hist",
                      cond: (context) => context.count === 3,
                    },
                    {
                      target: "#init",
                      cond: (context) => context.count === 4,
                    },
                    "p1",
                  ],
                },
                p1: {
                  entry: [assign({ count: 2 })],
                  initial: "prompt",
                  states: {
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "On which day do you want to have your meeting on?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p2: {
                  entry: [assign({ count: 3 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "What day do you have in mind?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p3: {
                  entry: [assign({ count: 4 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "On which day?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
              },
            },
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
          id: "appointmentDay",
          entry: send((context) => ({
            type: "SPEAK",
            value: `OK, ${context.day}`,
          })),
          on: { ENDSPEECH: "duration" },
        },
        duration: {
          initial: "prompt",
          entry: [assign({ count: 1 })],
          on: {
            RECOGNISED: [
              {target: "#helping", 
                cond: (context) => !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context,"duration"),
                })
              },
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
            TIMEOUT: ".noinput",
          },
          states: {
            noinput: {
              entry: send({
                type: "SPEAK",
                value: "I didn't catch that.",
              }),
              on: {
                ENDSPEECH: "reprompt",
              },
            },
            reprompt: {
              initial: "choice",
              states: {
                choice: {
                  always: [
                    {
                      target: "p2.hist",
                      cond: (context) => context.count === 2,
                    },
                    {
                      target: "p3.hist",
                      cond: (context) => context.count === 3,
                    },
                    {
                      target: "#init",
                      cond: (context) => context.count === 4,
                    },
                    "p1",
                  ],
                },
                p1: {
                  entry: [assign({ count: 2 })],
                  initial: "prompt",
                  states: {
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "Will it take the whole day?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p2: {
                  entry: [assign({ count: 3 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "Whole day meeting?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p3: {
                  entry: [assign({ count: 4 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "Yes or no?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
              },
            },
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
          id: "whenTime",
          initial: "prompt",
          entry: [assign({ count: 1 })],
          on: {
            RECOGNISED: [
              {target: "#helping", 
                cond: (context) => !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context,"whenTime"),
                })
              },
              {
                target: ".reassurement",
                cond: (context) => !!getEntity(context, "time") && getConfidence(context) === false,
              },
              {
                target: "timeOfDay",
                cond: (context) => !!getEntity(context, "time") || !!getNluEntity(context, "dateTime"),
                actions: assign({
                  time: (context) => getEntity(context, "time") || getNluEntity(context, "dateTime"),
                }),
              },
              {
                target: ".nomatch",
              },
            ],
            TIMEOUT: ".noinput",
          },
          states: {
            reassurement: {
              id: "reassurement",
              initial: "prompt",
              on: {
                RECOGNISED: [
                {
                  target: "#whenTime",
                  cond: (context) => !!getEntity(context, "denial"),
                  actions: assign({
                    denial: (context) => getEntity(context, "denial"),
                  }),
                },
                {
                  target: "#timeOfDay",
                  cond: (context) => !!getEntity(context, "confirmation"),
                  actions: assign({
                    confirmation: (context) => getEntity(context, "confirmation"),
                  }), 
                },
              ]},
              states: {
                prompt: {
                  entry: send((context) => ({
                    type: "SPEAK",
                    value: `Did I catch that correctly? Did you say ${context.recResult[0].utterance}?`
                    })),
                  on: { ENDSPEECH: "ask" },
                  },
                  ask: 
                  {
                  entry: send("LISTEN"),
                },
              },
            },
            noinput: {
              entry: send({
                type: "SPEAK",
                value: "I didn't catch that.",
              }),
              on: {
                ENDSPEECH: "reprompt",
              },
            },
            reprompt: {
              initial: "choice",
              states: {
                choice: {
                  always: [
                    {
                      target: "p2.hist",
                      cond: (context) => context.count === 2,
                    },
                    {
                      target: "p3.hist",
                      cond: (context) => context.count === 3,
                    },
                    {
                      target: "#init",
                      cond: (context) => context.count === 4,
                    },
                    "p1",
                  ],
                },
                p1: {
                  entry: [assign({ count: 2 })],
                  initial: "prompt",
                  states: {
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "At what time do you want to have your meeting?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p2: {
                  entry: [assign({ count: 3 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "What time do you have in mind?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p3: {
                  entry: [assign({ count: 4 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "What time?",
                      }),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
              },
            },
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
          id: "timeOfDay",
          entry: say("Great, let's create your meeting!"),
          on: { ENDSPEECH: "confirmMeeting" },
        },
        confirmMeetingWholeDay: {
          initial: "prompt",
          entry: [assign({ count: 1 })],
          on: {
            RECOGNISED: [
              {target: "#helping", 
                cond: (context) => !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context,"confirmMeetingWholeDay"),
                })
              },
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
            TIMEOUT: ".noinput",
          },
          states: {
            noinput: {
              entry: send({
                type: "SPEAK",
                value: "I didn't catch that.",
              }),
              on: {
                ENDSPEECH: "reprompt",
              },
            },
            reprompt: {
              initial: "choice",
              states: {
                choice: {
                  always: [
                    {
                      target: "p2.hist",
                      cond: (context) => context.count === 2,
                    },
                    {
                      target: "p3.hist",
                      cond: (context) => context.count === 3,
                    },
                    {
                      target: "#init",
                      cond: (context) => context.count === 4,
                    },
                    "p1",
                  ],
                },
                p1: {
                  entry: [assign({ count: 2 })],
                  initial: "prompt",
                  states: {
                    prompt: {
                      entry: send((context) =>({
                        type: "SPEAK",
                        value: `Do you want this meeting ${context.meeting} on ${context.day} for the whole day?`,
                      })),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p2: {
                  entry: [assign({ count: 3 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send((context) =>({
                        type: "SPEAK",
                        value: `Is ${context.meeting} on ${context.day} for the whole day correct?`,
                      })),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p3: {
                  entry: [assign({ count: 4 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send((context) =>({
                        type: "SPEAK",
                        value: `${context.meeting} on ${context.day} for the whole day. Is that right?`,
                      })),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
              },
            },
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
          entry: [assign({ count: 1 })],
          on: {
            RECOGNISED: [
              {target: "#helping", 
                cond: (context) => !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context,"confirmMeeting"),
                })
              },
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
            TIMEOUT: ".noinput",
          },
          states: {
            noinput: {
              entry: send({
                type: "SPEAK",
                value: "I didn't catch that.",
              }),
              on: {
                ENDSPEECH: "reprompt",
              },
            },
            reprompt: {
              initial: "choice",
              states: {
                choice: {
                  always: [
                    {
                      target: "p2.hist",
                      cond: (context) => context.count === 2,
                    },
                    {
                      target: "p3.hist",
                      cond: (context) => context.count === 3,
                    },
                    {
                      target: "#init",
                      cond: (context) => context.count === 4,
                    },
                    "p1",
                  ],
                },
                p1: {
                  entry: [assign({ count: 2 })],
                  initial: "prompt",
                  states: {
                    prompt: {
                      entry: send((context) =>({
                        type: "SPEAK",
                        value: `Do you want this meeting ${context.meeting} on ${context.day} at ${context.time}?`,
                      })),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p2: {
                  entry: [assign({ count: 3 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send((context) =>({
                        type: "SPEAK",
                        value: `Is ${context.meeting} on ${context.day} at ${context.time} correct?`,
                      })),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                p3: {
                  entry: [assign({ count: 4 })],
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send((context) =>({
                        type: "SPEAK",
                        value: `${context.meeting} on ${context.day} at ${context.time}. Is that right?`,
                      })),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
              },
            },
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
          on: { ENDSPEECH: "#init" },
        },
        incorrectInfo: {
          entry: send((context) => ({
            type: "SPEAK", 
            value: "Sorry, it's probably my fault. Let's try again!",
          })),
          on: { ENDSPEECH: "#init" },
        },
      },
    },
  },
};

const kbRequest = (text: string) =>
  fetch(
    new Request(
      `https://cors.eu.org/https://api.duckduckgo.com/?q=${text}&format=json&skip_disambig=1`
    )
  ).then((data) => data.json());

import { isContext } from "vm";
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
  "help": {
    intent: "None",
    entities: { help: "help" }
  },
  "i don't know": {
    intent: "None",
    entities: { help: "help" }
  },
  "i need help": {
    intent: "None",
    entities: { help: "help" }
  },
  "what should I do": {
    intent: "None",
    entities: { help: "help" }
  },
  "how does this work": {
    intent: "None",
    entities: { help: "help" }
  },
  "what's this": {
    intent: "None",
    entities: { help: "help" }
  },
  "uh, what's this": {
    intent: "None",
    entities: { help: "help" }
  },
};

//  functions on lines 48-77 were sourced and adapted from https://codepen.io/ishanbakshi/pen/pgzNMv 
const elem = document.getElementById('timer');
if (elem) { const timer = elem.innerHTML = 3 + ":" + 59; }

function startTimer() {
  if (elem) {
    let presentTime = elem.innerHTML;
    let timeArray: any = presentTime.split(/[:]+/);
    let m: any = timeArray[0];
    let s = checkSecond((timeArray[1] - 1));
    if (s == 59) { m = m - 1 }
    if (m < 0) {
      return false
    }
    if (m == 0 && s == "00") {
      //myFunction();
      return true
    }
    elem.innerHTML = m + ":" + s;
    console.log(m)
    
    setTimeout(startTimer, 1000);
  }
}

function checkSecond(sec: any) {
  if (sec < 10 && sec >= 0) { sec = "0" + sec };
  if (sec < 0) { sec = "59" };
  return sec;
}

function reloadPage() {
  //alert("Game Over! You couldn't buy all the items in time! You can try again!");
  window.location.reload();
}

  const images = ["bananas", "bread", "butter", "chocolate", "clementines", "cookies", "eggs", "milk", "plums"]

export function getItem(array: any) {
  const indexRandom = Math.floor(Math.random() * array.length);
  let item = `${array[indexRandom]}`
  console.log(item)
  return item
};

export function getImage(picture: any) {
  const elem = document.getElementById("image");
  if (elem) {
    const img = elem.innerHTML = `<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);">
    <img src="/img/${picture}.jpg" width="400" height="400"/>
  </div>`;
    return img
  }
};

const getnluEntity = (context: SDSContext, text: string) => {
  const result = [];
  const entities = context.nluResult.prediction.entities
  for (let i = 0; i < entities.length; i++) {
    if (entities[i].category === "toBuy") {
      if (entities[i].text.toLowerCase() === text) {
        result.push(entities[i].text);
        return result
      }
    }
  }
  return false;
};

const getHelp = (context: SDSContext, itemName: string) => {
  type HelpMessages = {
    [key: string]: string;
  }
  const helpMessages: HelpMessages = {
    nickname: "Just choose any nickname you would like for this game",
    instructions: "This is a language learning game. It is based on role-play. You are a customer and you need to buy the items that appear on your screen. I am your shopping assistant. Try to ask me for every item before the time runs out. Correct answers are 10 points, wrong answers are minus 5. When you're done, a green check will appear on your screen. Good luck!",
    bananas: "These are some bananas. You have to ask the shop assistant for them.",
    bread: "Try asking me to buy some bread.",
    butter: "You have to buy butter at this stage.",
    chocolate: "This is some chocolate you have to buy.",
    clementines: "You can ask me for clementines",
    cookies: "These are some cookies. Try asking me for them",
    eggs: "Just ask for some eggs",
    milk: "This is milk. You have to ask to buy it",
    plums: "These are plums. You need to get them",
    finished: "A yes or no answer will do just fine here. This is the last stage.",
    goodbye: "you can say goodbye to me if you want, otherwise wait for a little while until I close the store.",
    pay: "You can either say cash or card",
  }
  let message = helpMessages[itemName]
  return message
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

export const responses = ["Ok! Here you are! Would you like something else?", "Sure thing! Is there anything else that you need?", "Of course! What else can I get you?", "Can I get you anything else?","Is there anything else I can help you with?", "Anything more?", "Sure! Anything else you want?", "Something more?", "Would you like to buy something else?"]

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
        TTS_READY: "game",
        CLICK: "game",
      },
    },
    instructions: {
      id: "instructions",
      entry: send((context) => ({
        type: "SPEAK",
        value: `${context.help}`
      })),
      on: { ENDSPEECH: "#game.hist" },
    },
    game: {
      id: "game",
      initial: 'introduction',
      states: {
        hist: {
          type: 'history',
        },
        introduction: {
          initial: "prompt",
          on: {
            RECOGNISED: [
              {
                target: "#instructions",
                cond: (context) => !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context, "nickname"),
                }),
              },
              {
                target: "gettingAqcuainted",
                actions: assign({
                  nickname: (context) => context.recResult[0].utterance.replace(/\.$/g, ""),
                }),
              },
              {
                target: ".noname",
              },
            ],
            TIMEOUT: ".prompt"
          },
          states: {
            prompt: {
              entry: say("Hi! I am Ogma, your co-player for today. Please choose your nickname. What will it be?"),
              on: { ENDSPEECH: "ask" },
            },
            ask: {
              entry: send("LISTEN"),
            },
            noname: {
              entry: say(
                "Sorry, I am afraid I didn't hear you. Please repeat your nickname."
              ),
              on: { ENDSPEECH: "ask" },
            },
          },
        },
        gettingAqcuainted: {
          id: "gettingAqcuainted",
          initial: "prompt",
          entry: assign({
            arrayOfImages: (context) => images,
            arrayOfResponses: (context) => responses,
          }),
          on: {
            RECOGNISED: [
              {
                target: "#instructions",
                cond: (context) => context.nluResult.prediction.topIntent === "confirm" || !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context, "instructions"),
                  score: (context) => 0,
                  item: (context) => getItem(context.arrayOfImages),
                }),
              },
              {
                target: "#playGameFirstRound",
                cond: (context) => context.nluResult.prediction.topIntent === "deny",
                actions: assign({
                  score: (context) => 0,
                  item: (context) => getItem(context.arrayOfImages),
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
              initial: "choice",
              states: {
                choice: {
                  always: [
                    {
                      target: "prompt2.hist",
                      cond: (context) => context.count === 2,
                    },
                    "prompt1",
                  ],
                },
                prompt1: {
                  entry: [assign({ count: 2 })],
                  initial: "prompt",
                  states: {
                    prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Cool nickname ${context.nickname}! Remember that you can ask for help at any stage of the game if you just say "help". Would you like to hear the game's instructions now?`
                      })),
                      on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                prompt2: {
                  initial: "prompt",
                  states: {
                    hist: { type: "history" },
                    prompt: {
                      entry: send({
                        type: "SPEAK",
                        value: "Let's start the game!",
                      }),
                      on: { ENDSPEECH: "#playGameFirstRound" },
                    },
                  },
                },
              },
            },
            nomatch: {
              entry: send((context) => ({
                type: "SPEAK",
                value: `I'm sorry, I didn't understand you quite right. Can you repeat? Do you want to hear the instructions ${context.nickname}?`,
              })),
              on: { ENDSPEECH: "ask" },
            },
            ask: {
              entry: send("LISTEN"),
            },
          },
        },
        playGameFirstRound: {
          id: "playGameFirstRound",
          initial: "prompt",
          entry: [startTimer, assign({
            score: (context) => 0,
            arrayOfImages: (context) => context.arrayOfImages.filter((picture: any) => picture !== context.item),
          })],
          on: {
            RECOGNISED: [
              {
                target: "gameOver",
                cond: (context) => startTimer() === true,
              },
              {
                target: "#instructions",
                cond: (context) => !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context, context.item),
                })
              },
              {
                target: "playGameOtherRounds",
                cond: (context) => !!getnluEntity(context, context.item),
                actions: assign({
                  item: (context) => getItem(context.arrayOfImages),
                  response: (context) => getItem(context.arrayOfResponses),
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
                ENDSPEECH: "prompt",
              },
            },
            prompt: {
              entry: send((context) => ({
                type: "SPEAK",
                value: `You're at the supermarket looking for the things that appear on the screen. You only have 4 minutes before the store closes. A shop assistant is approaching you... Hey! What can I help you with today? ${getImage(context.item)}`,
              })),
              on: { ENDSPEECH: "ask" },
            },
            ask: {
              entry: send("LISTEN"),
            },
            nomatch: {
              entry: assign({ score: (context) => context.score - 5 }),
              initial: "p1",
              states: {
                p1: {
                  entry: say(
                    "Sorry, I couldn't find the item you asked for! Try something else!"
                  )
                },
              },
              on: { ENDSPEECH: "prompt1" },
            },
            prompt1: {
              entry: say(
                "I am your shopping assistant. What can I help you with today?"
              ),
              on: { ENDSPEECH: "ask" }
            },
          },
        },
        playGameOtherRounds: {
          id: "playGameOtherRounds",
          initial: "prompt",
          entry: assign({
            score: (context) => context.score + 10,
            arrayOfImages: (context) => context.arrayOfImages.filter((picture: any) => picture !== context.item),
          }),
          on: {
            RECOGNISED: [
              {
                target: "gameOver",
                cond: (context) => startTimer() === true,
              },
              {
                target: "#instructions",
                cond: (context) => !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context, context.item),
                })
              },
              {
                target: "playGameOtherRounds",
                cond: (context) => !!getnluEntity(context, context.item) && context.arrayOfImages.length > 2,
                actions: assign({
                  item: (context) => getItem(context.arrayOfImages),
                  response: (context) => getItem(context.arrayOfResponses),
                }),
              },
              {
                target: "finished",
                cond: (context) => !!getnluEntity(context, context.item) && context.arrayOfImages.length === 2,
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
                value: "I'm sorry I don't seem to hear you.",
              }),
              on: {
                ENDSPEECH: "prompt",
              },
            },
            prompt: {
              entry: send((context) => ({
                type: "SPEAK",
                value: `${context.response}. ${getImage(context.item)}`,
              })),
              on: { ENDSPEECH: "ask" },
            },
            ask: {
              entry: send("LISTEN"),
            },
            nomatch: {
              entry: assign({
                score: (context) => context.score - 5,
                item: (context) => getItem(context.arrayOfImages),
              }),
              initial: "p1",
              states: {
                p1: {
                  entry: say(
                    "Sorry, I'm afraid we don't have that. Ask for something else!"
                  )
                },
              },
              on: { ENDSPEECH: "#playGameOtherRounds" },
            },
          },
        },
        finished: {
          id: "finished",
          initial: "prompt",
          entry: assign({
            score: (context) => context.score + 10,
          }),
          on: {
            RECOGNISED: [
              {
                target: "gameOver",
                cond: (context) => startTimer() === true,
              },
              {
                target: "#instructions",
                cond: (context) => !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context, "finished"),
                })
              },
              {
                target: "shopForBonus",
                cond: (context) => context.nluResult.prediction.topIntent === "deny",
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
                value: "Sorry I don't hear you.",
              }),
              on: {
                ENDSPEECH: "prompt",
              },
            },
            prompt: {
              entry: send((context) => ({
                type: "SPEAK",
                value: `Ok, here you go! Is there anything else you need to buy before we close? ${getImage("check")}`,
              })),
              on: { ENDSPEECH: "ask" },
            },
            ask: {
              entry: send("LISTEN"),
            },
            nomatch: {
              initial: "p1",
              states: {
                p1: {
                  entry: say(
                    "There are many people in the store and I didn't really catch that. Anything more?"
                  )
                },
              },
              on: { ENDSPEECH: "ask" },
            },
          },
        },
        shopForBonus: {
          id: "shopForBonus",
          initial: "prompt",
          on: {
            RECOGNISED: [
              {
                target: "gameOver",
                cond: (context) => startTimer() === true,
              },
              {
                target: "pay",
                cond: (context) => context.nluResult.prediction.topIntent === "hearScore",
              },
              {
                target: "bonusGame",
                cond: (context) => context.nluResult.prediction.topIntent === "bonusPoints",
                actions: assign({
                  item: (context) => getItem(context.arrayOfImages),
                })
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
                value: "I can't seem to hear you.",
              }),
              on: {
                ENDSPEECH: "prompt",
              },
            },
            prompt: {
              entry: say(
                "Congratulations, you finished the game! Would you like to pay and hear your score or continue shopping for bonus points?",
              ),
              on: { ENDSPEECH: "ask" },
            },
            ask: {
              entry: send("LISTEN"),
            },
            nomatch: {
              entry: say(
                "Sorry I was distracted. Can you repeat please? There is no help for this state."
              ),
              on: { ENDSPEECH: "ask" },
            },
          },
        },
        bonusGame: {
          id: "bonusGame",
          initial: "prompt",
          entry: assign({
            score: (context) => context.score + 10,
            arrayOfImages: (context) => context.arrayOfImages.filter((picture: any) => picture !== context.item),
          }),
          on: {
            RECOGNISED: [
              {
                target: "gameOver",
                cond: (context) => startTimer() === true,
              },
              {
                target: "#instructions",
                cond: (context) => !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context, context.item)
                })
              },
              {
                target: "bonusGame",
                cond: (context) => !!getnluEntity(context, context.item) && context.arrayOfImages.length > 0,
                actions: assign({
                  item: (context) => getItem(context.arrayOfImages),
                  response: (context) => getItem(context.arrayOfResponses),
                }),
              },
              {
                target: "pay",
                cond: (context) => !!getnluEntity(context, context.item) && context.arrayOfImages.length === 0,
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
                value: "I'm sorry I don't seem to hear you.",
              }),
              on: {
                ENDSPEECH: "prompt",
              },
            },
            prompt: {
              entry: send((context) => ({
                type: "SPEAK",
                value: `${context.response}. ${getImage(context.item)}`,
              })),
              on: { ENDSPEECH: "ask" },
            },
            ask: {
              entry: send("LISTEN"),
            },
            nomatch: {
              entry: assign({
                score: (context) => context.score - 5,
                item: (context) => getItem(context.arrayOfImages),
              }),
              initial: "p1",
              states: {
                p1: {
                  entry: say(
                    "Sorry, I'm afraid we don't have that. Ask for something else!"
                  )
                },
              },
              on: { ENDSPEECH: "#bonusGame" },
            },
          },
        },
        pay: {
          id: "pay",
          initial: "prompt",
          entry: assign({ score: (context) => context.score + 10 }),
          on: {
            RECOGNISED: [
              {
                target: "gameOver",
                cond: (context) => startTimer() === true,
              },
              {
                target: "#instructions",
                cond: (context) => !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context, "pay"),
                })
              },
              {
                target: "goodbye",
                cond: (context) => context.nluResult.prediction.topIntent === "payment",
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
                value: "I can't seem to hear you.",
              }),
              on: {
                ENDSPEECH: "prompt",
              },
            },
            prompt: {
              entry: send((context) => ({
                type: "SPEAK",
                value: `Great! That would be 12 euros and 45 cents. Would you like to pay by cash or card? ${getImage("check")}`,
              })),
              on: { ENDSPEECH: "ask" },
            },
            ask: {
              entry: send("LISTEN"),
            },
            nomatch: {
              entry: assign({ score: (context) => context.score - 5 }),
              initial: "p1",
              states: {
                p1: {
                  entry: say(
                    "Sorry, I got distracted! Cash or card?"
                  )
                },
              },
              on: { ENDSPEECH: "ask" },
            },
          },
        },
        goodbye: {
          id: "goodbye",
          initial: "prompt",
          on: {
            RECOGNISED: [
              {
                target: "gameOver",
                cond: (context) => startTimer() === true,
              },
              {
                target: "#instructions",
                cond: (context) => !!getEntity(context, "help"),
                actions: assign({
                  help: (context) => getHelp(context, "goodbye"),
                })
              },
              {
                target: "scoring",
                cond: (context) => context.nluResult.prediction.topIntent === "goodbye" && context.score < 100,
              },
              {
                target: "fullScore",
                cond: (context) => context.nluResult.prediction.topIntent === "goodbye" && context.score === 100,
              },
              {
                target: ".nomatch",
              },
            ],
            TIMEOUT: "scoring",
          },
          states: {
            prompt: {
              entry: say(
                "Perfect! Here's your receipt! Have a goodnight!"
              ),
              on: { ENDSPEECH: "ask" },
            },
            ask: {
              entry: send("LISTEN"),
            },
            nomatch: {
              entry: say(
                "Bye bye"
              ),
              on: { ENDSPEECH: "#score" },
            },
          },
        },
        score: {
          id: "score",
          initial: "prompt",
          states: {
            prompt: {
              entry: send((context) => ({
                type: "SPEAK",
                value: `Good job ${context.nickname}! Your score is ${context.score}. Hope you enjoyed the game! Refresh the page or click the button for another round! See you!`
              })),
              on: { ENDSPEECH: "#init" },
            },
          },
        },
        scoring: {
          id: "scoring",
          initial: "prompt",
          states: {
            prompt: {
              entry: send((context) => ({
                type: "SPEAK",
                value: `Amazing work ${context.nickname}! Your score is ${context.score}. Hope you enjoyed the game! Refresh the page or click the button for another round! Maybe this time you'll name every item correctly! See you!`
              })),
              on: { ENDSPEECH: "#init" },
            },
          },
        },
        fullScore: {
          id: "fullScore",
          initial: "prompt",
          states: {
            prompt: {
              entry: send((context) => ({
                type: "SPEAK",
                value: `Awesome work ${context.nickname}! You named correctly every item and you received ${context.score} points!. Hope you enjoyed the game! Refresh the page or click the button for another round! Otherwise see you another time!`
              })),
              on: { ENDSPEECH: "#init" },
            },
          },
        },
        gameOver: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Game over! You run out of time and the store closed! Your score is ${context.score}. See you some other time!`,
          })),
          on: { ENDSPEECH: "#init" },
        },
      },
    },
  },
};

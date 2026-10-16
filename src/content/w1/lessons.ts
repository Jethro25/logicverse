import { registerLesson } from '@/content/lessons'

registerLesson({
  id: 'w1-l1',
  worldId: 'w1',
  title: 'What is a Digital Signal?',
  subtitle: 'The language of 0s and 1s',
  icon: '⚡',
  xpReward: 50,
  pages: [
    {
      type: 'text',
      heading: 'Two states. That\'s all.',
      body: 'Every computer, every phone, every digital device you\'ve ever used is built on a single idea: **information can be represented as just two states**.\n\nWe call them **0** and **1**. Or LOW and HIGH. Or OFF and ON. Or FALSE and TRUE.\n\nThey\'re all the same concept — a binary digit, or **bit**.',
    },
    {
      type: 'text',
      heading: 'What does a signal look like?',
      body: 'In real electronics, a digital signal is a **voltage level**.\n\n• **0 (LOW)** — typically 0 volts\n• **1 (HIGH)** — typically 3.3 V or 5 V\n\nThe circuit doesn\'t care about the exact voltage — only whether it\'s above or below a threshold. This makes digital systems **noise-resistant**: small fluctuations don\'t change the meaning.',
    },
    {
      type: 'truth-table-demo',
      heading: 'A signal over time',
      inputs: ['Time →'],
      outputs: ['Signal'],
      rows: [[0, 0], [0, 0], [0, 1], [0, 1], [0, 0], [0, 1], [0, 1]],
      caption: 'A digital signal alternates between 0 and 1 — nothing in between.',
    },
    {
      type: 'text',
      heading: 'Why binary?',
      body: 'Binary seems limiting — why not use more states? The answer is **reliability**.\n\nWith 10 states, the difference between each level is 10% of the supply voltage. Noise can easily push a signal from one state to another.\n\nWith 2 states, the difference is 50%. You can build systems that are **faster, cheaper, and far more reliable**.\n\nThis is why every processor, memory chip, and network interface in the world is digital.',
    },
    {
      type: 'example',
      heading: 'Example: Representing the letter "A"',
      description: 'How do we store the letter A in binary? We use a standard called ASCII.',
      steps: [
        'The letter A has ASCII code 65 in decimal',
        '65 in binary is 01000001 (eight bits)',
        'A computer stores eight voltage levels: LOW, HIGH, LOW, LOW, LOW, LOW, LOW, HIGH',
        'When retrieved, it decodes back to A — perfectly, every time',
      ],
    },
  ],
})

registerLesson({
  id: 'w1-l2',
  worldId: 'w1',
  title: 'Logic Gates: Making Decisions',
  subtitle: 'How circuits think',
  icon: '🧠',
  xpReward: 50,
  pages: [
    {
      type: 'text',
      heading: 'Signals go in, decisions come out',
      body: 'A **logic gate** is a circuit that takes one or more binary inputs and produces a binary output.\n\nThe output depends on the **combination of inputs** — it\'s like a tiny decision machine.\n\nGates are the **building blocks of all digital circuits**: from a simple calculator to a modern CPU with billions of transistors.',
    },
    {
      type: 'text',
      heading: 'The AND Gate',
      body: 'The **AND gate** produces 1 only when **all** inputs are 1.\n\nThink of it like this: a lamp turns on AND stays on only if switch A AND switch B are both closed.\n\nSymbol: **A · B** or **A AND B**\n\nThis is exactly like the "and" in English — "If it\'s raining **and** I go outside, I get wet."',
    },
    {
      type: 'truth-table-demo',
      heading: 'AND Gate Truth Table',
      inputs: ['A', 'B'],
      outputs: ['A AND B'],
      rows: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]],
      highlight: 3,
      caption: 'Only the last row (A=1 AND B=1) gives output 1.',
    },
    {
      type: 'text',
      heading: 'The OR Gate',
      body: 'The **OR gate** produces 1 when **at least one** input is 1.\n\nThink of an alarm that goes off if sensor A OR sensor B detects motion.\n\nSymbol: **A + B** or **A OR B**',
    },
    {
      type: 'truth-table-demo',
      heading: 'OR Gate Truth Table',
      inputs: ['A', 'B'],
      outputs: ['A OR B'],
      rows: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]],
      caption: 'Output is 0 only when BOTH inputs are 0.',
    },
    {
      type: 'text',
      heading: 'The NOT Gate (Inverter)',
      body: 'The **NOT gate** has just one input and **flips it**: 0 becomes 1, and 1 becomes 0.\n\nAlso called an **inverter**, it adds the logic "if this signal is NOT high, do something".\n\nSymbol: **Ā** (A with a bar) or **NOT A** or **¬A**',
    },
    {
      type: 'truth-table-demo',
      heading: 'NOT Gate Truth Table',
      inputs: ['A'],
      outputs: ['NOT A'],
      rows: [[0, 1], [1, 0]],
      caption: 'The output is always the opposite of the input.',
    },
    {
      type: 'diagram',
      heading: 'Gates in action: A simple circuit',
      circuit: {
        components: [
          { id: 's1', type: 'SWITCH', x: 1, y: 3, props: { value: 1 }, label: 'A' },
          { id: 's2', type: 'SWITCH', x: 1, y: 6, props: { value: 0 }, label: 'B' },
          { id: 'g1', type: 'AND', x: 5, y: 4 },
          { id: 'led', type: 'LED', x: 9, y: 4 },
        ],
        wires: [
          { id: 'w1', from: { componentId: 's1', pin: 'out' }, to: { componentId: 'g1', pin: 'a' } },
          { id: 'w2', from: { componentId: 's2', pin: 'out' }, to: { componentId: 'g1', pin: 'b' } },
          { id: 'w3', from: { componentId: 'g1', pin: 'out' }, to: { componentId: 'led', pin: 'in' } },
        ],
      },
      explanation: 'A=1, B=0 → AND output = 0 → LED is OFF. Try flipping the switches in Circuit Lab!',
    },
  ],
})

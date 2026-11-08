// Shared copy and shot list for the site versions (/v/1, /v/2, /v/3).
// Copy is taken word for word from the current /preview draft. Edit here once.

export const shots = {
  hero:     { n: 1,  img: "modular",    title: "Panels move down a bright, quiet production line" },
  powder:   { n: 2,  img: "powder",     title: "Mineral powder pours into a steel bowl" },
  slurry:   { n: 3,  img: "slurry",     title: "Slurry folds off a mixing paddle" },
  press:    { n: 4,  img: "press",      title: "Press lifts to reveal a pale tile" },
  cure:     { n: 5,  img: "oven",       title: "Tiles cure in a low-temperature oven" },
  kiln:     { n: 6,  img: "kiln",       title: "The old way: a kiln at 1,300°C" },
  cnc:      { n: 7,  img: "cnc2",       title: "A CNC bit cuts a panel like wood" },
  hands:    { n: 8,  img: "hands",      title: "Gloved hands hold a finished panel" },
  torch:    { n: 9,  img: "torch",      title: "Torch test on a panel face" },
  bench:    { n: 10, img: "benchlab",   title: "Benchtop stations dispense, press and scan" },
  pipettes: { n: 11, img: "pipettes",   title: "Automated dispensing into sample vials" },
  robopress:{ n: 12, img: "robopress",  title: "Robot arm loads a panel into the press" },
  pilot:    { n: 13, img: "pilot",      title: "Pilot line, wide" },
  line:     { n: 14, img: "robot-line", title: "Robot cells along a finishing line" },
  compress: { n: 15, img: "compress",   title: "Compression test on a sample" },
  energy:   { n: 16, img: "datacenter", title: "Data center aisle" },
  defense:  { n: 17, img: "drydock",    title: "Ship in dry dock" },
  aero:     { n: 18, img: "rocket",     title: "Engine test stand" },
  infra:    { n: 19, img: "house",      title: "Home on a hillside in wildfire country" },
} as const;
export type ShotKey = keyof typeof shots;
export const img = (k: ShotKey) => `/v/img/${shots[k].img}.webp`;

export const hero = {
  title: "Advanced ceramics, reinvented.",
  sub: "A new class of ceramic composites made below 250°C. Tough, machinable and fire-resistant, engineered for American energy, defense and infrastructure.",
};

export const statement = {
  lead: "Every era of American progress was built on a new material.",
  rest: "Steel, aluminum, nylon, fiberglass, the transistor, optical fiber. Then the labs that made them were broken up, and the factories moved overseas.",
};

export const missing = {
  title: "America still invents. It can no longer scale.",
  body: "Between a lab breakthrough and a factory sits years of pilot runs, testing and qualification. In the U.S., that infrastructure has all but disappeared.",
  stages: [
    { name: "Invention", state: "Still strong in the U.S.", items: [["University labs", "Papers, not products"], ["National labs", "Grant-paced"], ["Corporate R&D", "Incremental, risk-averse"]] },
    { name: "Scale-up and qualification", state: "The missing middle", items: [["Pilot and contract manufacturing", "Barely exists in the U.S."], ["Testing and certification", "~3 months per result"], ["Qualification with customers", "Slow, unfunded"]] },
    { name: "Manufacturing", state: "Mostly offshore", items: [["Factories", "Mostly overseas"], ["Domestic suppliers", "1–2 per critical part"]] },
  ],
  stall: "New materials stall between the lab and the factory, and sit on the shelf for decades.",
  answer: "Ouros builds the missing middle, so a new material reaches production in months, not decades.",
};

export const lowTemp = {
  title: "1,300°C kiln. Under 250°C at Ouros.",
  body: "For 30,000 years, ceramics have meant fire. Our solidification chemistry works at a fraction of the heat, which lets polymers, and eventually metals, live inside a ceramic matrix.",
};

export const powderToPart = {
  title: "Mineral powder in. Engineered parts out.",
  body: "Panels, brackets, insulators and machined components, formed and cured below 250°C from abundant ceramic feedstock.",
  parts: ["Panels", "Brackets", "Insulators", "Machined parts"],
};

export const composites = {
  title: "One low-temperature process. A family of ceramic composites.",
  process: "Ouros low-temperature solidification",
  inputs: [["Ceramic matrix", "Abundant mineral feedstock"], ["Second phase", "Polymer or metal alloy"]],
  families: [
    { name: "Ceramic–polymer composite", status: "", traits: ["Fire-resistant, self-extinguishing", "Tough and crack-resistant", "Cuts, drills and CNCs like wood", "Low-cost mineral feedstock"], uses: ["Fire barriers", "Building panels", "Electrical insulation", "Battery enclosures"] },
    { name: "Ceramic–metal composite", status: "In development", traits: ["Target: higher strength and toughness", "Target: thermal and electrical conductivity", "Precision machinable", "Tunable density"], uses: ["Thermal management", "Structural parts", "Defense hardware"] },
  ],
};

export const foundry = {
  title: "A materials lab built like a production line.",
  body: "Customers bring a problem and fund development. We engineer the material, prove it, and hand off a qualified process to partner-funded production.",
  steps: [
    { name: "Automated R&D", body: "A miniature production line of modular stations dispenses, presses, cures and scans samples around the clock, engineering composites to a customer’s spec.", shot: "bench" as ShotKey },
    { name: "Testing and qualification", body: "Fire, strength and durability testing in-house, so results come back in minutes instead of the three months outside labs take.", shot: "torch" as ShotKey },
    { name: "Pilot manufacturing", body: "Production-size parts on sensor-instrumented lines, with a process that transfers directly into partner-funded factories.", shot: "robopress" as ShotKey },
  ],
  data: "Every formulation, process setting and test result in one dataset. Each program makes the next material faster to develop.",
};

export const useCases = {
  title: "Built with government and OEM partners for the systems America runs on.",
  items: [
    { name: "Energy", body: "Fire barriers and rigid insulators for the grid, batteries and data centers.", shot: "energy" as ShotKey },
    { name: "Defense", body: "Fire-resistant, machinable components for naval and military systems.", shot: "defense" as ShotKey },
    { name: "Aerospace", body: "Thermal barriers and lightweight high-temperature composites.", shot: "aero" as ShotKey },
    { name: "Infrastructure", body: "Resilient building materials for wildfire and storm country. First product: MESOSTONE™ panels.", shot: "infra" as ShotKey },
  ],
};

export const how = {
  title: "Forward-deployed materials engineering.",
  body: "We embed with U.S. agencies and OEM innovation teams, engineer the material to their spec, and scale it with partner-funded production. The same path took Gorilla Glass from Corning’s lab into billions of devices.",
  steps: [
    { name: "Application discovery", phase: "Phase I", body: "A short paid engagement to map the customer’s problem, requirements and economics, and confirm the material fits." },
    { name: "Paid R&D and qualification", phase: "Phases II–III", body: "Customer-funded development through FOUNDRY: formulation, testing, pilot runs and qualification at full format." },
    { name: "Partner-funded production", phase: "Scale", body: "Qualified materials scale through long-term offtake and partner-funded manufacturing, not venture-funded factories." },
  ],
  who: ["U.S. government and defense agencies", "Innovation teams at OEMs and Tier 1 manufacturers"],
};

export const team = {
  title: "Ceramics veterans, serial founders, and builders from tech.",
  founders: [
    { name: "Teresa Liu", role: "Co-founder and CEO", bio: "Product and engineering at Google, Meta and Lyft. Kleiner Perkins and 776 Fellow. Forbes 30 Under 30.", init: "TL" },
    { name: "Sharon Tracy, PhD", role: "Co-founder and CTO", bio: "25+ years bringing new materials to production across IBM (advanced ceramics), USG and WJE. PhD in materials science, Northwestern.", init: "ST" },
    { name: "Prof. Richard Riman", role: "Academic co-founder", bio: "Distinguished Professor at Rutgers. Inventor and serial founder; co-founded Solidia and Queens Carbon.", init: "RR" },
  ],
  advisors: [
    { name: "Joseph King", role: "Technology, IP and scale-up", bio: "Former ARPA-E Program Director; former DuPont Ventures director.", init: "JK" },
    { name: "Josh Cable", role: "New materials", bio: "Former co-founder and CEO of InventWood.", init: "JC" },
    { name: "Sam Ruben", role: "Industry and policy", bio: "Co-founder of Mighty Buildings; founder, BuildTech VC.", init: "SR" },
    { name: "Ross Polk", role: "Commercialization and GTM", bio: "Commercial Director at Coreshell; first GTM hire at 3+ materials startups.", init: "RP" },
  ],
};

export const close = {
  title: "We’re building the place where materials scientists can dream again.",
  cta: "Bring us a materials problem",
  email: "mailto:teresa@ourosmaterials.com",
  linkedin: "https://www.linkedin.com/company/98473484/",
  place: "New York, New York",
};

export const nav = [
  ["Why", "#why"], ["Materials", "#materials"], ["Foundry", "#foundry"], ["How we work", "#how"], ["Team", "#team"],
] as const;

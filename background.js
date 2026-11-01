// Clicking the toolbar icon opens (and toggles) the side panel instead of a
// dropdown popup, so it stays open until dismissed.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(() => {});

const DEFAULT_MODEL = "gemini-flash-latest";
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const ASHBY_POSTING_API = "https://api.ashbyhq.com/posting-api/job-board";
const BOARD_TTL = 5 * 60 * 1000; // cache a board's postings for 5 minutes

const boardCache = new Map(); // board name -> { ts, jobs }

// The JD is fetched from Ashby's public posting API and matched by posting ID.
// board + postingId come from the page URL: /{board}/{postingId}[/application].
async function fetchJobDescription(board, postingId) {
  if (!board || !postingId) return "";
  try {
    let entry = boardCache.get(board);
    if (!entry || Date.now() - entry.ts > BOARD_TTL) {
      const r = await fetch(
        `${ASHBY_POSTING_API}/${encodeURIComponent(board)}?includeCompensation=true`,
      );
      if (!r.ok) return "";
      const d = await r.json();
      entry = { ts: Date.now(), jobs: Array.isArray(d.jobs) ? d.jobs : [] };
      boardCache.set(board, entry);
    }
    const job = entry.jobs.find((j) => j.id === postingId);
    return job ? job.descriptionPlain || "" : "";
  } catch (_) {
    return "";
  }
}

// Hard-coded applicant profile (from Pavithra_Lagisetty_Resume.pdf). Anything the
// user types into the options "profile" field is appended to this at prompt time.
const PROFILE_BASE = `Name: Lagisetty Naga Pavithra
Email: nagapavithralagisetty@gmail.com
Phone: (203) 667-5094
LinkedIn: https://www.linkedin.com/in/naga-pavithra-lagisetty-614794211/
Portfolio: https://lagisettyportfolio.netlify.app/
Location: Boston, MA
Work authorization: Eligible to work in the US on OPT and STEM OPT for up to 3 years.

EDUCATION
- Northeastern University, Boston, MA — Master of Science in Data Science (Sep 2024 – Dec 2026), GPA 4.0/4.0.
- Bangalore Institute of Technology, Bengaluru, India — Bachelor of Technology in Computer Science and Engineering (Dec 2020 – May 2024), CGPA 8.6/10.0.

WORK EXPERIENCE
Pure Fishing, Charleston, SC — AI Developer Intern (May 2026 – Sep 2026)
- Built conversational voice agent pathways on Bland AI as a 70+ node state machine that now resolve close to 70% of inbound customer care calls without human handoff, covering warranty registration, claim status lookup, order tracking, returns and replacements.
- Integrated the voice agent with Gorgias and the Shopify Admin API through a Cloudflare Workers middle layer, mapping webhook payloads to live order lookups and automatic ticket creation and routing.
- Led the production cutover of Gorgias ticket writes from inline pathway code to asynchronous Retool workflows over webhook, consolidating OAuth2 refresh, retries, and rate limits, with state based routing so queued writes never drop a live call.

Shezaar, San Francisco, CA — Machine Learning Engineer Intern (Jul 2025 – Dec 2025)
- Designed and deployed an end to end ML pipeline for a CLIP based multimodal recommendation engine, generating joint text image embeddings and performing vector similarity search across 30,000+ scraped products to deliver visually and semantically aligned recommendations.
- Built a Chrome extension to automate large scale web scraping via DOM parsing, extracting product metadata and images to compute safety, material quality, labor and impact scores.
- Integrated an LLM powered semantic analysis module to crawl and interpret web page content, generating structured insights.
- Created REST API endpoints to serve product recommendations, similarity search results and product scores to the Chrome extension and web app.
- Stored and indexed product embeddings in a vector database, enabling fast retrieval of similar products for each user query.
- Built data cleaning and validation steps for scraped product data, improving the accuracy of embeddings and product scores.

AtkinsRealis, Bengaluru, India — Data Scientist Intern (Mar 2024 – Aug 2024)
- Designed and implemented a vehicle detection system using YOLOv7, improving detection accuracy to 85% for parking lot surveillance, monitoring occupancy and optimizing space.
- Generated timestamped CSV reports using StrongSORT for accurate tracking.
- Extended the system to track vehicles across multiple traffic cameras on the CityFlow dataset, giving each car one consistent ID across all cameras and producing a timestamped CSV of its route.
- Detected and followed vehicles within each camera using YOLO and ByteTrack, and trained a ResNet50 model on VeRi-776 to create an appearance fingerprint for each vehicle track.
- Learned travel time windows between camera pairs from training labels, then matched tracks across cameras using the Hungarian algorithm and linked them into global IDs with union find.
- Compared appearance only, timing only, and combined matching, evaluated with IDF1, to measure how much travel time rules improve matching when many cars look alike.
- Built a parking occupancy dashboard showing live space availability and peak usage trends from the tracking data.
- Automated data extraction using BeautifulSoup and regular expressions, parsing dynamic content from conference websites into standardized formats.
- Built an end to end MLOps pipeline on Azure ML, integrating data versioning, model registry, CI/CD, and automated retraining.

PROJECTS
- RescueLine (1st place, NEU AI Hackathon) — Real time emergency call triage with LLM driven P0 to P3 classification, Twilio telephony and ElevenLabs voice, routing P0 and P1 calls to human dispatchers and queuing the rest on a priority waitlist. Built a live dispatcher dashboard tracking call queues, escalation state, and agent allocation. Stack: Python, ElevenLabs, Twilio, React.
- SOCClaw (People's Choice Award, Inference Starts Here Hackathon by Red Hat and The Open Accelerator) — Three agent incident response pipeline (triage, investigation, remediation) serving open weight models on local vLLM with continuous batching and paged KV cache for concurrent inference. Stack: vLLM, NVIDIA NeMo, Python.

TECHNICAL SKILLS
- Languages: Python, C, C++, Java, JavaScript, TypeScript, HTML5, CSS3, Bootstrap, Tableau
- Databases: SQL, Postgres, MongoDB, Neo4j, ArangoDB, OrientDB, Pinecone
- Frameworks: React.js, Express.js, Flask, TensorFlow, Scikit-learn, OpenGL, Power BI
- Data Science Tools: Pandas, NumPy, Matplotlib, Seaborn, Jupyter Notebook, NLTK, Keras, OpenCV, RAG, NLP, MLflow
- LLM Tools: OpenAI API, Hugging Face, Transformers, LangChain, Vector Search, Prompt Engineering, Few-Shot Learning, Azure OpenAI, LLaMA, Claude, ElevenLabs, Bland
- GPU & Inference: CUDA, Triton, Nsight Compute, vLLM, SGLang, NVIDIA NeMo, continuous batching, paged attention
- DevOps & Containerization: Docker, Kubernetes, GitHub Workflows, CI/CD, Azure, Terraform, AWS, S3, DynamoDB

POSITIONING (lean on this for "why are you a good fit", "why you", or "why this role" style questions)
- I ship AI systems that run in production, not just demos. At Pure Fishing my voice agents now handle close to 70% of inbound customer care calls without a human, and I owned the integrations (Gorgias, Shopify, Retool) that made that reliable. My hackathon wins (1st place at the NEU AI Hackathon and the People's Choice Award at Red Hat's Inference Starts Here Hackathon) show I can take a rough idea and ship a working product end to end under tight time pressure. Tie that same instinct to what the role and company need.`;

// Static persona + writing rules. Identical on every request, so it is sent as
// the model's systemInstruction rather than mixed into the per-request contents.
const SYSTEM_RULES = [
  "<role>",
  "You are helping a job applicant fill out an application form.",
  "Write a first-person answer to the application question, drawing on the",
  "applicant's profile and the job description.",
  "</role>",
  "",
  "<rules>",
  "- Write like a real person casually explaining themselves. Use a relaxed,",
  "  conversational tone and plain, everyday words, the way you would actually",
  "  talk, while still being appropriate for a job application.",
  '- Avoid fancy, formal, or buzzword-y words (for example "thrive", "bridge",',
  '  "leverage", "passionate", "highly polished", "seamless", "spearhead").',
  "  Keep technical terms exactly as they are. It must not sound AI-generated",
  "  or robotic.",
  '- Do NOT use em dashes (the "—" character) anywhere. Use commas, periods,',
  "  parentheses, or separate sentences instead.",
  "- Do NOT use hyphens to join words. Split the words with a space instead",
  '  (for example write "full stack" not "full-stack", "real time" not "real-time").',
  '- Do NOT use colons (the ":" character) anywhere. Rephrase into full sentences instead.',
  "- Keep the answer to about 100 words, unless the question explicitly asks for a",
  "  different length.",
  "- Return ONLY the answer text, ready to paste directly into the field: no preamble,",
  "  no surrounding quotes, and no markdown.",
  "- Be specific and ground the answer in the profile and job description.",
  "- For more specific questions, when the question relates to a skill, domain, or",
  "  experience that one of the applicant's projects or hackathon wins demonstrates,",
  "  reference that specific project by name and briefly what was built or achieved.",
  "  Prefer a concrete example over a generic claim.",
  "- Whenever you mention a specific hackathon project, also state the award it",
  "  won, using the details in the profile (for example RescueLine won 1st place at",
  "  the NEU AI Hackathon, SOCClaw won the People's Choice Award at the Inference",
  "  Starts Here Hackathon).",
  "- If the job description is '(not available)', rely entirely on the applicant profile to answer the question.",
  "</rules>",
].join("\n");

// Per-request inputs: the variable data the model grounds its answer in. Kept in
// contents (data first, question last) rather than in the system instruction.
function buildUserContent(question, jobDescription, profile, remark) {
  const profileSection = profile
    ? `${PROFILE_BASE}\n\nADDITIONAL NOTES FROM THE APPLICANT:\n${profile}`
    : PROFILE_BASE;
  const lines = [
    "<applicant_profile>",
    profileSection,
    "</applicant_profile>",
    "",
    "<job_description>",
    jobDescription || "(not available)",
    "</job_description>",
    "",
    "<application_question>",
    question,
    "</application_question>",
  ];
  if (remark) {
    lines.push(
      "",
      "<extra_instruction>",
      "Extra context or instruction from the applicant for this specific answer. Follow it.",
      remark,
      "</extra_instruction>",
    );
  }
  return lines.join("\n");
}

function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  // Thinking models (e.g. gemini-3.x flash) may return multiple parts; keep the answer text.
  return parts
    .filter((p) => typeof p.text === "string")
    .map((p) => p.text)
    .join("")
    .trim();
}

async function generate({ question, board, postingId, pageText, remark }) {
  const {
    apiKey = "",
    model = "",
    profile = "",
  } = await chrome.storage.local.get(["apiKey", "model", "profile"]);

  if (!apiKey) {
    return {
      error:
        "No API key set. Open the extension options and add your Gemini API key.",
    };
  }
  if (!question) {
    return { error: "Could not determine the question for this field." };
  }

  let jobDescription = await fetchJobDescription(board, postingId);
  if (!jobDescription) jobDescription = pageText || "";

  const usedModel = model || DEFAULT_MODEL;
  const url = `${ENDPOINT}/${encodeURIComponent(usedModel)}:generateContent`;
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_RULES }] },
    contents: [
      {
        parts: [
          { text: buildUserContent(question, jobDescription, profile, remark) },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      topP: 0.95,
      responseMimeType: "text/plain",
    },
  };

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return { error: "Network error reaching Gemini: " + err.message };
  }

  let data;
  try {
    data = await res.json();
  } catch (_) {
    return {
      error: `Gemini returned an unreadable response (HTTP ${res.status}).`,
    };
  }

  if (!res.ok) {
    const message = data?.error?.message || `HTTP ${res.status}`;
    return { error: "Gemini error: " + message };
  }

  const text = extractText(data);
  if (!text) {
    return { error: "Gemini returned no answer text." };
  }
  return { text };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "ASHBY_FILL") {
    generate(msg).then(sendResponse);
    return true; // keep the message channel open for the async response
  }
});

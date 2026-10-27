import JSZip from "jszip";
import type { Challenge } from "@/data/challenges";
import {
  generateSampleRows,
  rowsToCsv,
  type SampleRow,
} from "@/data/sampleData";

export type ProjectKitFields = {
  project: string;
  audience?: string;
  problem: string;
  data?: string;
  goals?: string;
  /** Supply-chain dataset selection label */
  source?: string;
  /** Preferred model label */
  model?: string;
};

type BuildProjectKitShared = {
  challenge: Challenge;
  /** Optional mapped rows to inject into the dashboard shell */
  rows?: SampleRow[];
  /** Optional user-uploaded CSV text or binary */
  userCsv?: string | ArrayBuffer | Uint8Array;
  /** Alias used by some callers for userCsv */
  csvContent?: string | ArrayBuffer | Uint8Array;
  /** When true (default for personal-ai-assistant), include integration docs */
  includePersonalAssistantExtras?: boolean;
};

/** Nested fields form (kit modal). */
export type BuildProjectKitWithFields = BuildProjectKitShared & {
  fields: ProjectKitFields;
  projectName?: never;
};

/** Flat form (direct download / alternate callers). */
export type BuildProjectKitFlat = BuildProjectKitShared & {
  fields?: never;
  projectName: string;
  audience?: string;
  problem: string;
  dataset?: string;
  goals?: string;
  sourceChoice?: string;
  modelChoice?: string;
};

export type BuildProjectKitOptions =
  | BuildProjectKitWithFields
  | BuildProjectKitFlat;

function resolveFields(options: BuildProjectKitOptions): ProjectKitFields {
  if ("fields" in options && options.fields) {
    return options.fields;
  }
  const flat = options as BuildProjectKitFlat;
  return {
    project: flat.projectName,
    audience: flat.audience,
    problem: flat.problem,
    data: flat.dataset,
    goals: flat.goals,
    source: flat.sourceChoice,
    model: flat.modelChoice,
  };
}

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "decision-project"
  );
}

function buildDashboardHtml(
  challenge: Challenge,
  fields: ProjectKitFields,
  rows: SampleRow[],
  usingUserData: boolean,
): string {
  if (challenge.slug === "personal-ai-assistant") {
    return buildPersonalAssistantHtml(fields);
  }

  const dataJson = JSON.stringify(rows).replace(/</g, "\\u003c");
  const dataLabel = usingUserData ? "Your imported data" : "Sample data";
  const caveat = usingUserData
    ? "This dashboard contains the data you imported. Verify your column mapping and whether sums and averages are meaningful."
    : "This is fictional sample data for learning. Total is the sum of filtered values; average is total divided by filtered records. Confirm that the definitions and calculations fit your own data.";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(fields.project || challenge.title)}</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#f5f5fb;color:#1b1930;font:15px/1.5 system-ui,sans-serif}
header,main{max-width:1100px;margin:auto;padding:25px}
header{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid #e3e1ee}
.tag{color:#7250df;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
h1{font-size:clamp(30px,5vw,50px);letter-spacing:-.04em;margin:10px 0;line-height:1.05}
.lead{color:#6d6a80;max-width:62ch}
.brief{background:#f1ecff;border:1px solid #ded5ff;border-radius:14px;padding:14px 16px;margin:18px 0;color:#56478e}
.box{background:#fff;border:1px solid #e4e1ef;border-radius:15px;padding:20px;margin:15px 0}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.stats .box{margin:0}
.number{font-size:32px;font-weight:700}
.bar{display:flex;align-items:center;gap:10px;margin:10px 0}
.bar span{width:135px}
.bar i{display:block;height:16px;background:#7953e6;border-radius:8px}
select,input{padding:10px;border:1px solid #dcd8ed;border-radius:8px;font:inherit}
table{width:100%;border-collapse:collapse}
th,td{text-align:left;padding:10px;border-bottom:1px solid #eee}
small{color:#6d6a80}
@media(max-width:650px){.stats{grid-template-columns:1fr}.bar span{width:100px}}
</style>
</head>
<body>
<header>
  <b>⌘ DECISION LAB</b>
  <span>${esc(dataLabel)}</span>
</header>
<main>
  <div class="tag">${esc(challenge.category)} / STARTER DASHBOARD</div>
  <h1>${esc(fields.project || challenge.title)}</h1>
  <p class="lead">${esc(fields.problem || challenge.problem)}</p>
  <div class="brief"><b>Project brief.</b> ${esc(fields.problem || challenge.question)} Audience: ${esc(fields.audience || "To be determined")}.</div>
  <div class="box">
    <label>Category <select id="filter"><option value="">All categories</option></select></label>
    &nbsp;
    <label>Search <input id="search" placeholder="Search records"></label>
  </div>
  <div class="stats">
    <div class="box"><span class="tag">Total ${esc(challenge.measure)}</span><div class="number" id="total"></div><small>${esc(challenge.unit)}</small></div>
    <div class="box"><span class="tag">Records</span><div class="number" id="count"></div><small>filtered records</small></div>
    <div class="box"><span class="tag">Average per record</span><div class="number" id="avg"></div><small>${esc(challenge.unit)} per record</small></div>
  </div>
  <div class="box">
    <h2>${esc(challenge.measure)} by category</h2>
    <div id="chart"></div>
  </div>
  <div class="box">
    <h2>Explore the records</h2>
    <div style="overflow:auto">
      <table>
        <thead><tr><th>Date</th><th>Category</th><th>Value (${esc(challenge.unit)})</th><th>Status</th></tr></thead>
        <tbody id="table"></tbody>
      </table>
    </div>
  </div>
  <div class="box">
    <h2>What should we check?</h2>
    <p>${esc(caveat)}</p>
  </div>
</main>
<script>
const data=${dataJson};
const filter=document.querySelector('#filter');
const search=document.querySelector('#search');
[...new Set(data.map(x=>x.category))].forEach(x=>filter.add(new Option(x,x)));
function render(){
  const q=(search.value||'').toLowerCase();
  const d=data.filter(x=>(!filter.value||x.category===filter.value)&&JSON.stringify(x).toLowerCase().includes(q));
  const sum=d.reduce((a,x)=>a+Number(x.value||0),0);
  document.querySelector('#total').textContent=String(sum);
  document.querySelector('#count').textContent=String(d.length);
  document.querySelector('#avg').textContent=d.length?(sum/d.length).toFixed(1):'—';
  const groups={};
  d.forEach(x=>{groups[x.category]=(groups[x.category]||0)+Number(x.value||0)});
  const max=Math.max(1,...Object.values(groups));
  document.querySelector('#chart').innerHTML=Object.entries(groups).map(([k,v])=>\`<div class="bar"><span>\${k}</span><i style="width:\${(v/max)*70}%"></i><b>\${v}</b></div>\`).join('')||'No matching records';
  document.querySelector('#table').innerHTML=d.map(x=>\`<tr><td>\${x.date}</td><td>\${x.category}</td><td>\${x.value}</td><td>\${x.status}</td></tr>\`).join('')||'<tr><td colspan="4">No matching records</td></tr>';
}
filter.addEventListener('change',render);
search.addEventListener('input',render);
render();
</script>
</body>
</html>`;
}

function buildPersonalAssistantHtml(fields: ProjectKitFields): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(fields.project || "Personal Assistant")} | Decision Lab</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#f4f3f9;color:#18162d;font:15px/1.55 system-ui,sans-serif}
header,main{max-width:1150px;margin:auto;padding:25px}
header{display:flex;justify-content:space-between;border-bottom:1px solid #e5e1ef}
.tag{font-size:11px;letter-spacing:.13em;color:#7550df;font-weight:800}
h1{font-size:clamp(36px,5vw,58px);letter-spacing:-.05em;margin:10px 0}
p{color:#6c6880}
.banner{background:#f1ecff;border:1px solid #ded5ff;border-radius:14px;padding:16px;margin:20px 0;color:#56478e}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.box{background:#fff;border:1px solid #e3dfed;border-radius:16px;padding:22px}
.box h2{margin:0 0 15px;font-size:20px}
.item{border-top:1px solid #efedf3;padding:14px 0;display:flex;justify-content:space-between;gap:15px}
.item p{margin:4px 0;font-size:13px}
.pill{font-size:11px;background:#eeebff;color:#6a48d0;border-radius:20px;padding:6px 9px;white-space:nowrap;height:max-content}
button,input{font:inherit}
button{border:0;background:#d7f655;color:#18162d;border-radius:25px;padding:10px 15px;font-weight:700;cursor:pointer}
input[type=text]{padding:11px;border:1px solid #dedbe8;border-radius:8px;width:72%}
ul{padding:0;list-style:none;margin:0}
li{padding:8px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;gap:10px;align-items:center}
small{color:#77718b}
.links a{color:#6947d0}
@media(max-width:700px){.grid{grid-template-columns:1fr}input[type=text]{width:100%}}
</style>
</head>
<body>
<header><b>⌘ DECISION LAB</b><b>PERSONAL ASSISTANT / DEMO</b></header>
<main>
  <div class="tag">YOUR WORKDAY, CLEARER</div>
  <h1>Good morning.</h1>
  <p>${esc(fields.problem || "Bring messages, meetings, and priorities into one calm workspace.")}</p>
  <div class="banner"><b>Demo mode.</b> The inbox and calendar below are fictional. No accounts are connected and no AI service is running. The task list is saved only in this browser.</div>
  <div class="grid">
    <section class="box">
      <div class="tag">INBOX / SAMPLE</div>
      <h2>Messages to review</h2>
      <div class="item"><div><b>Project update</b><p>Jordan · Could you review the plan before our meeting?</p></div><span class="pill">Needs reply</span></div>
      <div class="item"><div><b>Workshop materials</b><p>Alex · Sharing the slides for tomorrow’s session.</p></div><span class="pill">Read later</span></div>
      <div class="item"><div><b>Weekly report</b><p>Taylor · The latest draft is ready for your feedback.</p></div><span class="pill">Needs reply</span></div>
    </section>
    <section class="box">
      <div class="tag">CALENDAR / SAMPLE</div>
      <h2>Upcoming today</h2>
      <div class="item"><div><b>Team planning</b><p>9:30 · Room 3A</p></div><span class="pill">Upcoming</span></div>
      <div class="item"><div><b>Partner sync</b><p>11:00 · Video call</p></div><span class="pill">Upcoming</span></div>
      <div class="item"><div><b>Project review</b><p>2:00 · Studio B</p></div><span class="pill">Upcoming</span></div>
    </section>
    <section class="box">
      <div class="tag">FOCUS LIST</div>
      <h2>Priorities</h2>
      <form id="taskForm" style="display:flex;gap:8px;margin-bottom:12px">
        <input id="taskInput" type="text" placeholder="Add a priority" maxlength="120" required>
        <button type="submit">Add</button>
      </form>
      <ul id="tasks"></ul>
      <small>Saved in this browser only (localStorage).</small>
    </section>
    <section class="box">
      <div class="tag">NEXT STEPS</div>
      <h2>Make it real</h2>
      <p>Read INTEGRATIONS.md and CURSOR_PROMPTS.md before connecting mail or calendar. Start with fictional data; never put secrets in this HTML file.</p>
      <p class="links"><a href="https://developers.google.com/workspace/guides/create-credentials" target="_blank" rel="noopener noreferrer">Google Workspace credentials ↗</a></p>
    </section>
  </div>
</main>
<script>
const KEY='decisionlab-personal-tasks-v1';
const list=document.querySelector('#tasks');
const form=document.querySelector('#taskForm');
const input=document.querySelector('#taskInput');
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
function save(tasks){localStorage.setItem(KEY,JSON.stringify(tasks));render()}
function render(){
  const tasks=load();
  list.innerHTML=tasks.map((t,i)=>\`<li><span>\${t}</span><button type="button" data-i="\${i}">Done</button></li>\`).join('')||'<li><small>No priorities yet.</small></li>';
  list.querySelectorAll('button[data-i]').forEach(btn=>btn.onclick=()=>{
    const next=load();next.splice(Number(btn.getAttribute('data-i')),1);save(next);
  });
}
form.addEventListener('submit',e=>{
  e.preventDefault();
  const value=input.value.trim();
  if(!value)return;
  save([...load(),value]);
  input.value='';
});
render();
</script>
</body>
</html>`;
}

function buildReadme(
  challenge: Challenge,
  fields: ProjectKitFields,
  hasUserCsv: boolean,
  isPA: boolean,
): string {
  if (isPA) {
    return `# ${fields.project}

## Run the demo
Extract this folder, then open index.html in a browser. It includes fictional inbox and calendar examples and an editable focus list saved on this browser. No accounts are connected and no AI model is running.

## Make it yours
Open the folder in Cursor. Read PROJECT_BRIEF.md, CURSOR_PROMPTS.md and INTEGRATIONS.md before implementing real account connections.

## Privacy before sharing
Real emails, calendars and OAuth tokens can contain sensitive information. Use fictional data while prototyping. Do not commit tokens, credentials or real message content to GitHub. This static demo provides no authentication or server. Deploy only after appropriate security review.
`;
  }

  return `# ${fields.project}

## Start here
${
    hasUserCsv
      ? "Open index.html to explore your mapped data in a local dashboard. The numeric column is summed and averaged; check that these calculations suit your data."
      : "Open index.html in a browser for a working dashboard with fictional sample data."
  } Read PROJECT_BRIEF.md, then open the folder in Cursor and follow AI_WORKFLOW.md.

${
    hasUserCsv
      ? "Your provided CSV is in data/user-data.csv. The dashboard includes the mapped rows from this file; changes to the CSV will not automatically update the dashboard. Review your mapping, metrics, and data privacy before sharing."
      : "No dataset was provided; identify a public or synthetic source first. Challenge reference source: " +
        challenge.source.name +
        "."
  }

This kit does not run AI agents, connect accounts, provide login security, or deploy by itself. AI_WORKFLOW.md provides prompts for those next steps. Review code and data permissions before using real or sensitive information.

## Publish
After adapting and reviewing your project, create a GitHub repository and import it into Vercel. For private data implement server-side authorization and database access policies first. Never commit passwords or secret keys.
`;
}

function buildProjectBrief(
  challenge: Challenge,
  fields: ProjectKitFields,
  hasUserCsv: boolean,
): string {
  return `# ${fields.project}

## Project category
${challenge.name}

## Audience
${fields.audience?.trim() || "To be determined"}

## Decision or problem
${fields.problem}

## Data sources
${fields.data?.trim() || "To be determined"}

## Dataset selection
${fields.source?.trim() || "Not selected"}

## Model preference
${fields.model?.trim() || "To be decided"}

## Proposed framework
Decision question → data and permissions → cleaning and time split → baseline and model comparison → review → dashboard and deployment. This is a rule-based plan, not an AI-generated recommendation.

## Desired dashboard
${fields.goals?.trim() || "To be determined"}

## Dataset included
${hasUserCsv ? "data/user-data.csv" : "No dataset supplied"}

## Challenge ideas
${challenge.ideas.map((idea) => `- ${idea}`).join("\n")}
`;
}

function buildAiWorkflow(): string {
  return `# AI BUILD WORKFLOW

This document contains role prompts. It does not execute agents. Open this project in Cursor or another AI coding assistant and work through the roles sequentially.

## 1. Discovery and product role
Read PROJECT_BRIEF.md. Ask clarifying questions, define the user, decision, and success criteria. Identify assumptions and data gaps. Do not invent facts or metrics.

## 2. Data role
Inspect available data files and PROJECT_BRIEF.md. Explain the schema, missing values, potential bias, and three defensible metrics. If user-data.csv is present, inspect it safely and propose a mapping. Do not transmit sensitive data to external services without permission.

## 3. Dashboard builder role
Adapt index.html to the brief and approved data mapping. Explain metric formulas. Keep a sample fallback, accessible labels, loading and empty states. Do not claim the user data is connected until it is.

## 4. Security and database role
If the user chooses Supabase, guide them to create a project and connect it. Implement Supabase Auth with controlled user access and RLS policies and minimum privileges. Test unauthorized access. Never put secret/service role keys in client code or version control.

## 5. Deployment role
Guide the user to create a GitHub repository, review files before pushing, import the repository into Vercel, configure environment variables and deploy. Check the deployed URL and document remaining limitations. Do not ask for passwords or API secrets in chat.

## 6. Review role
Check accessibility, calculations, source attribution, privacy, and whether the dashboard supports the decision described in PROJECT_BRIEF.md. List what has and has not been verified.
`;
}

function buildFramework(fields: ProjectKitFields): string {
  return `# Project framework

1. Clarify the decision: ${fields.problem}
2. Identify audience: ${fields.audience?.trim() || "To be determined"}
3. Examine data: ${fields.data?.trim() || "To be determined"}; source: ${fields.source?.trim() || "Not selected"}
4. Define outcomes: ${fields.goals?.trim() || "To be determined"}
5. For forecasts: compare baseline with candidate models using a time-based holdout and appropriate error metrics.
6. Review results with a domain expert and document limits.
7. Develop and deploy with appropriate access controls.

This is a deterministic planning template, not an AI agent output.
`;
}

function buildIntegrationsMd(): string {
  return `# Integrating mail, calendar, and AI

This project is a static UI demo. There is no live connection, OAuth flow, backend, AI model, or account authorization configured.

## Google Workspace
1. Review https://developers.google.com/workspace/guides/create-credentials and https://developers.google.com/workspace/guides/configure-oauth-consent .
2. Create your own cloud project and OAuth client and enable the required APIs. Use a server-side OAuth flow, securely store and revoke tokens, and allow each user to grant and withdraw access.
3. Start with the narrowest scopes for the features you choose. For Gmail full message reading, review https://developers.google.com/workspace/gmail/api/auth/scopes . For Calendar events, review https://developers.google.com/workspace/calendar/api/auth . Gmail scopes can be restricted and may require verification.
4. Review and test user-specific authorization before using any real mailbox or calendar.

## Microsoft Outlook
Review delegated permissions and app registration at https://learn.microsoft.com/graph/permissions-reference . Mail and calendar are separate permissions; choose only what the selected feature needs. Do not use application-wide access for a personal demo by default.

## Safe operation
Never put OAuth client secrets, access tokens or refresh tokens in static HTML, client-side variables, committed files or prompts. Do not automatically send messages, create events, or expose another user's data. Show a preview and require an explicit user action before any write. Obtain consent before sending content to an AI provider.
`;
}

function buildCursorPromptsMd(): string {
  return `# Cursor prompts

1. Read this project and ask me about my workday, preferred mail/calendar provider, and the information I want to see. Describe the current demo limitations.

2. Improve the interface using the fictional messages and events already provided. Preserve keyboard accessibility and show clear loading, empty and error states.

3. Propose a server-based architecture for read-only Gmail and Google Calendar access. Explain OAuth, user consent, secure session storage, scope verification and deletion. Never expose tokens or secrets to the browser or Git. Ask before requesting access to my accounts.

4. If I choose Outlook, propose a separate Microsoft Graph delegated-permission integration. Use the least-privileged scopes necessary and explain how the user disconnects.

5. Add an AI provider only after I configure it securely. Do not send sensitive messages to a model without explicit consent. Present summaries as suggestions and allow the user to review source data.

6. Implement draft-only email or event suggestions first; never send a message or change a calendar without a clearly labeled explicit confirmation by the user. Test authentication, isolation and error handling.

7. Explain how to deploy to GitHub and Vercel with environment variables set on the server. Check the code and data before publication.
`;
}

function buildSourcesMd(challenge: Challenge): string {
  return `# Sources

${challenge.source.description}

- Source: ${challenge.source.name}
- URL: ${challenge.source.url}
- License: ${challenge.source.license}
- API note: ${challenge.source.apiNote}

Sample records in this kit are fictional and intended for workshop learning only.
`;
}

/**
 * Build a client-side Decision Lab project kit ZIP and return it as a Blob.
 */
export async function buildProjectKit(
  options: BuildProjectKitOptions,
): Promise<Blob> {
  const { challenge } = options;
  const fields = resolveFields(options);
  const projectName = fields.project.trim() || challenge.name;
  const normalizedFields: ProjectKitFields = {
    ...fields,
    project: projectName,
    problem: fields.problem.trim() || challenge.question,
  };

  const isPA = challenge.slug === "personal-ai-assistant";
  const includePAExtras =
    options.includePersonalAssistantExtras ?? isPA;
  const userCsv = options.userCsv ?? options.csvContent;
  const hasUserCsv = Boolean(userCsv);

  const rows =
    options.rows?.length ? options.rows : generateSampleRows(challenge);
  const usingUserData = hasUserCsv && Boolean(options.rows?.length);

  const zip = new JSZip();
  zip.file(
    "index.html",
    buildDashboardHtml(challenge, normalizedFields, rows, usingUserData),
  );
  zip.file(
    "README.md",
    buildReadme(challenge, normalizedFields, hasUserCsv, isPA),
  );
  zip.file(
    "PROJECT_BRIEF.md",
    buildProjectBrief(challenge, normalizedFields, hasUserCsv),
  );
  zip.file("AI_WORKFLOW.md", buildAiWorkflow());
  zip.file("FRAMEWORK.md", buildFramework(normalizedFields));
  zip.file("SOURCES.md", buildSourcesMd(challenge));

  if (!hasUserCsv) {
    zip.file("data/sample_data.csv", rowsToCsv(rows));
  } else if (userCsv) {
    zip.file("data/user-data.csv", userCsv);
  }

  if (includePAExtras) {
    zip.file("INTEGRATIONS.md", buildIntegrationsMd());
    zip.file("CURSOR_PROMPTS.md", buildCursorPromptsMd());
  }

  return zip.generateAsync({ type: "blob" });
}

/** Suggested download filename for a kit ZIP. */
export function projectKitFilename(projectName: string): string {
  return `${slugify(projectName)}.zip`;
}

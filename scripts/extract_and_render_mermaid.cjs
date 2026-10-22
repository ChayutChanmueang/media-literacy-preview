const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WIKI_DIR = path.resolve('docs/wiki/research-dev-summary');
const DIAGRAMS_DIR = path.join(WIKI_DIR, 'diagrams');

if (!fs.existsSync(DIAGRAMS_DIR)) {
  fs.mkdirSync(DIAGRAMS_DIR, { recursive: true });
}

// Custom CSS for Thai font support & crisp rendering
const customCssPath = path.join(DIAGRAMS_DIR, 'mermaid-style.css');
const customCss = `
* {
  font-family: 'Leelawadee UI', 'Tahoma', 'Segoe UI', sans-serif !important;
}
.node rect, .node circle, .node ellipse, .node polygon, .node path {
  stroke-width: 1.5px;
}
text {
  font-weight: 500;
}
`;
fs.writeFileSync(customCssPath, customCss, 'utf8');

// Specifications of all diagrams to extract
const diagrams = [
  {
    file: 'README.md',
    id: '00-empirical-highlights',
    title: 'แผนภาพไฮไลต์ตัวเลขเชิงประจักษ์ของโครงการ',
    matchRegex: /```mermaid\r?\nflowchart LR\r?\n\s+A\["ผู้ใช้งานจริงทั้งหมด[\s\S]*?```/
  },
  {
    file: '01-research-background-and-framework.md',
    id: '01-theoretical-framework',
    title: 'กรอบแนวคิดเชิงวิจัยและการพัฒนา',
    matchRegex: /```mermaid\r?\ngraph TD\r?\n\s+A\[กรอบแนวคิดเชิงวิจัย\][\s\S]*?```/
  },
  {
    file: '02-design-process-and-methodology.md',
    id: '02-senior-persona',
    title: 'User Persona ของกลุ่มผู้สูงอายุเป้าหมาย',
    matchRegex: /```mermaid\r?\nclassDiagram\r?\n\s+class SeniorPersona[\s\S]*?```/
  },
  {
    file: '02-design-process-and-methodology.md',
    id: '02-micro-lesson-unit',
    title: 'วงจรหน่วยการเรียนรู้ย่อย Micro-Lesson Unit',
    matchRegex: /```mermaid\r?\nflowchart LR\r?\n\s+subgraph LessonUnit[\s\S]*?```/
  },
  {
    file: '02-design-process-and-methodology.md',
    id: '02-positive-gamification-loop',
    title: 'วงจรการตัดสินใจและกลไกเกมเชิงบวก',
    matchRegex: /```mermaid\r?\ngraph LR\r?\n\s+Play\["เล่นมินิเกม"\][\s\S]*?```/
  },
  {
    file: '03-development-lifecycle-and-tech-stack.md',
    id: '03-sprint-roadmap',
    title: 'วงจรการพัฒนาระบบ Sprint Roadmap',
    matchRegex: /```mermaid\r?\ngantt\r?\n\s+title วงจรการพัฒนาระบบ[\s\S]*?```/
  },
  {
    file: '03-development-lifecycle-and-tech-stack.md',
    id: '03-system-architecture',
    title: 'แผนภาพสถาปัตยกรรมระบบโดยรวม',
    matchRegex: /```mermaid\r?\ngraph TB\r?\n\s+subgraph ClientLayer[\s\S]*?```/
  },
  {
    file: '04-testing-evaluation-and-field-deployments.md',
    id: '04-qa-testing-levels',
    title: 'ระดับการทดสอบระบบและการประกันคุณภาพ',
    matchRegex: /```mermaid\r?\nflowchart TD\r?\n\s+A\[กระบวนการทดสอบระบบ\][\s\S]*?```/
  },
  {
    file: '04-testing-evaluation-and-field-deployments.md',
    id: '04-completion-funnel',
    title: 'เส้นทางการเรียนรู้ของผู้ใช้ Completion Funnel',
    matchRegex: /```mermaid\r?\nflowchart TD\r?\n\s+Step1\["1\. เข้าหน้าแรก[\s\S]*?```/
  },
  {
    file: '05-discussion-lessons-learned-and-recommendations.md',
    id: '05-lessons-learned',
    title: 'บทเรียนสำคัญ 3 ด้านจากการพัฒนาและทดลองใช้',
    matchRegex: /```mermaid\r?\ngraph TD\r?\n\s+subgraph LessonsLearned[\s\S]*?```/
  }
];

console.log('🚀 Extracting Mermaid blocks and generating images...\n');

for (const d of diagrams) {
  const filePath = path.join(WIKI_DIR, d.file);
  let content = fs.readFileSync(filePath, 'utf8');

  const match = content.match(d.matchRegex);
  if (!match) {
    console.warn(`⚠️ Could not find pattern for ${d.id} in ${d.file}`);
    continue;
  }

  // Extract raw mermaid code (remove ```mermaid and ```)
  const fullBlock = match[0];
  const mermaidCode = fullBlock.replace(/^```mermaid\r?\n/, '').replace(/\r?\n```$/, '').trim();

  // 1. Save .mmd file
  const mmdFileName = `${d.id}.mmd`;
  const mmdFilePath = path.join(DIAGRAMS_DIR, mmdFileName);
  fs.writeFileSync(mmdFilePath, mermaidCode + '\n', 'utf8');
  console.log(`📝 Saved ${mmdFileName}`);

  // 2. Render to PNG using mmdc
  const pngFileName = `${d.id}.png`;
  const pngFilePath = path.join(DIAGRAMS_DIR, pngFileName);
  console.log(`🎨 Rendering ${pngFileName}...`);
  try {
    const cmd = `npx -y @mermaid-js/mermaid-cli -i "${mmdFilePath}" -o "${pngFilePath}" -b white -s 2 -C "${customCssPath}"`;
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ Successfully generated ${pngFileName}`);
  } catch (err) {
    console.error(`❌ Failed to render ${pngFileName}:`, err.message);
  }

  // 3. Replace in markdown file
  const replacement = `![${d.title}](./diagrams/${pngFileName})\n\n> 📋 *[ดูโค้ด Mermaid ต้นฉบับ](./diagrams/${mmdFileName})*`;
  content = content.replace(fullBlock, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`🔄 Updated ${d.file} with image reference\n`);
}

console.log('🎉 All Mermaid diagrams processed successfully!');

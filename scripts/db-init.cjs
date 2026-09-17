const pg = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL is not defined in environment variables.");
    process.exit(1);
  }

  console.log("Connecting to Supabase PostgreSQL database...");
  const pool = new pg.Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    console.log("Connected successfully! Starting DDL migration...");

    // 1. Run supabase-schema.sql
    const schemaPath = path.join(__dirname, "..", "docs", "supabase-schema.sql");
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    console.log("Executing schema SQL queries...");
    await client.query(schemaSql);
    console.log("Tables, indexes, and schemas created successfully!");

    // 2. Check if quiz questions already exist
    const checkRes = await client.query("SELECT COUNT(*) FROM quiz_questions");
    const count = parseInt(checkRes.rows[0].count, 10);
    
    if (count > 0) {
      console.log(`Quiz questions table already has ${count} records. Seeding skipped.`);
    } else {
      console.log("Seeding quiz questions and option choices...");
      
      const seedQuestions = [
        // PRETEST QUESTIONS
        {
          id: "pre-q1",
          test_type: "pretest",
          question_text: "หากมีข้อความแชร์ในไลน์กลุ่มว่า 'ดื่มน้ำมะนาวผสมน้ำอุ่นช่วยรักษาโรคมะเร็งได้หายขาดใน 3 วัน' ท่านจะปฏิบัติอย่างไร?",
          explanation: "ข่าวรักษามะเร็งด้วยมะนาวจัดเป็นข่าวลือทางการแพทย์ ควรหลีกเลี่ยงการแชร์ต่อและตรวจสอบจากศูนย์ต่อต้านข่าวปลอมก่อนเชื่อครับ",
          sort_order: 1,
          options: [
            { text: "เชื่อทันทีและรีบกดแชร์ส่งต่อให้เพื่อนคนอื่นในไลน์กลุ่ม", is_correct: false },
            { text: "ไม่แชร์ต่อ และตรวจสอบข้อมูลจากแหล่งข่าวหรือแพทย์ที่เชื่อถือได้ก่อน", is_correct: true },
            { text: "ไม่แน่ใจ", is_correct: false }
          ]
        },
        {
          id: "pre-q2",
          test_type: "pretest",
          question_text: "มีข้อความ SMS ส่งมาว่า 'พัสดุของท่านชำรุดเสียหาย กรุณากดลิงก์เพื่อกรอกข้อมูลรับค่าชดเชย 1,000 บาท' ท่านควรทำอย่างไร?",
          explanation: "มิจฉาชีพมักแอบอ้างเป็นบริษัทขนส่งเพื่อส่งลิงก์ดูดเงินหรือติดตั้งแอปพลิเคชันควบคุมมือถือ ห้ามกดลิงก์ดังกล่าวเด็ดขาดครับ",
          sort_order: 2,
          options: [
            { text: "กดเปิดลิงก์เพื่อกรอกชื่อและบัญชีธนาคารรับเงินชดเชย", is_correct: false },
            { text: "ห้ามกดเปิดลิงก์ และลบข้อความ SMS ทิ้งทันที", is_correct: true },
            { text: "ไม่แน่ใจ", is_correct: false }
          ]
        },
        {
          id: "pre-q3",
          test_type: "pretest",
          question_text: "ข้อใดเป็นจุดสังเกตหลักในการจับผิดภาพถ่ายบุคคลที่สร้างขึ้นจากปัญญาประดิษฐ์ (AI Deepfake)?",
          explanation: "AI ในปัจจุบันยังมีจุดบกพร่องในการสร้างอวัยวะที่มีรายละเอียดสูง เช่น นิ้วมือแหว่ง/เกิน แววตาแข็งทื่อไม่กะพริบ หรือจุดเชื่อมต่อขอบผมเบลอผิดสังเกตครับ",
          sort_order: 3,
          options: [
            { text: "รายละเอียดนิ้วมือบิดเบี้ยว แววตาแข็งทื่อไม่กะพริบ ขอบผมฟุ้งเบลอ", is_correct: true },
            { text: "ภาพมีความคมชัดและสีสันสวยงามสมบูรณ์แบบมากเกินไป", is_correct: false },
            { text: "ไม่แน่ใจ", is_correct: false }
          ]
        },

        // POSTTEST QUESTIONS
        {
          id: "post-q1",
          test_type: "posttest",
          question_text: "เมื่อได้รับลิงก์แจกเงินช่วยเหลือค่าครองชีพจากหน่วยงานรัฐบาลส่งมาในกลุ่มไลน์ ท่านควรตรวจสอบอย่างไรก่อนเชื่อ?",
          explanation: "การชะลอการตอบสนองความเร็วด้วยการกางโล่ 'หยุด คิด ถาม ทำ' ช่วยให้เรามีเวลาสืบค้นจากเว็บไซต์หลักและไม่หลงกลหน้าเพจปลอมครับ",
          sort_order: 1,
          options: [
            { text: "ตรวจสอบกับเว็บไซต์หลักของหน่วยงานนั้นๆ หรือโทรสอบถามสายด่วนก่อน", is_correct: true },
            { text: "รีบแชร์ลิงก์ส่งต่อไปให้ญาติพี่น้องคนอื่นลองกดรับสิทธิ์ก่อน", is_correct: false },
            { text: "ไม่แน่ใจ", is_correct: false }
          ]
        },
        {
          id: "post-q2",
          test_type: "posttest",
          question_text: "มิจฉาชีพแอบอ้างเป็นตำรวจโทรหาและแจ้งว่า 'ท่านเกี่ยวข้องกับคดีฟอกเงิน ให้โอนเงินทั้งหมดมาตรวจสอบ' ท่านควรทำอย่างไร?",
          explanation: "เจ้าหน้าที่ตำรวจและหน่วยงานรัฐไม่มีสิทธิ์โทรศัพท์มาสอบสวนเรื่องการเงินหรือขอให้ประชาชนโอนเงินผ่านทางโทรศัพท์เพื่อตรวจสอบเด็ดขาดครับ",
          sort_order: 2,
          options: [
            { text: "ตกใจและยอมรีบโอนเงินไปให้ทันทีเพื่อยืนยันความบริสุทธิ์ใจ", is_correct: false },
            { text: "วางสายทันที และโทรติดต่อสถานีตำรวจโดยตรงเพื่อยืนยันข้อเท็จจริง", is_correct: true },
            { text: "ไม่แน่ใจ", is_correct: false }
          ]
        },
        {
          id: "post-q3",
          test_type: "posttest",
          question_text: "หากมีแชทจากลูกหลานหรือเพื่อนสนิททักมาขอยืมเงินเร่งด่วนทางข้อความ LINE สิ่งใดที่ควรปฏิบัติก่อนโอนเงิน?",
          explanation: "แชท LINE สามารถโดนแฮกหรือสวมรอยรูปภาพได้ง่าย เพื่อความปลอดภัยสูงสุดควรโทรศัพท์ติดต่อพูดคุยให้ได้ยินเสียงหรือวิดีโอคอลยืนยันตัวตนก่อนโอนเงินเสมอครับ",
          sort_order: 3,
          options: [
            { text: "โทรศัพท์กลับไปด้วยเสียงหรือวิดีโอคอลเพื่อพูดคุยยืนยันกับเจ้าตัวโดยตรง", is_correct: true },
            { text: "รีบโอนเงินช่วยเหลือทันทีเพราะเกรงใจเพื่อนและกลัวเพื่อนโกรธ", is_correct: false },
            { text: "ไม่แน่ใจ", is_correct: false }
          ]
        }
      ];

      for (const q of seedQuestions) {
        // Insert question
        await client.query(
          "INSERT INTO quiz_questions (id, test_type, question_text, explanation, sort_order) VALUES ($1, $2, $3, $4, $5)",
          [q.id, q.test_type, q.question_text, q.explanation, q.sort_order]
        );

        // Insert choices options
        for (const opt of q.options) {
          await client.query(
            "INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES ($1, $2, $3)",
            [q.id, opt.text, opt.is_correct]
          );
        }
      }
      console.log("Seeding completed successfully!");
    }

    client.release();
    console.log("Database initialized successfully!");
  } catch (err) {
    console.error("Initialization failed:", err);
  } finally {
    await pool.end();
  }
}

run();

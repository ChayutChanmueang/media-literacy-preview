# [Game Design Document]()  
## [รู้ทันกลางสายหมอก]()  
### [Media Literacy Top-Down Game Prototype]()  
**เวอร์ชันเอกสาร:** Prototype GDD 0.1  
 **ประเภทเกม:** 2D Top-down Narrative Adventure + Minigame Collection  
 **แพลตฟอร์ม:** Web / Progressive Web App  
 **เทคโนโลยีหลัก:** Next.js, React, TypeScript และ Phaser  
 **กลุ่มเป้าหมาย:** ผู้ใหญ่วัยกลางคนและผู้สูงอายุ  
 **ระยะเวลาการเล่นเป้าหมาย:** 45–60 นาที  
 **จำนวนวันในเกม:** 3 วัน  
 **จำนวนมินิเกม:** 10 เกม  
 **จำนวนแผนที่หลัก:** 1 แผนที่  
 **จำนวนสถานที่สำคัญ:** 5 สถานที่  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [1. High Concept]()  
ผู้เล่นเลือกรับบทเป็น **แม่น้ำอิง** หรือ  **พ่อจอม** อายุ 50 ปี ซึ่งอาศัยอยู่กับครอบครัวในหมู่บ้านบนภูเขาที่ได้รับแรงบันดาลใจจากแม่กำปอง จังหวัดเชียงใหม่  
ในช่วงสามวันก่อนงานชุมชนประจำหมู่บ้าน ผู้เล่นต้องทำกิจวัตรประจำวัน เช่น ซื้อของ เยี่ยมเพื่อนบ้าน ไปโรงพยาบาล และช่วยเตรียมงานชุมชน  
ระหว่างวัน โทรศัพท์และสื่อออนไลน์จะนำเหตุการณ์ไม่คาดคิดเข้ามา ทั้งข่าวปลอม ข้อความหลอกลวง ภาพจาก AI การเปิดเผยข้อมูลส่วนตัว ลิงก์ปลอม แอปอันตราย และบุคคลไม่หวังดีในแชต  
ผู้เล่นต้องใช้ทักษะรู้เท่าทันสื่อในการช่วยตัวเอง ครอบครัว และคนในหมู่บ้าน ก่อนที่ข้อมูลหลอกลวงจะถูกส่งต่อจนกระทบงานสำคัญของชุมชน  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [2. Prototype Goal]()  
Prototype นี้ไม่ได้มีเป้าหมายสร้างเกมแม่กำปองเต็มรูปแบบ แต่ใช้พิสูจน์แนวคิดหลักดังต่อไปนี้:  
1. มินิเกมทั้ง 10 เกมสามารถเชื่อมเข้าสู่สถานการณ์ในชีวิตประจำวันได้หรือไม่  
2. การเดินสำรวจและบทสนทนาช่วยลดความรู้สึกเหมือนทำแบบทดสอบหรือไม่  
3. ผู้เล่นเข้าใจว่าเหตุใดมินิเกมแต่ละเกมจึงเกิดขึ้น  
4. ผู้เล่นสามารถเล่นต่อเนื่องระหว่างโลกหลักและมินิเกมได้โดยไม่สับสน  
5. เกมสามารถทำงานได้ทั้งมือถือแนวตั้งและคอมพิวเตอร์แนวนอน  
6. ระบบสามารถบันทึกผลลัพธ์ของมินิเกมแต่ละเกมในรูปแบบเดียวกัน  
7. ผู้เล่นรู้สึกว่าการตัดสินใจของตนส่งผลต่อครอบครัวและชุมชน  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [3. Design Pillars]()  
## [3.1 เรื่องใกล้ตัว]()  
ทุกเหตุการณ์ต้องเกิดจากกิจวัตรที่ผู้เล่นเข้าใจได้ เช่น การซื้อของ รอคิวโรงพยาบาล เล่น Facebook รับ SMS หรือคุยกับเพื่อนบ้าน  
## [3.2 เล่นก่อน สอนทีหลัง]()  
เกมไม่ควรเริ่มด้วยการบรรยายบทเรียนยาว ๆ ผู้เล่นจะพบสถานการณ์ก่อน ลงมือแก้ปัญหา แล้วจึงได้รับคำอธิบายสั้น ๆ หลังจบมินิเกม  
## [3.3 ไม่มีการตำหนิผู้เล่น]()  
เมื่อตอบผิด เกมต้องอธิบายเหตุผลและเปิดโอกาสให้เรียนรู้ ไม่ใช้ข้อความที่ทำให้ผู้เล่นรู้สึกว่าตนเองไม่เก่งหรือถูกหลอกง่าย  
## [3.4 ทุกมินิเกมมีบริบท]()  
มินิเกมจะไม่ปรากฏจากเมนูบทเรียนโดยตรง แต่ต้องเกิดจากบทสนทนา โทรศัพท์ วัตถุ หรือเหตุการณ์ในโลกเกม  
## [3.5 Prototype ต้องสร้างได้จริง]()  
ระบบที่ไม่จำเป็นต่อการทดสอบแนวคิด เช่น combat, inventory, crafting, NPC schedule และ open world จะไม่อยู่ใน prototype  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [4. Player Fantasy]()  
ผู้เล่นไม่ได้รับบทเป็นผู้เชี่ยวชาญด้านไซเบอร์ แต่เป็นคนธรรมดาในชุมชนที่เริ่มรู้จักสังเกต ตั้งคำถาม และช่วยคนรอบข้าง  
ความรู้สึกหลักที่เกมต้องการสร้างคือ:  
“ฉันอาจไม่รู้ทุกเรื่อง แต่ฉันสามารถหยุด ตรวจสอบ และขอความช่วยเหลือก่อนตัดสินใจได้”  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [5. Story Summary]()  
หมู่บ้านกำลังเตรียมจัดงาน **วันสุขใจชุมชนกลางดอย** ซึ่งจะมีทั้งตลาดชุมชน กิจกรรมสุขภาพ และการประชาสัมพันธ์สถานที่ท่องเที่ยว  
ก่อนวันงานเพียงสามวัน ผู้คนในหมู่บ้านเริ่มได้รับข้อความและข่าวแปลก ๆ จำนวนมาก เช่น:  
- ข่าวสุขภาพที่ไม่มีแหล่งอ้างอิง  
- SMS แจ้งสิทธิ์กู้เงิน  
- ลิงก์ลงทะเบียนรับเงินสนับสนุน  
- รูปภาพที่อ้างว่าเป็นเหตุการณ์จริง  
- แอปที่อ้างว่าใช้สำหรับรับสิทธิ์ชุมชน  
- บัญชี LINE ที่แอบอ้างเป็นเจ้าหน้าที่  
- โฆษณายารักษาโรคสารพัด  
- โพสต์ที่เปิดเผยข้อมูลส่วนตัว  
แม่น้ำอิงหรือพ่อจอมจะค่อย ๆ พบว่าเหตุการณ์เหล่านี้ไม่ได้เกิดกับตนเองเพียงคนเดียว แต่กำลังแพร่ไปยังร้านค้า โรงพยาบาล เพื่อนบ้าน โรงเรียน และศูนย์ชุมชน  
ผู้เล่นต้องช่วยตรวจสอบเหตุการณ์ทั้งหมด ก่อนที่คนในชุมชนจะหลงเชื่อ ส่งต่อข้อมูล หรือสูญเสียเงิน  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [6. Prototype Scope]()  
## [6.1 สิ่งที่มีใน Prototype]()  
- ตัวละครที่เลือกเล่นได้ 2 ตัว  
- แผนที่หมู่บ้านขนาดเล็ก 1 แผนที่  
- บ้านผู้เล่น  
- ร้านค้าชุมชน  
- บ้านเพื่อนบ้าน  
- โรงพยาบาลส่งเสริมสุขภาพ  
- ศูนย์ข้อมูลชุมชน  
- NPC หลัก 5–7 ตัว  
- เนื้อเรื่อง 3 วัน  
- มินิเกม 10 เกม  
- ระบบบทสนทนา  
- ระบบภารกิจแบบเส้นตรง  
- ระบบพลังงานอย่างง่าย  
- ระบบคะแนนความรู้ทัน  
- ระบบความปลอดภัยของชุมชน  
- หน้าสรุปประจำวัน  
- หน้าสรุปเมื่อจบ Prototype  
- ระบบบันทึกผลการเล่น  
- ระบบรองรับมือถือและคอมพิวเตอร์  
## [6.2 สิ่งที่ไม่มีใน Prototype]()  
- การต่อสู้  
- ระบบอาวุธ  
- ระบบไอเทม  
- NPC เดินตามตารางเวลา  
- ระบบกลางวันกลางคืนแบบ real-time  
- การเลือกคำตอบที่แตกแขนงเป็นหลายเส้นเรื่อง  
- ระบบความสัมพันธ์กับ NPC  
- การตกแต่งบ้าน  
- ระบบเศรษฐกิจ  
- โลกเปิดเต็มรูปแบบ  
- การเดินทางระหว่างหลายแผนที่  
- ภารกิจสุ่ม  
- Multiplayer  
- Voice acting เต็มรูปแบบ  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [7. Core Game Loop]()  
ลูปหลักของเกมคือ:  
1. เริ่มต้นวันภายในบ้าน  
2. ดูบทสนทนาเปิดวัน  
3. รับภารกิจหลัก  
4. เลือกสถานที่จากแผนที่หมู่บ้าน  
5. เดินไปยัง NPC หรือจุดกิจกรรม  
6. อ่านบทสนทนา  
7. พบเหตุการณ์เสี่ยงทางดิจิทัล  
8. เปิดมินิเกมที่เกี่ยวข้อง  
9. รับผลลัพธ์และคำอธิบาย  
10. เพิ่มหรือลดคะแนน  
11. ทำภารกิจถัดไป  
12. กลับบ้าน  
13. ดูสรุปประจำวัน  
14. เริ่มวันใหม่  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [8. Prototype Structure]()  
Prototype แบ่งเป็น 3 วัน โดยรวมมินิเกมทั้งหมด 10 เกม  
## [วันที่ 1: ข้อความที่ไม่น่าไว้ใจ]()  
ธีมหลัก:  
- SMS ปลอม  
- ข้อความหลอกลวง  
- ลิงก์ปลอม  
- การพูดคุยกับบุคคลไม่หวังดี  
มินิเกมประจำวัน:  
1. จับสัญญาณมิจ  
2. กางโล่กู้ชีพ  
3. จำลองแชต LINE  
4. ลิงก์จี้หรือลิงก์จริง  
## [วันที่ 2: เห็นแล้วอย่าเพิ่งเชื่อ]()  
ธีมหลัก:  
- ข่าวปลอม  
- ภาพจาก AI  
- การแชร์ข้อมูล  
- โฆษณาสุขภาพเกินจริง  
มินิเกมประจำวัน:  
1. จริงหรือมั่ว?  
2. AI หรือคน?  
3. แชร์ดีไหม?  
4. วิ่งสู้ภัยไซเบอร์  
## [วันที่ 3: ปกป้องเครื่อง ปกป้องชุมชน]()  
ธีมหลัก:  
- แอปอันตราย  
- เบอร์ปลอม  
- การตัดสินใจภายใต้แรงกดดัน  
- การใช้ทักษะทั้งหมดร่วมกัน  
มินิเกมประจำวัน:  
1. กระโดดแพรู้ทันมิจ  
2. นี่แอปฉัน นั่นแอปใคร?  
ช่วงท้ายวันจะมีเหตุการณ์สรุปที่นำผลจากทั้ง 10 เกมมาใช้ตัดสินสถานะของงานชุมชน  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [9. World Map]()  
Prototype ใช้แผนที่เดียว เพื่อให้สร้างได้เร็วและลดเวลาโหลด  
โครงสร้างแผนที่โดยประมาณ:  
                   โรงพยาบาล  
                        |  
 บ้านเพื่อนบ้าน --- ลานกลาง --- ศูนย์ชุมชน  
                        |  
                   ร้านค้าชุมชน  
                        |  
                     บ้านผู้เล่น  
## [9.1 บ้านผู้เล่น]()  
ใช้สำหรับ:  
- เปิดและจบแต่ละวัน  
- บทสนทนาครอบครัว  
- เล่นโทรศัพท์  
- ดูคะแนน  
- ดูสรุปผล  
- เริ่มเหตุการณ์เกี่ยวกับ Social Media  
## [9.2 ร้านค้าชุมชน]()  
ใช้สำหรับ:  
- ซื้อของ  
- พบแม่ค้า  
- เหตุการณ์ SMS  
- ลิงก์สินเชื่อ  
- การจ่ายเงิน  
- ข่าวที่คนในชุมชนส่งต่อ  
## [9.3 บ้านเพื่อนบ้าน]()  
ใช้สำหรับ:  
- ช่วยดูโทรศัพท์  
- ตรวจแชต LINE  
- ตรวจแอป  
- รับฟังข่าวลือ  
- พูดคุยเรื่องเบอร์แปลก  
## [9.4 โรงพยาบาลส่งเสริมสุขภาพ]()  
ใช้สำหรับ:  
- ข่าวสุขภาพ  
- โฆษณายา  
- ภาพที่อ้างว่าเป็นข้อมูลทางการแพทย์  
- การให้ความรู้หลังจบมินิเกม  
## [9.5 ศูนย์ข้อมูลชุมชน]()  
ใช้สำหรับ:  
- เตรียมงานชุมชน  
- ตรวจข้อมูลประชาสัมพันธ์  
- สรุปเบาะแส  
- ภารกิจสุดท้าย  
- หน้าสรุป Prototype  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [10. Main Characters]()  
## [10.1 แม่น้ำอิง]()  
อายุ 50 ปี  
ลักษณะนิสัย:  
- เป็นมิตร  
- ช่างสังเกต  
- ชอบพูดคุยกับเพื่อนบ้าน  
- ใช้ Facebook และ LINE เป็นประจำ  
- ไม่ได้เชี่ยวชาญเทคโนโลยี แต่พร้อมเรียนรู้  
## [10.2 พ่อจอม]()  
อายุ 50 ปี  
ลักษณะนิสัย:  
- ใจเย็น  
- ชอบตั้งคำถาม  
- ชอบช่วยงานชุมชน  
- ใช้โทรศัพท์สำหรับข่าวและการติดต่อ  
- ระมัดระวังแต่บางครั้งก็เชื่อสิ่งที่ดูเป็นทางการ  
ตัวละครที่ไม่ได้ถูกเลือกจะปรากฏเป็นสมาชิกครอบครัวและช่วยพูดคุยในฉากเปิดกับฉากจบวัน  
## [10.3 ลูกวัย 15 ปี]()  
หน้าที่:  
- เชื่อมเรื่องเทคโนโลยีระหว่างวัย  
- ให้มุมมองของเยาวชน  
- ไม่ได้รู้ทุกอย่าง  
- บางครั้งเป็นฝ่ายถามผู้เล่น  
- ช่วยสรุปสิ่งที่เรียนรู้ในช่วงเย็น  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [11. Supporting NPCs]()  
## [11.1 ป้าคำ]()  
เพื่อนบ้านที่ชอบแชร์ข่าวและส่งข้อความในกลุ่ม LINE  
ใช้เชื่อมกับ:  
- ข่าวปลอม  
- แชต LINE  
- ภาพ AI  
- เบอร์แปลก  
## [11.2 ลุงปัน]()  
เพื่อนบ้านที่สนใจโปรโมชั่น สินเชื่อ และยาบำรุง  
ใช้เชื่อมกับ:  
- SMS สินเชื่อ  
- ลิงก์ปลอม  
- โฆษณายา  
- แอปอันตราย  
## [11.3 ป้าสาย]()  
เจ้าของร้านค้าชุมชน  
ใช้เชื่อมกับ:  
- การจ่ายเงิน  
- SMS ปลอม  
- ข่าวส่งต่อ  
- QR หรือลิงก์ปลอม  
## [11.4 พยาบาลเมย์]()  
บุคลากรโรงพยาบาลส่งเสริมสุขภาพ  
ใช้เชื่อมกับ:  
- ข่าวสุขภาพ  
- ยารักษาทุกโรค  
- ภาพปลอม  
- การตรวจสอบแหล่งข้อมูล  
## [11.5 เจ้าหน้าที่นที]()  
เจ้าหน้าที่ศูนย์ข้อมูลชุมชน  
ใช้เชื่อมกับ:  
- ข้อมูลทางการ  
- เพจปลอม  
- ลิงก์ลงทะเบียน  
- ภารกิจสรุปของชุมชน  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [12. Game Stats]()  
Prototype ใช้ค่าสถานะเพียง 3 ค่า  
## [12.1 พลังงาน]()  
ใช้สำหรับจำกัดจำนวนกิจกรรมในแต่ละวัน  
- เริ่มวันด้วยพลังงาน 5 หน่วย  
- การเข้าสถานที่หลักใช้ 1 หน่วย  
- มินิเกมไม่หักพลังงานเพิ่ม  
- เมื่อทำภารกิจหลักครบ วันจะจบโดยอัตโนมัติ  
- Prototype ไม่อนุญาตให้พลังงานหมดก่อนทำเนื้อเรื่องหลัก  
พลังงานมีไว้เพื่อสื่อโครงสร้างประจำวัน ไม่ได้ใช้บังคับผู้เล่นอย่างเข้มงวด  
## [12.2 คะแนนรู้ทัน]()  
ได้จาก:  
- ตรวจพบจุดผิดปกติ  
- เลือกคำตอบอย่างมีเหตุผล  
- ใช้คำแนะนำอย่างเหมาะสม  
- จบมินิเกม  
คะแนนนี้ใช้แสดงความก้าวหน้าส่วนบุคคล  
## [12.3 ความปลอดภัยของชุมชน]()  
เปลี่ยนตามผลรวมของมินิเกม  
- ตอบถูกหรือจัดการความเสี่ยงได้ดี: เพิ่ม  
- พลาดบางส่วน: ไม่เพิ่มหรือเพิ่มเล็กน้อย  
- เลือกการกระทำเสี่ยง: ลดเล็กน้อย  
ค่านี้ใช้สร้างความรู้สึกว่าการตัดสินใจมีผลต่อชุมชน  
ไม่มี Game Over จากค่าความปลอดภัยต่ำ  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [13. Minigame Integration Design]()  
มินิเกมทั้ง 10 เกมใช้ interface ผลลัพธ์ร่วมกัน  
ข้อมูลที่ทุกเกมต้องส่งกลับ:  
- รหัสมินิเกม  
- รหัสเหตุการณ์  
- เล่นจบหรือไม่  
- คะแนน  
- จำนวนคำตอบถูก  
- จำนวนคำตอบผิด  
- เวลาที่ใช้  
- จำนวนครั้งที่ขอคำใบ้  
- จำนวนครั้งที่ลองใหม่  
- ผลลัพธ์ด้านการเรียนรู้  
- การกระทำหลักที่ผู้เล่นเลือก  
รูปแบบผลลัพธ์เชิงแนวคิด:  
MinigameResult  
 - minigameId  
 - incidentId  
 - completed  
 - score  
 - correctCount  
 - mistakeCount  
 - duration  
 - hintsUsed  
 - retryCount  
 - outcome  
โลกหลักจะไม่อ่าน logic ภายในของมินิเกม แต่รับเฉพาะผลลัพธ์มาตรฐาน  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [14. Minigame Design and Narrative Placement]()  
## [14.1 จริงหรือมั่ว?]()  
### [แนวคิด]()  
ผู้เล่นตรวจสอบว่าข่าวหรือข้อมูลที่ได้รับควรแชร์ต่อหรือไม่  
### [ตำแหน่งในเนื้อเรื่อง]()  
วันที่ 2 ณ โรงพยาบาลส่งเสริมสุขภาพ  
ป้าคำส่งข่าวในกลุ่มชุมชนว่า:  
ดื่มน้ำสมุนไพรชนิดหนึ่งสามารถรักษาโรคเรื้อรังได้ทั้งหมด  
พยาบาลเมย์เห็นข้อความและขอให้ผู้เล่นช่วยตรวจสอบก่อนที่ข่าวจะถูกแชร์ต่อ  
### [เป้าหมายการเรียนรู้]()  
- ตรวจสอบแหล่งที่มา  
- แยกข้อเท็จจริงกับความคิดเห็น  
- ไม่แชร์ข้อมูลเพราะเห็นว่ามีคนแชร์จำนวนมาก  
- พิจารณาผลกระทบก่อนแชร์  
### [ผลต่อโลก]()  
หากสำเร็จ ข่าวจะไม่ถูกส่งต่อในกลุ่มชุมชน และความปลอดภัยของชุมชนเพิ่มขึ้น  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
## [14.2 จับสัญญาณมิจ]()  
### [แนวคิด]()  
ผู้เล่นตรวจว่าข้อความเป็นข้อความจริงหรือข้อความหลอกลวง  
### [ตำแหน่งในเนื้อเรื่อง]()  
วันที่ 1 ณ ร้านค้าชุมชน  
ระหว่างจ่ายเงิน ผู้เล่นได้รับข้อความว่า:  
คุณได้รับวงเงินกู้พิเศษ กรุณากดยืนยันภายใน 10 นาที  
### [เป้าหมายการเรียนรู้]()  
- สังเกตข้อความเร่งรัด  
- สังเกตคำสะกดผิด  
- สังเกตการขอข้อมูลส่วนตัว  
- สังเกตข้อเสนอที่ดีเกินจริง  
### [ผลต่อโลก]()  
หากผู้เล่นตรวจพบ ป้าสายจะเตือนลูกค้าในร้านไม่ให้กดข้อความลักษณะเดียวกัน  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
## [14.3 AI หรือคน?]()  
### [แนวคิด]()  
ผู้เล่นแยกภาพจริงออกจากภาพที่สร้างหรือดัดแปลงด้วย AI  
### [ตำแหน่งในเนื้อเรื่อง]()  
วันที่ 2 ณ ศูนย์ข้อมูลชุมชน  
มีภาพถูกแชร์ว่าเกิดอุบัติเหตุใหญ่ใกล้น้ำตก ทำให้นักท่องเที่ยวเริ่มยกเลิกการเดินทาง  
เจ้าหน้าที่นทีขอให้ผู้เล่นช่วยตรวจสอบภาพ  
### [เป้าหมายการเรียนรู้]()  
- สังเกตรายละเอียดผิดธรรมชาติ  
- ไม่ตัดสินจากภาพเพียงอย่างเดียว  
- ตรวจสอบแหล่งเผยแพร่  
- เปรียบเทียบกับข้อมูลจากช่องทางทางการ  
### [ผลต่อโลก]()  
หากสำเร็จ ศูนย์ชุมชนจะเผยแพร่ข้อมูลแก้ไขทันเวลา  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
## [14.4 แชร์ดีไหม?]()  
### [แนวคิด]()  
ผู้เล่นพิจารณาว่าโพสต์หรือรูปภาพใดควรแชร์ ไม่ควรแชร์ หรือต้องแก้ไขก่อนแชร์  
### [ตำแหน่งในเนื้อเรื่อง]()  
วันที่ 2 ณ บ้านผู้เล่น  
ผู้เล่นต้องเลือกภาพสำหรับโพสต์ประชาสัมพันธ์กิจกรรมครอบครัวและงานชุมชน  
ภาพบางภาพมี:  
- ใบหน้าหลาน  
- บัตรประชาชน  
- เลขที่บ้าน  
- ป้ายทะเบียน  
- ตำแหน่งแบบ real-time  
### [เป้าหมายการเรียนรู้]()  
- เข้าใจข้อมูลส่วนบุคคล  
- ขออนุญาตก่อนโพสต์รูปผู้อื่น  
- ปกปิดข้อมูลสำคัญ  
- ระวังข้อมูลตำแหน่ง  
### [ผลต่อโลก]()  
ภาพที่ปลอดภัยจะถูกใช้ในโพสต์งานชุมชน  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
## [14.5 กางโล่กู้ชีพ]()  
### [แนวคิด]()  
ผู้เล่นแยก SMS ที่ปลอดภัยออกจาก SMS หลอกลวง  
### [ตำแหน่งในเนื้อเรื่อง]()  
วันที่ 1 ณ บ้านเพื่อนบ้าน  
ลุงปันได้รับ SMS หลายข้อความ ทั้งข้อความจากโรงพยาบาล ร้านค้า และข้อความแจ้งรับสิทธิ์ปลอม  
ผู้เล่นช่วยคัดแยกก่อนที่ลุงปันจะกดลิงก์ผิด  
### [เป้าหมายการเรียนรู้]()  
- เปรียบเทียบ SMS หลายรูปแบบ  
- ตรวจชื่อผู้ส่ง  
- ตรวจลิงก์  
- ระวังข้อความที่ขอให้ทำทันที  
### [ความแตกต่างจากจับสัญญาณมิจ]()  
จับสัญญาณมิจเน้นตรวจรายละเอียดภายในข้อความหนึ่งชุด  
กางโล่กู้ชีพเน้นคัดแยก SMS หลายข้อความอย่างรวดเร็ว  
### [ผลต่อโลก]()  
ลุงปันเก็บเฉพาะข้อความสำคัญและลบข้อความเสี่ยง  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
## [14.6 จำลองแชต LINE]()  
### [แนวคิด]()  
ผู้เล่นสนทนากับบัญชีที่อาจเป็นบุคคลไม่หวังดี และเลือกวิธีตอบกลับ  
### [ตำแหน่งในเนื้อเรื่อง]()  
วันที่ 1 ณ บ้านผู้เล่นช่วงเย็น  
บัญชีที่ใช้รูปโปรไฟล์คล้ายลูกส่งข้อความว่า:  
โทรศัพท์เสีย ขอให้ช่วยโอนเงินด่วน  
ผู้เล่นต้องถาม ตรวจสอบ และตัดสินใจว่าจะทำอย่างไร  
### [เป้าหมายการเรียนรู้]()  
- ไม่เชื่อเพียงรูปโปรไฟล์  
- ตรวจสอบตัวตนผ่านช่องทางอื่น  
- ไม่โอนเงินเพราะถูกกดดัน  
- ระวังบัญชีใหม่หรือถ้อยคำผิดปกติ  
### [ผลต่อโลก]()  
หากตรวจสอบสำเร็จ ผู้เล่นจะโทรหาลูกผ่านเบอร์เดิมและพบว่าเป็นบัญชีปลอม  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
## [14.7 วิ่งสู้ภัยไซเบอร์]()  
### [แนวคิด]()  
ตัวละครวิ่งและต้องหลบหรือกระโดดข้ามข้อมูลหรือโฆษณาที่ไม่น่าเชื่อถือ  
ตัวอย่างวัตถุ:  
- ยาวิเศษรักษาทุกโรค  
- อาหารเสริมเห็นผลทันที  
- โปรโมชั่นที่ไม่มีเงื่อนไข  
- ข่าวสุขภาพไม่มีแหล่งอ้างอิง  
### [ตำแหน่งในเนื้อเรื่อง]()  
วันที่ 2 ณ โรงพยาบาลส่งเสริมสุขภาพ  
เกมถูกนำเสนอเป็นกิจกรรมสาธิตจากพยาบาลเมย์ เพื่อช่วยให้ผู้เล่นฝึกสังเกตโฆษณาเกินจริง  
### [เป้าหมายการเรียนรู้]()  
- สังเกตคำกล่าวอ้างเกินจริง  
- ระวังผลิตภัณฑ์ที่อ้างรักษาได้ทุกโรค  
- ไม่ซื้อเพราะคำรับรองที่ตรวจสอบไม่ได้  
- มองหาเลขทะเบียนหรือแหล่งข้อมูลทางการ  
### [ผลต่อโลก]()  
ผู้เล่นได้รับตรา “ไม่หลงคำโฆษณา”  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
## [14.8 กระโดดแพรู้ทันมิจ]()  
### [แนวคิด]()  
ผู้เล่นกระโดดไปยังแพหรือทางเลือกที่เป็นข้อความหรือหมายเลขที่ปลอดภัย และหลีกเลี่ยงข้อความหรือเบอร์ปลอม  
### [ตำแหน่งในเนื้อเรื่อง]()  
วันที่ 3 ณ ลานกลางหมู่บ้าน  
เจ้าหน้าที่จัดกิจกรรมเตรียมความพร้อมก่อนงานชุมชน ผู้เล่นต้องแสดงวิธีแยก SMS และเบอร์โทรศัพท์ที่น่าสงสัย  
### [เป้าหมายการเรียนรู้]()  
- แยกข้อความจริงและปลอม  
- ระวังหมายเลขแปลก  
- ไม่เชื่อ Caller ID โดยอัตโนมัติ  
- ตรวจสอบเบอร์ผ่านช่องทางทางการ  
### [ผลต่อโลก]()  
ชาวบ้านที่ชมกิจกรรมจะได้รับความรู้ก่อนวันงาน  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
## [14.9 ลิงก์จี้หรือลิงก์จริง]()  
### [แนวคิด]()  
ผู้เล่นตรวจและแยก URL จริงออกจาก URL ที่เลียนแบบเว็บไซต์ทางการ  
### [ตำแหน่งในเนื้อเรื่อง]()  
วันที่ 1 ณ ศูนย์ข้อมูลชุมชน  
มีลิงก์ปลอมอ้างว่าเป็นแบบลงทะเบียนรับสิทธิ์ร้านค้าชุมชน  
ผู้เล่นต้องเลือกลิงก์ที่เป็นช่องทางจริง  
### [เป้าหมายการเรียนรู้]()  
- อ่านชื่อโดเมน  
- ตรวจตัวอักษรที่คล้ายกัน  
- ระวัง subdomain หลอก  
- ไม่ตัดสินจากโลโก้หรือสีเว็บไซต์เพียงอย่างเดียว  
### [ผลต่อโลก]()  
ศูนย์ข้อมูลสามารถประกาศลิงก์ที่ถูกต้องก่อนมีคนกรอกข้อมูลในเว็บปลอม  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
## [14.10 นี่แอปฉัน นั่นแอปใคร?]()  
### [แนวคิด]()  
เกมจำลองหน้าจอโทรศัพท์ ผู้เล่นต้องค้นหาแอปอันตรายหรือแอปที่ไม่ได้ติดตั้งเองและลบออก  
### [ตำแหน่งในเนื้อเรื่อง]()  
วันที่ 3 ณ บ้านเพื่อนบ้าน  
ลุงปันพบว่าโทรศัพท์ช้าลงและมีแอปแปลก ๆ หลังจากคุยกับคนที่อ้างว่าเป็นเจ้าหน้าที่  
ผู้เล่นต้องตรวจหาแอปที่ผิดปกติ  
### [เป้าหมายการเรียนรู้]()  
- ตรวจแอปที่ไม่รู้จัก  
- ตรวจสิทธิ์ของแอป  
- ระวังการติดตั้งจากนอก Store  
- ลบแอปอันตราย  
- ขอความช่วยเหลือเมื่อไม่แน่ใจ  
### [ผลต่อโลก]()  
โทรศัพท์ของลุงปันปลอดภัยขึ้น และข้อมูลสำคัญไม่ถูกเข้าถึงต่อ  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [15. Detailed Day Flow]()  
## [วันที่ 1: ข้อความที่ไม่น่าไว้ใจ]()  
### [ฉากเปิด]()  
- ผู้เล่นเตรียมอาหารให้ลูก  
- ลูกออกไปโรงเรียน  
- โทรศัพท์ได้รับข้อความสินเชื่อ  
- ผู้เล่นได้รับภารกิจไปซื้อของและช่วยงานศูนย์ชุมชน  
### [ภารกิจที่ 1: ร้านค้าชุมชน]()  
- บทสนทนากับป้าสาย  
- เปิดมินิเกมจับสัญญาณมิจ  
- รับคำอธิบายสั้น ๆ  
### [ภารกิจที่ 2: บ้านเพื่อนบ้าน]()  
- ลุงปันมี SMS หลายข้อความ  
- เปิดมินิเกมกางโล่กู้ชีพ  
### [ภารกิจที่ 3: ศูนย์ข้อมูลชุมชน]()  
- พบลิงก์ลงทะเบียนปลอม  
- เปิดมินิเกมลิงก์จี้หรือลิงก์จริง  
### [เหตุการณ์ก่อนนอน]()  
- บัญชี LINE ปลอมแอบอ้างเป็นลูก  
- เปิดมินิเกมจำลองแชต LINE  
### [สรุปวัน]()  
- คะแนนรู้ทัน  
- จำนวนข้อความที่ตรวจพบ  
- คนที่ได้รับความช่วยเหลือ  
- สัญญาณอันตรายที่เรียนรู้  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
## [วันที่ 2: เห็นแล้วอย่าเพิ่งเชื่อ]()  
### [ฉากเปิด]()  
- ในกลุ่มชุมชนมีข่าวสุขภาพถูกแชร์  
- ผู้เล่นได้รับภารกิจไปโรงพยาบาลและศูนย์ชุมชน  
### [ภารกิจที่ 1: โรงพยาบาล]()  
- ตรวจข่าวรักษาโรค  
- เปิดมินิเกมจริงหรือมั่ว?  
### [ภารกิจที่ 2: กิจกรรมสุขภาพ]()  
- พยาบาลจัดกิจกรรมฝึกสังเกตโฆษณา  
- เปิดมินิเกมวิ่งสู้ภัยไซเบอร์  
### [ภารกิจที่ 3: ศูนย์ข้อมูลชุมชน]()  
- ภาพอุบัติเหตุปลอมกำลังแพร่  
- เปิดมินิเกม AI หรือคน?  
### [เหตุการณ์ที่บ้าน]()  
- เลือกภาพประชาสัมพันธ์งานชุมชน  
- เปิดมินิเกมแชร์ดีไหม?  
### [สรุปวัน]()  
- ข่าวปลอมที่หยุดได้  
- ภาพที่ตรวจสอบ  
- ข้อมูลส่วนตัวที่ปกป้อง  
- สถานะชุมชน  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
## [วันที่ 3: ปกป้องโทรศัพท์ ปกป้องชุมชน]()  
### [ฉากเปิด]()  
- ลุงปันบอกว่าโทรศัพท์ทำงานผิดปกติ  
- งานชุมชนจะเริ่มในวันถัดไป  
### [ภารกิจที่ 1: บ้านเพื่อนบ้าน]()  
- ตรวจโทรศัพท์  
- เปิดมินิเกมนี่แอปฉัน นั่นแอปใคร?  
### [ภารกิจที่ 2: ลานกลางหมู่บ้าน]()  
- จัดกิจกรรมรู้ทันมิจฉาชีพ  
- เปิดมินิเกมกระโดดแพรู้ทันมิจ  
### [ภารกิจสุดท้าย: ศูนย์ข้อมูลชุมชน]()  
เจ้าหน้าที่นทีสรุปว่าเหตุการณ์ทั้งหมดเกิดจากการส่งต่อข้อมูลโดยไม่ตรวจสอบ และการแอบอ้างช่องทางของชุมชน  
ผู้เล่นต้องเลือกคำแนะนำสำหรับประกาศเตือนชุมชนจากสิ่งที่ได้เรียนรู้  
ภารกิจนี้ไม่ใช่มินิเกมใหม่ แต่เป็นหน้าสรุปแบบโต้ตอบที่นำผลจากทั้ง 10 เกมมาแสดง  
### [ฉากจบ]()  
งานชุมชนสามารถดำเนินต่อได้  
NPC ที่ผู้เล่นช่วยไว้จะปรากฏในฉากจบ  
ระดับความปลอดภัยของชุมชนจะกำหนดข้อความสรุปตอนจบ  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [16. Ending Conditions]()  
Prototype มีตอนจบ 3 ระดับ แต่ไม่มีตอนจบล้มเหลว  
## [16.1 ชุมชนรู้ทันดีเยี่ยม]()  
เงื่อนไข:  
- คะแนนรวมสูง  
- ผ่านมินิเกมส่วนใหญ่  
- ใช้คำใบ้น้อยหรือเหมาะสม  
ผลลัพธ์:  
- ชาวบ้านช่วยกันตรวจสอบข้อมูล  
- งานชุมชนดำเนินไปอย่างราบรื่น  
- ผู้เล่นได้รับตรา “ผู้ช่วยชุมชนรู้ทัน”  
## [16.2 ชุมชนเริ่มรู้ทัน]()  
เงื่อนไข:  
- คะแนนระดับกลาง  
- มีข้อผิดพลาดบางส่วน  
ผลลัพธ์:  
- งานยังดำเนินต่อได้  
- NPC กล่าวถึงสิ่งที่ต้องฝึกเพิ่มเติม  
- เกมเน้นว่าการขอความช่วยเหลือเป็นเรื่องปกติ  
## [16.3 ชุมชนต้องช่วยกันอีกหน่อย]()  
เงื่อนไข:  
- คะแนนต่ำ  
- พลาดหลายเหตุการณ์  
ผลลัพธ์:  
- ไม่มีการตำหนิ  
- NPC ช่วยสรุปสัญญาณสำคัญ  
- ผู้เล่นสามารถกลับไปเล่นมินิเกมได้  
- งานชุมชนยังจัดได้ด้วยความร่วมมือของทุกคน  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [17. User Interface]()  
## [17.1 World HUD]()  
แสดงเฉพาะ:  
- วันที่  
- ภารกิจปัจจุบัน  
- พลังงาน  
- คะแนนรู้ทัน  
- ความปลอดภัยของชุมชน  
- ปุ่มเมนู  
- ปุ่มโต้ตอบบนมือถือ  
## [17.2 Dialogue UI]()  
ต้องมี:  
- ชื่อผู้พูด  
- ภาพหรือไอคอนตัวละคร  
- ตัวอักษรขนาดใหญ่  
- ปุ่มถัดไป  
- ปุ่มย้อนอ่านข้อความล่าสุด  
- ตัวเลือกคำตอบไม่เกิน 3 ตัวเลือก  
- ไม่มีข้อความยาวเกินไปในหนึ่งหน้า  
## [17.3 Phone Overlay]()  
ใช้สำหรับ:  
- SMS  
- LINE  
- Facebook  
- รูปภาพ  
- แอป  
- ลิงก์  
โทรศัพท์จะแสดงเป็น React overlay เหนือ Phaser world  
## [17.4 Daily Summary]()  
แสดง:  
- สถานที่ที่ไป  
- คนที่ช่วย  
- มินิเกมที่เล่น  
- คะแนนแต่ละเกม  
- สิ่งที่ทำได้ดี  
- สิ่งที่ควรระวัง  
- คะแนนรวมของวัน  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [18. Accessibility]()  
Prototype ต้องมีอย่างน้อย:  
- ตัวอักษรขนาดปกติและขนาดใหญ่  
- ปุ่มสัมผัสขนาดใหญ่  
- ระยะห่างระหว่างปุ่ม  
- ตัวเลือกเสียงเปิดหรือปิด  
- ลดการเคลื่อนไหว  
- หยุดเวลาได้  
- ไม่มีมินิเกมที่บังคับความเร็วสูงโดยไม่มีโหมดผ่อนคลาย  
- ใช้ข้อความร่วมกับสีและไอคอน  
- ปุ่มยืนยันก่อนออกจากมินิเกม  
- ปุ่มเล่นใหม่  
- ปุ่มขอคำใบ้  
- รองรับมือถือแนวตั้ง  
- รองรับ PC แนวนอน  
เกมวิ่งและเกมกระโดดต้องมีโหมดช้าสำหรับผู้สูงอายุ  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [19. Technical Architecture]()  
## [19.1 Next.js และ React]()  
รับผิดชอบ:  
- เว็บหลัก  
- ระบบผู้ใช้  
- เมนู  
- Dialog overlay  
- Phone overlay  
- มินิเกม React เดิม  
- สรุปผล  
- บันทึกข้อมูล  
- Accessibility settings  
## [19.2 Phaser]()  
รับผิดชอบ:  
- แผนที่  
- ตัวละคร  
- การเดิน  
- กล้อง  
- Collision  
- NPC  
- จุดโต้ตอบ  
- Animation  
- การเปิดเหตุการณ์  
## [19.3 Event Bus]()  
Event หลัก:  
- world-ready  
- interaction-started  
- dialogue-opened  
- incident-started  
- minigame-opened  
- minigame-completed  
- minigame-closed  
- quest-updated  
- day-completed  
- save-requested  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [20. Content Data Structure]()  
เนื้อหาควรถูกจัดเก็บเป็นข้อมูลเพื่อให้ AI สร้างและแก้ไขได้ง่าย  
## [20.1 Incident Data]()  
แต่ละเหตุการณ์ประกอบด้วย:  
- ID  
- วันที่  
- สถานที่  
- NPC  
- บทสนทนาเปิด  
- มินิเกม  
- Payload ที่ส่งให้มินิเกม  
- บทสนทนาหลังสำเร็จ  
- บทสนทนาหลังพลาด  
- คะแนน  
- ผลต่อชุมชน  
## [20.2 Dialogue Data]()  
ประกอบด้วย:  
- ผู้พูด  
- ข้อความ  
- สีหน้าหรือรูป  
- ตัวเลือก  
- เงื่อนไข  
- เหตุการณ์ถัดไป  
## [20.3 Quest Data]()  
ประกอบด้วย:  
- ID  
- ชื่อ  
- คำอธิบาย  
- วันที่  
- ลำดับภารกิจ  
- จุดเริ่ม  
- จุดจบ  
- สถานะ  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [21. Art Direction]()  
รูปแบบภาพ:  
- 2D top-down  
- สีอบอุ่น  
- บรรยากาศป่าและภูเขา  
- บ้านไม้และชุมชนขนาดเล็ก  
- หมอกบาง  
- ลำธาร  
- ต้นไม้และดอกไม้  
- ตัวละครอ่านง่าย  
- ไม่เน้นรายละเอียดสมจริงมากเกินไป  
Prototype สามารถใช้:  
- Tilemap ขนาดเล็ก  
- Asset สำเร็จรูป  
- ภาพตัวละครที่สร้างด้วย AI  
- Animation เดิน 4 ทิศแบบพื้นฐาน  
- Portrait ตัวละครเพียง 1–3 สีหน้า  
ไม่จำเป็นต้องสร้างแม่กำปองเหมือนสถานที่จริงทุกจุด  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [22. Audio Direction]()  
เสียงที่ต้องมี:  
- เพลงพื้นหลังหมู่บ้านแบบสงบ  
- เสียงลำธาร  
- เสียงนก  
- เสียงแจ้งเตือนโทรศัพท์  
- เสียงปุ่ม  
- เสียงสำเร็จ  
- เสียงเตือนแบบไม่รุนแรง  
Prototype ไม่จำเป็นต้องมีเสียงพากย์เต็มรูปแบบ  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [23. Performance Target]()  
Prototype ควร:  
- เปิดได้บนมือถือ RAM 2–3 GB  
- ไม่โหลดทั้ง 10 มินิเกมพร้อมกัน  
- โหลดมินิเกมเมื่อจำเป็น  
- คืนหน่วยความจำเมื่อมินิเกมปิด  
- จำกัดขนาด texture  
- ใช้ asset เสียงแบบบีบอัด  
- ลด animation ในโหมดประหยัด  
- ไม่ให้ React render ตามตำแหน่งผู้เล่นทุก frame  
- บันทึกอัตโนมัติหลังจบแต่ละมินิเกม  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [24. Analytics and Research Logging]()  
บันทึกอย่างน้อย:  
- ตัวละครที่เลือก  
- อุปกรณ์  
- ขนาดหน้าจอ  
- วันในเกม  
- มินิเกมที่เปิด  
- เวลาเริ่มและจบ  
- คะแนน  
- จำนวนข้อผิดพลาด  
- จำนวนคำใบ้  
- จำนวน retry  
- การออกจากเกมกลางคัน  
- การกลับมาเล่นต่อ  
- คะแนนความปลอดภัยชุมชน  
- เวลารวมของ Prototype  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [25. Prototype Acceptance Criteria]()  
Prototype ถือว่าเสร็จเมื่อ:  
1. ผู้เล่นเลือกแม่น้ำอิงหรือพ่อจอมได้  
2. ผู้เล่นเดินในแผนที่ได้  
3. ผู้เล่นโต้ตอบกับ NPC ได้  
4. เนื้อเรื่องเล่นได้ครบ 3 วัน  
5. มินิเกมทั้ง 10 เกมเปิดจากเหตุการณ์ในโลกหลัก  
6. โลกเกมหยุดระหว่างเล่นมินิเกม  
7. มินิเกมทุกเกมส่งผลลัพธ์กลับในรูปแบบเดียวกัน  
8. โลกเกมกลับมาทำงานหลังจบมินิเกม  
9. คะแนนและภารกิจอัปเดตถูกต้อง  
10. บันทึกความคืบหน้าได้  
11. รีเฟรชแล้วกลับมาเล่นต่อได้  
12. เล่นได้บนมือถือแนวตั้ง  
13. เล่นได้บนคอมพิวเตอร์แนวนอน  
14. ไม่มี Canvas หรือ event listener ซ้ำ  
15. หน้าสรุปวันแสดงผลถูกต้อง  
16. มีฉากจบตามผลรวม  
17. ตัวอักษรและปุ่มเหมาะกับผู้สูงอายุ  
18. เกมใช้เวลาเล่นไม่เกินประมาณ 60 นาที  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [26. AI-Assisted Development Plan]()  
## [Phase 1: Integration Foundation]()  
สร้าง:  
- Phaser container  
- Player movement  
- Map  
- NPC interaction  
- Typed Event Bus  
- Minigame adapter  
- Mock minigame หนึ่งเกม  
## [Phase 2: Narrative Framework]()  
สร้าง:  
- Dialogue system  
- Quest system  
- Incident data  
- Day controller  
- Daily summary  
## [Phase 3: Integrate All Minigames]()  
เชื่อมมินิเกมทีละเกม:  
1. จับสัญญาณมิจ  
2. กางโล่กู้ชีพ  
3. ลิงก์จี้หรือลิงก์จริง  
4. จำลองแชต LINE  
5. จริงหรือมั่ว?  
6. AI หรือคน?  
7. แชร์ดีไหม?  
8. วิ่งสู้ภัยไซเบอร์  
9. นี่แอปฉัน นั่นแอปใคร?  
10. กระโดดแพรู้ทันมิจ  
หลังเชื่อมแต่ละเกม ต้องทดสอบ:  
- เปิดได้  
- ปิดได้  
- ส่งผลลัพธ์ได้  
- ไม่ทำให้ world state หาย  
- ไม่สร้าง event ซ้ำ  
- เล่นบนมือถือได้  
## [Phase 4: Polish]()  
เพิ่ม:  
- ฉากเปิด  
- ฉากจบ  
- เสียง  
- ภาพตัวละคร  
- Animation  
- Accessibility  
- การลดเวลาโหลด  
## [Phase 5: User Test]()  
ทดสอบคำถามหลัก:  
- เกมยังรู้สึกเหมือนข้อสอบหรือไม่  
- ผู้เล่นเข้าใจบริบทของมินิเกมหรือไม่  
- การเดินช่วยเพิ่มความสนุกหรือทำให้เหนื่อย  
- มินิเกม 10 เกมในหนึ่ง Prototype ยาวเกินไปหรือไม่  
- ผู้เล่นจำสิ่งที่เรียนรู้ได้หรือไม่  
- ผู้เล่นต้องการเล่นต่อหรือไม่  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [27. Production Transition]()  
Prototype นี้มีหน้าที่ทดสอบการเชื่อมมินิเกมทั้ง 10 เกมเท่านั้น  
เมื่อเข้าสู่ Production จริง จะใช้ GDD ฉบับใหญ่เพื่อเพิ่ม:  
- แผนที่แม่กำปองหลายพื้นที่  
- น้ำตกและแหล่งท่องเที่ยว  
- วัด โรงเรียน ร้านค้า และหน่วยงาน  
- เนื้อเรื่องหลายวัน  
- การสำรวจอิสระ  
- เหตุการณ์เสริม  
- ระบบเบาะแส  
- ระบบข่าวลือ  
- ความสัมพันธ์กับ NPC  
- เส้นเรื่องแตกแขนง  
- ภารกิจหลังจบเนื้อเรื่อง  
- เนื้อหาใหม่ที่ไม่ใช่มินิเกมเดิม  
Prototype ต้องไม่สร้างระบบเหล่านี้ล่วงหน้า เว้นแต่ผลการทดสอบแสดงว่าจำเป็น  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [28. Final Prototype Formula]()  
1 แผนที่  
 3 วัน  
 5 สถานที่  
 5–7 NPC  
 10 มินิเกม  
 3 ค่าสถานะ  
 1 เนื้อเรื่องเส้นตรง  
 3 ตอนจบเชิงผลลัพธ์  
 45–60 นาที  
หัวใจของ Prototype คือ:  
ผู้เล่นใช้ชีวิตในชุมชน พบปัญหาทางดิจิทัลจากสถานการณ์ใกล้ตัว เล่นมินิเกมเพื่อแก้ปัญหา และเห็นว่าการตัดสินใจของตนช่วยปกป้องคนอื่นได้อย่างไร  

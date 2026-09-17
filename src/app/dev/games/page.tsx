import DevGameHubClient from "./DevGameHubClient";
import { isDevHubEnabled } from "@/lib/devHub";

/**
 * Dev Game Hub gate (US-03-R4).
 *
 * เช็ก env ฝั่ง Server Component ตอน request — เปิด/ปิดจาก Docker/Portainer
 * ได้โดยไม่ต้อง rebuild image (ต่างจาก NEXT_PUBLIC_* ที่ฝังตอน build ใน Client Component)
 */
export const dynamic = "force-dynamic";

export default function DevGameHubPage() {
  if (!isDevHubEnabled()) {
    return (
      <div className="p-8 text-slate-600">
        <h2 className="text-xl font-bold mb-2">หน้ารวมเกมถูกปิดใช้งาน</h2>
        <p>
          หน้านี้เป็นเครื่องมือสำหรับทีมพัฒนาเท่านั้น หากต้องการเปิดใช้บนเซิร์ฟเวอร์
          production ให้ตั้งค่า environment variable{" "}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded">ENABLE_DEV_HUB=true</code>
          {" "}(หรือ{" "}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded">NEXT_PUBLIC_ENABLE_DEV_HUB=true</code>
          ) ใน Docker/Portainer แล้ว restart container — ไม่ต้อง rebuild image
        </p>
      </div>
    );
  }

  return <DevGameHubClient />;
}

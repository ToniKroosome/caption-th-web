import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function PricingPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-blue-400">Tum-Mu-Sub-Bu</Link>
        {isSignedIn ? (
          <Link href="/tool" className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg">เปิดโปรแกรม</Link>
        ) : (
          <Link href="/sign-in" className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg">เข้าสู่ระบบ</Link>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center py-20 px-4">
        <h1 className="text-4xl font-bold mb-2">ราคา</h1>
        <p className="text-gray-400 mb-12">เลือกแผนที่เหมาะกับคุณ</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
          {/* Free */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="text-gray-400 text-sm font-medium uppercase mb-1">Free</div>
            <div className="text-4xl font-bold mb-1">฿0</div>
            <div className="text-gray-500 text-sm mb-6">ใช้งานได้ตลอด</div>
            <ul className="space-y-3 text-sm mb-8">
              {["ถอดเสียงไม่จำกัด", "แก้ไข Caption", "ดาวน์โหลด .SRT / .TXT", "Export วิดีโอ (มี Watermark)"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
            {isSignedIn ? (
              <Link href="/tool" className="block text-center bg-gray-600 hover:bg-gray-500 px-4 py-2.5 rounded-xl font-medium">
                เปิดโปรแกรม
              </Link>
            ) : (
              <Link href="/sign-up" className="block text-center bg-gray-600 hover:bg-gray-500 px-4 py-2.5 rounded-xl font-medium">
                เริ่มใช้งานฟรี
              </Link>
            )}
          </div>

          {/* Pro */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-blue-500 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-xs font-bold px-3 py-1 rounded-full">แนะนำ</div>
            <div className="text-blue-400 text-sm font-medium uppercase mb-1">Pro</div>
            <div className="text-4xl font-bold mb-1">฿100<span className="text-lg text-gray-400">/เดือน</span></div>
            <div className="text-gray-500 text-sm mb-1">หรือ ฿1,990 (ซื้อขาด)</div>
            <div className="text-xs text-gray-600 mb-6">สมัคร 30 เดือน = เป็นเจ้าของถาวรอัตโนมัติ</div>
            <ul className="space-y-3 text-sm mb-8">
              {["ทุกอย่างใน Free", "Export วิดีโอไม่มี Watermark", "รองรับทุกอุปกรณ์", "อัพเดทฟีเจอร์ใหม่ก่อนใคร"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <button className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl font-medium opacity-60 cursor-not-allowed" disabled>
              เร็วๆ นี้ — ระบบชำระเงินกำลังมา
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

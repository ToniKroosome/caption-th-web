import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold text-blue-400">CaptionTH</span>
        <div className="flex gap-3">
          <Link href="/pricing" className="text-sm text-gray-400 hover:text-white px-3 py-1">ราคา</Link>
          {isSignedIn ? (
            <Link href="/tool" className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg">เปิดโปรแกรม</Link>
          ) : (
            <Link href="/sign-in" className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg">เข้าสู่ระบบ</Link>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-5xl font-bold mb-4">
          สร้าง <span className="text-blue-400">Caption ภาษาไทย</span>
          <br />ในเบราว์เซอร์
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-8">
          อัพโหลดเสียงหรือวิดีโอ — AI ถอดเสียงและสร้าง Caption ทั้งหมดในเครื่องของคุณ
          ไม่มีเซิร์ฟเวอร์ ไม่มี API Key
        </p>
        <div className="flex gap-4">
          {isSignedIn ? (
            <Link href="/tool" className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-medium text-lg">
              เปิดโปรแกรม
            </Link>
          ) : (
            <Link href="/sign-up" className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-medium text-lg">
              เริ่มใช้งานฟรี
            </Link>
          )}
          <Link href="/pricing" className="border border-gray-600 hover:border-gray-400 px-6 py-3 rounded-xl font-medium text-lg text-gray-300">
            ดูราคา
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          {[
            { icon: "🔒", title: "Privacy First", desc: "ไฟล์เสียงของคุณไม่ถูกส่งออกนอกเครื่อง ทุกอย่างรันใน Browser" },
            { icon: "🤖", title: "AI ถอดเสียงอัตโนมัติ", desc: "ใช้ Whisper AI รองรับภาษาไทยได้ดี แก้ไขได้ก่อน Export" },
            { icon: "🎬", title: "Export พร้อม Subtitle", desc: "เบิร์น Subtitle ลงวิดีโอ หรือดาวน์โหลดไฟล์ .SRT" },
          ].map((f) => (
            <div key={f.title} className="bg-gray-800 rounded-xl p-5">
              <div className="text-3xl mb-2">{f.icon}</div>
              <div className="font-semibold mb-1">{f.title}</div>
              <div className="text-gray-400 text-sm">{f.desc}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

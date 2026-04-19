import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold text-blue-400">CaptionTH</span>
        <div className="flex gap-3">
          <Link href="/pricing" className="text-sm text-gray-400 hover:text-white px-3 py-1">ราคา</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-5xl font-bold mb-4">
          สร้าง <span className="text-blue-400">Caption ภาษาไทย</span>
          <br />บนเครื่องของคุณ
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-8">
          ดาวน์โหลดแอปและใช้งานได้เลย — ถอดเสียงด้วย Whisper AI บนเครื่องของคุณ
          เร็ว แม่น ไม่ต้องมีอินเทอร์เน็ต ไม่มี API Key
        </p>

        <div className="flex gap-4 flex-wrap justify-center mb-4">
          <a
            href="https://github.com/ToniKroosome/caption-th-web/releases/latest/download/CaptionTH-Mac.dmg"
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-medium text-lg flex items-center gap-2"
          >
             ดาวน์โหลดสำหรับ Mac
          </a>
          <a
            href="https://github.com/ToniKroosome/caption-th-web/releases/latest/download/CaptionTH-Windows.exe"
            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl font-medium text-lg flex items-center gap-2"
          >
             ดาวน์โหลดสำหรับ Windows
          </a>
        </div>
        <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-300 mt-2">
          ดูราคา — ฟรีมี Watermark, Pro ไม่มี
        </Link>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          {[
            { icon: "⚡", title: "เร็วและแม่น", desc: "ใช้ Whisper AI รันบนเครื่องคุณโดยตรง เร็วกว่า Browser มาก" },
            { icon: "🔒", title: "Privacy First", desc: "ไฟล์เสียงไม่ถูกส่งออกนอกเครื่องคุณเลย ปลอดภัย 100%" },
            { icon: "🎬", title: "Export พร้อม Subtitle", desc: "เบิร์น Subtitle ลงวิดีโอ หรือดาวน์โหลดไฟล์ .SRT / .TXT" },
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

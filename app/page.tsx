import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen text-white flex flex-col" style={{ backgroundImage: "url('/background.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <header className="border-b border-white/10 px-6 py-3 flex items-center" style={{ background: "rgba(10,22,40,0.85)", backdropFilter: "blur(8px)" }}>
        <div className="flex-1" />
        <Image src="/logo.jpg" alt="ทำมุซับบุ" width={208} height={208} style={{ borderRadius: 8 }} />
        <div className="flex-1 flex justify-end">
          <Link href="/pricing" className="text-sm text-gray-400 hover:text-white px-3 py-1">ราคา</Link>
        </div>
      </header>

      {/* Banner */}
      <div className="w-full">
        <Image src="/banner.jpg" alt="ทำมุซับบุ banner" width={1200} height={400} style={{ width: "100%", height: "auto", display: "block" }} priority />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16" style={{ background: "rgba(10,22,40,0.7)" }}>
        <h1 className="text-5xl font-bold mb-4">
          สร้าง <span className="text-blue-400">Caption ภาษาไทย</span>
          <br />บนเครื่องของคุณ
        </h1>
        <p className="text-gray-300 text-lg max-w-xl mb-8">
          ดาวน์โหลดแอปและใช้งานได้เลย — รันบนเครื่องของคุณโดยตรง
          เร็ว แม่น ไม่ต้องมีอินเทอร์เน็ต
        </p>

        <div className="flex gap-4 flex-wrap justify-center mb-4">
          <a
            href="https://github.com/ToniKroosome/caption-th-web/releases/latest/download/TumMuSubBu-Mac.dmg"
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-medium text-lg flex items-center gap-2"
          >
             ดาวน์โหลดสำหรับ Mac
          </a>
          <a
            href="https://github.com/ToniKroosome/caption-th-web/releases/latest/download/TumMuSubBu-Win.exe"
            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl font-medium text-lg flex items-center gap-2"
          >
             ดาวน์โหลดสำหรับ Windows
          </a>
        </div>
        <Link href="/pricing" className="text-sm text-gray-400 hover:text-gray-200 mt-2">
          ดูราคา — ฟรีมี Watermark, Pro ไม่มี
        </Link>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          {[
            { icon: "⚡", title: "เร็วและแม่น", desc: "รันบนเครื่องคุณโดยตรง เร็วและแม่นมาก" },
            { icon: "🔒", title: "Privacy First", desc: "ไฟล์เสียงไม่ถูกส่งออกนอกเครื่องคุณเลย ปลอดภัย 100%" },
            { icon: "🎬", title: "Export พร้อม Subtitle", desc: "เบิร์น Subtitle ลงวิดีโอ หรือดาวน์โหลดไฟล์ .SRT / .TXT" },
          ].map((f) => (
            <div key={f.title} className="rounded-xl p-5" style={{ background: "rgba(30,40,60,0.8)" }}>
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

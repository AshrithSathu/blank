import { auth, signOut } from "@/auth";
import Image from "next/image";
import Link from "next/link";
export default async function Home() {
  const session = await auth();
  console.log(session);
  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-4xl font-bold text-white">
          <Link href="/api/auth/signin">Sign In</Link>
        </h1>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Hello {session.user?.name}</h1>
        <Image
          src={session.user?.image || ""}
          alt="User Image"
          width={100}
          height={100}
        />
        <p className="text-lg">This is a test</p>
        <Link href="/api/auth/signout" className="text-blue-500">
          Sign Out
        </Link>
      </div>
    </div>
  );
}

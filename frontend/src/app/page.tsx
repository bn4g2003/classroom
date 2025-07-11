import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Classroom App</h1>
        
        <div className="space-y-4">
          <Link 
            href="/login/phone" 
            className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white hover:bg-blue-500 transition"
          >
            Sign In with Phone
          </Link>
          <Link 
            href="/login/email" 
            className="block w-full rounded-lg bg-gray-700 px-4 py-3 text-center font-semibold text-white hover:bg-gray-600 transition"
          >
            Sign In with Email
          </Link>
        </div>

        <div className="mt-8">
          <Link href="/register/instructor" className="text-sm text-gray-600 hover:text-blue-600">
            Don't have an account? <strong>Sign up as Instructor</strong>
          </Link>
        </div>
      </div>
    </main>
  );
}
import { SignInForm } from "@/components/auth/SignInForm"

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome Back</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Sign in to access your member dashboard
                    </p>
                </div>
                <SignInForm />
            </div>
        </div>
    )
}

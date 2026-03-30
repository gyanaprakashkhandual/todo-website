import { useState } from "react";
import { motion } from "framer-motion";
import { API_CONFIG, API_ENDPOINTS } from "../../configs/config";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

const features = [
  { icon: "⚡", text: "Drag & drop Kanban boards" },
  { icon: "🏷️", text: "Tags, priorities & due dates" },
  { icon: "📱", text: "Works on mobile & desktop" },
  { icon: "🔒", text: "Secure OAuth2 authentication" },
];

export default function AuthPage() {
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "github" | null
  >(null);

  const handleOAuth = (provider: "google" | "github") => {
    setLoadingProvider(provider);
    const endpoint =
      provider === "google"
        ? API_ENDPOINTS.AUTH.GOOGLE_LOGIN
        : API_ENDPOINTS.AUTH.GITHUB_LOGIN;
    window.location.href = `${API_CONFIG.BASE_URL}${endpoint}`;
  };

  return (
    <div className="select-none min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 w-full max-w-md lg:max-w-none"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800/80 text-xs font-medium text-gray-500 dark:text-gray-400 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Available on mobile &amp; desktop
            </div>

            <h1 className="text-XL sm:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white leading-[1.15] tracking-tight mb-4 ">
              TASK THAT ACT
              <br />
              <span className="text-gray-400 dark:text-gray-600 font-normal">
                ...ually get done.
              </span>
            </h1>

            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-8 max-w-sm">
              A focused todo manager with Kanban boards, smart filters, and a
              clean UI built for how you actually work.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f) => (
                <li key={f.text} className="flex items-center gap-3">
                  <span className="text-base leading-none">{f.icon}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="w-full max-w-90 shrink-0"
          >
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-7 sm:p-8">
              <div className="mb-7">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Sign in to Todo
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose a provider to get started
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  disabled={loadingProvider !== null}
                  onClick={() => handleOAuth("google")}
                  className="relative w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-200 text-sm font-medium transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {loadingProvider === "google" ? (
                    <svg
                      className="w-4 h-4 animate-spin text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      />
                    </svg>
                  ) : (
                    <GoogleIcon />
                  )}
                  <span>Continue with Google</span>
                  <svg
                    className="w-3.5 h-3.5 ml-auto text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors"
                    fill="none"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M6 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  disabled={loadingProvider !== null}
                  onClick={() => handleOAuth("github")}
                  className="relative w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-200 text-sm font-medium transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {loadingProvider === "github" ? (
                    <svg
                      className="w-4 h-4 animate-spin text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      />
                    </svg>
                  ) : (
                    <GithubIcon />
                  )}
                  <span>Continue with GitHub</span>
                  <svg
                    className="w-3.5 h-3.5 ml-auto text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors"
                    fill="none"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M6 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              </div>

              <p className="mt-6 text-xs text-center text-gray-400 dark:text-gray-600 leading-relaxed">
                By signing in you agree to our{" "}
                <a
                  href="/terms-and-conditions"
                  className="text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Terms
                </a>{" "}
                and{" "}
                <a
                  href="/privacy-policy"
                  className="text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Privacy Policy
                </a>
              </p>
            </div>

            <p className="mt-5 text-xs text-center text-gray-400 dark:text-gray-600">
              No password needed — sign in with your existing account
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

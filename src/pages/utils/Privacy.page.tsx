import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  {
    title: "Information We Collect",
    body: `When you sign in to Todo using Google or GitHub OAuth2, we receive your name, email address, and profile picture from your chosen provider. We do not collect passwords. Beyond authentication, we store the tasks, notes, tags, and metadata you create within the Service. We may also collect anonymized usage data such as feature interaction counts to improve the product.`,
  },
  {
    title: "How We Use Your Information",
    body: `We use your information solely to provide, operate, and improve Todo. This includes authenticating your identity, storing and syncing your tasks across sessions, and sending important service notifications. We do not use your data for advertising, and we do not build advertising profiles from your usage.`,
  },
  {
    title: "Data Storage & Security",
    body: `Your data is stored in a PostgreSQL database hosted on secure infrastructure. Passwords are never stored — authentication is handled entirely by OAuth2 providers. Sensitive fields are encrypted at rest. We use HTTPS for all data in transit. While we take reasonable precautions, no system is completely secure, and we cannot guarantee absolute data security.`,
  },
  {
    title: "Third-Party Services",
    body: `Todo uses Google and GitHub for OAuth2 authentication. When you choose to sign in with either provider, you are subject to their respective privacy policies. We do not share your personal data with any other third parties, advertisers, or data brokers. We may use infrastructure providers (hosting, database) who process data on our behalf under strict data processing agreements.`,
  },
  {
    title: "Cookies & Local Storage",
    body: `We use browser local storage to store your authentication token and session preferences such as dark/light mode and filter state. We do not use tracking cookies or third-party analytics cookies. You can clear local storage at any time through your browser settings, which will sign you out of the Service.`,
  },
  {
    title: "Data Retention",
    body: `We retain your account data and tasks for as long as your account is active. If you stop using Todo and request deletion, we will remove your personal data and all associated content within 30 days. Anonymized, aggregated usage statistics may be retained indefinitely as they cannot identify you.`,
  },
  {
    title: "Your Rights",
    body: `You have the right to access, correct, or delete the personal data we hold about you at any time. You may export your task data or request full account deletion by contacting us through the support link. If you are in the European Economic Area, you also have rights under GDPR including the right to data portability and the right to lodge a complaint with a supervisory authority.`,
  },
  {
    title: "Children's Privacy",
    body: `Todo is not directed at children under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child under 13 has provided us with personal data, we will delete it promptly. If you believe we may have collected such information, please contact us immediately.`,
  },
  {
    title: "Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. When we do, we will update the "last updated" date at the top of this page. For significant changes, we will notify you via the email address associated with your account. Continued use of the Service after changes constitutes your acceptance of the updated policy.`,
  },
  {
    title: "Contact Us",
    body: `If you have questions, concerns, or requests regarding your privacy or this policy, please reach out via the support link in the footer. We are committed to resolving privacy concerns promptly and transparently.`,
  },
];

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <motion.div className="mb-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 mb-4">
            Legal
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-600">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </motion.div>

        <motion.p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-10 pb-10 border-b border-gray-100 dark:border-gray-800">
          Your privacy matters to us. This policy explains what data we collect,
          how we use it, and the controls you have over your information when
          using Todo.
        </motion.p>

        <div className="space-y-8">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.12 + i * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="pb-8 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="shrink-0 w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pl-9">
                {section.body}
              </p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800/60 px-5 sm:px-8 py-6">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} Todo. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-600">
            <button
              onClick={() => navigate("/terms-and-conditions")}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate("/")}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Back to home
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

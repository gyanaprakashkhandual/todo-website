import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    body: `By accessing or using Todo ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. We reserve the right to update these terms at any time, and continued use of the Service after changes constitutes your acceptance of the new terms.`,
  },
  {
    title: "Use of the Service",
    body: `Todo is provided for personal and professional task management. You agree to use the Service only for lawful purposes and in accordance with these Terms. You must not misuse the Service by introducing malicious code, attempting unauthorized access, or interfering with other users' experience.`,
  },
  {
    title: "Account & Authentication",
    body: `Access to Todo is provided via OAuth2 through Google or GitHub. You are responsible for maintaining the security of your connected account and for all activity that occurs under your session. We are not liable for any loss or damage arising from unauthorized access due to your failure to protect your credentials.`,
  },
  {
    title: "Your Content",
    body: `You retain full ownership of all tasks, notes, and data you create within Todo. By using the Service, you grant us a limited, non-exclusive license to store and process your content solely for the purpose of providing the Service to you. We do not share, sell, or use your content for advertising.`,
  },
  {
    title: "Service Availability",
    body: `We strive to maintain high availability but do not guarantee uninterrupted access to the Service. We may perform maintenance, updates, or experience outages that temporarily affect availability. We are not liable for any loss resulting from downtime or service interruptions.`,
  },
  {
    title: "Termination",
    body: `You may stop using the Service at any time. We reserve the right to suspend or terminate your access if you violate these Terms or engage in conduct that harms the Service or other users. Upon termination, your data may be deleted in accordance with our data retention policy.`,
  },
  {
    title: "Disclaimer of Warranties",
    body: `The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We disclaim all warranties including merchantability, fitness for a particular purpose, and non-infringement to the fullest extent permitted by law.`,
  },
  {
    title: "Limitation of Liability",
    body: `To the maximum extent permitted by applicable law, Todo and its creators shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use or inability to use the Service, even if we have been advised of the possibility of such damages.`,
  },
  {
    title: "Contact",
    body: `If you have questions about these Terms, please reach out via the support link in the footer. We aim to respond to all inquiries within 2 business days.`,
  },
];

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <motion.div className="mb-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 mb-4">
            Legal
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
            Terms of Service
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
          Please read these Terms of Service carefully before using Todo. These
          terms govern your access to and use of our task management application
          and related services.
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
              onClick={() => navigate("/privacy-policy")}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Privacy Policy
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

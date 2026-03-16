import React from "react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col items-center justify-center py-0 px-0">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-green-200 p-6 md:p-10 mx-2 my-6 overflow-y-auto" style={{ maxHeight: '90vh' }}>
        <button
          className="mb-6 px-5 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition self-start"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h1 className="text-3xl font-extrabold mb-4 text-green-700 text-center">Privacy Policy – Freshwayz App <small>Powered By MYAMIGO TECH SOLUTIONS PRIVATE LIMITED</small></h1>
        <p className="mb-6 text-green-900 text-center">At Freshways, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use the Freshways mobile application.</p>
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-2 text-green-700">1. Information We Collect</h2>
            <ul className="list-disc ml-6 text-green-900 space-y-1">
              <li>Name</li>
              <li>Mobile number</li>
              <li>Email address</li>
              <li>Location details (for service or delivery purposes)</li>
              <li>Basic technical and usage information related to the app</li>
            </ul>
            <p className="mt-2 text-green-900">This information is collected only to provide and improve our services.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-2 text-green-700">2. How We Use Your Information</h2>
            <ul className="list-disc ml-6 text-green-900 space-y-1">
              <li>Processing orders and providing services</li>
              <li>Managing user accounts</li>
              <li>Customer support and communication</li>
              <li>Improving app functionality and user experience</li>
            </ul>
            <p className="mt-2 text-green-900">We do not sell, rent, or trade your personal information to third parties, except when required by law.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-2 text-green-700">3. Data Security</h2>
            <p className="text-green-900">We take appropriate security measures to protect your personal data from unauthorized access, misuse, or disclosure. While we strive to use commercially acceptable means to protect your information, no method of transmission over the internet is 100% secure.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-2 text-green-700">4. Third-Party Services</h2>
            <p className="text-green-900">The Freshways app may use third-party services such as payment gateways or analytics tools. These services may collect information according to their own privacy policies. Freshways is not responsible for the privacy practices of third-party services.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-2 text-green-700">5. Children’s Privacy</h2>
            <p className="text-green-900">Freshways does not knowingly collect personal information from children under the age of 13. If you believe that a child has provided us with personal data, please contact us and we will take appropriate action.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-2 text-green-700">6. Changes to This Privacy Policy</h2>
            <p className="text-green-900">We may update this Privacy Policy from time to time. Any changes will be reflected on this page or within the app. We encourage users to review this policy periodically.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-2 text-green-700">7. Contact Us</h2>
            <ul className="list-disc ml-6 text-green-900">
              <li>Email: support@freshways.in</li>
              <li>App Name: Freshways</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

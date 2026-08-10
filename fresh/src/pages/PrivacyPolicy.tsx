import React from "react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div
      className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-green-200 p-6 md:p-10 mx-2 my-6 overflow-y-auto"
      style={{ maxHeight: "90vh" }}
    >
      <button
        className="mb-6 px-5 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition self-start"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Privacy Policy – Freshwayz App
          </h1>

          <p>
            <strong>Powered By MYAMIGO TECH SOLUTIONS PRIVATE LIMITED</strong>
          </p>

          <p className="mt-3">
            At Freshwayz, we value your privacy and are committed to
            protecting your personal information. This Privacy Policy explains
            how we collect, use, and safeguard your data when you use the
            Freshwayz mobile application.
          </p>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            1. Information We Collect
          </h2>

          <ul className="list-disc pl-6 space-y-1">
            <li>Name</li>
            <li>Mobile number</li>
            <li>Email address</li>
            <li>Location details (for service or delivery purposes)</li>
            <li>
              Basic technical and usage information related to the app
            </li>
          </ul>

          <p className="mt-3">
            This information is collected only to provide and improve our
            services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            2. How We Use Your Information
          </h2>

          <ul className="list-disc pl-6 space-y-1">
            <li>Processing orders and providing services</li>
            <li>Managing user accounts</li>
            <li>Customer support and communication</li>
            <li>Improving app functionality and user experience</li>
          </ul>

          <p className="mt-3">
            We do not sell, rent, or trade your personal information to third
            parties, except when required by law or when necessary to provide
            services through trusted service providers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            3. Data Security
          </h2>

          <p>
            We take appropriate security measures to protect your personal
            data from unauthorized access, misuse, or disclosure. While we
            strive to use commercially acceptable means to protect your
            information, no method of transmission over the internet is 100%
            secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            4. Third-Party Services
          </h2>

          <p>
            The Freshwayz app may use third-party services such as payment
            gateways, analytics tools, cloud services, and other service
            providers. These services may process information according to
            their own privacy policies. Freshwayz is not responsible for the
            privacy practices of third-party services beyond our control.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
  5. Google Gemini AI and Data Processing
</h2>

<p>
  Freshwayz uses Google's Gemini 2.5 artificial intelligence services
  to provide certain AI-powered features within the application.
</p>

<p className="mt-3">
  When you use an AI-powered feature, information that you provide to
  that feature, including text, prompts, questions, and other content
  submitted for processing, may be transmitted to Google Gemini for the
  purpose of generating an AI response or providing the requested
  AI-powered functionality.
</p>

<p className="mt-3">
  Depending on the AI feature you use, the information submitted for
  processing may also include relevant context required to provide the
  requested response or recommendation.
</p>

<p className="mt-3">
  The information transmitted to Gemini is processed by Google as a
  third-party AI service provider. Processing may include receiving your
  input, processing the submitted content, generating a response, and
  applying Google's applicable safety and abuse-prevention measures.
</p>

<p className="mt-3">
  Freshwayz does not intentionally send personal information to Gemini
  unless that information is included in the content or context submitted
  through an AI-powered feature. Users should avoid submitting unnecessary
  sensitive, confidential, or personal information through AI features.
</p>

<p className="mt-3">
  Before using an AI-powered feature that requires transmission of
  information to Google Gemini, Freshwayz provides an in-app privacy
  notice and requests the user's explicit consent before the AI request
  is sent.
</p>

<p className="mt-3">
  Google's processing of information submitted to Gemini is subject to
  Google's applicable terms and privacy practices. For more information,
  please review Google's applicable Gemini API terms and data processing
  documentation.
</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            6. Children’s Privacy
          </h2>

          <p>
            Freshwayz does not knowingly collect personal information from
            children under the age of 13. If you believe that a child has
            provided us with personal data, please contact us and we will take
            appropriate action.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            7. Changes to This Privacy Policy
          </h2>

          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be reflected on this page or within the app. We encourage
            users to review this policy periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            8. Contact Us
          </h2>

          <p>
            <strong>Email:</strong>{" "}
            <a
              href="mailto:support@freshways.in"
              className="text-green-600 hover:underline"
            >
              support@freshways.in
            </a>
          </p>

          <p>
            <strong>App Name:</strong> Freshwayz
          </p>
        </section>
      </div>
    </div>
  );
}
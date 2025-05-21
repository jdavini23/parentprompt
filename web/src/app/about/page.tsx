import React from 'react';

export const metadata = {
  title: 'About | ParentPrompt',
  description: 'Learn about ParentPrompt and our mission',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">About ParentPrompt</h1>

        <div className="prose prose-lg mx-auto">
          <p className="lead text-xl text-gray-600 mb-8">
            ParentPrompt is a platform designed to help parents engage with their children through
            AI-generated conversation starters, activities, and educational prompts tailored to
            their children's ages and interests.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
          <p>
            We believe that meaningful conversations and shared activities are the foundation of
            strong parent-child relationships. Our mission is to provide parents with tools that
            make it easier to connect with their children in today's busy world.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>Create a profile</strong> for each of your children, including their age,
              interests, and learning goals.
            </li>
            <li>
              <strong>Receive personalized prompts</strong> designed to spark conversation,
              encourage learning, and create memorable moments.
            </li>
            <li>
              <strong>Schedule delivery</strong> of prompts to fit your family's routine - whether
              it's dinner table conversation starters or weekend activity ideas.
            </li>
            <li>
              <strong>Save your favorites</strong> to revisit activities that resonated with your
              family.
            </li>
          </ol>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Family First:</strong> We design every feature with the goal of strengthening
              family bonds.
            </li>
            <li>
              <strong>Privacy:</strong> We take your family's privacy seriously and never share your
              information with third parties.
            </li>
            <li>
              <strong>Inclusivity:</strong> Our prompts are designed to be inclusive and respectful
              of diverse family structures and backgrounds.
            </li>
            <li>
              <strong>Growth:</strong> We're constantly learning and improving our platform based on
              parent feedback.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Get Started</h2>
          <p>
            Ready to enhance your family conversations and activities? Sign up today and discover
            the difference that intentional engagement can make in your family life.
          </p>

          <div className="mt-8 text-center">
            <a
              href="/signup"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Create Your Free Account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

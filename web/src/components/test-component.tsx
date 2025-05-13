// This is a test component to verify ESLint and Prettier configuration
import React from 'react';

interface TestComponentProps {
  title: string;
  description?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ title, description }) => {
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="mt-2 text-gray-600">{description}</p>}
    </div>
  );
};

export default TestComponent;

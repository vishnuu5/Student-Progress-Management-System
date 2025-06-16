import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ContestHistory from './ContestHistory';
import ProblemSolvingData from './ProblemSolvingData';
import SubmissionHeatmap from './SubmissionHeatmap';

const StudentProfile = ({ student }) => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('contests');
  const [contestFilter, setContestFilter] = useState(30); // days
  const [problemFilter, setProblemFilter] = useState(30); // days

  const tabs = [
    { id: 'contests', label: 'Contest History' },
    { id: 'problems', label: 'Problem Solving' },
    { id: 'heatmap', label: 'Submission Heatmap' }
  ];

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{student.name}</h2>
        <p className="text-sm opacity-75">
          Codeforces Handle: {student.codeforcesHandle}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 ${
                activeTab === tab.id
                  ? isDarkMode
                    ? 'border-b-2 border-blue-500 text-blue-400'
                    : 'border-b-2 border-blue-600 text-blue-600'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'contests' && (
        <div>
          <div className="mb-4">
            <label className="mr-2">Filter by:</label>
            <select
              value={contestFilter}
              onChange={(e) => setContestFilter(Number(e.target.value))}
              className={`px-3 py-1 rounded ${
                isDarkMode
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-900 border-gray-300'
              } border`}
            >
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last 365 days</option>
            </select>
          </div>
          <ContestHistory
            studentId={student._id}
            days={contestFilter}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {activeTab === 'problems' && (
        <div>
          <div className="mb-4">
            <label className="mr-2">Filter by:</label>
            <select
              value={problemFilter}
              onChange={(e) => setProblemFilter(Number(e.target.value))}
              className={`px-3 py-1 rounded ${
                isDarkMode
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-900 border-gray-300'
              } border`}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          <ProblemSolvingData
            studentId={student._id}
            days={problemFilter}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {activeTab === 'heatmap' && (
        <SubmissionHeatmap
          studentId={student._id}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default StudentProfile; 
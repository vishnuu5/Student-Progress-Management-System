import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FaEdit, FaTrash, FaDownload, FaEye, FaBell, FaBellSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const StudentTable = ({ students, onDelete, onEdit, onExport, onToggleReminder }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    setFilteredStudents(students);
  }, [students]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedStudents = [...filteredStudents].sort((a, b) => {
      if (key === 'name') {
        return direction === 'ascending' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (key === 'currentRating' || key === 'maxRating') {
        return direction === 'ascending'
          ? (a[key] || 0) - (b[key] || 0)
          : (b[key] || 0) - (a[key] || 0);
      }
      if (key === 'lastUpdate') {
        return direction === 'ascending'
          ? new Date(a.lastUpdate) - new Date(b.lastUpdate)
          : new Date(b.lastUpdate) - new Date(a.lastUpdate);
      }
      return 0;
    });

    setFilteredStudents(sortedStudents);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(value.toLowerCase()) ||
      student.codeforcesHandle.toLowerCase().includes(value.toLowerCase()) ||
      student.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleViewProfile = (studentId) => {
    navigate(`/students/${studentId}`);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={handleSearch}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300'
            }`}
          />
        </div>
        {user?.role === 'admin' && (
          <div className="flex gap-2">
            <button
              onClick={onExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FaDownload /> Export
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${
          isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
        }`}>
          <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name {getSortIcon('name')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('codeforcesHandle')}
              >
                Codeforces Handle {getSortIcon('codeforcesHandle')}
              </th>
              <th 
                scope="col" 
                className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('currentRating')}
              >
                Current Rating {getSortIcon('currentRating')}
              </th>
              <th 
                scope="col" 
                className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('maxRating')}
              >
                Max Rating {getSortIcon('maxRating')}
              </th>
              <th 
                scope="col" 
                className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('lastUpdate')}
              >
                Last Update {getSortIcon('lastUpdate')}
              </th>
              <th 
                scope="col" 
                className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                Reminders
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDarkMode ? 'divide-gray-700 bg-gray-900' : 'divide-gray-200 bg-white'
          }`}>
            {filteredStudents.map((student) => (
              <tr key={student._id} className={isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.name}
                    </div>
                    <div className="md:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <div>Current Rating: {student.currentRating || 'N/A'}</div>
                      <div>Max Rating: {student.maxRating || 'N/A'}</div>
                      <div>Last Update: {student.lastUpdate ? new Date(student.lastUpdate).toLocaleDateString() : 'N/A'}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span>Reminders:</span>
                        <button
                          onClick={() => onToggleReminder(student._id)}
                          className={`p-1 rounded-full ${
                            student.remindersEnabled 
                              ? 'text-green-600 hover:text-green-700' 
                              : 'text-gray-400 hover:text-gray-500'
                          }`}
                          title={student.remindersEnabled ? 'Disable reminders' : 'Enable reminders'}
                        >
                          {student.remindersEnabled ? <FaBell size={14} /> : <FaBellSlash size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {student.codeforcesHandle}
                  </div>
                </td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {student.currentRating || 'N/A'}
                  </div>
                </td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {student.maxRating || 'N/A'}
                  </div>
                </td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {student.lastUpdate ? new Date(student.lastUpdate).toLocaleDateString() : 'N/A'}
                  </div>
                </td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onToggleReminder(student._id)}
                    className={`p-2 rounded-full ${
                      student.remindersEnabled 
                        ? 'text-green-600 hover:text-green-700' 
                        : 'text-gray-400 hover:text-gray-500'
                    }`}
                    title={student.remindersEnabled ? 'Disable reminders' : 'Enable reminders'}
                  >
                    {student.remindersEnabled ? <FaBell /> : <FaBellSlash />}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleViewProfile(student._id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View Profile"
                    >
                      <FaEye />
                    </button>
                    {user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => onEdit(student)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => onDelete(student._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable; 
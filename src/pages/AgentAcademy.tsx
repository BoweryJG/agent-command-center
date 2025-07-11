import React from 'react';
import { motion } from 'framer-motion';

const AgentAcademy: React.FC = () => {
  const courses = [
    {
      id: 1,
      title: 'Customer Service Excellence',
      progress: 75,
      modules: 12,
      duration: '4 hours',
      difficulty: 'Intermediate',
      icon: '🎯',
    },
    {
      id: 2,
      title: 'Advanced Conversation Flow',
      progress: 45,
      modules: 8,
      duration: '3 hours',
      difficulty: 'Advanced',
      icon: '💬',
    },
    {
      id: 3,
      title: 'Emotional Intelligence Training',
      progress: 90,
      modules: 6,
      duration: '2 hours',
      difficulty: 'Beginner',
      icon: '❤️',
    },
    {
      id: 4,
      title: 'Technical Support Mastery',
      progress: 30,
      modules: 10,
      duration: '5 hours',
      difficulty: 'Advanced',
      icon: '🔧',
    },
  ];

  const learningPaths = [
    { name: 'Sales Specialist', agents: 5, completion: 60 },
    { name: 'Support Expert', agents: 8, completion: 75 },
    { name: 'Creative Assistant', agents: 3, completion: 40 },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-electric-pink to-electric-purple bg-clip-text text-transparent">
          Agent Academy
        </h1>
        <p className="text-text-secondary mt-2">
          Train and enhance your AI agents with specialized courses
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Learners', value: '16', icon: '🎓' },
          { label: 'Courses Completed', value: '42', icon: '✅' },
          { label: 'Avg. Performance', value: '87%', icon: '📊' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="neural-card text-center"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-text-muted text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Library */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="neural-card">
            <h3 className="text-xl font-semibold mb-4">Available Courses</h3>
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-lg bg-neural-light/50 hover:bg-neural-light transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{course.icon}</span>
                        <div>
                          <h4 className="font-medium text-lg">{course.title}</h4>
                          <p className="text-sm text-text-muted">
                            {course.modules} modules • {course.duration} • {course.difficulty}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-text-muted">Progress</span>
                          <span className="text-xs text-text-muted">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-neural-dark rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-electric-pink to-electric-purple h-2 rounded-full transition-all duration-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <button className="ml-4 px-4 py-2 rounded-lg bg-electric-purple/20 text-electric-purple opacity-0 group-hover:opacity-100 transition-opacity">
                      Continue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Training Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="neural-card mt-6"
          >
            <h3 className="text-xl font-semibold mb-4">Upcoming Training Sessions</h3>
            <div className="space-y-3">
              {[
                { agent: 'Harvey', course: 'Advanced Conversation Flow', time: 'In 2 hours' },
                { agent: 'Synthia', course: 'Emotional Intelligence', time: 'Tomorrow, 10 AM' },
                { agent: 'Echo', course: 'Technical Support', time: 'Tomorrow, 2 PM' },
              ].map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-neural-light/50"
                >
                  <div>
                    <p className="font-medium">{session.agent}</p>
                    <p className="text-sm text-text-muted">{session.course}</p>
                  </div>
                  <span className="text-sm text-electric-purple">{session.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Learning Paths */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="neural-card">
            <h3 className="text-xl font-semibold mb-4">Learning Paths</h3>
            <div className="space-y-4">
              {learningPaths.map((path) => (
                <div key={path.name} className="p-4 rounded-lg bg-neural-light/50">
                  <h4 className="font-medium mb-2">{path.name}</h4>
                  <div className="flex items-center justify-between text-sm text-text-muted mb-2">
                    <span>{path.agents} agents enrolled</span>
                    <span>{path.completion}%</span>
                  </div>
                  <div className="w-full bg-neural-dark rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-electric-blue to-electric-purple h-1.5 rounded-full"
                      style={{ width: `${path.completion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 neural-button">
              Create Custom Path
            </button>
          </div>

          {/* Performance Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="neural-card mt-6"
          >
            <h3 className="text-xl font-semibold mb-4">Top Performers</h3>
            <div className="space-y-3">
              {[
                { agent: 'Harvey', score: 95, trend: 'up' },
                { agent: 'Nova', score: 92, trend: 'up' },
                { agent: 'Synthia', score: 88, trend: 'stable' },
              ].map((performer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-neural-light/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-lg font-bold ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-400' :
                      'text-orange-400'
                    }`}>
                      #{index + 1}
                    </div>
                    <p className="font-medium">{performer.agent}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{performer.score}%</span>
                    <span className={`text-sm ${
                      performer.trend === 'up' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {performer.trend === 'up' ? '↑' : '→'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AgentAcademy;
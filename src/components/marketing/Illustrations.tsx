import { motion } from 'framer-motion';

// Dashboard Chart Illustration with animations
export function DashboardChart() {
  return (
    <motion.div 
      className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-end justify-between h-full gap-2">
        {[65, 45, 80, 60, 90, 70, 85, 55, 75, 65, 80, 70].map((height, index) => (
          <motion.div
            key={index}
            className="bg-gradient-to-t from-green-500 to-green-400 rounded-t flex-1"
            style={{ height: `${height}%` }}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
          />
        ))}
      </div>
      <motion.div 
        className="mt-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <div className="text-2xl font-bold text-gray-900">$24,580</div>
        <div className="text-sm text-gray-600">Total Revenue</div>
      </motion.div>
    </motion.div>
  );
}

// Active Users Chart with vivid animations
export function ActiveUsersChart() {
  return (
    <motion.div 
      className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-end justify-between h-full gap-1">
        {[40, 60, 45, 80, 70, 90, 75, 85, 70, 95, 80, 100].map((height, index) => (
          <motion.div
            key={index}
            className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t flex-1"
            style={{ height: `${height}%` }}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
          />
        ))}
      </div>
      <motion.div 
        className="mt-3 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <div className="text-lg font-bold text-blue-600">1,247</div>
        <div className="text-xs text-blue-600">Active Users</div>
      </motion.div>
    </motion.div>
  );
}

// Revenue Chart with vivid animations
export function RevenueChart() {
  return (
    <motion.div 
      className="w-full h-48 bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg p-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-end justify-between h-full gap-1">
        {[30, 50, 40, 70, 60, 85, 65, 80, 55, 90, 75, 95].map((height, index) => (
          <motion.div
            key={index}
            className="bg-gradient-to-t from-brand-500 to-brand-400 rounded-t flex-1"
            style={{ height: `${height}%` }}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
          />
        ))}
      </div>
      <motion.div 
        className="mt-3 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <div className="text-lg font-bold text-brand-600">$1,240</div>
        <div className="text-xs text-brand-600">Revenue Today</div>
      </motion.div>
    </motion.div>
  );
}

// Integration Network Illustration with vivid animations
export function IntegrationNetwork() {
  return (
    <motion.div 
      className="relative w-full h-80 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Central Logo with pulsing animation */}
      <motion.div 
        className="absolute z-10 w-20 h-20 bg-green-600 rounded-full flex items-center justify-center shadow-lg"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-green-600">CV</span>
        </div>
      </motion.div>
      
      {/* Integration Nodes with staggered animations */}
      {[
        { position: "top-8 left-8", icon: "💳", delay: 0.2 },
        { position: "top-8 right-8", icon: "👤", delay: 0.4 },
        { position: "bottom-8 left-8", icon: "💬", delay: 0.6 },
        { position: "bottom-8 right-8", icon: "📊", delay: 0.8 }
      ].map((node, index) => (
        <motion.div 
          key={index}
          className={`absolute ${node.position} w-16 h-16 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center shadow-lg`}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: node.delay,
            type: "spring",
            stiffness: 200
          }}
          whileHover={{ 
            scale: 1.1, 
            rotate: 5,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
          }}
        >
          <span className="text-2xl">{node.icon}</span>
        </motion.div>
      ))}
      
      {/* Animated Connection Lines */}
      <motion.svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 400 300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <defs>
          <pattern id="dashed" patternUnits="userSpaceOnUse" width="8" height="8">
            <motion.path 
              d="M 0,8 l 8,0" 
              stroke="#10B981" 
              strokeWidth="2" 
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1.2 }}
            />
          </pattern>
        </defs>
        <motion.line 
          x1="200" y1="150" x2="100" y2="100" 
          stroke="url(#dashed)" 
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
        />
        <motion.line 
          x1="200" y1="150" x2="300" y2="100" 
          stroke="url(#dashed)" 
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
        />
        <motion.line 
          x1="200" y1="150" x2="100" y2="200" 
          stroke="url(#dashed)" 
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
        />
        <motion.line 
          x1="200" y1="150" x2="300" y2="200" 
          stroke="url(#dashed)" 
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 2 }}
        />
      </motion.svg>
    </motion.div>
  );
}

// Analytics Dashboard Illustration with techy appearance
export function AnalyticsDashboard() {
  return (
    <motion.div 
      className="w-full h-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      whileHover={{ y: -5 }}
    >
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Analytics Dashboard</h3>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-medium text-gray-900 mb-3">Revenue Trends</h4>
            <div className="h-32 bg-gradient-to-r from-green-400 to-green-600 rounded flex items-end justify-center relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <div className="text-white font-bold relative z-10">Chart</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="font-medium text-gray-900 mb-3">User Activity</h4>
            <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600 rounded flex items-end justify-center relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
              />
              <div className="text-white font-bold relative z-10">Chart</div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Techy Data Visualization
export function TechyDataViz() {
  return (
    <motion.div 
      className="w-full h-64 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Floating data points */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-green-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
      
      <div className="relative z-10">
        <h3 className="text-white font-bold text-lg mb-4">Real-time Data Flow</h3>
        <div className="text-green-400 text-sm">Live Analytics Dashboard</div>
      </div>
    </motion.div>
  );
}
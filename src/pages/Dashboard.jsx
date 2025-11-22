import { Link } from 'react-router-dom';

const Dashboard = () => {
  const stats = [
    { name: 'Total Trees', value: '1,234', change: '+12%', color: 'green' },
    { name: 'Healthy Trees', value: '1,089', change: '+5%', color: 'green' },
    { name: 'Species', value: '45', change: '+2', color: 'blue' },
    { name: 'Recent Inspections', value: '89', change: '+18%', color: 'yellow' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your tree management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className={`text-sm mt-2 text-${stat.color}-600`}>{stat.change} from last month</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-gray-600">Loading activities...</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/trees/add" className="btn btn-primary w-full">
              Add New Tree
            </Link>
            <Link to="/health-records" className="btn btn-outline w-full">
              Record Health Check
            </Link>
            <Link to="/analytics" className="btn btn-outline w-full">
              View Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

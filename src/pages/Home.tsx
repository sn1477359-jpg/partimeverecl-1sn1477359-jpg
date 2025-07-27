import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Wallet, 
  Search, 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  MapPin,
  Users
} from 'lucide-react';

interface WalletSummary {
  totalEarned: number;
  pendingPayments: number;
  hoursWorked: number;
  jobsCompleted: number;
}

const Home: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [walletSummary, setWalletSummary] = useState<WalletSummary>({
    totalEarned: 0,
    pendingPayments: 0,
    hoursWorked: 0,
    jobsCompleted: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'student') {
      loadWalletSummary();
    }
    loadRecentJobs();
  }, [profile]);

  const loadWalletSummary = async () => {
    if (!profile) return;

    try {
      const { data: walletEntries, error } = await supabase
        .from('wallet_entries')
        .select('amount, duration_hours, status')
        .eq('student_id', profile.id);

      if (error) throw error;

      const summary = walletEntries.reduce(
        (acc, entry) => {
          if (entry.status === 'paid') {
            acc.totalEarned += entry.amount;
            acc.hoursWorked += entry.duration_hours || 0;
            acc.jobsCompleted += 1;
          } else {
            acc.pendingPayments += entry.amount;
          }
          return acc;
        },
        { totalEarned: 0, pendingPayments: 0, hoursWorked: 0, jobsCompleted: 0 }
      );

      setWalletSummary(summary);
    } catch (error) {
      console.error('Error loading wallet summary:', error);
    }
  };

  const loadRecentJobs = async () => {
    try {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select(`
          *,
          users:poster_id (name, rating)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setRecentJobs(jobs || []);
    } catch (error) {
      console.error('Error loading recent jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDistance = (lat1?: number, lon1?: number) => {
    // Mock distance calculation - in real app, use user's location
    if (!lat1 || !lon1) return 'N/A';
    return `${(Math.random() * 5 + 0.5).toFixed(1)} km`;
  };

  const formatTimeToReach = () => {
    return `${Math.floor(Math.random() * 20 + 5)} mins`;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white p-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {profile?.name}! 👋
        </h1>
        <p className="text-indigo-100">
          {profile?.role === 'student' 
            ? 'Ready to find your next opportunity?' 
            : 'Ready to find the perfect candidate?'
          }
        </p>
      </div>

      {/* Student Wallet Summary */}
      {profile?.role === 'student' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Wallet className="text-indigo-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Job Wallet</h2>
                <p className="text-gray-600">Your earnings overview</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/wallet')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View More →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="text-green-600" size={20} />
                <span className="text-sm font-medium text-green-700">Total Earned</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(walletSummary.totalEarned)}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="text-yellow-600" size={20} />
                <span className="text-sm font-medium text-yellow-700">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">
                {formatCurrency(walletSummary.pendingPayments)}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="text-blue-600" size={20} />
                <span className="text-sm font-medium text-blue-700">Hours</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {walletSummary.hoursWorked}h
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="text-purple-600" size={20} />
                <span className="text-sm font-medium text-purple-700">Jobs</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {walletSummary.jobsCompleted}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => navigate('/jobs')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
              <Search className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Find a Part-Time Job</h3>
              <p className="text-gray-600">Browse available opportunities near you</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/post-job')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
              <PlusCircle className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Post a Part-Time Job</h3>
              <p className="text-gray-600">Find the perfect candidate for your needs</p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Opportunities</h2>
          <button
            onClick={() => navigate('/jobs')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentJobs.slice(0, 6).map((job: any) => (
              <div
                key={job.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {formatCurrency(job.pay_offered)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{job.domain}</p>
                
                <div className="flex items-center text-xs text-gray-500 space-x-4">
                  <div className="flex items-center space-x-1">
                    <MapPin size={12} />
                    <span>{formatDistance(job.latitude, job.longitude)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{formatTimeToReach()}</span>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      by {job.users?.name || 'Anonymous'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-gray-600">
                        {job.users?.rating?.toFixed(1) || 'New'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
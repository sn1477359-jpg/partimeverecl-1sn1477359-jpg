import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Filter,
  Download,
  Calendar
} from 'lucide-react';

interface WalletEntry {
  id: string;
  amount: number;
  duration_hours: number;
  status: 'pending' | 'paid';
  payment_date: string | null;
  created_at: string;
  jobs: {
    title: string;
    users: {
      name: string;
    };
  };
}

const Wallet: React.FC = () => {
  const { profile } = useAuth();
  const [walletEntries, setWalletEntries] = useState<WalletEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'hours'>('date');

  useEffect(() => {
    if (profile?.role === 'student') {
      loadWalletEntries();
    }
  }, [profile, filter, sortBy]);

  const loadWalletEntries = async () => {
    if (!profile) return;

    try {
      let query = supabase
        .from('wallet_entries')
        .select(`
          *,
          jobs:job_id (
            title,
            users:poster_id (name)
          )
        `)
        .eq('student_id', profile.id);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const orderColumn = sortBy === 'date' ? 'created_at' : 
                         sortBy === 'amount' ? 'amount' : 'duration_hours';
      
      const { data, error } = await query.order(orderColumn, { ascending: false });

      if (error) throw error;
      setWalletEntries(data || []);
    } catch (error) {
      console.error('Error loading wallet entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = () => {
    return walletEntries.reduce(
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
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const summary = calculateSummary();

  if (profile?.role !== 'student') {
    return (
      <div className="text-center py-12">
        <WalletIcon className="mx-auto text-gray-400 mb-4" size={48} />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Wallet Not Available</h2>
        <p className="text-gray-600">The wallet feature is only available for students.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Wallet</h1>
          <p className="text-gray-600">Track your earnings and payment history</p>
        </div>
        
        <button className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          <Download size={20} />
          <span>Export</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="text-green-600" size={24} />
            <span className="text-sm font-medium text-green-700">Total Earned</span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(summary.totalEarned)}
          </p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="text-yellow-600" size={24} />
            <span className="text-sm font-medium text-yellow-700">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">
            {formatCurrency(summary.pendingPayments)}
          </p>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-blue-700">Hours Worked</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {summary.hoursWorked.toFixed(1)}h
          </p>
        </div>

        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle className="text-purple-600" size={24} />
            <span className="text-sm font-medium text-purple-700">Jobs Done</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {summary.jobsCompleted}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-500" />
              <span className="font-medium text-gray-700">Filter:</span>
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'paid' | 'pending')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Transactions</option>
              <option value="paid">Paid Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'hours')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="hours">Hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : walletEntries.length === 0 ? (
          <div className="p-12 text-center">
            <WalletIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600">
              Complete your first job to see your earnings here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {walletEntries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {entry.jobs?.title || 'Job Title'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {entry.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <span>by {entry.jobs?.users?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDate(entry.created_at)}</span>
                      </div>
                      {entry.duration_hours && (
                        <>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{entry.duration_hours}h</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {entry.status === 'paid' && entry.payment_date && (
                      <p className="text-xs text-green-600 mt-1">
                        Paid on {formatDate(entry.payment_date)}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-xl font-bold ${
                      entry.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {formatCurrency(entry.amount)}
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

export default Wallet;
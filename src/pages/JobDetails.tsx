import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Star,
  ArrowLeft,
  Send,
  CheckCircle
} from 'lucide-react';

interface JobDetails {
  id: string;
  title: string;
  domain: string;
  description: string;
  skills_required: string;
  gender_preference: string;
  age_preference: string;
  pay_offered: number;
  is_negotiable: boolean;
  location_address: string;
  start_time: string;
  end_time: string;
  optional_instructions: string;
  users: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
}

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [negotiationAmount, setNegotiationAmount] = useState('');
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (id) {
      loadJobDetails();
      checkApplicationStatus();
    }
  }, [id]);

  const loadJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          users:poster_id (id, name, phone, rating)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error loading job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!profile || profile.role !== 'student') return;

    try {
      const { data, error } = await supabase
        .from('applications')
        .select('status')
        .eq('job_id', id)
        .eq('student_id', profile.id)
        .single();

      if (data) {
        setApplicationStatus(data.status);
      }
    } catch (error) {
      // No application exists yet
    }
  };

  const handleApply = async () => {
    if (!job || !profile || !termsAccepted) return;

    setApplying(true);
    try {
      const { error } = await supabase
        .from('applications')
        .insert([
          {
            job_id: job.id,
            student_id: profile.id,
            original_pay: job.pay_offered,
            distance_km: Math.random() * 5 + 0.5, // Mock distance
            time_to_reach_min: Math.floor(Math.random() * 20 + 5), // Mock time
          },
        ]);

      if (error) throw error;

      setApplicationStatus('pending');
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleNegotiate = async () => {
    if (!job || !profile || !negotiationAmount || !termsAccepted) return;

    setApplying(true);
    try {
      const { error } = await supabase
        .from('applications')
        .insert([
          {
            job_id: job.id,
            student_id: profile.id,
            original_pay: job.pay_offered,
            negotiated_pay: parseFloat(negotiationAmount),
            status: 'negotiating',
            distance_km: Math.random() * 5 + 0.5, // Mock distance
            time_to_reach_min: Math.floor(Math.random() * 20 + 5), // Mock time
          },
        ]);

      if (error) throw error;

      setApplicationStatus('negotiating');
      setShowNegotiation(false);
      alert('Negotiation offer submitted successfully!');
    } catch (error) {
      console.error('Error submitting negotiation:', error);
      alert('Failed to submit negotiation. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const maskPhone = (phone: string) => {
    if (phone.length >= 10) {
      return `+91-${phone.slice(-10, -7)}XXXXX${phone.slice(-3)}`;
    }
    return phone;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'negotiating':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h2>
        <button
          onClick={() => navigate('/jobs')}
          className="text-indigo-600 hover:text-indigo-700"
        >
          ← Back to jobs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/jobs')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        <span>Back to jobs</span>
      </button>

      {/* Job Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                {job.domain}
              </span>
              {job.is_negotiable && (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                  Negotiable
                </span>
              )}
              {applicationStatus && (
                <span className={`px-3 py-1 rounded-full font-medium capitalize ${getStatusColor(applicationStatus)}`}>
                  {applicationStatus}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(job.pay_offered)}
            </div>
            {profile?.role === 'student' && !applicationStatus && (
              <div className="space-y-2">
                <button
                  onClick={handleApply}
                  disabled={applying || !termsAccepted}
                  className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {applying ? 'Applying...' : '🟢 Apply Now'}
                </button>
                {job.is_negotiable && (
                  <button
                    onClick={() => setShowNegotiation(true)}
                    disabled={applying || !termsAccepted}
                    className="w-full bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    🟡 Make an Offer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {profile?.role === 'student' && !applicationStatus && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">
                ✅ I accept the terms and conditions
              </span>
            </label>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Job Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {(job.skills_required || job.gender_preference || job.age_preference) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="space-y-3">
                {job.skills_required && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Skills Required</h3>
                    <p className="text-gray-700">{job.skills_required}</p>
                  </div>
                )}
                {job.gender_preference && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Gender Preference</h3>
                    <p className="text-gray-700">{job.gender_preference}</p>
                  </div>
                )}
                {job.age_preference && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Age Preference</h3>
                    <p className="text-gray-700">{job.age_preference}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optional Instructions */}
          {job.optional_instructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">Special Instructions</h2>
              <p className="text-blue-800 leading-relaxed">
                {job.optional_instructions}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="text-gray-400 mt-1" size={18} />
                <div>
                  <p className="font-medium text-gray-900">Start Time</p>
                  <p className="text-gray-600 text-sm">{formatDateTime(job.start_time)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="text-gray-400 mt-1" size={18} />
                <div>
                  <p className="font-medium text-gray-900">End Time</p>
                  <p className="text-gray-600 text-sm">{formatDateTime(job.end_time)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="text-gray-400 mt-1" size={18} />
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-600 text-sm">{job.location_address}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>⏱️ {Math.floor(Math.random() * 20 + 5)} mins to reach</span>
                    <span>📏 {(Math.random() * 5 + 0.5).toFixed(1)} km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Employer</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <User className="text-indigo-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {job.users.name.split(' ')[0]} {job.users.name.split(' ')[1]?.[0]}.
                  </p>
                  <div className="flex items-center space-x-1">
                    <Star className="text-yellow-400 fill-current" size={14} />
                    <span className="text-sm text-gray-600">
                      {job.users.rating?.toFixed(1) || 'New'} rating
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Phone className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  <p className="text-gray-600 text-sm">{maskPhone(job.users.phone)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Negotiation Modal */}
      {showNegotiation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Make an Offer</h2>
            <p className="text-gray-600 mb-4">
              Current offer: {formatCurrency(job.pay_offered)}
            </p>
            
            <div className="mb-4">
              <label htmlFor="negotiationAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Your offer amount
              </label>
              <input
                type="number"
                id="negotiationAmount"
                value={negotiationAmount}
                onChange={(e) => setNegotiationAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter amount"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowNegotiation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleNegotiate}
                disabled={!negotiationAmount || applying}
                className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Send size={16} />
                <span>{applying ? 'Sending...' : 'Send Offer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PlusCircle, DollarSign, MapPin, Clock, FileText, AlertCircle, Calendar, Users } from 'lucide-react';

const PostJob: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [genderPreference, setGenderPreference] = useState('');
  const [agePreference, setAgePreference] = useState('');
  const [payOffered, setPayOffered] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [optionalInstructions, setOptionalInstructions] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  const domains = [
    'Food & Beverage',
    'Retail',
    'Events',
    'Tutoring',
    'Delivery',
    'Data Entry',
    'Customer Service',
    'Other'
  ];

  const genderOptions = [
    { value: '', label: 'No preference' },
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Any', label: 'Any' }
  ];

  const ageOptions = [
    { value: '', label: 'No preference' },
    { value: '18-25', label: '18-25 years' },
    { value: '26-35', label: '26-35 years' },
    { value: '36-45', label: '36-45 years' },
    { value: '45+', label: '45+ years' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!profile) {
      setError('You must be logged in to post a job');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .insert([
          {
            poster_id: profile.id,
            title,
            domain,
            description,
            skills_required: skillsRequired || null,
            gender_preference: genderPreference || null,
            age_preference: agePreference || null,
            pay_offered: parseFloat(payOffered),
            is_negotiable: isNegotiable,
            location_address: locationAddress,
            start_time: startTime,
            end_time: endTime,
            optional_instructions: optionalInstructions || null,
            status: 'active'
          }
        ]);

      if (error) throw error;

      navigate('/jobs');
    } catch (err: any) {
      setError(err.message || 'An error occurred while posting the job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <PlusCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Post a New Job</h1>
              <p className="text-indigo-100 mt-1">Find the perfect candidate for your needs</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="e.g., Help with event setup and management"
              />
            </div>

            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                Domain *
              </label>
              <select
                id="domain"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              >
                <option value="">Select a domain</option>
                {domains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="payOffered" className="block text-sm font-medium text-gray-700 mb-2">
                Pay Offered (₹) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="payOffered"
                  required
                  min="1"
                  step="0.01"
                  value={payOffered}
                  onChange={(e) => setPayOffered(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div className="mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">Pay is negotiable</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="locationAddress"
                  required
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="e.g., MG Road, Bangalore"
                />
              </div>
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  id="startTime"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  id="endTime"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={startTime || new Date().toISOString().slice(0, 16)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="genderPreference" className="block text-sm font-medium text-gray-700 mb-2">
                Gender Preference
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="genderPreference"
                  value={genderPreference}
                  onChange={(e) => setGenderPreference(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                >
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="agePreference" className="block text-sm font-medium text-gray-700 mb-2">
                Age Preference
              </label>
              <select
                id="agePreference"
                value={agePreference}
                onChange={(e) => setAgePreference(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              >
                {ageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="skillsRequired" className="block text-sm font-medium text-gray-700 mb-2">
                Skills Required
              </label>
              <input
                type="text"
                id="skillsRequired"
                value={skillsRequired}
                onChange={(e) => setSkillsRequired(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="e.g., Good communication, Physical fitness, Experience with events"
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="description"
                  required
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Describe the job in detail. Include what the person will be doing, any requirements, and what you expect from them..."
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="optionalInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                id="optionalInstructions"
                rows={3}
                value={optionalInstructions}
                onChange={(e) => setOptionalInstructions(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                placeholder="Any additional instructions or requirements..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Posting...</span>
                </div>
              ) : (
                'Post Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
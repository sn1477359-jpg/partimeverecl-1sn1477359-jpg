import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Phone, 
  Mail, 
  Star, 
  Shield, 
  Edit3, 
  Save, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Profile: React.FC = () => {
  const { profile, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    aadhaar_masked: profile?.aadhaar_masked || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          aadhaar_masked: formData.aadhaar_masked,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      setEditing(false);
      alert('Profile updated successfully!');
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      aadhaar_masked: profile?.aadhaar_masked || '',
    });
    setEditing(false);
  };

  const maskPhone = (phone: string) => {
    if (phone.length >= 10) {
      return `+91-${phone.slice(-10, -7)}XXXXX${phone.slice(-3)}`;
    }
    return phone;
  };

  const getVerificationStatus = () => {
    switch (profile?.verification_status) {
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: 'Verified',
        };
      case 'rejected':
        return {
          icon: X,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: 'Rejected',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          text: 'Pending Verification',
        };
    }
  };

  const verificationStatus = getVerificationStatus();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <User className="text-indigo-600" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 capitalize">{profile?.role} Account</p>
            </div>
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Edit3 size={16} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Save size={16} />
                <span>{loading ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Verification Status */}
        <div className={`flex items-center space-x-3 p-4 rounded-lg ${verificationStatus.bgColor} mb-6`}>
          <verificationStatus.icon className={verificationStatus.color} size={24} />
          <div>
            <p className={`font-medium ${verificationStatus.color}`}>
              {verificationStatus.text}
            </p>
            <p className="text-sm text-gray-600">
              {profile?.verification_status === 'verified' 
                ? 'Your account has been verified and you can access all features.'
                : profile?.verification_status === 'rejected'
                ? 'Please contact support to resolve verification issues.'
                : 'Your documents are being reviewed. This may take 24-48 hours.'
              }
            </p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="text-gray-400" size={20} />
                  <span className="text-gray-900">{profile?.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="text-gray-400" size={20} />
                <span className="text-gray-900">{user?.email}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="text-gray-400" size={20} />
                  <span className="text-gray-900">{profile?.phone}</span>
                </div>
              )}
            </div>

            {profile?.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar (Masked)
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="aadhaar_masked"
                    value={formData.aadhaar_masked}
                    onChange={handleChange}
                    placeholder="XXXX-XXXX-1234"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="text-gray-400" size={20} />
                    <span className="text-gray-900">
                      {profile?.aadhaar_masked || 'Not provided'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Star className="text-yellow-400 fill-current" size={20} />
              <span className="text-gray-900">
                {profile?.rating && profile.rating > 0 
                  ? `${profile.rating.toFixed(1)} (${profile.total_ratings} reviews)`
                  : 'No ratings yet'
                }
              </span>
            </div>
          </div>

          {/* Account Stats */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Account Type:</span>
                <span className="font-medium text-gray-900 capitalize">{profile?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since:</span>
                <span className="font-medium text-gray-900">
                  {profile?.created_at && new Date(profile.created_at).toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Verification Status:</span>
                <span className={`font-medium capitalize ${verificationStatus.color}`}>
                  {profile?.verification_status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Ratings:</span>
                <span className="font-medium text-gray-900">
                  {profile?.total_ratings || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Shield className="text-blue-600 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Privacy & Security</h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              Your personal information is securely stored and only shared with relevant parties when necessary. 
              Phone numbers and ID details are masked when displayed to other users to protect your privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
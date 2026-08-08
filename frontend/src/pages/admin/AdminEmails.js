import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  EnvelopeIcon,
  PlusIcon,
  EyeIcon,
  PaperAirplaneIcon,
  TrashIcon,
  PencilIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminEmails = () => {
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns', 'create', 'individual', 'stats'
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    subject: '',
    content: '',
    template: 'marketing',
    recipients: 'all_users',
    specificRecipients: [],
    scheduledAt: ''
  });

  const [individualForm, setIndividualForm] = useState({
    email: '',
    userName: '',
    subject: '',
    content: '',
    template: 'marketing'
  });

  const queryClient = useQueryClient();

  // Fetch email campaigns
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery(
    ['emailCampaigns', currentPage, statusFilter],
    async () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        status: statusFilter
      });
      const response = await api.get(`/api/admin/email-campaigns?${params}`);
      return response.data;
    },
    { keepPreviousData: true }
  );

  // Fetch email stats
  const { data: statsData } = useQuery(
    'emailStats',
    async () => {
      const response = await api.get('/api/admin/email-campaigns/stats/overview');
      return response.data;
    }
  );

  // Fetch users for specific recipients
  const { data: usersData } = useQuery(
    'allUsers',
    async () => {
      const response = await api.get('/api/admin/users?limit=1000');
      return response.data.users;
    },
    { enabled: campaignForm.recipients === 'specific_users' }
  );

  // Create campaign mutation
  const createCampaignMutation = useMutation(
    (data) => api.post('/api/admin/email-campaigns', data),
    {
      onSuccess: () => {
        toast.success('Email campaign created successfully');
        setShowCampaignModal(false);
        resetCampaignForm();
        queryClient.invalidateQueries('emailCampaigns');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create campaign');
      }
    }
  );

  // Send campaign mutation
  const sendCampaignMutation = useMutation(
    (id) => api.post(`/api/admin/email-campaigns/${id}/send`),
    {
      onSuccess: (data) => {
        toast.success(`Campaign is being sent to ${data.data.totalRecipients} recipients`);
        queryClient.invalidateQueries('emailCampaigns');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to send campaign');
      }
    }
  );

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation(
    (id) => api.delete(`/api/admin/email-campaigns/${id}`),
    {
      onSuccess: () => {
        toast.success('Campaign deleted successfully');
        queryClient.invalidateQueries('emailCampaigns');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete campaign');
      }
    }
  );

  // Send individual email mutation
  const sendIndividualMutation = useMutation(
    (data) => api.post('/api/admin/send-individual-email', data),
    {
      onSuccess: () => {
        toast.success('Email sent successfully');
        resetIndividualForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to send email');
      }
    }
  );

  // Preview email mutation
  const previewMutation = useMutation(
    (data) => api.post('/api/admin/email-campaigns/preview', data),
    {
      onSuccess: (data) => {
        setPreviewContent(data.data.htmlContent);
        setShowPreviewModal(true);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to generate preview');
      }
    }
  );

  const resetCampaignForm = () => {
    setCampaignForm({
      title: '',
      subject: '',
      content: '',
      template: 'marketing',
      recipients: 'all_users',
      specificRecipients: [],
      scheduledAt: ''
    });
  };

  const resetIndividualForm = () => {
    setIndividualForm({
      email: '',
      userName: '',
      subject: '',
      content: '',
      template: 'marketing'
    });
  };

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    createCampaignMutation.mutate(campaignForm);
  };

  const handleSendIndividual = (e) => {
    e.preventDefault();
    sendIndividualMutation.mutate(individualForm);
  };

  const handleSendCampaign = (campaign) => {
    if (window.confirm(`Are you sure you want to send "${campaign.title}" campaign?`)) {
      sendCampaignMutation.mutate(campaign._id);
    }
  };

  const handleDeleteCampaign = (campaign) => {
    if (window.confirm(`Are you sure you want to delete "${campaign.title}" campaign?`)) {
      deleteCampaignMutation.mutate(campaign._id);
    }
  };

  const handlePreview = (form) => {
    previewMutation.mutate({
      subject: form.subject,
      content: form.content,
      template: form.template
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'sending':
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'scheduled':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <PencilIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'sending':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const templateOptions = [
    { value: 'marketing', label: 'Marketing', description: 'Promotional content with call-to-action' },
    { value: 'newsletter', label: 'Newsletter', description: 'Regular updates and news' },
    { value: 'announcement', label: 'Announcement', description: 'Important notifications' },
    { value: 'promotion', label: 'Promotion', description: 'Special offers and deals' },
    { value: 'official', label: 'Official', description: 'Formal business communication' },
    { value: 'custom', label: 'Custom', description: 'Basic template with custom content' }
  ];

  const recipientOptions = [
    { value: 'all_users', label: 'All Users', description: 'Send to all registered users' },
    { value: 'all_sellers', label: 'All Sellers', description: 'Send to all sellers' },
    { value: 'active_users', label: 'Active Users', description: 'Send to active users and sellers' },
    { value: 'suspended_users', label: 'Suspended Users', description: 'Send to suspended accounts' },
    { value: 'specific_users', label: 'Specific Users', description: 'Choose specific recipients' }
  ];

  if (campaignsLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <EnvelopeIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Email Marketing</h1>
              <p className="text-gray-600">Send marketing emails and manage campaigns</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetCampaignForm();
              setShowCampaignModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'campaigns', label: 'Campaigns', icon: EnvelopeIcon },
              { id: 'individual', label: 'Send Individual', icon: PaperAirplaneIcon },
              { id: 'stats', label: 'Statistics', icon: ChartBarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sending">Sending</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Campaigns List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipients
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivery Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaignsData?.campaigns?.map((campaign) => (
                      <tr key={campaign._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {campaign.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {campaign.subject}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Template: {campaign.template}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(campaign.status)}
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campaign.stats.totalRecipients || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campaign.stats.deliveryRate || 0}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handlePreview(campaign)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Preview"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            
                            {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                              <button
                                onClick={() => handleSendCampaign(campaign)}
                                className="text-green-600 hover:text-green-900"
                                title="Send Campaign"
                                disabled={sendCampaignMutation.isLoading}
                              >
                                <PaperAirplaneIcon className="h-4 w-4" />
                              </button>
                            )}
                            
                            {campaign.status !== 'sending' && (
                              <button
                                onClick={() => handleDeleteCampaign(campaign)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                                disabled={deleteCampaignMutation.isLoading}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {campaignsData?.pagination?.pages > 1 && (
                <div className="flex justify-center">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: campaignsData.pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </div>
          )}

          {activeTab === 'individual' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Send Individual Email</h3>
              <form onSubmit={handleSendIndividual} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={individualForm.email}
                      onChange={(e) => setIndividualForm({ ...individualForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Name
                    </label>
                    <input
                      type="text"
                      value={individualForm.userName}
                      onChange={(e) => setIndividualForm({ ...individualForm, userName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template *
                  </label>
                  <select
                    value={individualForm.template}
                    onChange={(e) => setIndividualForm({ ...individualForm, template: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {templateOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={individualForm.subject}
                    onChange={(e) => setIndividualForm({ ...individualForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    value={individualForm.content}
                    onChange={(e) => setIndividualForm({ ...individualForm, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email content here..."
                    required
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => handlePreview(individualForm)}
                    className="px-4 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                    disabled={previewMutation.isLoading}
                  >
                    <EyeIcon className="h-4 w-4 inline mr-2" />
                    Preview
                  </button>
                  <button
                    type="submit"
                    disabled={sendIndividualMutation.isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {sendIndividualMutation.isLoading ? 'Sending...' : 'Send Email'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'stats' && statsData && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Email Marketing Statistics</h3>
              
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {statsData.overview.totalCampaigns}
                  </div>
                  <div className="text-sm text-blue-600">Total Campaigns</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {statsData.overview.totalEmailsSent.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Emails Sent</div>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">
                    {statsData.overview.overallDeliveryRate}%
                  </div>
                  <div className="text-sm text-yellow-600">Delivery Rate</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {statsData.overview.scheduledCampaigns}
                  </div>
                  <div className="text-sm text-purple-600">Scheduled</div>
                </div>
              </div>

              {/* Recent Campaigns */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Recent Campaigns</h4>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Campaign
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Sent/Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {statsData.recentCampaigns.map((campaign) => (
                        <tr key={campaign._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {campaign.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.stats?.sentCount || 0}/{campaign.stats?.totalRecipients || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create Email Campaign</h3>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    value={campaignForm.title}
                    onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    value={campaignForm.subject}
                    onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template *
                  </label>
                  <select
                    value={campaignForm.template}
                    onChange={(e) => setCampaignForm({ ...campaignForm, template: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {templateOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipients *
                  </label>
                  <select
                    value={campaignForm.recipients}
                    onChange={(e) => setCampaignForm({ ...campaignForm, recipients: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {recipientOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {campaignForm.recipients === 'specific_users' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Users *
                  </label>
                  <select
                    multiple
                    value={campaignForm.specificRecipients}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setCampaignForm({ ...campaignForm, specificRecipients: values });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  >
                    {usersData?.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email}) - {user.role}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple users</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={campaignForm.content}
                  onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email content here..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Send (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={campaignForm.scheduledAt}
                  onChange={(e) => setCampaignForm({ ...campaignForm, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => handlePreview(campaignForm)}
                  className="px-4 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                  disabled={previewMutation.isLoading}
                >
                  <EyeIcon className="h-4 w-4 inline mr-2" />
                  Preview
                </button>
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCampaignModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createCampaignMutation.isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createCampaignMutation.isLoading ? 'Creating...' : 'Create Campaign'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Email Preview</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: previewContent }} />
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmails;
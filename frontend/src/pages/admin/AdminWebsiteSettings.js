import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import {
  CogIcon,
  PhotoIcon,
  GlobeAltIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminWebsiteSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [publisherFormData, setPublisherFormData] = useState({
    name: '',
    description: 'Quality Books',
    website: '',
    displayOrder: 0,
    isActive: true
  });
  const [heroSlideFormData, setHeroSlideFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    overlayColor: 'rgba(0, 0, 0, 0.4)',
    textColor: '#ffffff',
    primaryButtonText: 'Browse Books',
    primaryButtonLink: '/books',
    primaryButtonStyle: 'primary',
    secondaryButtonText: 'Featured Books',
    secondaryButtonLink: '/books?featured=true',
    secondaryButtonStyle: 'outline',
    displayOrder: 0,
    autoSlideDelay: 5000,
    isActive: true
  });
  const [isPublisherModalOpen, setIsPublisherModalOpen] = useState(false);
  const [isHeroSlideModalOpen, setIsHeroSlideModalOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState(null);
  const [editingHeroSlide, setEditingHeroSlide] = useState(null);

  const queryClient = useQueryClient();

  // Fetch website settings
  const { data: websiteSettings } = useQuery(
    'websiteSettings',
    () => api.get('/api/admin/website-settings').then(res => res.data),
    {
      onSuccess: (data) => {
        setFormData(data);
      }
    }
  );

  // Fetch publisher ads
  const { data: publisherAds, isLoading: adsLoading } = useQuery(
    'publisherAds',
    () => api.get('/api/admin/publisher-ads').then(res => res.data)
  );

  // Fetch hero slides
  const { data: heroSlides, isLoading: heroSlidesLoading } = useQuery(
    'heroSlides',
    () => api.get('/api/admin/hero-slides').then(res => res.data)
  );

  // Update website settings mutation
  const updateSettingsMutation = useMutation(
    (data) => {
      const formDataToSend = new FormData();
      
      // Append all text fields
      Object.keys(data).forEach(key => {
        if (key === 'socialMedia' || key === 'features') {
          formDataToSend.append(key, JSON.stringify(data[key]));
        } else if (key !== 'logo' && key !== 'heroImage') {
          formDataToSend.append(key, data[key]);
        }
      });

      // Append files if they exist
      if (data.logo && data.logo instanceof File) {
        formDataToSend.append('logo', data.logo);
      }
      if (data.heroImage && data.heroImage instanceof File) {
        formDataToSend.append('heroImage', data.heroImage);
      }

      return api.put('/api/admin/website-settings', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    {
      onSuccess: () => {
        toast.success('Website settings updated successfully');
        setIsEditing(false);
        queryClient.invalidateQueries('websiteSettings');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update settings');
      }
    }
  );

  // Create/Update publisher ad mutation
  const publisherMutation = useMutation(
    (data) => {
      const formDataToSend = new FormData();
      
      Object.keys(data).forEach(key => {
        if (key !== 'image') {
          formDataToSend.append(key, data[key]);
        }
      });

      if (data.image && data.image instanceof File) {
        formDataToSend.append('image', data.image);
      }

      if (editingPublisher) {
        return api.put(`/api/admin/publisher-ads/${editingPublisher._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        return api.post('/api/admin/publisher-ads', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
    },
    {
      onSuccess: () => {
        toast.success(`Publisher advertisement ${editingPublisher ? 'updated' : 'created'} successfully`);
        setIsPublisherModalOpen(false);
        setEditingPublisher(null);
        setPublisherFormData({
          name: '',
          description: 'Quality Books',
          website: '',
          displayOrder: 0,
          isActive: true
        });
        queryClient.invalidateQueries('publisherAds');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to save publisher advertisement');
      }
    }
  );

  // Create/Update hero slide mutation
  const heroSlideMutation = useMutation(
    (data) => {
      const formDataToSend = new FormData();
      
      Object.keys(data).forEach(key => {
        if (key !== 'backgroundImage') {
          formDataToSend.append(key, data[key]);
        }
      });

      if (data.backgroundImage && data.backgroundImage instanceof File) {
        formDataToSend.append('backgroundImage', data.backgroundImage);
      }

      if (editingHeroSlide) {
        return api.put(`/api/admin/hero-slides/${editingHeroSlide._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        return api.post('/api/admin/hero-slides', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
    },
    {
      onSuccess: () => {
        toast.success(`Hero slide ${editingHeroSlide ? 'updated' : 'created'} successfully`);
        setIsHeroSlideModalOpen(false);
        setEditingHeroSlide(null);
        setHeroSlideFormData({
          title: '',
          subtitle: '',
          description: '',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          textColor: '#ffffff',
          primaryButtonText: 'Browse Books',
          primaryButtonLink: '/books',
          primaryButtonStyle: 'primary',
          secondaryButtonText: 'Featured Books',
          secondaryButtonLink: '/books?featured=true',
          secondaryButtonStyle: 'outline',
          displayOrder: 0,
          autoSlideDelay: 5000,
          isActive: true
        });
        queryClient.invalidateQueries('heroSlides');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to save hero slide');
      }
    }
  );

  // Delete hero slide mutation
  const deleteHeroSlideMutation = useMutation(
    (id) => api.delete(`/api/admin/hero-slides/${id}`),
    {
      onSuccess: () => {
        toast.success('Hero slide deleted successfully');
        queryClient.invalidateQueries('heroSlides');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete hero slide');
      }
    }
  );

  // Toggle hero slide status mutation
  const toggleHeroSlideMutation = useMutation(
    (id) => api.patch(`/api/admin/hero-slides/${id}/toggle`),
    {
      onSuccess: () => {
        toast.success('Hero slide status updated');
        queryClient.invalidateQueries('heroSlides');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update status');
      }
    }
  );
  const deletePublisherMutation = useMutation(
    (id) => api.delete(`/api/admin/publisher-ads/${id}`),
    {
      onSuccess: () => {
        toast.success('Publisher advertisement deleted successfully');
        queryClient.invalidateQueries('publisherAds');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete publisher advertisement');
      }
    }
  );

  // Toggle publisher ad status mutation
  const togglePublisherMutation = useMutation(
    (id) => api.patch(`/api/admin/publisher-ads/${id}/toggle`),
    {
      onSuccess: () => {
        toast.success('Publisher advertisement status updated');
        queryClient.invalidateQueries('publisherAds');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update status');
      }
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  const handlePublisherSubmit = (e) => {
    e.preventDefault();
    publisherMutation.mutate(publisherFormData);
  };

  const handleEditPublisher = (publisher) => {
    setEditingPublisher(publisher);
    setPublisherFormData({
      name: publisher.name,
      description: publisher.description,
      website: publisher.website || '',
      displayOrder: publisher.displayOrder,
      isActive: publisher.isActive
    });
    setIsPublisherModalOpen(true);
  };

  const handleHeroSlideSubmit = (e) => {
    e.preventDefault();
    heroSlideMutation.mutate(heroSlideFormData);
  };

  const handleEditHeroSlide = (slide) => {
    setEditingHeroSlide(slide);
    setHeroSlideFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description || '',
      overlayColor: slide.overlayColor,
      textColor: slide.textColor,
      primaryButtonText: slide.primaryButton?.text || 'Browse Books',
      primaryButtonLink: slide.primaryButton?.link || '/books',
      primaryButtonStyle: slide.primaryButton?.style || 'primary',
      secondaryButtonText: slide.secondaryButton?.text || 'Featured Books',
      secondaryButtonLink: slide.secondaryButton?.link || '/books?featured=true',
      secondaryButtonStyle: slide.secondaryButton?.style || 'outline',
      displayOrder: slide.displayOrder,
      autoSlideDelay: slide.autoSlideDelay,
      isActive: slide.isActive
    });
    setIsHeroSlideModalOpen(true);
  };

  const handleDeleteHeroSlide = (id) => {
    if (window.confirm('Are you sure you want to delete this hero slide?')) {
      deleteHeroSlideMutation.mutate(id);
    }
  };

  const handleDeletePublisher = (id) => {
    if (window.confirm('Are you sure you want to delete this publisher advertisement?')) {
      deletePublisherMutation.mutate(id);
    }
  };

  if (!websiteSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Website Settings</h1>
        <div className="flex space-x-2">
          {activeTab === 'general' && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Settings'}
            </button>
          )}
          {activeTab === 'hero' && (
            <button
              onClick={() => setIsHeroSlideModalOpen(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Hero Slide
            </button>
          )}
          {activeTab === 'publishers' && (
            <button
              onClick={() => setIsPublisherModalOpen(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Publisher
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CogIcon className="h-5 w-5 inline mr-2" />
            General Settings
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'hero'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PhotoIcon className="h-5 w-5 inline mr-2" />
            Hero Slides
          </button>
          <button
            onClick={() => setActiveTab('publishers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'publishers'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <GlobeAltIcon className="h-5 w-5 inline mr-2" />
            Publisher Advertisements
          </button>
        </nav>
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website Name
                  </label>
                  <input
                    type="text"
                    name="websiteName"
                    value={formData.websiteName || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain
                  </label>
                  <input
                    type="text"
                    name="websiteDomain"
                    value={formData.websiteDomain || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
                  {formData.logo && typeof formData.logo === 'string' && (
                    <div className="mb-2">
                      <img
                        src={`${process.env.REACT_APP_API_URL || ''}${formData.logo}`}
                        alt="Current Logo"
                        className="h-16 w-auto object-contain border border-gray-200 rounded"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Background Image
                  </label>
                  {formData.heroImage && typeof formData.heroImage === 'string' && (
                    <div className="mb-2">
                      <img
                        src={`${process.env.REACT_APP_API_URL || ''}${formData.heroImage}`}
                        alt="Current Hero"
                        className="h-16 w-auto object-contain border border-gray-200 rounded"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    name="heroImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Hero Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hero Section</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    name="heroTitle"
                    value={formData.heroTitle || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Subtitle
                  </label>
                  <textarea
                    name="heroSubtitle"
                    value={formData.heroSubtitle || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <textarea
                    name="metaKeywords"
                    value={formData.metaKeywords || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={formData.contactPhone || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    name="socialMedia.facebook"
                    value={formData.socialMedia?.facebook || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter
                  </label>
                  <input
                    type="url"
                    name="socialMedia.twitter"
                    value={formData.socialMedia?.twitter || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    name="socialMedia.instagram"
                    value={formData.socialMedia?.instagram || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="socialMedia.linkedin"
                    value={formData.socialMedia?.linkedin || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Free Shipping Threshold (₹)
                  </label>
                  <input
                    type="number"
                    name="features.freeShippingThreshold"
                    value={formData.features?.freeShippingThreshold || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    name="features.commissionRate"
                    value={formData.features?.commissionRate || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateSettingsMutation.isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {updateSettingsMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Hero Slides Tab */}
      {activeTab === 'hero' && (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            {heroSlidesLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slide
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Background
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Content
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {heroSlides?.slides?.map((slide) => (
                      <tr key={slide._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{slide.title}</div>
                            <div className="text-sm text-gray-500">{slide.subtitle}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={`${process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app'}${slide.backgroundImage}`}
                            alt={slide.title}
                            className="h-16 w-24 object-cover border border-gray-200 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="mb-1">
                              <span className="font-medium">Primary:</span> {slide.primaryButton?.text}
                            </div>
                            <div>
                              <span className="font-medium">Secondary:</span> {slide.secondaryButton?.text}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {slide.displayOrder}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            slide.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {slide.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditHeroSlide(slide)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleHeroSlideMutation.mutate(slide._id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {slide.isActive ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteHeroSlide(slide._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!heroSlides?.slides || heroSlides.slides.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No hero slides found. Click "Add Hero Slide" to create one.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Publisher Advertisements Tab */}
      {activeTab === 'publishers' && (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            {adsLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Publisher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {publisherAds?.ads?.map((ad) => (
                      <tr key={ad._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{ad.name}</div>
                            {ad.website && (
                              <div className="text-sm text-gray-500">{ad.website}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={`${process.env.REACT_APP_API_URL || ''}${ad.image}`}
                            alt={ad.name}
                            className="h-12 w-12 object-contain border border-gray-200 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ad.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ad.displayOrder}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            ad.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {ad.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditPublisher(ad)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => togglePublisherMutation.mutate(ad._id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {ad.isActive ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeletePublisher(ad._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!publisherAds?.ads || publisherAds.ads.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No publisher advertisements found. Click "Add Publisher" to create one.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Publisher Modal */}
      {isPublisherModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPublisher ? 'Edit Publisher Advertisement' : 'Add Publisher Advertisement'}
              </h3>
              <form onSubmit={handlePublisherSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publisher Name *
                  </label>
                  <input
                    type="text"
                    value={publisherFormData.name}
                    onChange={(e) => setPublisherFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={publisherFormData.description}
                    onChange={(e) => setPublisherFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={publisherFormData.website}
                    onChange={(e) => setPublisherFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={publisherFormData.displayOrder}
                    onChange={(e) => setPublisherFormData(prev => ({ ...prev, displayOrder: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image {!editingPublisher && '*'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPublisherFormData(prev => ({ ...prev, image: e.target.files[0] }))}
                    required={!editingPublisher}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={publisherFormData.isActive}
                    onChange={(e) => setPublisherFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPublisherModalOpen(false);
                      setEditingPublisher(null);
                      setPublisherFormData({
                        name: '',
                        description: 'Quality Books',
                        website: '',
                        displayOrder: 0,
                        isActive: true
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={publisherMutation.isLoading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {publisherMutation.isLoading ? 'Saving...' : (editingPublisher ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Hero Slide Modal */}
      {isHeroSlideModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingHeroSlide ? 'Edit Hero Slide' : 'Add Hero Slide'}
              </h3>
              <form onSubmit={handleHeroSlideSubmit} className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={heroSlideFormData.title}
                      onChange={(e) => setHeroSlideFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle *
                    </label>
                    <input
                      type="text"
                      value={heroSlideFormData.subtitle}
                      onChange={(e) => setHeroSlideFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={heroSlideFormData.description}
                    onChange={(e) => setHeroSlideFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overlay Color
                    </label>
                    <input
                      type="text"
                      value={heroSlideFormData.overlayColor}
                      onChange={(e) => setHeroSlideFormData(prev => ({ ...prev, overlayColor: e.target.value }))}
                      placeholder="rgba(0, 0, 0, 0.4)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={heroSlideFormData.textColor}
                      onChange={(e) => setHeroSlideFormData(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Primary Button</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                      <input
                        type="text"
                        value={heroSlideFormData.primaryButtonText}
                        onChange={(e) => setHeroSlideFormData(prev => ({ ...prev, primaryButtonText: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                      <input
                        type="text"
                        value={heroSlideFormData.primaryButtonLink}
                        onChange={(e) => setHeroSlideFormData(prev => ({ ...prev, primaryButtonLink: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                      <select
                        value={heroSlideFormData.primaryButtonStyle}
                        onChange={(e) => setHeroSlideFormData(prev => ({ ...prev, primaryButtonStyle: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="outline">Outline</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Secondary Button</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                      <input
                        type="text"
                        value={heroSlideFormData.secondaryButtonText}
                        onChange={(e) => setHeroSlideFormData(prev => ({ ...prev, secondaryButtonText: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                      <input
                        type="text"
                        value={heroSlideFormData.secondaryButtonLink}
                        onChange={(e) => setHeroSlideFormData(prev => ({ ...prev, secondaryButtonLink: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                      <select
                        value={heroSlideFormData.secondaryButtonStyle}
                        onChange={(e) => setHeroSlideFormData(prev => ({ ...prev, secondaryButtonStyle: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="outline">Outline</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={heroSlideFormData.displayOrder}
                      onChange={(e) => setHeroSlideFormData(prev => ({ ...prev, displayOrder: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto Slide Delay (ms)
                    </label>
                    <input
                      type="number"
                      value={heroSlideFormData.autoSlideDelay}
                      onChange={(e) => setHeroSlideFormData(prev => ({ ...prev, autoSlideDelay: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="heroSlideActive"
                      checked={heroSlideFormData.isActive}
                      onChange={(e) => setHeroSlideFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="heroSlideActive" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Image {!editingHeroSlide && '*'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setHeroSlideFormData(prev => ({ ...prev, backgroundImage: e.target.files[0] }))}
                    required={!editingHeroSlide}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </form>
              
              <div className="flex justify-end space-x-4 pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsHeroSlideModalOpen(false);
                    setEditingHeroSlide(null);
                    setHeroSlideFormData({
                      title: '',
                      subtitle: '',
                      description: '',
                      overlayColor: 'rgba(0, 0, 0, 0.4)',
                      textColor: '#ffffff',
                      primaryButtonText: 'Browse Books',
                      primaryButtonLink: '/books',
                      primaryButtonStyle: 'primary',
                      secondaryButtonText: 'Featured Books',
                      secondaryButtonLink: '/books?featured=true',
                      secondaryButtonStyle: 'outline',
                      displayOrder: 0,
                      autoSlideDelay: 5000,
                      isActive: true
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleHeroSlideSubmit}
                  disabled={heroSlideMutation.isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {heroSlideMutation.isLoading ? 'Saving...' : (editingHeroSlide ? 'Update' : 'Create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWebsiteSettings;
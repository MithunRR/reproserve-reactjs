import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, Camera, Video, FileText, Square } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { currentUserStorage } from '../utils/localStorage';
import { createProjectStart, resetCreateProjectFlag } from '../Store/Features/Authentication/authslice';

export function CreateProjectPage({ navigate }) {
  // "Add to Portfolio" from a completed job pre-fills these fields.
  const [prefill] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('portfolioPrefill');
      if (raw) {
        localStorage.removeItem('portfolioPrefill');
        return JSON.parse(raw);
      }
    } catch {
      // ignore malformed prefill
    }
    return null;
  });

  const [projectName, setProjectName] = useState(prefill?.title || '');
  const [description, setDescription] = useState(prefill?.description || '');
  const [squareFeet, setSquareFeet] = useState('');
  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [category, setCategory] = useState(prefill?.category || '');

  const dispatch = useDispatch();
  const currentUser = currentUserStorage.get();
  const createProjectLoading = useSelector((state) => state.AuthReducer.createProjectLoading);
  const createProjectSuccess = useSelector((state) => state.AuthReducer.createProjectSuccess);
  const createProjectError = useSelector((state) => state.AuthReducer.createProjectError);

  useEffect(() => {
    if (createProjectSuccess) {
      toast.success('Project created successfully!');
      dispatch(resetCreateProjectFlag());
      navigate('profile');
    }
  }, [createProjectSuccess, dispatch]);

  useEffect(() => {
    if (createProjectError) {
      toast.error(typeof createProjectError === 'string' ? createProjectError : 'Failed to create project');
      dispatch(resetCreateProjectFlag());
    }
  }, [createProjectError, dispatch]);

  const categories = [
  'Construction & Renovation',
  'Repairs & Maintenance',
  'Outdoor & Landscaping',
  'Home Services & Lifestyle',
  'Professional & Legal Services'];


  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    if (photos.length + files.length <= 3) {
      setPhotos([...photos, ...files]);
    } else {
      alert('You can only upload up to 3 photos');
    }
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size <= 25 * 1024 * 1024) {// 25MB
        setVideo(file);
      } else {
        alert('Video file must be 25MB or smaller');
      }
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    if (!currentUser?.id) {
      toast.error('Please sign in to create a project.');
      navigate('login');
      return;
    }
    const fd = new FormData();
    fd.append('userId', currentUser.id);
    fd.append('title', projectName.trim());
    fd.append('category', category || '');
    fd.append('description', description.trim() || projectName.trim());
    if (squareFeet) fd.append('timeline', `${squareFeet} sq ft`);
    photos.forEach((photo) => fd.append('photos', photo));
    dispatch(createProjectStart(fd));
  };

  return (
    <div
      className="px-4 min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse at top right, #0089e1 0%, transparent 50%),
          radial-gradient(ellipse at top left, #004571 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, #004471 0%, transparent 50%),
          radial-gradient(ellipse at bottom left, #001624 0%, transparent 50%),
          linear-gradient(225deg, #004571, #001624)
        `,
        paddingTop: '80px',
        paddingBottom: '64px',
        marginTop: '-65px'
      }}>
      
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('profile')}
            className="mr-4 p-2 rounded-md border border-white/30 hover:bg-white/20 backdrop-blur-sm transition-all duration-300">
            
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="text-3xl text-white drop-shadow-lg">Create a New Project</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Name */}
          <div
            className="rounded-2xl shadow-lg p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
            <h2 className="text-xl text-white drop-shadow-lg mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-white" />
              Project Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2 drop-shadow-md">Project Name *</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter your project name..."
                  className="w-full px-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                  required />
                
              </div>

              <div>
                <label className="block text-white mb-2 drop-shadow-md">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/60">
                  
                  <option value="" className="bg-cool-gray">Select a category...</option>
                  {categories.map((cat) =>
                  <option key={cat} value={cat} className="bg-cool-gray">{cat}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2 drop-shadow-md">Project Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project in detail..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60" />
                
              </div>

              <div>
                <label className="block text-white mb-2 drop-shadow-md">Approximate Square Feet</label>
                <div className="relative">
                  <input
                    type="number"
                    value={squareFeet}
                    onChange={(e) => setSquareFeet(e.target.value)}
                    placeholder="Enter square footage..."
                    className="w-full px-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60" />
                  
                  <Square className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div
            className="rounded-2xl shadow-lg p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
            <h2 className="text-xl text-white drop-shadow-lg mb-6 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-white" />
              Photos (Up to 3)
            </h2>
            
            <div className="space-y-4">
              {photos.length < 3 &&
              <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-white/60 hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                  <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload" />
                
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-white mx-auto mb-4 drop-shadow-md" />
                    <p className="text-white mb-2 drop-shadow-md">Click to upload photos</p>
                    <p className="text-sm text-white drop-shadow-md">JPG, PNG up to 10MB each</p>
                  </label>
                </div>
              }

              {photos.length > 0 &&
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) =>
                <div key={index} className="relative border border-white/30 rounded-lg overflow-hidden backdrop-blur-sm">
                      <img
                    src={URL.createObjectURL(photo)}
                    alt={`Project photo ${index + 1}`}
                    className="w-full h-32 object-cover" />
                  
                      <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-coral-orange text-black rounded-full p-1 hover:bg-coral-orange/90 transition-all duration-300">
                    
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                )}
                </div>
              }
            </div>
          </div>

          {/* Video */}
          <div
            className="rounded-2xl shadow-lg p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
            <h2 className="text-xl text-white drop-shadow-lg mb-6 flex items-center">
              <Video className="h-5 w-5 mr-2 text-white" />
              Video (Optional, max 25MB)
            </h2>
            
            {!video ?
            <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-white/60 hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-upload" />
              
                <label htmlFor="video-upload" className="cursor-pointer">
                  <Video className="h-12 w-12 text-white mx-auto mb-4 drop-shadow-md" />
                  <p className="text-white mb-2 drop-shadow-md">Click to upload video</p>
                  <p className="text-sm text-white drop-shadow-md">MP4, MOV up to 25MB</p>
                </label>
              </div> :

            <div className="relative border border-white/30 rounded-lg overflow-hidden backdrop-blur-sm">
                <video
                src={URL.createObjectURL(video)}
                controls
                className="w-full h-48 object-cover bg-black">
                
                  Your browser does not support the video tag.
                </video>
                <button
                type="button"
                onClick={removeVideo}
                className="absolute top-2 right-2 bg-coral-orange text-black rounded-full p-1 hover:bg-coral-orange/90 transition-all duration-300">
                
                  <X className="h-4 w-4" />
                </button>
              </div>
            }
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('profile')}
              className="px-6 py-3 rounded-xl border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold backdrop-blur-sm">
              
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProjectLoading}
              className="px-6 py-3 rounded-xl bg-coral-orange text-black hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">

              {createProjectLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>);

}
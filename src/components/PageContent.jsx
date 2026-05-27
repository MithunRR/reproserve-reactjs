import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../utils/api';
import { Loader2, AlertCircle } from 'lucide-react';

export function PageContent({ navigate }) {
  const { slug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.get(`/api/pages/${slug}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        setPageData(response.data);
      } catch (err) {
        console.error('Error fetching page:', err);
        setError(err.response?.data?.message || 'Failed to load page. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (isLoading) {
    return (
      <div
        className="px-4 min-h-screen flex items-center justify-center"
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
        
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white drop-shadow-md">Loading page...</p>
        </div>
      </div>);

  }

  if (error) {
    return (
      <div
        className="px-4 min-h-screen flex items-center justify-center"
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
        
        <div
          className="text-center py-12 px-8 rounded-2xl max-w-md"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
          <AlertCircle className="h-12 w-12 text-coral-orange mx-auto mb-4" />
          <p className="text-xl text-white mb-4 drop-shadow-lg">Error loading page</p>
          <p className="text-white mb-6 drop-shadow-md">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold">
            
            Go to Home
          </button>
        </div>
      </div>);

  }

  if (!pageData) {
    return null;
  }

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
        <div
          className="rounded-2xl p-8 md:p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
          <h1 className="text-4xl md:text-5xl mb-8 text-white drop-shadow-lg font-bold">
            {pageData.name}
          </h1>
          
          <div
            className="page-content"
            style={{
              color: 'white',
              lineHeight: '1.8'
            }}
            dangerouslySetInnerHTML={{ __html: pageData.content }} />
          
          
          <style>{`
            .page-content {
              color: white;
            }
            .page-content h1,
            .page-content h2,
            .page-content h3,
            .page-content h4,
            .page-content h5,
            .page-content h6 {
              color: white;
              margin-top: 2rem;
              margin-bottom: 1rem;
              font-weight: bold;
              line-height: 1.3;
            }
            .page-content h1 {
              font-size: 2.5rem;
            }
            .page-content h2 {
              font-size: 2rem;
            }
            .page-content h3 {
              font-size: 1.75rem;
            }
            .page-content h4 {
              font-size: 1.5rem;
            }
            .page-content p {
              margin-bottom: 1.5rem;
              color: rgba(255, 255, 255, 0.9);
              line-height: 1.8;
            }
            .page-content ul,
            .page-content ol {
              margin-bottom: 1.5rem;
              padding-left: 2rem;
              color: rgba(255, 255, 255, 0.9);
            }
            .page-content li {
              margin-bottom: 0.5rem;
            }
            .page-content a {
              color: #0089e1;
              text-decoration: underline;
              transition: color 0.3s;
            }
            .page-content a:hover {
              color: #00a8ff;
            }
            .page-content strong {
              font-weight: bold;
              color: white;
            }
            .page-content em {
              font-style: italic;
            }
          `}</style>
        </div>
      </div>
    </div>);

}
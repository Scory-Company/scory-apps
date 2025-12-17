/**
 * useBackgroundSimplify Hook
 *
 * React hook wrapper for BackgroundJobManager
 * Provides easy access to background simplification features
 */

import { useEffect } from 'react';
import { useToast } from '@/features/shared/hooks/useToast';
import { backgroundJobManager } from '../services/BackgroundJobManager';
import api from '@/services/api';

interface SimplifyOptions {
  externalId: string;
  source: 'openalex' | 'scholar';
  title: string;
  authors: string[];
  year: number;
  abstract?: string;
  pdfUrl?: string;
  landingPageUrl?: string;
  doi?: string;
  readingLevel: 'SIMPLE' | 'STUDENT' | 'ACADEMIC' | 'EXPERT';
  citationCount?: number;
  rating?: number;
  categoryName?: string;
}

export function useBackgroundSimplify() {
  const toast = useToast();

  // Initialize manager on mount
  useEffect(() => {
    backgroundJobManager.initialize(toast, api);

    // Cleanup on unmount
    return () => {
      backgroundJobManager.cleanup();
    };
  }, []);

  /**
   * Start a background simplification job
   */
  const startSimplification = async (options: SimplifyOptions) => {
    return await backgroundJobManager.startSimplification(options);
  };

  /**
   * Cancel a job
   */
  const cancelJob = async (jobId: string) => {
    await backgroundJobManager.cancelJob(jobId);
  };

  /**
   * Get active jobs count
   */
  const getActiveJobsCount = () => {
    return backgroundJobManager.getActiveJobsCount();
  };

  /**
   * Get all active jobs
   */
  const getActiveJobs = () => {
    return backgroundJobManager.getActiveJobs();
  };

  return {
    startSimplification,
    cancelJob,
    getActiveJobsCount,
    getActiveJobs,
    ToastContainer: toast.ToastContainer,
  };
}

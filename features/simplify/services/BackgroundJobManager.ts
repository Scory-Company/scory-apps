/**
 * Background Job Manager
 *
 * Manages background simplification jobs with toast notifications
 * Supports multiple concurrent jobs and real-time progress tracking via SSE
 */

import { router } from 'expo-router';

interface StartJobOptions {
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

interface JobTracker {
  jobId: string;
  externalId: string;
  title: string;
  toastId: string;
}

interface ToastAPI {
  loading: (message: string, description?: string) => string;
  progress: (message: string, progressValue: number, description?: string) => string;
  updateToast: (id: string, updates: any) => void;
  hideToast: (id: string) => void;
  showToast: (options: any) => string;
  success: (message: string, duration?: number) => string;
  error: (message: string) => string;
}

export class BackgroundJobManager {
  private activeJobs: Map<string, JobTracker> = new Map();
  private toastAPI: ToastAPI | null = null;
  private apiClient: any = null;

  /**
   * Initialize with toast API and API client
   */
  initialize(toastAPI: ToastAPI, apiClient: any) {
    this.toastAPI = toastAPI;
    this.apiClient = apiClient;
  }

  /**
   * Check if user can start a new job (rate limiting)
   */
  async canStartJob(): Promise<{ canStart: boolean; reason?: string; limits?: any }> {
    if (!this.apiClient) {
      return { canStart: false, reason: 'API client not initialized' };
    }

    try {
      const response = await this.apiClient.get('/jobs/my-active');
      const { count, limits } = response.data.data; // Backend returns { success, data: { count, limits } }

      // Check concurrent limit
      if (count >= limits.maxConcurrent) {
        return {
          canStart: false,
          reason: `Maximum ${limits.maxConcurrent} papers can be simplified at once`,
          limits,
        };
      }

      // Check daily limit
      if (limits.currentDaily >= limits.maxDaily) {
        return {
          canStart: false,
          reason: `Daily limit of ${limits.maxDaily} simplifications reached`,
          limits,
        };
      }

      return { canStart: true, limits };
    } catch (error) {
      console.error('Failed to check job limits:', error);
      // Allow job if check fails (fail open)
      return { canStart: true };
    }
  }

  /**
   * Start a new background simplification job
   */
  async startSimplification(options: StartJobOptions): Promise<string | null> {
    if (!this.toastAPI || !this.apiClient) {
      console.error('BackgroundJobManager not initialized');
      return null;
    }

    // Check if can start job
    const limitCheck = await this.canStartJob();
    if (!limitCheck.canStart) {
      this.toastAPI.error(limitCheck.reason || 'Cannot start job');
      return null;
    }

    try {
      // Start job - send all required fields to backend
      const response = await this.apiClient.post('/simplify/external', {
        externalId: options.externalId,
        source: options.source,
        title: options.title,
        authors: options.authors,
        year: options.year,
        abstract: options.abstract,
        pdfUrl: options.pdfUrl,
        landingPageUrl: options.landingPageUrl,
        doi: options.doi,
        readingLevel: options.readingLevel,
        citationCount: options.citationCount,
        rating: options.rating,
        categoryName: options.categoryName,
      });

      const { jobId, streamUrl } = response.data.data;

      // Show loading toast
      const toastId = this.toastAPI.progress(
        options.title,
        0,
        'Starting simplification...'
      );

      // Track job
      this.activeJobs.set(jobId, {
        jobId,
        externalId: options.externalId,
        title: options.title,
        toastId,
      });

      // Start tracking progress
      this.trackJobProgress(jobId, streamUrl);

      return jobId;
    } catch (error: any) {
      console.error('Failed to start simplification:', error);

      // Handle rate limit errors
      if (error.response?.status === 429) {
        const errorData = error.response.data;
        this.toastAPI.error(errorData.message || 'Rate limit exceeded');
      } else {
        this.toastAPI.error('Failed to start simplification');
      }

      return null;
    }
  }

  /**
   * Track job progress via polling (React Native compatible)
   */
  private trackJobProgress(jobId: string, streamUrl: string) {
    if (!this.toastAPI) return;

    const job = this.activeJobs.get(jobId);
    if (!job) return;

    // Use polling instead of SSE for React Native compatibility
    // EventSource is not available in React Native
    this.pollJobStatus(jobId);
  }


  /**
   * Handle job completion
   */
  private handleCompleted(jobId: string, data: any) {
    if (!this.toastAPI) return;

    const job = this.activeJobs.get(jobId);
    if (!job) return;

    // Hide progress toast
    this.toastAPI.hideToast(job.toastId);

    // Auto-navigate to article immediately
    if (data.result?.articleId) {
      router.push(`/article/${data.result.articleId}`);

      // Show simple success toast (no action button needed)
      this.toastAPI.success('Simplification complete!', 2000);
    } else {
      // Fallback if no articleId
      this.toastAPI.success(job.title + ' - Simplification complete!', 3000);
    }

    // Cleanup
    this.activeJobs.delete(jobId);
  }

  /**
   * Handle job failure
   */
  private handleFailed(jobId: string, data: any) {
    if (!this.toastAPI) return;

    const job = this.activeJobs.get(jobId);
    if (!job) return;

    // Hide progress toast
    this.toastAPI.hideToast(job.toastId);

    // Show error toast
    this.toastAPI.error(data.error || 'Simplification failed');

    // Cleanup
    this.activeJobs.delete(jobId);
  }


  /**
   * Poll job status (React Native compatible alternative to SSE)
   */
  private async pollJobStatus(jobId: string) {
    if (!this.apiClient || !this.toastAPI) return;

    const job = this.activeJobs.get(jobId);
    if (!job) return;

    let retryCount = 0;
    const MAX_RETRIES = 10; // Maximum 10 retries before giving up
    const BASE_DELAY = 2000; // Base delay: 2 seconds

    const poll = async () => {
      // Check if job still exists (might be cancelled)
      if (!this.activeJobs.has(jobId)) {
        return;
      }

      try {
        const response = await this.apiClient.get(`/jobs/${jobId}`);
        const jobData = response.data.data || response.data; // Handle both nested and flat structure

        // Reset retry count on successful request
        retryCount = 0;

        // Update progress
        if (jobData.progress !== undefined) {
          // Filter out generic status messages
          let description = jobData.stage || jobData.status || '';
          if (description.toLowerCase() === 'active' || description.toLowerCase() === 'processing') {
            description = ''; // Hide generic status
          }

          this.toastAPI?.updateToast(job.toastId, {
            progress: jobData.progress || 0,
            description: description,
          });
        }

        // Check job state
        if (jobData.state === 'completed' || jobData.status === 'completed') {
          this.handleCompleted(jobId, { result: jobData.result || jobData });
        } else if (jobData.state === 'failed' || jobData.status === 'failed') {
          this.handleFailed(jobId, { error: jobData.error || 'Job failed' });
        } else {
          // Still processing, poll again after 2 seconds
          setTimeout(poll, BASE_DELAY);
        }
      } catch (error: any) {
        retryCount++;

        // Check if max retries reached
        if (retryCount >= MAX_RETRIES) {
          console.error(`Polling failed after ${MAX_RETRIES} retries:`, error);
          this.handleFailed(jobId, {
            error: 'Network error: Unable to check simplification status. Please check your connection.'
          });
          return;
        }

        // If job not found (404), it might be completed or deleted
        if (error.response?.status === 404) {
          this.handleFailed(jobId, { error: 'Job not found or expired' });
          return;
        }

        // Network error or other errors - retry with exponential backoff
        const delay = Math.min(BASE_DELAY * Math.pow(1.5, retryCount - 1), 10000); // Max 10 seconds
        console.warn(`Polling retry ${retryCount}/${MAX_RETRIES} in ${delay}ms:`, error.message);

        // Update toast to show retry status
        this.toastAPI?.updateToast(job.toastId, {
          description: `Connection issue. Retrying (${retryCount}/${MAX_RETRIES})...`,
        });

        setTimeout(poll, delay);
      }
    };

    poll();
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string) {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    // Hide toast
    if (this.toastAPI) {
      this.toastAPI.hideToast(job.toastId);
    }

    // Cancel on backend (optional)
    try {
      await this.apiClient?.delete(`/jobs/${jobId}`);
    } catch (error) {
      console.error('Failed to cancel job on backend:', error);
    }

    // Cleanup
    this.activeJobs.delete(jobId);
  }

  /**
   * Get active jobs count
   */
  getActiveJobsCount(): number {
    return this.activeJobs.size;
  }

  /**
   * Get all active jobs
   */
  getActiveJobs(): JobTracker[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Cleanup all jobs (e.g., on app unmount)
   */
  cleanup() {
    // Clear all active jobs and their toasts
    this.activeJobs.forEach((job) => {
      if (this.toastAPI) {
        this.toastAPI.hideToast(job.toastId);
      }
    });
    this.activeJobs.clear();
  }

}

// Singleton instance
export const backgroundJobManager = new BackgroundJobManager();

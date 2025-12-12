/**
 * Job Persistence Utility
 *
 * Persists job state to AsyncStorage so users can resume polling if app is closed/refreshed
 * Implements the job retention policy from API_JOB_QUEUE.md (24 hour retention)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const JOB_STORAGE_KEY = '@scory:active_jobs';
const JOB_RETENTION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface PersistedJob {
  jobId: string;
  type: 'simplify' | 'resimplify';
  timestamp: number;
  metadata: {
    title?: string; // For simplify jobs
    articleId?: string; // For resimplify jobs
    readingLevel?: string;
  };
}

/**
 * Save job to persistence layer
 */
export async function saveJob(job: PersistedJob): Promise<void> {
  try {
    const jobs = await getJobs();

    // Add new job
    jobs.push(job);

    // Clean old jobs (older than 24 hours)
    const validJobs = jobs.filter(j => Date.now() - j.timestamp < JOB_RETENTION_MS);

    await AsyncStorage.setItem(JOB_STORAGE_KEY, JSON.stringify(validJobs));
    console.log('[JobPersistence] Saved job:', job.jobId);
  } catch (error) {
    console.error('[JobPersistence] Failed to save job:', error);
  }
}

/**
 * Get all persisted jobs
 */
export async function getJobs(): Promise<PersistedJob[]> {
  try {
    const data = await AsyncStorage.getItem(JOB_STORAGE_KEY);
    if (!data) return [];

    const jobs: PersistedJob[] = JSON.parse(data);

    // Filter out expired jobs
    return jobs.filter(job => Date.now() - job.timestamp < JOB_RETENTION_MS);
  } catch (error) {
    console.error('[JobPersistence] Failed to get jobs:', error);
    return [];
  }
}

/**
 * Remove job from persistence layer
 */
export async function removeJob(jobId: string): Promise<void> {
  try {
    const jobs = await getJobs();
    const filtered = jobs.filter(j => j.jobId !== jobId);

    await AsyncStorage.setItem(JOB_STORAGE_KEY, JSON.stringify(filtered));
    console.log('[JobPersistence] Removed job:', jobId);
  } catch (error) {
    console.error('[JobPersistence] Failed to remove job:', error);
  }
}

/**
 * Clear all persisted jobs
 */
export async function clearAllJobs(): Promise<void> {
  try {
    await AsyncStorage.removeItem(JOB_STORAGE_KEY);
    console.log('[JobPersistence] Cleared all jobs');
  } catch (error) {
    console.error('[JobPersistence] Failed to clear jobs:', error);
  }
}

/**
 * Get job by ID
 */
export async function getJob(jobId: string): Promise<PersistedJob | null> {
  try {
    const jobs = await getJobs();
    return jobs.find(j => j.jobId === jobId) || null;
  } catch (error) {
    console.error('[JobPersistence] Failed to get job:', error);
    return null;
  }
}

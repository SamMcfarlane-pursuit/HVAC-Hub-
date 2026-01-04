import type { VercelRequest, VercelResponse } from '@vercel/node';
import { store, Job } from './data/store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        switch (req.method) {
            case 'GET': {
                // Get all jobs
                const jobs = store.getJobs();
                return res.status(200).json(jobs);
            }

            case 'POST': {
                // Create new job
                const jobData = req.body as Omit<Job, 'id'>;

                if (!jobData.clientName || !jobData.description || !jobData.location) {
                    return res.status(400).json({ error: 'Missing required fields: clientName, description, location' });
                }

                const newJob = store.createJob({
                    clientId: `C${Math.floor(Math.random() * 1000)}`,
                    clientName: jobData.clientName,
                    address: jobData.address || 'Address TBD',
                    description: jobData.description,
                    status: 'Pending',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    requiredSkillLevel: jobData.requiredSkillLevel || 'Journeyman',
                    location: jobData.location,
                    estimatedDuration: jobData.estimatedDuration || 2
                });

                return res.status(201).json(newJob);
            }

            case 'PUT': {
                // Update job
                const { id, ...updates } = req.body;

                if (!id) {
                    return res.status(400).json({ error: 'Job ID is required' });
                }

                const updatedJob = store.updateJob(id, updates);

                if (!updatedJob) {
                    return res.status(404).json({ error: 'Job not found' });
                }

                return res.status(200).json(updatedJob);
            }

            case 'DELETE': {
                // Delete job
                const { id } = req.query;

                if (!id || typeof id !== 'string') {
                    return res.status(400).json({ error: 'Job ID is required' });
                }

                const deleted = store.deleteJob(id);

                if (!deleted) {
                    return res.status(404).json({ error: 'Job not found' });
                }

                return res.status(200).json({ success: true });
            }

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Jobs API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

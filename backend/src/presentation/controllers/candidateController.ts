import { Request, Response } from 'express';
import { addCandidate, findCandidateById, updateCandidateStage } from '../../application/services/candidateService';

export const addCandidateController = async (req: Request, res: Response) => {
    try {
        const candidateData = req.body;
        const candidate = await addCandidate(candidateData);
        res.status(201).json({ message: 'Candidate added successfully', data: candidate });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ message: 'Error adding candidate', error: error.message });
        } else {
            res.status(400).json({ message: 'Error adding candidate', error: 'Unknown error' });
        }
    }
};

export const getCandidateById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const candidate = await findCandidateById(id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateCandidateStageController = async (req: Request, res: Response) => {
    try {
        const candidateId = parseInt(req.params.id);
        
        if (isNaN(candidateId)) {
            return res.status(400).json({ error: 'Invalid candidate ID format' });
        }

        const { applicationId, newStepId } = req.body;

        if (!applicationId || !newStepId) {
            return res.status(400).json({ error: 'applicationId and newStepId are required' });
        }

        if (isNaN(applicationId) || isNaN(newStepId)) {
            return res.status(400).json({ error: 'applicationId and newStepId must be numbers' });
        }

        const updatedCandidate = await updateCandidateStage(candidateId, applicationId, newStepId);

        res.status(200).json({
            message: 'Candidate stage updated successfully',
            data: updatedCandidate
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === 'Candidate not found') {
                return res.status(404).json({ error: 'Candidate not found' });
            }
            if (error.message === 'Application not found') {
                return res.status(404).json({ error: 'Application not found' });
            }
            if (error.message === 'Interview step not found') {
                return res.status(404).json({ error: 'Interview step not found' });
            }
            if (error.message === 'Application does not belong to this candidate') {
                return res.status(400).json({ error: 'Application does not belong to this candidate' });
            }
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export { addCandidate };
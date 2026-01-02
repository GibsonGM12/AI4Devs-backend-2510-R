import { Position } from '../../domain/models/Position';

export const getCandidatesByPosition = async (positionId: number) => {
    // Validar que la posición exista
    const position = await Position.findOne(positionId);
    
    if (!position) {
        throw new Error('Position not found');
    }

    // Obtener los candidatos con sus scores
    const candidates = await Position.findCandidatesByPosition(positionId);

    return candidates;
};


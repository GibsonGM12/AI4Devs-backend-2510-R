import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CandidateWithScore {
    candidateId: number;
    fullName: string;
    current_interview_step: string;
    average_score: number | null;
}

export class Position {
    id?: number;
    companyId: number;
    interviewFlowId: number;
    title: string;
    description: string;
    status: string;
    isVisible: boolean;
    location: string;
    jobDescription: string;
    requirements?: string;
    responsibilities?: string;
    salaryMin?: number;
    salaryMax?: number;
    employmentType?: string;
    benefits?: string;
    companyDescription?: string;
    applicationDeadline?: Date;
    contactInfo?: string;

    constructor(data: any) {
        this.id = data.id;
        this.companyId = data.companyId;
        this.interviewFlowId = data.interviewFlowId;
        this.title = data.title;
        this.description = data.description;
        this.status = data.status;
        this.isVisible = data.isVisible;
        this.location = data.location;
        this.jobDescription = data.jobDescription;
        this.requirements = data.requirements;
        this.responsibilities = data.responsibilities;
        this.salaryMin = data.salaryMin;
        this.salaryMax = data.salaryMax;
        this.employmentType = data.employmentType;
        this.benefits = data.benefits;
        this.companyDescription = data.companyDescription;
        this.applicationDeadline = data.applicationDeadline;
        this.contactInfo = data.contactInfo;
    }

    static async findOne(id: number): Promise<Position | null> {
        const data = await prisma.position.findUnique({
            where: { id: id },
        });
        if (!data) return null;
        return new Position(data);
    }

    static async findCandidatesByPosition(positionId: number): Promise<CandidateWithScore[]> {
        const position = await prisma.position.findUnique({
            where: { id: positionId },
            include: {
                applications: {
                    include: {
                        candidate: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            }
                        },
                        interviewStep: {
                            select: {
                                name: true,
                            }
                        },
                        interviews: {
                            select: {
                                score: true,
                            }
                        }
                    }
                }
            }
        });

        if (!position) {
            return [];
        }

        const candidatesWithScores: CandidateWithScore[] = position.applications.map(app => {
            // Calcular el promedio de scores
            const scores = app.interviews
                .map(interview => interview.score)
                .filter((score): score is number => score !== null);
            
            const average_score = scores.length > 0
                ? scores.reduce((sum, score) => sum + score, 0) / scores.length
                : null;

            return {
                candidateId: app.candidate.id,
                fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
                current_interview_step: app.interviewStep.name,
                average_score: average_score
            };
        });

        return candidatesWithScores;
    }
}

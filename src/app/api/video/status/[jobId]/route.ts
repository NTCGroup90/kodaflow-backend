import { NextRequest } from 'next/server';
import { getVideoStatus } from '@/lib/ai/json2video';
import { handleApiRequest, requireAuth } from '@/lib/api-helpers';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    return handleApiRequest(async () => {
        await requireAuth();

        const { jobId } = await params;

        const status = await getVideoStatus(jobId);

        return status;
    });
}

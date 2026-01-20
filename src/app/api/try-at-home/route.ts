import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { roomImage, curtainImages, curtainVideos, productTitle } = await request.json();

        if (!roomImage) {
            return NextResponse.json(
                { success: false, error: 'Room image is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'API key not configured' },
                { status: 500 }
            );
        }

        // Extract base64 data from room image
        const roomBase64 = roomImage.split(',')[1];
        const roomMimeType = roomImage.match(/data:(.*?);/)?.[1] || 'image/jpeg';

        // Prepare parts array
        const parts: any[] = [];

        // Updated prompt with pile and video reference
        const prompt = `Bu oda fotoğrafındaki pencereye perde ekle.

Sana gönderdiğim medya:
1. Oda fotoğrafı (pencereli)
2-3. Kumaş deseni fotoğrafları  
4. (Varsa) Kumaş videosu - kumaşın dokusunu ve hareketini gösterir
5. Pile şekli referans fotoğrafı

KURALLAR:
- Kumaş resimlerindeki/videosundaki desenin ve rengin BİREBİR AYNISI olsun
- Pile şekli son resimdeki gibi düz sık pile (1x3) olsun
- Perdeler fotorealistik ve profesyonel görünsün
- Pencereye uygun boyutta olsun
- Eğer oda fotoğrafı akşam veya gece çekilmişse, ışığı GÜNDÜZ gibi yap

Perdenin penceremde nasıl duracağını gösteren resim üret.`;

        parts.push({ text: prompt });

        // Add room image
        parts.push({
            inlineData: {
                mimeType: roomMimeType,
                data: roomBase64
            }
        });
        console.log('✓ Room image added');

        // Add curtain images (already converted to base64 by frontend)
        if (curtainImages && Array.isArray(curtainImages)) {
            console.log('Curtain images received:', curtainImages.length);

            for (let i = 0; i < curtainImages.length; i++) {
                const img = curtainImages[i];
                if (img && img.startsWith('data:')) {
                    const base64 = img.split(',')[1];
                    const mimeType = img.match(/data:(.*?);/)?.[1] || 'image/jpeg';

                    parts.push({
                        inlineData: {
                            mimeType: mimeType,
                            data: base64
                        }
                    });
                    console.log(`✓ Curtain image ${i + 1} added, mimeType: ${mimeType}, size: ${base64.length} chars`);
                }
            }
        }

        // Add curtain videos if available (for better fabric reference)
        if (curtainVideos && Array.isArray(curtainVideos) && curtainVideos.length > 0) {
            console.log('Curtain videos found:', curtainVideos.length);

            for (let i = 0; i < Math.min(curtainVideos.length, 1); i++) { // Only first video to save tokens
                const videoUrl = curtainVideos[i];
                if (videoUrl && typeof videoUrl === 'string') {
                    try {
                        console.log('Fetching video:', videoUrl.substring(0, 50) + '...');
                        const videoResponse = await fetch(videoUrl);
                        if (videoResponse.ok) {
                            const videoBuffer = await videoResponse.arrayBuffer();
                            const videoBase64 = Buffer.from(videoBuffer).toString('base64');
                            const contentType = videoResponse.headers.get('content-type') || 'video/mp4';

                            parts.push({
                                inlineData: {
                                    mimeType: contentType,
                                    data: videoBase64
                                }
                            });
                            console.log(`✓ Curtain video added, mimeType: ${contentType}, size: ${videoBase64.length} chars`);
                        }
                    } catch (e) {
                        console.error('Failed to fetch video:', e);
                    }
                }
            }
        }

        // Add pile reference image from local file
        try {
            const fs = await import('fs');
            const path = await import('path');
            const pileImagePath = path.join(process.cwd(), 'public', 'image', 'flat.jpg');
            const pileImageBuffer = fs.readFileSync(pileImagePath);
            const pileBase64 = pileImageBuffer.toString('base64');

            parts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: pileBase64
                }
            });
            console.log('✓ Pile reference image (flat.jpg) added');
        } catch (e) {
            console.error('Could not load pile reference image:', e);
        }

        console.log('Total parts to send:', parts.length, '(1 text + images/videos)');

        // Call Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: {
                        responseModalities: ["TEXT", "IMAGE"]
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', response.status, errorText);

            return NextResponse.json(
                { success: false, error: `AI hatası: ${response.status}` },
                { status: 500 }
            );
        }

        const result = await response.json();
        console.log('✓ Gemini response received');

        // Extract generated image
        const candidates = result.candidates || [];
        let generatedImageBase64 = null;

        for (const candidate of candidates) {
            const candidateParts = candidate.content?.parts || [];
            for (const part of candidateParts) {
                if (part.inlineData?.data) {
                    generatedImageBase64 = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                    console.log('✓ Generated image extracted');
                    break;
                }
            }
            if (generatedImageBase64) break;
        }

        if (!generatedImageBase64) {
            const textResponse = candidates[0]?.content?.parts?.[0]?.text;
            console.log('No image generated. Response:', textResponse);
            return NextResponse.json(
                {
                    success: false,
                    error: textResponse || 'Görsel oluşturulamadı. Pencereli bir oda fotoğrafı deneyin.'
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            generatedImage: generatedImageBase64
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { success: false, error: 'Hata: ' + (error instanceof Error ? error.message : 'Bilinmeyen') },
            { status: 500 }
        );
    }
}

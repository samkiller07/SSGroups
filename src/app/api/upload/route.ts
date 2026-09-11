import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate admin
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required for image upload' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type: ${file.type}. Allowed formats: JPG, PNG, WEBP, GIF.`,
        },
        { status: 400 }
      );
    }

    // 3. Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds 5MB limit (Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Generate safe unique filename
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeFilename = `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;

    // 5. If Supabase Storage is configured, upload to Supabase bucket 'catalog-images'
    if (isSupabaseConfigured) {
      const supabase = getSupabaseServer();
      if (supabase) {
        const { data, error } = await supabase.storage
          .from('catalog-images')
          .upload(`public/${safeFilename}`, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from('catalog-images')
            .getPublicUrl(`public/${safeFilename}`);

          return NextResponse.json({
            success: true,
            imageUrl: publicUrlData.publicUrl,
            filename: safeFilename,
          });
        }
      }
    }

    // 6. Local uploads directory fallback
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, safeFilename);
    await writeFile(filePath, buffer);

    const localUrl = `/uploads/${safeFilename}`;

    return NextResponse.json({
      success: true,
      imageUrl: localUrl,
      filename: safeFilename,
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while processing image upload' },
      { status: 500 }
    );
  }
}

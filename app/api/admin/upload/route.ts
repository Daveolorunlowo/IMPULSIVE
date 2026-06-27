import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const isAdminAuthorized = (req: Request) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'impulsive2006';
  const providedPassword = req.headers.get('x-admin-password');
  return providedPassword === adminPassword || process.env.NODE_ENV === 'development';
};

export const POST = async (req: Request) => {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('[POST /api/admin/upload] Storage Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('[POST /api/admin/upload]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file tải lên." }, { status: 400 });
    }

    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME || "9nine";
    let publicDomain = process.env.R2_PUBLIC_DOMAIN || "meohd.io.vn";

    // Standardize publicDomain URL with protocol
    if (!publicDomain.startsWith("http://") && !publicDomain.startsWith("https://")) {
      publicDomain = `https://${publicDomain}`;
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `uploads/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    if (accountId && accessKeyId && secretAccessKey) {
      try {
        const s3Client = new S3Client({
          region: "auto",
          endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
          },
        });

        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: buffer,
            ContentType: file.type || "image/png",
          })
        );

        const publicUrl = `${publicDomain}/${fileName}`;
        return NextResponse.json({ url: publicUrl, provider: "Cloudflare R2", success: true });
      } catch (r2Err: any) {
        console.error("Cloudflare R2 Upload Error:", r2Err);
      }
    }

    // Fallback: Data URL if R2 parameters fail
    const mimeType = file.type || "image/png";
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({
      url: dataUrl,
      provider: "Fallback DataURL",
      success: true
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi xử lý file upload" }, { status: 500 });
  }
}

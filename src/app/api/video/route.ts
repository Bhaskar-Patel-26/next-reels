import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Video from "@/models/Video";

export async function POST(request: NextRequest) {
  try {
    const { title, description, videoUrl, thumbnailUrl, constrols, trasnsformations } =
      await request.json();

    if (!title || !description || !videoUrl || !thumbnailUrl) {
      return NextResponse.json(
        { message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newVideo = new Video({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      constrols: constrols ?? true,
      trasnsformations: trasnsformations ?? { height: 1920, width: 1080, quality: 100 },
    });

    await newVideo.save();

    return NextResponse.json(newVideo, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const videos = await Video.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(videos || [], { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

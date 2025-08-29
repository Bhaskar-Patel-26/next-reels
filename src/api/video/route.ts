import Video from "@/models/Video";
import { authOptions } from "@/utils/auth";
import { connectToDatabase } from "@/utils/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const videos = await Video.find().sort({ createdAt: -1 }).lean();

    if (!videos || videos.length === 0) {
      return NextResponse.json([], { status: 404 });
    }

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { title, description, videoUrl, thumbnailUrl, userId, controls, trasnformation } = await request.json();
    if (!title || !description || !videoUrl || !thumbnailUrl || !userId) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const newVideo = new Video({ title, description, videoUrl, thumbnailUrl, userId, controls: controls ? controls : true, trasnformation: trasnformation ? trasnformation : {height: 1920, width: 1080, quality: 100} });
    await newVideo.save();
    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
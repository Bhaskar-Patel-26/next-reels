import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  try {
    if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_PUBLIC_KEY) {
      throw new Error("ImageKit keys are missing");
    }

    const token = crypto.randomBytes(16).toString("hex");
    const expire = Math.floor(Date.now() / 1000) + 300; // 5 min
    const signature = crypto
      .createHmac("sha1", process.env.IMAGEKIT_PRIVATE_KEY)
      .update(token + expire)
      .digest("hex");

    return NextResponse.json({
      token,
      expire,
      signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  } catch (err) {
    console.error("ImageKit Auth Error:", err);
    return NextResponse.json({ message: "Auth Error" }, { status: 500 });
  }
}

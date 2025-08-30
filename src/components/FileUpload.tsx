"use client";
import { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    setMessage("");
    setProgress(0);

    try {
      // 1️⃣ Get ImageKit auth params
      const authRes = await fetch("/api/imagekit");
      const { token, expire, signature, publicKey } = await authRes.json();

      // 2️⃣ Upload file to ImageKit
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("useUniqueFileName", "true");
      formData.append("signature", signature);
      formData.append("expire", expire);
      formData.append("token", token);
      formData.append("publicKey", publicKey);

      const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message || "Upload failed");

      setUploadedUrl(uploadData.url);

      // 3️⃣ Save video info in MongoDB
      const dbRes = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name,
          description: "Uploaded via ImageKit",
          videoUrl: uploadData.url,
          thumbnailUrl: uploadData.thumbnailUrl || uploadData.url,
        }),
      });

      const savedVideo = await dbRes.json();
      if (!dbRes.ok) throw new Error(savedVideo.message || "Failed to save video");

      setMessage("✅ Upload & save successful!");
      setProgress(100);
    } catch (error: any) {
      console.error(error);
      setMessage(`❌ Error: ${error.message}`);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Your Video</h2>

        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full mb-4 text-sm text-gray-600
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-indigo-50 file:text-indigo-700
                     hover:file:bg-indigo-100
                     cursor-pointer"
        />

        <button
          onClick={handleUpload}
          disabled={!file}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Upload
        </button>

        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {message && (
          <p className="mt-4 text-center text-gray-700 font-medium">{message}</p>
        )}

        {uploadedUrl && (
          <div className="mt-6 w-full">
            <p className="text-gray-800 font-medium mb-2">Preview:</p>
            <video
              src={uploadedUrl}
              controls
              className="w-full rounded-2xl shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}

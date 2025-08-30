"use client";
import { useEffect, useState } from "react";
import FileUpload from "@/components/FileUpload";
import { signOut } from "next-auth/react";

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/video");
        if (!res.ok) throw new Error("Failed to fetch videos");
        const data = await res.json();
        setVideos(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      {/* Navbar */}
      <nav className="w-full bg-white dark:bg-neutral-800 shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
          My App
        </h1>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main>
        <FileUpload />

        {/* Video List */}
        <div>
          <h2 className="text-3xl font-bold text-center text-white my-6">
            All Videos
          </h2>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {videos.length === 0 ? (
              <p className="text-white">No videos uploaded yet.</p>
            ) : (
              videos.map((video) => (
                <div
                  key={video._id}
                  className="bg-white rounded-xl shadow-lg p-4 w-72"
                >
                  <video
                    src={video.videoUrl}
                    controls
                    className="rounded-lg w-full"
                  />
                  <h3 className="font-semibold mt-2">{video.title}</h3>
                  <p className="text-sm text-gray-600">{video.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

import React from "react";

import { emit } from "@tauri-apps/api/event";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";
import { writeText as WriteToClipboard } from "@tauri-apps/api/clipboard";

import {
  ArrowUpToLine,
  TimerReset,
  File,
  HandCoins,
  History,
  X,
} from "lucide-react";

import { useDropzone } from "react-dropzone";
import {
  getNextCloserTen,
  isFileAllowed,
  isFileSizeAllowed,
} from "./lib/utils";

import { Menu } from "./components/menu";
import { Progress } from "./components/progress";
import { Separator } from "./components/separator";
import { UploadArea } from "./components/upload-area";
import { api } from "./lib/api";

function App() {
  const [uploadQueue, setUploadQueue] = React.useState<File[]>([]);
  const [err, setErr] = React.useState<string>("");
  const [progress, setProgress] = React.useState<number>(0);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleUpload,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  React.useEffect(() => {
    const HasPermission = localStorage.getItem("notifications-permission");

    if (!HasPermission) {
      isPermissionGranted().then((permissionGranted) => {
        if (!permissionGranted) {
          requestPermission().then((permission) => {
            permissionGranted = permission === "granted";
            localStorage.setItem("notifications-permission", "granted");
          });
        }
      });
    }
  }, []);

  function emitUploadProgress(progress: number) {
    emit("progress", {
      progress,
    });
  }

  async function handleUpload(files: File[]) {
    setProgress(0);
    setUploadQueue(files);

    const [file] = files;

    const filesIsAllowed =
      isFileAllowed(file.type) && isFileSizeAllowed(file.size);

    if (!filesIsAllowed) {
      setErr("Files is not allowed. MIME Type not secure or size up to 1Gb.");
    }

    const createUploadURLResponse = await api.post<{
      id: string;
      signedUrl: string;
    }>("/uploads", {
      name: file.name,
      contentType: file.type,
      size: file.size,
    });

    const { id, signedUrl } = createUploadURLResponse.data;

    await api.put(signedUrl, file, {
      onUploadProgress({ progress }) {
        if (progress) {
          const progressPercent = Math.round(progress * 100);
          const closerTen = getNextCloserTen(progressPercent);

          emitUploadProgress(closerTen);
          setProgress(progressPercent);
        }
      },
    });

    const downloadURL = `http://localhost:3333/uploads/${id}`;

    await WriteToClipboard(downloadURL);

    const permissionGranted = await isPermissionGranted();

    if (permissionGranted) {
      sendNotification({
        title: "Upload Succeeded!",
        body: "Share Url was copied to your clipboard.",
      });
    }

    setUploadQueue([]);
  }

  function handleCancelUpload() {
    setUploadQueue([]);
    setErr("");
  }

  function handleQuitApp() {
    emit("quit");
  }

  const status =
    uploadQueue.length > 0 ? "accept" : isDragActive ? "active" : "pending";

  return (
    <div className="bg-dark/30 h-[384px] p-2 rounded-default text-gray-light flex flex-col">
      <UploadArea {...getRootProps()} data-status={status}>
        <input {...getInputProps()} />

        {status === "active" && (
          <p className="text-sm text-gray">Start Uploading</p>
        )}

        {status === "accept" && (
          <>
            {err ? (
              <div className="flex items-center gap-3">
                <p className=" animate-pulse text-sm text-gray">
                  Error on upload file.
                </p>
                <button
                  onClick={handleCancelUpload}
                  title="Cancel upload"
                  className="text-gray/50"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {uploadQueue.length > 1 ? (
                    <p className=" animate-pulse text-sm text-gray">
                      Uploading {uploadQueue.length} files(s).
                    </p>
                  ) : (
                    <p className="animate-pulse text-sm text-gray">
                      Uploading{" "}
                      {uploadQueue[0].name.length > 14
                        ? uploadQueue[0].name.substring(0, 14).concat("...")
                        : uploadQueue[0].name}
                    </p>
                  )}
                  <button
                    onClick={handleCancelUpload}
                    title="Cancel upload"
                    className="text-gray/50"
                  >
                    <X className="size-3" />
                  </button>
                </div>
                <Progress progress={progress} />
              </div>
            )}
          </>
        )}
        {status === "pending" && (
          <p className="flex items-center text-sm text-gray">
            <ArrowUpToLine className="size-4 mr-1" />
            Drag files here
          </p>
        )}
      </UploadArea>
      <Separator />
      <div className="flex-1 flex-col flex pb-2">
        <Menu onClick={open} hotkey="mod+o" icon={File}>
          Select File
        </Menu>
        <Menu icon={History} hotkey="mod+shift+v">
          Recent Uploads
        </Menu>
        <Separator />
        <Menu icon={HandCoins}>Donate</Menu>
        <Menu icon={TimerReset}>Check for updates</Menu>
        <Separator />
        <Menu>Settings</Menu>
        <Menu onClick={handleQuitApp} hotkey="mod+q">
          Quit
        </Menu>
      </div>
    </div>
  );
}

export default App;

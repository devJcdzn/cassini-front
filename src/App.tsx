import React from "react";
import { emit } from "@tauri-apps/api/event";

import {
  ArrowUpToLine,
  TimerReset,
  File,
  HandCoins,
  History,
  X,
} from "lucide-react";

import { useDropzone } from "react-dropzone";
import { verifyMimeTypes } from "./lib/utils";
import { mimeTypesAllowed } from "./lib/secure-mime-types";

import { Menu } from "./components/menu";
import { Progress } from "./components/progress";
import { Separator } from "./components/separator";
import { UploadArea } from "./components/upload-area";

function App() {
  const [uploadQueue, setUploadQueue] = React.useState<File[]>([]);
  const [err, setErr] = React.useState<string>("");
  const [progress, setProgress] = React.useState<number>(0);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleUpload,
    multiple: true,
    noClick: true,
    noKeyboard: true,
  });

  function emitUploadProgress(progress: number) {
    emit("progress", {
      progress,
    });
  }

  function handleUpload(files: File[]) {
    setUploadQueue(files);

    const { error, message } = verifyMimeTypes(files, mimeTypesAllowed);

    if (error && error !== null) {
      console.log({
        error,
        message,
      });
      setErr(message as string);
      return;
    }

    setTimeout(() => {
      emitUploadProgress(10);
      setProgress(10);
    }, 500 * 1);
    setTimeout(() => {
      emitUploadProgress(15);
      setProgress(15);
    }, 500 * 2);
    setTimeout(() => {
      emitUploadProgress(25);
      setProgress(25);
    }, 500 * 3);
    setTimeout(() => {
      emitUploadProgress(50);
      setProgress(50);
    }, 500 * 4);
    setTimeout(() => {
      emitUploadProgress(65);
      setProgress(65);
    }, 500 * 5);
    setTimeout(() => {
      emitUploadProgress(80);
      setProgress(80);
    }, 500 * 6);
    setTimeout(() => {
      emitUploadProgress(100);
      setProgress(100);
    }, 500 * 7);

    console.log(files);
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

import React from "react";

import { ArrowUpToLine, File, History, X } from "lucide-react";

import { useDropzone } from "react-dropzone";

import { Menu } from "./components/menu";
import { Button } from "./components/button";
import { Separator } from "./components/separator";
import { UploadArea } from "./components/upload-area";

function App() {
  const [uploadQueue, setUploadQueue] = React.useState<File[]>([]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleUpload,
    multiple: true,
    noClick: true,
    noKeyboard: true,
  });

  function handleUpload(files: File[]) {
    setUploadQueue(files);

    console.log(files);
  }

  function handleCancelUpload() {
    setUploadQueue([]);
  }

  const status =
    uploadQueue.length > 0 ? "accept" : isDragActive ? "active" : "pending";

  return (
    <div className="bg-dark h-[354px] p-2 rounded-default text-gray-light flex flex-col">
      <UploadArea {...getRootProps()} data-status={status}>
        <input {...getInputProps()} />

        {status === "active" && (
          <p className="text-sm text-gray">Start Uploading</p>
        )}

        {status === "accept" && (
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
        <Button>About</Button>
        <Button>Check for updates</Button>
        <Separator />
        <Button>Settings</Button>
        <Button>Quit</Button>
      </div>
    </div>
  );
}

export default App;

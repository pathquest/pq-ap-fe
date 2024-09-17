import React, { useState, useRef, useEffect } from "react";
// ProgressBar Library
// Icon Components
import UploadIcon from "./icons/UploadIcon";
import FileIcon from "./icons/FileIcon";
import PdfIcon from "./icons/PdfIcon";
import WordIcon from "./icons/WordIcon";
import ExcelIcon from "./icons/ExcelIcon";
import ClearIcon from "./icons/ClearIcon.js";
import ImageIcon from "./icons/ImageIcon.js";
import CheckIcon from "./icons/CheckIcon.js";
import { ProgressBar, Toast } from "pq-ap-lib";

const extensionToIconMap: any = {
  pdf: <PdfIcon />,
  doc: <WordIcon />,
  docx: <WordIcon />,
  xls: <ExcelIcon />,
  xlsx: <ExcelIcon />,
  jpg: <ImageIcon />,
  jpeg: <ImageIcon />,
  png: <ImageIcon />,
};

interface UploaderProps {
  multiSelect?: boolean;
  variant?: string;
  type?: string;
  getValue: (uploadedFiles: any) => void;
  maxFileCount?: number;
  accept?: string
}

interface UploadedFile {
  url: string;
  uploadedAt: string;
}

function Uploader({
  multiSelect,
  variant,
  type,
  accept,
  getValue,
  maxFileCount,
}: UploaderProps) {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [files, setFiles] = useState<any>([]);
  const [uploaded, setUploaded] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // for Url Uploader
  const [rootUrl, setRootUrl] = useState("");
  const [mainUrl, setMainUrl] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileChange(files);
  };

  const handleFileChange = (newFiles: FileList) => {
    // const remainingSpace = maxFileCount
    //   ? maxFileCount - files.length
    //   : Infinity;
    // const filesToAdd = Array.from(newFiles).slice(0, remainingSpace);
    const totalFileCount = files.length + newFiles.length;

    if (maxFileCount && totalFileCount > maxFileCount) {
      Toast.error(`You are only allowed to upload a maximum of ${maxFileCount} files at a time`);
      setFiles([]);
      setFileNames([]);
      getValue([]);
      setUploaded(false);
      setIsChecked(false);
      return
    }
    else {
      const updatedFiles = [...files, ...Array.from(newFiles)];
      setFiles(updatedFiles);

      const updatedFileNames = updatedFiles.map((file) => file.name);
      setFileNames(updatedFileNames);

      getValue(updatedFiles);

      setTimeout(() => {
        setIsChecked(true);
      }, 2000);

      setTimeout(() => {
        setUploaded(true);
      }, 2500);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileChange(files);
    }

    // Set the uploaded state to false when a new file is selected
    setUploaded(false);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFileNames = [...fileNames];
    updatedFileNames.splice(index, 1);
    setFileNames(updatedFileNames);
    setFiles(Array.from(files).filter((i, inx) => inx !== index));

    getValue(Array.from(files).filter((i, inx) => inx !== index));

    if (updatedFileNames.length === 0) {
      setUploaded(false);
    }

    setIsChecked(false);
  };

  const getFileExtension = (fileName: string) => {
    const extension = fileName
      .slice(fileName.lastIndexOf(".") + 1)
      .toLowerCase();
    return extension;
  };

  const renderFileIcon = (fileName: string) => {
    const extension = getFileExtension(fileName);
    const icon = extensionToIconMap[extension];
    return icon || <FileIcon />;
  };

  // for url uploader
  const handleRootUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRootUrl(e.target.value);
  };

  const handleMainUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMainUrl(e.target.value);
  };

  const handleUpload = () => {
    if (mainUrl) {
      let fileUrl = mainUrl;

      if (rootUrl) {
        fileUrl = rootUrl + mainUrl;
      }

      // Perform upload logic using the fileUrl
      // console.log("Uploading file from URL:", fileUrl);
      // Add your upload logic here

      // Store uploaded file information
      const uploadedFile: UploadedFile = {
        url: fileUrl,
        uploadedAt: new Date().toISOString(),
      };

      // Add uploaded file to the list
      setUploadedFiles((prevUploadedFiles) => [
        ...prevUploadedFiles,
        uploadedFile,
      ]);

      // Reset the input fields after upload
      setRootUrl("");
      setMainUrl("");
    }
  };

  return type === "url" ? (
    <div className="flex flex-row justify-center items-center h-[36px] border border-dashed border-lightSilver rounded-[4px]">
      <input
        className="outline-none border-r border-r-lightSilver w-1/6 ml-2 text-[14px]  text-darkCharcoal placeholder:text-[14px]"
        type="url"
        value={rootUrl}
        onChange={handleRootUrlChange}
        placeholder="Enter root URL"
      />
      <input
        className="outline-none w-4/6 ml-2 text-[14px]  text-pureBlack placeholder:text-[14px]"
        type="url"
        value={mainUrl}
        onChange={handleMainUrlChange}
        placeholder="Enter main URL"
      />
      <span className="w-1/6 relative">
        <button
          onClick={handleUpload}
          className="absolute bottom-[-12px] right-5 text-[16px] px-[20px] text-slatyGrey  hover:bg-[#EDFFFC] hover:text-primary rounded-[5px]"
        >
          Upload
        </button>
      </span>
    </div>
  ) : (
    <>
      <div>
        {(multiSelect || !variant) && (
          <div
            className={`upload-container w-full flex items-center justify-center ${variant === "small" ? "h-[36px]" : "flex-col h-[230px]"
              } justify-center items-centerborder transition-all duration-200 ease-in
        border border-dashed border-lightSilver hover:border-primary hover:bg-[#EDFFFC] cursor-pointer rounded-[4px]`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            <input
              type="file"
              accept={accept}
              multiple={multiSelect}
              ref={fileInputRef}
              className="input-field hidden"
              onChange={handleFileInputChange}
            />
            <div
              className={`text-[15px] text-slatyGrey ${variant === "small"
                ? ""
                : "border-2 border-lightSilver rounded-[4px] p-2"
                }`}
            >
              <UploadIcon />
            </div>

            <p
              className={`${variant === "small" ? "ml-[10px]" : "mt-4"
                } text-[14px] text-darkCharcoal `}
            >
              Drag and Drop or <span className="text-primary">Browse</span> to
              Upload
            </p>
          </div>
        )}

        {multiSelect ? (
          <section className="mt-2 flex flex-col justify-between p-2 border border-lightSilver w-full h-[105px] rounded-[4px] overflow-y-auto">
            <div>
              <div className="flex flex-row ml-2 flex-wrap overflow-x-auto">
                {fileNames.length > 0 && uploaded
                  ? fileNames.map((name, index) => (
                    <span
                      className="text-[14px] text-darkCharcoal  flex items-center gap-2 bg-whiteSmoke px-[2px] py-[2.5px] rounded-[2px] mr-2 mb-2"
                      key={name}
                    >
                      <span className="text-[14px]">
                        {renderFileIcon(name)}
                      </span>
                      {name.length > 8 ? (
                        <>{name.slice(0, 8)}..</>
                      ) : (
                        <>{name}</>
                      )}
                      <span
                        onClick={() => handleRemoveFile(index)}
                        className="text-[14px] text-slatyGrey cursor-pointer"
                      >
                        <ClearIcon />
                      </span>
                    </span>
                  ))
                  : !uploaded && (
                    <span className="flex flex-row items-center gap-2 text-[14px] text-darkCharcoal ">
                      {fileNames.length === 0 ? (
                        <>
                          <FileIcon /> No selected files
                        </>
                      ) : (
                        <>
                          {fileNames.length} file
                          {fileNames.length > 1 ? "s" : ""} selected
                        </>
                      )}
                    </span>
                  )}
              </div>
            </div>
            {fileNames.length > 0 && !uploaded && (
              <div className="flex items-center text-[12px]  italic text-slatyGrey flex-row">
                <span className="mr-[10px]">
                  {uploaded ? "Uploaded" : "Uploading..."}
                </span>

                <ProgressBar
                  variant="primary"
                  progressDigit={false}
                  label={""}
                />

                <span className=" ml-2 text-primary text-[20px]">
                  {isChecked && <CheckIcon />}
                </span>
              </div>
            )}
          </section>
        ) : (
          <section
            className={`${variant === "small"
              ? fileNames.length > 0 &&
              "flex justify-between items-center border border-lightSilver h-[36px] px-[20px] rounded-[4px]"
              : "mt-2 flex justify-between items-center border border-lightSilver h-[36px] px-[20px] rounded-[4px]"
              }`}
          >
            {fileNames.length > 0 && !uploaded ? (
              <>
                <label className="text-[12px] italic mr-[10px] text-slatyGrey ">
                  {!uploaded ? "Uploading..." : "Uploaded"}
                </label>

                <ProgressBar
                  variant="primary"
                  progressDigit={false}
                  label={""}
                />

                <span className=" ml-2 text-primary text-[20px]">
                  {isChecked && <CheckIcon />}
                </span>
              </>
            ) : uploaded ? (
              <>
                <div className="flex flex-row items-center">
                  {renderFileIcon(fileNames[0])}
                  <span className="ml-2 text-[14px] text-darkCharcoal ">
                    {fileNames[0].length > 30 ? (
                      <>
                        {fileNames[0].slice(0, 26)}..
                        {fileNames[0].substring(fileNames[0].lastIndexOf("."))}
                      </>
                    ) : (
                      <>{fileNames[0]}</>
                    )}
                  </span>
                </div>
                <span
                  onClick={() => handleRemoveFile(0)}
                  className="text-[18px] text-slatyGrey cursor-pointer"
                >
                  <ClearIcon />
                </span>
              </>
            ) : variant === "small" ? (
              <div
                className="upload-container w-full flex justify-center h-[36px]
                  items-center transition-all duration-200 ease-in
                border border-dashed border-lightSilver hover:border-primary hover:bg-[#EDFFFC]
                cursor-pointer rounded-[4px]"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
              >
                <input
                  type="file"
                  multiple={multiSelect}
                  ref={fileInputRef}
                  className="input-field hidden"
                  onChange={handleFileInputChange}
                />
                <div
                  className={`text-[15px] text-slatyGrey ${variant === "small"
                    ? ""
                    : "border-2 border-lightSilver rounded-[4px] p-2"
                    }`}
                >
                  <UploadIcon />
                </div>

                <p
                  className={`${variant === "small" ? "ml-[10px]" : "mt-4"
                    } text-[14px] text-darkCharcoal `}
                >
                  Drag and Drop or <span className="text-primary">Browse</span>{" "}
                  to Upload
                </p>
              </div>
            ) : (
              <div className="flex flex-row items-center">
                <FileIcon />
                <span className="ml-2 text-[14px] text-darkCharcoal ">
                  No Files Selected
                </span>
              </div>
            )}
          </section>
        )}
      </div>
      <Toast position="top_center" />
    </>
  );
}

export default Uploader;

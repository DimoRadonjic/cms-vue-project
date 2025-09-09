export const errorMessageSupabase = (error: any) => {
  if (error) {
    throw new Error(error.message);
  }
};

export const sanitizeFileName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
};

import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const getPdfPreview = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer(); // PDF sadržaj
  const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
  const pdf = await loadingTask.promise;

  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport, canvas }).promise;
  return canvas.toDataURL("image/jpg");
};

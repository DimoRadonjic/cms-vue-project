import { BucketsName, TableName } from ".";
import { supabase } from "../../supabase";
import type { DocumentItem } from "../../types/types";
import { sanitizeFileName } from "./utils";

const table = TableName.documents;
const bucket = BucketsName.documents;

type Document = {
  title: string;
  url: string;
  path: string;
};

const getDocuments = async () => {
  const { data, status, error } = await supabase.from(table).select("*");

  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};

const getDocument = async (id: number) => {
  const { data, status, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};

const addDocument = async (
  document: Document
): Promise<{ data: DocumentItem[] | null; status: number }> => {
  const { data, status, error } = await supabase
    .from(table)
    .insert([document])
    .select();
  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};

const deleteDocumentByID = async (id: number) => {
  // First, delete the document from the documents table
  const { data, status, error } = await supabase
    .from(table)
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  // Then, update related blogs to remove the reference to this document
  // Assuming blogs have a documents array or document_id field
  // Example for documents array:
  // await supabase
  //   .from("blogs")
  //   .update({ documents: supabase.raw('array_remove(documents, ?)', [id]) })
  //   .contains('documents', [id]);

  // Example for document_id field:
  // await supabase
  //   .from("blogs")
  //   .update({ document_id: null })
  //   .eq("document_id", id);

  // Adjust the above logic based on your actual blog schema

  return { data, status };
};

const deleteDocuments = async (ids: string[]) => {
  if (typeof ids[0] !== "number") {
    ids.map(Number);
  }

  const { data, error, status } = await supabase
    .from(table)
    .delete()
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }
  return { data, status };
};

const uploadDocumentToStorage = async (file: File) => {
  const sanitizedFileName = sanitizeFileName(file.name);
  console.log("sanitizedFileName", sanitizedFileName);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(sanitizedFileName, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data: urlData, error: urlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(sanitizedFileName, 60 * 60 * 24 * 7);

  if (urlError || !urlData)
    throw new Error(urlError?.message || "Failed to create signed URL");

  const fileTitle = file.name.replace(/\.[^/.]+$/, "");

  const document: Document = {
    title: fileTitle,
    url: urlData.signedUrl,
    path: sanitizedFileName,
  };

  const { data: docData } = await addDocument(document);

  if (!docData || docData.length === 0) {
    throw new Error("Failed to add document or missing document id");
  }
  return { data: docData, status: 201 };
};

const uploadDocumentsToStorage = async (
  files: File[]
): Promise<DocumentItem[]> => {
  const uploadPromises = files.map(async (file) => {
    const { data } = await uploadDocumentToStorage(file);
    return data[0];
  });

  return Promise.all(uploadPromises);
};

const deleteDocumentFromStorage = async (document: DocumentItem) => {
  const { id, path } = document;
  const { data, error } = await supabase.storage.from(bucket).remove([path]);
  await deleteDocumentByID(Number(id));

  if (error) throw new Error(error.message);

  return { data };
};

const deleteDocumentsFromStorage = async (documents: DocumentItem[]) => {
  const deletionPromises = documents.map(async (document) => {
    await deleteDocumentFromStorage(document);
  });

  return Promise.all(deletionPromises);
};

const tableDocuments = {
  getDocuments,
  getDocument,
  addDocument,
  deleteDocumentByID,
  deleteDocuments,
  uploadDocumentToStorage,
  uploadDocumentsToStorage,
  deleteDocumentFromStorage,
  deleteDocumentsFromStorage,
};
export default tableDocuments;

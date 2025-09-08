import { BucketsName, TableName } from "..";
import { supabase } from "../..";
import type { DocumentItem } from "../../../types/types";
import { sanitizeFileName } from "../utils";
import { addPostDocument, removePostDocument } from "./tablePostDocumets";

const table = TableName.documents;
const bucket = BucketsName.documents;

export type Document = Omit<DocumentItem, "id" | "post_ids">;

const getDocuments = async () => {
  const { data, status, error } = await supabase.from(table).select(`
    id,
    title,
    url,
    path,
    post_ids:posts_documents (
      post_id
    )
  `);

  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};

const availableDocuments = async (postID: string) => {
  const { data } = await getDocuments();

  const available = data?.filter(
    (doc) => !doc.post_ids.some((p) => p.post_id === postID)
  );

  return available as unknown as DocumentItem[];
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

const uploadDocumentToStorage = async (file: File, postId: string) => {
  const sanitizedFileName = sanitizeFileName(file.name);

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

  await addPostDocument(Number(docData[0].id), postId);

  return { data: docData, status: 201 };
};

const uploadDocumentsToStorage = async (
  files: File[],
  postID: string
): Promise<DocumentItem[]> => {
  const uploadPromises = files.map(async (file) => {
    const { data } = await uploadDocumentToStorage(file, postID);
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

// Mozda ima bolji nacin
const deleteDocumentsFromStorage = async (documents: DocumentItem[]) => {
  const deletionPromises = documents.map(async (document) => {
    await deleteDocumentFromStorage(document);
  });

  return Promise.all(deletionPromises);
};

const addPostDocumentLink = async (document_id: number, postId: string) => {
  try {
    await addPostDocument(document_id, postId);
  } catch (err: any) {
    console.error("Failed to link document:", err);
    throw new Error(err.message);
  }
};

const deletePostDocumentLink = async (document_id: number, postId: string) => {
  try {
    await removePostDocument(document_id, postId);
  } catch (err: any) {
    console.error("Failed to un-link document:", err);
    throw new Error(err.message);
  }
};

const removeDocument = async (document: DocumentItem, postId: string) => {
  const { id, post_ids, ...doc } = document;

  try {
    await deletePostDocumentLink(Number(id), postId);
    await supabase.from(table).update(doc).eq("id", id);
  } catch (err: any) {
    console.error("Failed to update document:", err);
    throw new Error(err.message);
  }
};

const removeDocuments = async (documents: DocumentItem[], postId: string) => {
  const updatePromises = documents.map(async (document) => {
    await removeDocument(document, postId);
  });

  return Promise.all(updatePromises);
};

const updateDocument = async (document: DocumentItem) => {
  const { id, post_ids, ...doc } = document;

  try {
    await supabase.from(table).update(doc).eq("id", id);
  } catch (err: any) {
    console.error("Failed to update document:", err);
    throw new Error(err.message);
  }
};

const updateDocuments = async (documents: DocumentItem[]) => {
  const updatePromises = documents.map(async (document) => {
    await updateDocument(document);
  });

  return Promise.all(updatePromises);
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
  updateDocument,
  updateDocuments,
  addPostDocumentLink,
  deletePostDocumentLink,
  removeDocuments,
  availableDocuments,
};
export default tableDocuments;

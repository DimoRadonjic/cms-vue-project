import { BucketsName, TableName } from ".";
import { supabase } from "..";
import { errorMessage } from "../../axios/utils";
import type { DocumentItem } from "../../types/types";
import { getPdfPreview, sanitizeFileName } from "../utils";
import { addPostDocument, removePostDocument } from "./tablePostDocumets";

const table = TableName.documents;
const bucket = BucketsName.documents;

export type Document = Omit<DocumentItem, "id" | "post_ids">;

const createURL = async (path: string) => {
  try {
    const { data } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60 * 24 * 7);

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    return { data, expires_at: newExpiresAt };
  } catch (error: any) {
    errorMessage("Failed to create url for image", error);
    throw new Error(error.message);
  }
};

async function createOrRefreshUrls() {
  const { data: documents, error } = await supabase
    .from(table)
    .select("id, path, url_expires_at");

  if (error) throw error;

  const now = new Date();

  for (const doc of documents) {
    const expiresAt = doc.url_expires_at ? new Date(doc.url_expires_at) : null;

    if (
      !doc.path ||
      !expiresAt ||
      (expiresAt.getTime() - now.getTime()) / 1000 < 86400
    ) {
      const { data } = await createURL(doc.path);

      const signedUrl = data?.signedUrl;
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      await supabase
        .from(table)
        .update({ url: signedUrl, url_expires_at: newExpiresAt.toISOString() })
        .eq("id", doc.id);
    }
  }
}

const getDocuments = async () => {
  createOrRefreshUrls();

  const { data, status, error } = await supabase.from(table).select(`
    id,
    title,
    url,
    path,
    preview_img,
    post_ids:posts_documents (
      post_id
    ),
    url_expires_at,
    created_at
  `);

  if (error) {
    throw new Error(error.message);
  }

  data.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return { data, status };
};

const availableDocuments = async (postID: string): Promise<DocumentItem[]> => {
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
  const { data, status, error } = await supabase
    .from(table)
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

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

  const { data: doc, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(sanitizedFileName, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data: urlData, expires_at } = await createURL(doc.path);

  if (!urlData) {
    throw new Error("Failed to get public URL");
  }

  const fileTitle = file.name.replace(/\.[^/.]+$/, "");

  const previewDoc = await getPdfPreview(file);

  const document: Document = {
    title: fileTitle,
    url: urlData.signedUrl,
    path: sanitizedFileName,
    preview_img: previewDoc,
    url_expires_at: expires_at,
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

const searchDocuments = async (search: string) => {
  if (!search.trim()) {
    try {
      const { data } = await getDocuments();
      return data;
    } catch (error) {
      console.error("Error searching documents:", error);
      return [];
    }
  }
  try {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .ilike("title", `%${search}%`);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error searching documents:", err);
    return [];
  }
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
  searchDocuments,
};
export default tableDocuments;

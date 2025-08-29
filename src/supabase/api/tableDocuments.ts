import { BucketsName, TableName } from ".";
import { supabase } from "../../supabase";
import type { DocumentItem } from "../../types/types";

const table = TableName.documents;
const bucket = BucketsName.documents;

type Document = {
  title: string;
  url: string;
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
): Promise<{ data: DocumentItem | null; status: number }> => {
  const { data, status, error } = await supabase.from(table).insert(document);
  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};

const deleteDocument = async (id: number) => {
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

const uploadDocumentToStorage = async (document: any) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(document.name, document.file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data: urlData, error: urlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(document.name, 60 * 60 * 24 * 7); // 7 days

  if (urlError || !urlData) {
    throw new Error(urlError?.message || "Failed to create signed URL");
  }

  return { data, status: 201 };
};

const uploadDocumentsToStorage = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(async (file) => {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(file.name, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(file.name, 60 * 60 * 24 * 7);

    if (urlError || !urlData)
      throw new Error(urlError?.message || "Failed to create signed URL");

    const { data: docData } = await addDocument({
      title: file.name,
      url: urlData.signedUrl,
    });

    if (!docData) {
      throw new Error("Failed to add document or retrieve its ID");
    }

    return docData;
  });

  const documentDatas = await Promise.all(uploadPromises);
  return documentDatas.map((doc) => String(doc.id));
};

const deleteDocumentFromStorage = async (path: string) => {
  const { data, error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(error.message);
  }

  console.log("path", path);

  // ako je vezan za samo jedan blog post, obrisati i iz baze
  // await deleteDocument(parseInt(path.split("/")[1])); // assuming path format is "pdfs/{id}_{name}"

  return { data };
};

const tableDocuments = {
  getDocuments,
  getDocument,
  addDocument,
  deleteDocument,
  uploadDocumentToStorage,
  uploadDocumentsToStorage,
  deleteDocumentFromStorage,
};
export default tableDocuments;

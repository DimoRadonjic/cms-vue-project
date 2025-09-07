import tableDocuments from "../../supabase/api/tables/tableDocuments";
import type { DocumentItem } from "../../types/types";
import { errorMessage } from "../utils";

const getDocumentsAPI = async () => {
  try {
    const { data, status } = await tableDocuments.getDocuments();

    return { data, status };
  } catch (error: any) {
    errorMessage("Failed to fetch documents", error);
    return { data: null, status: 500 };
  }
};

const getDocumentByIDAPI = async (id: number) => {
  try {
    const { data, status } = await tableDocuments.getDocument(id);

    return { data, status };
  } catch (error: any) {
    errorMessage("Failed to fetch documents", error);
    return { data: null, status: 500 };
  }
};

const uploadDocumentsAPI = async (files: File[], post_id: string) => {
  try {
    const response = await tableDocuments.uploadDocumentsToStorage(
      files,
      post_id
    );

    return { data: response, status: 200 };
  } catch (error: any) {
    errorMessage("Failed to upload document", error);
    return { data: null, status: 500 };
  }
};

const uploadDocumentAPI = async (file: File, post_id: string) => {
  try {
    const response = await tableDocuments.uploadDocumentToStorage(
      file,
      post_id
    );
    console.log("response", response);

    return { data: response, status: 200 };
  } catch (error: any) {
    errorMessage("Failed to upload document", error);
    return { data: null, status: 500 };
  }
};

const removeDocumentAPI = async (document: DocumentItem) => {
  try {
    await tableDocuments.deleteDocumentFromStorage(document);
    return { status: 200 };
  } catch (error: any) {
    errorMessage("Failed to delete document", error);
    return { status: 500 };
  }
};

const deleteDocumentsAPI = async (documents: DocumentItem[]) => {
  try {
    await tableDocuments.deleteDocumentsFromStorage(documents);
    return { status: 200 };
  } catch (error: any) {
    errorMessage("Failed to delete document", error);
    return { status: 500 };
  }
};

const updateDocumentAPI = async (document: DocumentItem) => {
  try {
    await tableDocuments.updateDocument(document);
    return { status: 200 };
  } catch (error: any) {
    errorMessage("Failed to delete document", error);
    return { status: 500 };
  }
};

const updateDocumentsAPI = async (documents: DocumentItem[]) => {
  try {
    await tableDocuments.updateDocuments(documents);
    return { status: 200 };
  } catch (error: any) {
    errorMessage("Failed to delete document", error);
    return { status: 500 };
  }
};

const apiDocuments = {
  getDocumentsAPI,
  uploadDocumentsAPI,
  uploadDocumentAPI,
  removeDocumentAPI,
  deleteDocumentsAPI,
  getDocumentByIDAPI,
  updateDocumentAPI,
  updateDocumentsAPI,
};

export default apiDocuments;

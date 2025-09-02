import tableDocuments from "../../supabase/api/tableDocuments";
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

const getDocumentByIDAPI = async (id: string) => {
  try {
    const { data, status } = await tableDocuments.getDocument(Number(id));

    return { data, status };
  } catch (error: any) {
    errorMessage("Failed to fetch documents", error);
    return { data: null, status: 500 };
  }
};

const uploadDocumentsAPI = async (files: File[]) => {
  console.log("uploadDocumentsAPI files", files);
  try {
    const response = await tableDocuments.uploadDocumentsToStorage(files);
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

const apiDocuments = {
  getDocumentsAPI,
  uploadDocumentsAPI,
  removeDocumentAPI,
  deleteDocumentsAPI,
  getDocumentByIDAPI,
};

export default apiDocuments;

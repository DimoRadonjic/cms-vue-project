import tableDocuments from "../../supabase/api/tableDocuments";
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

const uploadDocumentsAPI = async (files: File[]) => {
  try {
    const response = await tableDocuments.uploadDocumentsToStorage(files);

    return { data: response, status: 200 };
  } catch (error: any) {
    errorMessage("Failed to upload document", error);
    return { data: null, status: 500 };
  }
};

const apiDocuments = { getDocumentsAPI, uploadDocumentsAPI };

export default apiDocuments;

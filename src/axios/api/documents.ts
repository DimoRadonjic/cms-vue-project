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

const apiDocuments = { getDocumentsAPI };

export default apiDocuments;

import api from "..";
import { errorMessage } from "../utils";

const getDocuments = async () => {
  try {
    const data = await api.get("/documents");

    return data;
  } catch (error: any) {
    errorMessage("Failed to fetch documents", error);
  }
};

const apiDocuments = { getDocuments };

export default apiDocuments;

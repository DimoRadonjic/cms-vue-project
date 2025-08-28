import { supabase } from "../../supabase";

const getDocuments = async () => {
  const { data, status, error } = await supabase.from("Documents").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};

const tableDocuments = { getDocuments };

export default tableDocuments;

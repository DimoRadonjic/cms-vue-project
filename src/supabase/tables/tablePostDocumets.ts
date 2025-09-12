import { JunctionTableName } from ".";
import { supabase } from "..";

const table = JunctionTableName.posts_documents;

export const addPostDocument = async (document_id: number, post_id: string) => {
  const add = { document_id, post_id };
  const { data, status, error } = await supabase
    .from(table)
    .insert([add])
    .select();
  if (error) {
    throw new Error(error.message);
  }

  return { data, status };
};

export const removePostDocument = async (
  document_id: number,
  post_id: string
) => {
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq("document_id", document_id)
    .eq("post_id", post_id);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const addPostDocuments = async (
  document_ids: number[],
  post_id: string
) => {
  const updatePromises = document_ids.map(async (id) => {
    await addPostDocument(id, post_id);
  });

  return Promise.all(updatePromises);
};

export const removePostDocuments = async (
  document_ids: number[],
  post_id: string
) => {
  const updatePromises = document_ids.map(async (id) => {
    await removePostDocument(id, post_id);
  });

  return Promise.all(updatePromises);
};

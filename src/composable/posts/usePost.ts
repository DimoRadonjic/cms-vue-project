import { ref } from "vue";
import type { PostData } from "../../types/types";
import apiPosts from "../../api/posts";

export const usePost = (id: string) => {
  const data = ref<Array<PostData>>();

  const fetchPost = async () => {
    const res = await apiPosts.getPost(id);

    data.value = res;
  };

  void fetchPost();

  return { data, fetchPost };
};

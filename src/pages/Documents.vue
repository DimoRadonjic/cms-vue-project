<script setup lang="ts">
import CardTable from "../components/card-table/CardTable.vue";
import { useDocuments } from "../composable/documents/useDocuments";

const { data, loading, reFetch, uploadDocuments, deleteDocuments } =
  useDocuments();
</script>
<template>
  <div class="w-full">
    <div class="flex flex-wrap p-4 gap-4 place-items-start">
      <CardTable
        type="document"
        :data
        title="Documents"
        accept="application/pdf"
        :loading
        :modalOpen="false"
        :upload="uploadDocuments"
        :delete="deleteDocuments"
        :onRefetch="reFetch"
      />
    </div>
  </div>
</template>

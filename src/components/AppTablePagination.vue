<script setup lang="ts"></script>

<template>
  <Paginator
    :template="{
      '640px':
        'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown',
      '960px':
        'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown',
      default:
        'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown ',
    }"
    :rows="10"
    :totalRecords="120"
    :rowsPerPageOptions="[10, 20, 30]"
    pt:root="!w-fit mx-auto"
  >
  </Paginator>
</template>

<style scoped></style>

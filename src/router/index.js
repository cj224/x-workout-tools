import { createRouter, createWebHashHistory } from "vue-router";
import PuzzleView from "@/views/PuzzleView.vue";
import ConvertView from "@/views/ConvertView.vue";

// Hash history works on Gitee Pages without server rewrite rules.
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "puzzle", component: PuzzleView },
    { path: "/convert", name: "convert", component: ConvertView },
  ],
});

export default router;

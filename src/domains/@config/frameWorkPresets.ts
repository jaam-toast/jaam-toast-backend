import { Framework } from "../../repositories/@types";

export const FrameWorkPresets: Record<
  Framework,
  { buildCommand: string; buildDirectory: string }
> = {
  CreateReactApp: {
    buildCommand: "npm run build",
    buildDirectory: "build",
  },
  ReactStatic: {
    buildCommand: "react-static build",
    buildDirectory: "dist",
  },
  NextJs: {
    buildCommand: "next build && next export",
    buildDirectory: "out",
  },
  NuxtJs: {
    buildCommand: "nuxt generate",
    buildDirectory: "dist",
  },
  Angular: {
    buildCommand: "ng build",
    buildDirectory: "dist",
  },
  Astro: {
    buildCommand: "npm run build",
    buildDirectory: "dist",
  },
  Gatsby: {
    buildCommand: "gatsby build",
    buildDirectory: "public",
  },
  GitBook: {
    buildCommand: "gitbook build",
    buildDirectory: "_book",
  },
  Jekyll: {
    buildCommand: "jekyll build",
    buildDirectory: "_site",
  },
  Remix: {
    buildCommand: "npm run build",
    buildDirectory: "public",
  },
  Svelte: {
    buildCommand: "npm run build",
    buildDirectory: "public",
  },
  Vue: {
    buildCommand: "npm run build",
    buildDirectory: "public",
  },
  VuePress: {
    buildCommand: "vuepress build $directory",
    buildDirectory: "$directory/.vuepress/dist",
  },
};

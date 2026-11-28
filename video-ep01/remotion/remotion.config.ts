import { Config } from "@remotion/cli/config";

// public/ holds junctions to ../raw and ../fonts (never point this at video-ep01: it contains remotion/ itself).
Config.setPublicDir("public"); // junctions to ../raw and ../fonts
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);

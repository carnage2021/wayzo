import { generateReactHelpers } from "@uploadthing/react";
import type { WayzoFileRouter } from "@/app/api/uploadthing/core";

/** Typed client helpers for the routes in app/api/uploadthing/core.ts. */
export const { useUploadThing, uploadFiles } = generateReactHelpers<WayzoFileRouter>();

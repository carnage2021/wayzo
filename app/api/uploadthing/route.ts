import { createRouteHandler } from "uploadthing/next";
import { fileRouter } from "./core";

/** UploadThing endpoint (reads UPLOADTHING_TOKEN from the environment). */
export const { GET, POST } = createRouteHandler({ router: fileRouter });

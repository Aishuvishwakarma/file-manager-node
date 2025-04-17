import * as yup from "yup";

/**
 * Schema to validate folder creation payload.
 * - `name`: required string for the folder's name.
 * - `parent`: optional string to link this folder under a parent folder (nullable).
 * - `description`: optional string for folder description (nullable).
 */
export const createFolderSchema = yup.object({
    name: yup.string().required("Folder name is required"),
    parent: yup.string().optional().nullable(),
    description: yup.string().optional().nullable(),
});

/**
 * Schema to validate file upload payload.
 * - `folderId`: optional string to associate file with a folder (nullable).
 */
export const uploadFileSchema = yup.object({
    folderId: yup.string().optional().nullable()
});
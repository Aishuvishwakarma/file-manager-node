import * as yup from "yup";

export const createFolderSchema = yup.object({
    name: yup.string().required("Folder name is required"),
    parent: yup.string().optional().nullable(),
    description: yup.string().optional().nullable(),
});

export const uploadFileSchema = yup.object({
    folderId: yup.string().optional().nullable()
});
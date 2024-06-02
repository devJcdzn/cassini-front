/**
 * Verifies the MIME types of the files in the provided array.
 * @param {File[]} files - Array of files to be checked.
 * @param {string[]} allowedMimeTypes - List of allowed MIME types.
 */
export function verifyMimeTypes(
  files: File[],
  allowedMimeTypes: string[]
): { error: string | null; message: string | null } {
  const bannedTypes = files.filter((file) => {
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        error: file.type,
        message: `Tipo não permitido: ${file.type}`,
      };
    }
  });

  if (bannedTypes.length > 0) {
    return {
      error: bannedTypes.map((file) => file.type).join(", "),
      message: "Alguns arquivos não são permitidos.",
    };
  }

  return {
    error: null,
    message: "Upload Start!",
  };
}

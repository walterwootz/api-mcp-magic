import JSZip from 'jszip';

export const generateZipBundle = async (
  files: Record<string, string>,
  projectName: string
): Promise<Blob> => {
  const zip = new JSZip();
  
  Object.entries(files).forEach(([filename, content]) => {
    zip.file(filename, content);
  });
  
  return await zip.generateAsync({ type: 'blob' });
};

export const downloadZip = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

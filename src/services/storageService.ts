import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll 
} from 'firebase/storage';
import { storage } from '../firebase/config';

export type StorageFolder = 'patient-files' | 'xrays' | 'prescriptions' | 'clinic-assets';

export const storageService = {
  /**
   * Uploads a file to a specific folder in Firebase Storage
   */
  async uploadFile(file: File, folder: StorageFolder, subPath?: string): Promise<{ url: string; path: string }> {
    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const path = subPath ? `${folder}/${subPath}/${fileName}` : `${folder}/${fileName}`;
      const storageRef = ref(storage, path);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      return { url, path };
    } catch (error) {
      console.error('Error uploading file to Firebase Storage:', error);
      throw error;
    }
  },

  /**
   * Gets download URL for a file path
   */
  async getFileUrl(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  },

  /**
   * Deletes a file from Firebase Storage
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
};

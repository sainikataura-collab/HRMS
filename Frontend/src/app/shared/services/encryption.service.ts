import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  secretKey = environment.encryptionSecretKey;  

  // Encrypt and make it URL-safe
  encryptText(text: string): string {
    const encrypted = CryptoJS.AES.encrypt(text, this.secretKey).toString();
    return this.base64UrlEncode(encrypted);
  }

  // Decrypt URL-safe encrypted text
  decryptText(text: string): string {
    try {
      const encryptedText = this.base64UrlDecode(text);
      const bytes = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      return text; // Return original text if decryption fails
    }
  }

  // Convert to URL-safe Base64 using CryptoJS
  private base64UrlEncode(text: string): string {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // Convert back from URL-safe Base64 using CryptoJS
  private base64UrlDecode(text: string): string {
    let base64 = text.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '='; // Pad if necessary
    }
    return CryptoJS.enc.Base64.parse(base64).toString(CryptoJS.enc.Utf8);
  }
}
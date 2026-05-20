import * as crypto from 'crypto';

export class DexpertCryptoUtil {
  private static readonly CIPHER_ALGORITHM = 'aes-128-cbc';
  private static readonly CIPHER_KEY_LEN = 16;

  private static formatKey(key: string): Buffer {
    let formattedKey = key;
    if (formattedKey.length < this.CIPHER_KEY_LEN) {
      formattedKey = formattedKey.padEnd(this.CIPHER_KEY_LEN, '0');
    } else if (formattedKey.length > this.CIPHER_KEY_LEN) {
      formattedKey = formattedKey.substring(0, this.CIPHER_KEY_LEN);
    }
    return Buffer.from(formattedKey, 'utf-8');
  }

  static encrypt(data: string, ivString: string, keyString: string): string {
    const key = this.formatKey(keyString);
    const iv = Buffer.from(ivString, 'utf-8');
    const cipher = crypto.createCipheriv(this.CIPHER_ALGORITHM, key, iv);
    
    let encrypted = cipher.update(data, 'utf-8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }

  static decrypt(data: string, ivString: string, keyString: string): string {
    const key = this.formatKey(keyString);
    const iv = Buffer.from(ivString, 'utf-8');
    
    // Completely sanitize the string to strictly valid Base64 characters
    const sanitizedData = data.replace(/[^A-Za-z0-9\+\/\=]/g, '');

    try {
      const decipher = crypto.createDecipheriv(this.CIPHER_ALGORITHM, key, iv);
      let decrypted = decipher.update(sanitizedData, 'base64', 'utf-8');
      decrypted += decipher.final('utf-8');
      return decrypted;
    } catch (e) {
      console.log('Decryption failed with auto padding, trying without padding...');
      const decipherNoPad = crypto.createDecipheriv(this.CIPHER_ALGORITHM, key, iv);
      decipherNoPad.setAutoPadding(false);
      let decrypted = decipherNoPad.update(sanitizedData, 'base64', 'utf-8');
      decrypted += decipherNoPad.final('utf-8');
      
      // Manual unpad (PKCS7)
      const lastChar = decrypted.charCodeAt(decrypted.length - 1);
      if (lastChar > 0 && lastChar <= 16) {
        decrypted = decrypted.substring(0, decrypted.length - lastChar);
      }
      return decrypted;
    }
  }
}

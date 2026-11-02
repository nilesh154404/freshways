import * as crypto from 'crypto';

export interface DexpertParsedResponse {
  pgTransId?: string;
  transId?: string;
  amount?: string;
  requestedAmount?: string;
  mtxnId?: string;
  firstName?: string;
  lastName?: string;
  payInstrument?: string;
  email?: string;
  contact?: string;
  respCode?: string;
  mcode?: string;
  txnDate?: string;
  status?: string;
  rmsg?: string;
  raw: Record<string, string>;
}

export class DexpertCryptoUtil {
  private static readonly CIPHER_ALGORITHM = 'aes-128-cbc';
  private static readonly CIPHER_KEY_LEN = 16;

  static formatKey(key: string): Buffer {
    let formattedKey = key || '';
    if (formattedKey.length < this.CIPHER_KEY_LEN) {
      formattedKey = formattedKey.padEnd(this.CIPHER_KEY_LEN, '0');
    } else if (formattedKey.length > this.CIPHER_KEY_LEN) {
      formattedKey = formattedKey.substring(0, this.CIPHER_KEY_LEN);
    }
    return Buffer.from(formattedKey, 'utf-8');
  }

  /**
   * Existing method preserved for backward compatibility.
   * Note parameter order: (data, ivString, keyString)
   */
  static encrypt(data: string, ivString: string, keyString: string): string {
    const key = this.formatKey(keyString);
    const iv = this.formatKey(ivString);
    const cipher = crypto.createCipheriv(this.CIPHER_ALGORITHM, key, iv);
    
    let encrypted = cipher.update(data, 'utf-8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }

  /**
   * Existing method preserved for backward compatibility.
   * Note parameter order: (data, ivString, keyString)
   */
  static decrypt(data: string, ivString: string, keyString: string): string {
    if (!data) return '';

    // Handle Dexpert '$' to '+' replacement and spaces from URL decoding
    let sanitizedData = data.split('$').join('+').split(' ').join('+');
    sanitizedData = sanitizedData.replace(/[^A-Za-z0-9+/=]/g, '');

    const key = this.formatKey(keyString);
    const iv = this.formatKey(ivString);

    try {
      const decipher = crypto.createDecipheriv(this.CIPHER_ALGORITHM, key, iv);
      let decrypted = decipher.update(sanitizedData, 'base64', 'utf-8');
      decrypted += decipher.final('utf-8');
      return decrypted;
    } catch {
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

  /**
   * Encrypt helper matching Dexpert Java AES/CBC/PKCS5PADDING standard.
   */
  static encryptDexpertResponse(plainText: string, keyString: string, ivString: string): string {
    const key = this.formatKey(keyString);
    const iv = this.formatKey(ivString);
    const cipher = crypto.createCipheriv(this.CIPHER_ALGORITHM, key, iv);
    return cipher.update(plainText, 'utf-8', 'base64') + cipher.final('base64');
  }

  /**
   * Decrypt AES-encrypted payload received from Dexpert webhook or response.
   * Supports:
   *  - URL-encoded strings (%xx)
   *  - Dexpert '$' to '+' replacement
   *  - URL space to '+' replacement
   *  - Key and IV candidate testing (handles provisional key/iv swap & router fallback)
   */
  static decryptDexpertResponse(
    encryptedData: string,
    keyString: string,
    ivString: string,
    fallbackKeyString?: string,
    fallbackIvString?: string,
  ): string {
    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('Encrypted payload is empty or not a string.');
    }

    let sanitized = encryptedData.trim();
    if (sanitized.includes('%')) {
      try {
        sanitized = decodeURIComponent(sanitized);
      } catch {
        // retain sanitized if decodeURIComponent fails
      }
    }

    // Dexpert specifies: encrypted = encrypted.replace("$", "+");
    sanitized = sanitized.split('$').join('+').split(' ').join('+');
    sanitized = sanitized.replace(/[^A-Za-z0-9+/=]/g, '');

    if (!sanitized) {
      throw new Error('Encrypted payload contains no valid Base64 data.');
    }

    // Candidate key/iv pairs to try:
    // 1. (DEXPERT_AES_KEY, DEXPERT_AES_IV)
    // 2. (DEXPERT_AES_IV, DEXPERT_AES_KEY) - in case provisional assignment was swapped
    // 3. Fallback (DEXPERT_PRIVATE_KEY, DEXPERT_PRIVATE_VALUE) if configured
    // 4. Fallback (DEXPERT_PRIVATE_VALUE, DEXPERT_PRIVATE_KEY)
    const candidatePairs: Array<{ key: string; iv: string }> = [
      { key: keyString, iv: ivString },
      { key: ivString, iv: keyString },
    ];

    if (fallbackKeyString && fallbackIvString) {
      candidatePairs.push({ key: fallbackKeyString, iv: fallbackIvString });
      candidatePairs.push({ key: fallbackIvString, iv: fallbackKeyString });
    }

    for (const pair of candidatePairs) {
      if (!pair.key || !pair.iv) continue;
      const keyBuffer = this.formatKey(pair.key);
      const ivBuffer = this.formatKey(pair.iv);

      // Attempt 1: Standard auto-padding
      try {
        const decipher = crypto.createDecipheriv(this.CIPHER_ALGORITHM, keyBuffer, ivBuffer);
        const decrypted = decipher.update(sanitized, 'base64', 'utf-8') + decipher.final('utf-8');
        if (this.isValidDecryptedResponse(decrypted)) {
          return decrypted;
        }
      } catch {
        // Continue to unpadded attempt
      }

      // Attempt 2: Manual unpadding
      try {
        const decipherNoPad = crypto.createDecipheriv(this.CIPHER_ALGORITHM, keyBuffer, ivBuffer);
        decipherNoPad.setAutoPadding(false);
        let decrypted = decipherNoPad.update(sanitized, 'base64', 'utf-8') + decipherNoPad.final('utf-8');
        const lastChar = decrypted.charCodeAt(decrypted.length - 1);
        if (lastChar > 0 && lastChar <= 16) {
          decrypted = decrypted.substring(0, decrypted.length - lastChar);
        }
        if (this.isValidDecryptedResponse(decrypted)) {
          return decrypted;
        }
      } catch {
        // Try next candidate pair
      }
    }

    throw new Error('Dexpert AES decryption failed: unable to decrypt with configured credentials.');
  }

  /**
   * Helper to check if a decrypted string looks like a valid Dexpert response query string.
   */
  private static isValidDecryptedResponse(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    return (
      text.includes('mtxnId=') ||
      text.includes('transId=') ||
      text.includes('status=') ||
      text.includes('pgTransId=') ||
      text.includes('respCode=') ||
      (text.includes('&') && text.includes('='))
    );
  }

  /**
   * Parse the decrypted key-value string (URL-encoded pairs) into a typed object.
   * Extracts all 15 Dexpert fields plus preserves raw dictionary.
   * Strips any whitespace/tabs from keys (e.g. Dexpert's 'requ \testedAmount').
   */
  static parseDecryptedQuery(decryptedText: string): DexpertParsedResponse {
    const raw: Record<string, string> = {};
    if (!decryptedText) {
      return { raw };
    }

    const pairs = decryptedText.split('&');
    for (const pair of pairs) {
      const eqIdx = pair.indexOf('=');
      if (eqIdx !== -1) {
        // Clean any tabs or whitespace from key names
        const key = pair.substring(0, eqIdx).replace(/[\s\t\r\n]/g, '').trim();
        let val = pair.substring(eqIdx + 1);
        if (val.includes('%')) {
          try {
            val = decodeURIComponent(val);
          } catch {
            // Keep original val if decoding fails
          }
        }
        if (key) {
          raw[key] = val;
        }
      }
    }

    const cleanField = (v?: string): string | undefined => {
      if (v === undefined || v === null || v === '' || v === 'null') return undefined;
      return v;
    };

    return {
      pgTransId: cleanField(raw['pgTransId'] || raw['pg_transt_id'] || raw['pg_transId']),
      transId: cleanField(raw['transId'] || raw['txnid'] || raw['txnId'] || raw['trans_id']),
      amount: cleanField(raw['amount'] || raw['paid_amount']),
      requestedAmount: cleanField(raw['requestedAmount'] || raw['requested_amount']),
      mtxnId: cleanField(raw['mtxnId'] || raw['merchant_trans_id']),
      firstName: cleanField(raw['firstName'] || raw['payer_first_name'] || raw['pfname']),
      lastName: cleanField(raw['lastName'] || raw['payer_last_name'] || raw['plname']),
      payInstrument: cleanField(raw['payInstrument'] || raw['payment_method']),
      email: cleanField(raw['email'] || raw['payer_email'] || raw['pemail']),
      contact: cleanField(raw['contact'] || raw['payer_contact_no'] || raw['pmno']),
      respCode: cleanField(raw['respCode'] || raw['response_code']),
      mcode: cleanField(raw['mcode']),
      txnDate: cleanField(raw['txnDate'] || raw['transDate']),
      status: cleanField(raw['status'] || raw['order_status']),
      rmsg: cleanField(raw['rmsg'] || raw['response_message']),
      raw,
    };
  }
}

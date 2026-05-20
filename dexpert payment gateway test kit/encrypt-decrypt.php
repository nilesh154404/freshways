<?php

class EncryptDecrypt
{                

    /**
     * Encrypt data using AES Cipher (CBC) with 128 bit key
     * 
     * @param type $key - key to use should be 16 bytes long (128 bits)
     * @param type $iv - initialization vector
     * @param type $data - data to encrypt
     * @return encrypted data in base64 encoding with iv attached at end after a :
     */

     function encrypt($data, $iv ,$key ) {
		 $OPENSSL_CIPHER_NAME = "aes-128-cbc"; //Name of OpenSSL Cipher 
		 $CIPHER_KEY_LEN = 16; //128 bits
        if (strlen($key) < $CIPHER_KEY_LEN) {
            $key = str_pad("$key", $CIPHER_KEY_LEN, "0"); //0 pad to len 16
        } else if (strlen($key) > $CIPHER_KEY_LEN) {
            $key = substr($key, 0, $CIPHER_KEY_LEN); //truncate to 16 bytes
        }

        $encodedEncryptedData = base64_encode(openssl_encrypt($data, $OPENSSL_CIPHER_NAME, $key, OPENSSL_RAW_DATA, $iv));
     
        return $encodedEncryptedData;

    }

    /**
     * Decrypt data using AES Cipher (CBC) with 128 bit key
     * 
     * @param type $key - key to use should be 16 bytes long (128 bits)
     * @param type $data - data to be decrypted in base64 encoding with iv attached at the end after a :
     * @return decrypted data
     */
     function decrypt($data, $iv, $key ) {
       
		$OPENSSL_CIPHER_NAME = "aes-128-cbc"; //Name of OpenSSL Cipher 
		$CIPHER_KEY_LEN = 16; //128 bits
        if (strlen($key) < $CIPHER_KEY_LEN) {
            $key = str_pad("$key", $CIPHER_KEY_LEN, "0"); //0 pad to len 16
        } else if (strlen($key) > $CIPHER_KEY_LEN) {
            $key = substr($key, 0, $CIPHER_KEY_LEN); //truncate to 16 bytes
        }
        $decryptedData = openssl_decrypt(base64_decode($data), $OPENSSL_CIPHER_NAME, $key, OPENSSL_RAW_DATA, $iv);
       
        return $decryptedData;
    }

}
?>